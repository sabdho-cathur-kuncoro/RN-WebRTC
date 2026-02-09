// hooks/useLocationTracker.ts
import { onSendGPSDeviceService } from "@/services/gps";
import { calculateBearing } from "@/utils/calculateBearing";
import { storage } from "@/utils/storage";
import * as Location from "expo-location";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import type { MapMarker, Region } from "react-native-maps";
import MapView from "react-native-maps";
import {
  SharedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type PermissionStatus = Location.PermissionStatus | null;

interface UseLocationTrackerResult {
  mapRef: RefObject<MapView | null>;
  listRef: any;
  selectedId: number | null;
  selectedVehicle: any;
  gpsEnabled: boolean;
  permissionStatus: PermissionStatus;
  initialRegion: Region | null;
  lastLocation: Location.LocationObject | null;
  bearing: any;
  isLoading: boolean;
  error: string | null;
  markerRefs: RefObject<Record<string, MapMarker | null>>;
  highlight: SharedValue<number>;
  refreshStatus: () => Promise<void>;
  isAnimatingCamera: React.MutableRefObject<boolean>;
  setMapReady: (ready: boolean) => void;
  actionsLocTracker: {
    onSetSelectedVehicle: (val: any) => void;
    onFocusVehicle: (data: any, index: number) => void;
    onGoToUserLocation: () => void;
    onChangeZoomSnap: (delta: number) => void;
    onSetInitialCamera: () => Promise<void>;
  };
}

// const FORCE_ROTATION_WHEN_STATIONARY = true;
const MIN_ZOOM = 10;
const MAX_ZOOM = 20;

const INITIAL_DELTA = 0.005;

export function useLocationTracker(): UseLocationTrackerResult {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [gpsEnabled, setGpsEnabled] = useState<boolean>(true);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>(null);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [lastLocation, setLastLocation] =
    useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bearing, setBearing] = useState(0);

  // const screen = useWindowDimensions();
  // const ASPECT_RATIO = screen.width / screen.height;
  // const LATITUDE_DELTA = 0.001;
  // const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  const markerRefs = useRef<Record<string, MapMarker | null>>({});
  const lastPosition = useRef<Location.LocationObjectCoords | null>(null);
  const watchSub = useRef<Location.LocationSubscription | null>(null);
  const hasFirstFix = useRef(false);
  const mapRef = useRef<MapView | null>(null);
  const listRef = useRef<any>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const isAnimatingCamera = useRef(false); // Prevent concurrent camera animations
  const lastCameraAnimationTime = useRef(0); // Track last animation time for debouncing
  const cameraAnimationQueue = useRef<(() => void)[]>([]); // Queue for camera operations
  const isProcessingQueue = useRef(false); // Track if queue is being processed
  const mapReadyRef = useRef(false); // Track if map is fully ready
  const currentAnimationId = useRef(0); // Track current animation ID for cancellation
  const pendingAnimationAbort = useRef(false); // Flag to abort pending animation

  const appState = useRef<AppStateStatus>(AppState.currentState);

  const highlight = useSharedValue(0);

  // Process camera animation queue sequentially with proper timing
  const processCameraQueue = useCallback(async () => {
    if (
      isProcessingQueue.current ||
      cameraAnimationQueue.current.length === 0 ||
      !mapReadyRef.current ||
      pendingAnimationAbort.current
    ) {
      return;
    }

    isProcessingQueue.current = true;

    while (cameraAnimationQueue.current.length > 0) {
      // Check if we should abort
      if (pendingAnimationAbort.current) {
        console.log("[processCameraQueue] Animation aborted");
        cameraAnimationQueue.current = [];
        break;
      }

      const operation = cameraAnimationQueue.current.shift();
      if (operation) {
        try {
          // Generate unique ID for this animation
          const animationId = currentAnimationId.current;

          // Execute the operation and await if it's async
          await Promise.resolve(operation());

          // Wait for animation to complete with buffer time
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Only continue if this is still the current animation
          if (currentAnimationId.current !== animationId) {
            console.log("[processCameraQueue] Animation superseded, stopping");
            cameraAnimationQueue.current = [];
            break;
          }
        } catch (e) {
          console.log("[processCameraQueue] Error:", e);
          // Continue processing next operation even if one fails
        }
      }
    }

    isProcessingQueue.current = false;
  }, []);

  // Queue a camera animation operation with safety checks
  const queueCameraAnimation = useCallback(
    (operation: () => void) => {
      // Only add to queue if map is ready
      if (!mapReadyRef.current) {
        console.log("[queueCameraAnimation] Map not ready, skipping");
        return false;
      }

      // Limit queue size to prevent memory buildup
      if (cameraAnimationQueue.current.length > 3) {
        console.log(
          "[queueCameraAnimation] Queue full, clearing and adding new"
        );
        cameraAnimationQueue.current = [];
      }

      cameraAnimationQueue.current.push(operation);
      processCameraQueue();
      return true;
    },
    [processCameraQueue]
  );

  const actionsLocTracker = {
    onSetSelectedVehicle: useCallback((val: any) => {
      setSelectedVehicle(val);
    }, []),
    onFocusVehicle: useCallback(
      (data: any, index: number) => {
        try {
          const now = Date.now();
          // Increased debounce to 800ms for more safety
          if (now - lastCameraAnimationTime.current < 800) {
            console.log("[onFocusVehicle] Debounced");
            return;
          }

          if (
            appState.current !== "active" ||
            !mapRef.current ||
            !initialRegion ||
            isAnimatingCamera.current ||
            !mapReadyRef.current
          )
            return;

          // Validate coordinates
          const lat = parseFloat(data.latitute);
          const long = parseFloat(data.longitude);

          if (isNaN(lat) || isNaN(long)) {
            console.log("[onFocusVehicle] Invalid coordinates");
            return;
          }

          isAnimatingCamera.current = true;
          lastCameraAnimationTime.current = now;

          // Increment animation ID to cancel any previous animations
          currentAnimationId.current += 1;

          setSelectedVehicle(data);

          // Queue the camera animation with smoother transitions
          const queued = queueCameraAnimation(async () => {
            try {
              // Get current camera settings
              mapRef.current
                ?.getCamera()
                .then((camera) => {
                  if (!camera || !mapRef.current) {
                    isAnimatingCamera.current = false;
                    return;
                  }

                  // Use animateCamera for smooth animation with duration
                  mapRef.current?.animateCamera(
                    {
                      center: {
                        latitude: lat,
                        longitude: long,
                      },
                      zoom: camera.zoom ?? 19,
                    },
                    { duration: 800 } // Smooth 800ms animation
                  );
                })
                .catch((e) => {
                  console.log("[onFocusVehicle] getCamera error:", e);
                  isAnimatingCamera.current = false;
                });
            } catch (e) {
              console.log("[onFocusVehicle] Camera error:", e);
              isAnimatingCamera.current = false;
            }
          });

          if (!queued) {
            isAnimatingCamera.current = false;
            return;
          }

          // Select card
          setSelectedId(data.device_id);

          // Scroll list to the item
          listRef.current?.scrollToIndex({
            index,
            animated: true,
          });

          // Clear previous timeout if any
          if (highlightTimeoutRef.current) {
            clearTimeout(highlightTimeoutRef.current);
          }

          // Start highlight animation
          highlight.value = 0;
          highlight.value = withSequence(
            withTiming(1, { duration: 200 }),
            withDelay(1200, withTiming(0, { duration: 300 }))
          );

          // Clear selectedId after (200 + 1200 + 300) ms = 1700 ms
          highlightTimeoutRef.current = setTimeout(() => {
            setSelectedId(null);
          }, 1700);

          // Reset animation flag after animation completes
          setTimeout(() => {
            isAnimatingCamera.current = false;
          }, 1000);
        } catch (err) {
          console.log("[onFocusVehicle] Error:", err);
          isAnimatingCamera.current = false;
        }
      },
      [highlight, initialRegion, queueCameraAnimation]
    ),
    onGoToUserLocation: useCallback(() => {
      const now = Date.now();
      // Increased debounce to 800ms for more safety
      if (now - lastCameraAnimationTime.current < 800) {
        console.log("[onGoToUserLocation] Debounced");
        return;
      }

      if (
        appState.current !== "active" ||
        !initialRegion ||
        !mapRef.current ||
        isAnimatingCamera.current ||
        !mapReadyRef.current
      )
        return;

      isAnimatingCamera.current = true;
      lastCameraAnimationTime.current = now;

      // Increment animation ID to cancel any previous animations
      currentAnimationId.current += 1;

      const queued = queueCameraAnimation(() => {
        try {
          // Use animateCamera for smooth animation with duration
          mapRef.current?.animateCamera(
            {
              center: {
                latitude: initialRegion.latitude,
                longitude: initialRegion.longitude,
              },
              zoom: 19,
            },
            { duration: 800 } // Smooth 800ms animation
          );
        } catch (e) {
          console.log("[goToUserLocation] Animation error:", e);
          isAnimatingCamera.current = false;
        }
      });

      if (!queued) {
        isAnimatingCamera.current = false;
        return;
      }

      // Reset flag after animation completes
      setTimeout(() => {
        isAnimatingCamera.current = false;
      }, 1000);
    }, [initialRegion, queueCameraAnimation]),
    onChangeZoomSnap: useCallback(
      (delta: number) => {
        const now = Date.now();
        // Increased debounce to 500ms for more safety
        if (now - lastCameraAnimationTime.current < 500) {
          console.log("[onChangeZoomSnap] Debounced");
          return;
        }

        if (
          appState.current !== "active" ||
          !mapRef.current ||
          isAnimatingCamera.current ||
          !mapReadyRef.current
        )
          return;

        isAnimatingCamera.current = true;
        lastCameraAnimationTime.current = now;

        // Increment animation ID to cancel any previous animations
        currentAnimationId.current += 1;

        const queued = queueCameraAnimation(async () => {
          try {
            // Get current camera settings
            mapRef.current
              ?.getCamera()
              .then((camera) => {
                if (!camera || !mapRef.current || camera.zoom == null) {
                  isAnimatingCamera.current = false;
                  return;
                }

                const currentZoom = camera.zoom;

                // Target zoom (clamped)
                const targetZoom = Math.max(
                  MIN_ZOOM,
                  Math.min(MAX_ZOOM, currentZoom + delta)
                );

                // Use animateCamera for smooth animation with duration
                mapRef.current?.animateCamera(
                  {
                    ...camera,
                    zoom: targetZoom,
                  },
                  { duration: 400 } // Faster 400ms animation for zoom
                );
              })
              .catch((e) => {
                console.log("[changeZoomSnap] getCamera error:", e);
                isAnimatingCamera.current = false;
              });
          } catch (e) {
            console.log("[changeZoomSnap] Camera error:", e);
            isAnimatingCamera.current = false;
          }
        });

        if (!queued) {
          isAnimatingCamera.current = false;
          return;
        }

        // Reset flag after animation completes
        setTimeout(() => {
          isAnimatingCamera.current = false;
        }, 800);
      },
      [queueCameraAnimation]
    ),
    onSetInitialCamera: useCallback(async () => {
      const now = Date.now();
      // Increased debounce to 300ms
      if (now - lastCameraAnimationTime.current < 300) {
        return;
      }

      if (
        appState.current !== "active" ||
        !mapRef.current ||
        !initialRegion ||
        isAnimatingCamera.current ||
        !mapReadyRef.current
      )
        return;

      isAnimatingCamera.current = true;
      lastCameraAnimationTime.current = now;

      queueCameraAnimation(() => {
        try {
          // Use animateCamera for smooth animation with duration
          mapRef.current?.animateCamera(
            {
              center: {
                latitude: initialRegion.latitude,
                longitude: initialRegion.longitude,
              },
              zoom: 19,
            },
            { duration: 600 } // Moderate 600ms animation for initial camera
          );
        } catch (e) {
          console.log("[setInitialCamera] Animation error:", e);
        }
      });

      // Reset flag with longer delay
      setTimeout(() => {
        isAnimatingCamera.current = false;
      }, 200);
    }, [initialRegion, queueCameraAnimation]),
  };

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      appState.current = nextState;
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (cancelled) return;

      setInitialRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,

        // SAFE, wide deltas
        latitudeDelta: INITIAL_DELTA,
        longitudeDelta: INITIAL_DELTA,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // const stopWatching = useCallback(() => {
  //   if (watchSub.current) {
  //     watchSub.current.remove();
  //     watchSub.current = null;
  //   }
  // }, []);

  const startWatching = useCallback(async () => {
    if (watchSub.current) return; // prevent duplicates

    const username = storage.getString("user.username");
    console.log("Starting watch...");

    watchSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 1,
      },
      (loc) => {
        const speed = loc.coords.speed ?? 0;

        if (lastPosition.current && speed > 1) {
          const gpsBearing = calculateBearing(lastPosition.current, loc.coords);
          setBearing(gpsBearing);
        }

        lastPosition.current = loc.coords;
        setLastLocation(loc);

        onSendGPSDeviceService({
          device_id: username!,
          latlon: `${loc.coords.latitude},${loc.coords.longitude}`,
        });

        if (!hasFirstFix.current) {
          hasFirstFix.current = true;
          setIsLoading(false);
        }
      }
    );
  }, []);

  useEffect(() => {
    startWatching();

    return () => {
      if (watchSub.current) {
        watchSub.current.remove();
        watchSub.current = null;
      }
    };
  }, [startWatching]);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const enabled = await Location.hasServicesEnabledAsync();
    setGpsEnabled(enabled);

    if (!enabled) {
      setError("GPS is off");
      setIsLoading(false);
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();

    setPermissionStatus(status);

    if (status !== "granted") {
      setError("Permission denied");
      setIsLoading(false);
      return;
    }

    hasFirstFix.current = false;
  }, []);

  return {
    mapRef,
    listRef,
    markerRefs,
    selectedId,
    selectedVehicle,
    gpsEnabled,
    permissionStatus,
    initialRegion,
    lastLocation,
    bearing,
    isLoading,
    error,
    highlight,
    actionsLocTracker,
    refreshStatus,
    isAnimatingCamera,
    setMapReady: (ready: boolean) => {
      mapReadyRef.current = ready;
    },
  };
}
