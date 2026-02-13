import {
  blackColor,
  blackRGBAColor,
  blackTextStyle,
  blueColor,
  blueRGBAColor,
  blueTextStyle,
  greyTextStyle,
  mainContent,
  shadow,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import useHandleLocation from "@/hooks/useHandleLocation";
import { useLocationTracker } from "@/hooks/useLocationTracker";
import { useOperationStore } from "@/stores/operation.store";
import { shortestAngleDiff } from "@/utils/helpers";
import { storage } from "@/utils/storage";
import { Fontisto, Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Button from "../Button";
import Gap from "../Gap";
import { VehicleItem } from "../VehicleItem";
import { mapLightStyle } from "./map.style";

const MapComponent = () => {
  const {
    mapRef,
    listRef,
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
    setMapReady,
  } = useLocationTracker();
  const operation = useOperationStore((s) => s.operation);
  const { listGPS, actions } = useHandleLocation();

  const [mapReady, setMapReadyState] = useState(false);
  const [initialCameraSet, setInitialCameraSet] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  const { height } = useWindowDimensions();

  const rotation = useSharedValue(0);
  const bubbleVisible = useSharedValue(0); // 0 = hidden, 1 = visible

  const lastRotation = useRef(0);
  const lastInteractionTime = useRef(0);
  const interactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  function showBubble() {
    bubbleVisible.value = withTiming(1, { duration: 1000 });
  }

  function hideBubble() {
    bubbleVisible.value = withTiming(0, { duration: 150 });
  }

  // Handle user interaction with map to prevent automatic camera movements
  const handleMapInteractionStart = () => {
    setIsUserInteracting(true);
    lastInteractionTime.current = Date.now();

    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
  };

  const handleMapInteractionEnd = () => {
    // Reset interaction state after user stops interacting for 1 second
    interactionTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 1000);
  };

  // marker
  // const animatedStyle = useAnimatedStyle(() => {
  //   return {
  //     transform: [{ rotate: `${rotation.value}deg` }],
  //   };
  // });

  // bubble callout marker
  const bubbleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: bubbleVisible.value,
      transform: [
        {
          translateY: withTiming(bubbleVisible.value ? 0 : 6, {
            duration: 300,
          }),
        },
        {
          scale: withTiming(bubbleVisible.value ? 1 : 0.98, { duration: 300 }),
        },
      ],
    };
  });

  // get data all device
  useEffect(() => {
    actions.onGetGroupGPS(operation?.activity_id ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // bubble handling
  useEffect(() => {
    if (selectedVehicle) {
      showBubble();
    } else {
      hideBubble();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicle]);

  // heading marker
  useEffect(() => {
    const diff = shortestAngleDiff(lastRotation.current, bearing);
    const next = lastRotation.current + diff;

    rotation.value = withTiming(next, {
      duration: 300,
    });

    lastRotation.current = next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bearing]);

  // move camera when initiate
  useEffect(() => {
    if (!mapReady || !initialRegion || initialCameraSet) return;

    actionsLocTracker.onSetInitialCamera();
    setInitialCameraSet(true);
  }, [initialCameraSet, mapReady, initialRegion, actionsLocTracker]);

  if (isLoading) {
    return (
      <View style={[mainContent, styles.center]}>
        <View style={styles.loadingContainer}>
          <LottieView
            source={require("@/assets/lottie/trail-loading.json")}
            autoPlay
            loop
            style={styles.lottie}
          />

          <Text style={[whiteTextStyle]}>Getting your location..</Text>
        </View>
      </View>
    );
  }

  if (!initialRegion) {
    return (
      <View style={[mainContent, styles.center]}>
        <Text style={[whiteTextStyle]}>
          {error ?? "Location not available."}
        </Text>
        <Button title="Try again" onPress={refreshStatus} />
        <Text style={[greyTextStyle]}>
          GPS: {gpsEnabled ? "ON" : "OFF"} | Permission: {permissionStatus}
        </Text>
      </View>
    );
  }
  return (
    <View style={[{ flex: 1 }]}>
      <View style={[styles.mapWrapper]}>
        <MapView
          provider={PROVIDER_GOOGLE}
          ref={mapRef}
          customMapStyle={mapLightStyle}
          style={[styles.map]}
          initialRegion={initialRegion}
          scrollEnabled={true}
          rotateEnabled={true}
          onMapReady={() => {
            setMapReadyState(true);
            setMapReady(true);
          }}
          onPress={() => {
            actionsLocTracker.onSetSelectedVehicle(null);
            handleMapInteractionEnd();
          }}
          onPanDrag={() => {
            actionsLocTracker.onSetSelectedVehicle(null);
            handleMapInteractionStart();
          }}
          onRegionChange={() => {
            handleMapInteractionStart();
          }}
          onRegionChangeComplete={() => {
            handleMapInteractionEnd();
          }}
        >
          {listGPS.map((data: any, index: any) => {
            const device_id = data?.popup.split(" ")[1];
            const currentUser =
              device_id === storage.getString("user.username");
            const lat = currentUser
              ? lastLocation?.coords.latitude
              : parseFloat(data?.coords[0]);
            const long = currentUser
              ? lastLocation?.coords.longitude
              : parseFloat(data?.coords[1]);
            const dataSelected = {
              device_id,
              lat,
              long,
              id: data.id,
              is_online: data.is_online,
            };
            return (
              <Marker
                key={data.unit_id}
                coordinate={{
                  latitude: lat!,
                  longitude: long!,
                }}
                flat
                anchor={{ x: 0.5, y: 1 }}
                onPress={() => {
                  if (!isUserInteracting) {
                    actionsLocTracker.onFocusVehicle(dataSelected, index);
                  }
                }}
                style={{ width: 56, height: 56 }}
              >
                {/* <Animated.View style={animatedStyle}> */}
                <Image
                  source={
                    currentUser
                      ? require("@/assets/images/vehicle-top-pov-user.png")
                      : require("@/assets/images/vehicle-top-pov.png")
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                    resizeMode: "contain",
                  }}
                />
                {/* </Animated.View> */}
              </Marker>
            );
          })}
        </MapView>
        {selectedVehicle && (
          <Animated.View
            pointerEvents={"none"}
            style={[
              styles.infoBubble,
              bubbleAnimatedStyle,
              { top: height / 3.4 },
            ]}
          >
            <Text style={styles.title}>{selectedVehicle.device_id}</Text>

            <Text style={styles.subtitle}>
              {Math.round((selectedVehicle.speed ?? 0) * 3.6)} km/h
            </Text>
            <View style={styles.tail} />
          </Animated.View>
        )}
      </View>
      <View style={styles.footer}>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              width: "60%",
            }}
          >
            <TouchableOpacity
              style={styles.btnRefresh}
              activeOpacity={0.7}
              onPress={() => {
                actionsLocTracker.onSetSelectedVehicle(null);
                refreshStatus();
              }}
            >
              <Fontisto name="spinner-refresh" size={20} color={blueColor} />
              <Gap width={10} />
              <Text style={[blueTextStyle, { fontWeight: "700" }]}>
                Refresh
              </Text>
            </TouchableOpacity>
            <Gap width={20} />
            <TouchableOpacity
              style={styles.locationBtn}
              activeOpacity={0.7}
              onPress={() => {
                try {
                  actionsLocTracker.onSetSelectedVehicle(null);
                  actionsLocTracker.onGoToUserLocation();
                } catch (err) {
                  console.log(err);
                }
              }}
            >
              <Ionicons name="locate" size={24} color="#333" />
            </TouchableOpacity>
            <Gap width={10} />
            <TouchableOpacity
              style={styles.zoomBtn}
              activeOpacity={0.7}
              onPress={() => {
                if (!isUserInteracting) {
                  actionsLocTracker.onChangeZoomSnap(1);
                }
              }}
            >
              <Text style={styles.zoomText}>+</Text>
            </TouchableOpacity>
            <Gap width={10} />
            <TouchableOpacity
              style={styles.zoomBtn}
              activeOpacity={0.7}
              onPress={() => {
                if (!isUserInteracting) {
                  actionsLocTracker.onChangeZoomSnap(-1);
                }
              }}
            >
              <Text style={styles.zoomText}>−</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.coordinatesDesc, shadow]}>
            <Text style={[blackTextStyle]}>
              Lat: {lastLocation?.coords?.latitude} | lng:{" "}
              {lastLocation?.coords?.longitude}
            </Text>
          </View>
        </View>
        <View style={[styles.vehicleContainer]}>
          <FlatList
            ref={listRef}
            data={listGPS}
            keyExtractor={(item: any) => item.unit_id}
            renderItem={({ item, index }: any) => {
              const device_id = item?.popup.split(" ")[1];
              const currentUser =
                device_id === storage.getString("user.username");
              const lat = currentUser
                ? lastLocation?.coords.latitude
                : parseFloat(item?.coords[0]);
              const long = currentUser
                ? lastLocation?.coords.longitude
                : parseFloat(item?.coords[1]);
              const dataSelected = {
                device_id,
                lat,
                long,
                id: item.id,
                is_online: item.is_online,
              };
              return (
                <VehicleItem
                  item={item}
                  index={index}
                  selectedId={selectedId}
                  highlight={highlight}
                  onPress={() =>
                    actionsLocTracker.onFocusVehicle(dataSelected, index)
                  }
                />
              );
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </View>
    </View>
  );
};

export default MapComponent;

const styles = StyleSheet.create({
  mapWrapper: {
    flex: 1,
    borderRadius: 10,
    position: "relative",
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
  btnRefresh: {
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: blueColor,
    backgroundColor: blueRGBAColor,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationBtn: {
    width: 40,
    height: 40,
    backgroundColor: whiteColor,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    elevation: 5,
  },
  zoomBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: whiteColor,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  zoomText: {
    fontSize: 28,
    fontWeight: "bold",
    color: blackColor,
  },
  coordinatesDesc: {
    width: "auto",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 5,
    backgroundColor: whiteColor,
  },
  vehicleContainer: {
    backgroundColor: blackRGBAColor,
    marginHorizontal: 10,
    marginBottom: 20,
    padding: 10,
    borderRadius: 14,
  },
  loadingContainer: {
    width: 200,
    paddingVertical: 24,
    borderRadius: 16,
    backgroundColor: "#111",
    alignItems: "center",
  },
  lottie: {
    width: 100,
    height: 100,
  },
  infoBubble: {
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: whiteColor,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,

    shadowColor: blackColor,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontWeight: "600",
    fontSize: 14,
    color: blackColor,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
  },
  tail: {
    position: "absolute",
    bottom: -6,
    left: "75%",
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: whiteColor,
    transform: [{ rotate: "45deg" }],
  },
});
