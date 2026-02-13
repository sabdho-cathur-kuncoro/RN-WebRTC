import Button from "@/components/Button";
import FocusAwareStatusBar from "@/components/FocusAwareStatusbar";
import Gap from "@/components/Gap";
import { mapLightStyle } from "@/components/MapComponent/map.style";
import {
  bgColor,
  blackColor,
  blackTextStyle,
  blueColor,
  blueRGBAColor,
  blueTextStyle,
  dot,
  greenColor,
  greyColor,
  greyTextStyle,
  line,
  mainContent,
  navyColor,
  redColor,
  shadow,
  strokeColor,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import useHandleLocation from "@/hooks/useHandleLocation";
import { useLocationTracker } from "@/hooks/useLocationTracker";
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

const DUMMY = [
  {
    id: 1,
    device_id: "DVC-001",
    lat: "-6.2088",
    lng: "106.8456",
    isOnline: true,
  },
  {
    id: 2,
    device_id: "DVC-002",
    lat: "-6.2088",
    lng: "106.8456",
    isOnline: true,
  },
  {
    id: 3,
    device_id: "DVC-003",
    lat: "-6.2088",
    lng: "106.8456",
    isOnline: true,
  },
  {
    id: 4,
    device_id: "DVC-004",
    lat: "-6.2088",
    lng: "106.8456",
    isOnline: true,
  },
  {
    id: 5,
    device_id: "DVC-005",
    lat: "-6.2088",
    lng: "106.8456",
    isOnline: true,
  },
  {
    id: 6,
    device_id: "DVC-006",
    lat: "-6.2088",
    lng: "106.8456",
    isOnline: true,
  },
  {
    id: 7,
    device_id: "DVC-007",
    lat: "-6.2088",
    lng: "106.8456",
    isOnline: true,
  },
  {
    id: 8,
    device_id: "DVC-008",
    lat: "-6.2088",
    lng: "106.8456",
    isOnline: true,
  },
  {
    id: 9,
    device_id: "DVC-009",
    lat: "-6.2088",
    lng: "106.8456",
    isOnline: true,
  },
  {
    id: 10,
    device_id: "DVC-010",
    lat: "-6.2088",
    lng: "106.8456",
    isOnline: true,
  },
];

const Map = () => {
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
    actions.onGetGPS();
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

  return (
    <View style={[styles.container]}>
      <FocusAwareStatusBar barStyle={"light-content"} />
      <View style={styles.header}>
        <Text style={styles.appTitle}>KOMANDO</Text>
        <TouchableOpacity>
          <Ionicons name="notifications" size={22} color={whiteColor} />
          <View style={dot} />
        </TouchableOpacity>
      </View>
      <View style={[line]} />
      <Gap height={20} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={styles.sidebarContainer}>
          <FlatList
            data={listGPS}
            keyExtractor={(item: any) => item.popup}
            contentContainerStyle={{ paddingBottom: 80 }}
            renderItem={({ item, index }: any) => {
              const device_id = item?.popup?.split(" ")[1];
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
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (!isUserInteracting) {
                      actionsLocTracker.onFocusVehicle(dataSelected, index);
                    }
                  }}
                  style={styles.cardContainer}
                >
                  <View style={styles.row}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        width: "70%",
                      }}
                    >
                      <Image
                        source={require("@/assets/images/vehicle-user.png")}
                        style={{ width: 40, height: 40, resizeMode: "cover" }}
                      />
                      <Gap width={20} />
                      <Text style={[whiteTextStyle]}>{device_id}</Text>
                    </View>
                    <View
                      style={{
                        width: "29%",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      <View
                        style={[
                          styles.dotContainer,
                          {
                            backgroundColor: item?.is_online
                              ? greenColor
                              : redColor,
                          },
                        ]}
                      />
                      <Gap width={10} />
                      <Text style={[whiteTextStyle, { fontSize: 12 }]}>
                        {item?.is_online ? "Online" : "Offline"}
                      </Text>
                    </View>
                  </View>
                  <View style={[line, { marginVertical: 20 }]} />
                  <View
                    style={{
                      width: "90%",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="location" color={greyColor} size={20} />
                    <Gap width={10} />
                    <Text style={[whiteTextStyle, { fontSize: 12 }]}>
                      Lat: {lat} | Lng: {long}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
        <View style={{ width: "70%" }}>
          <View style={[styles.mapWrapper]}>
            {initialRegion ? (
              <>
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
                        key={device_id}
                        coordinate={{
                          latitude: lat!,
                          longitude: long!,
                        }}
                        flat
                        anchor={{ x: 0.5, y: 1 }}
                        onPress={() => {
                          if (!isUserInteracting) {
                            actionsLocTracker.onFocusVehicle(
                              dataSelected,
                              index
                            );
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
                      { top: height / 4.5 },
                    ]}
                  >
                    <Text style={styles.title}>
                      {selectedVehicle.device_id}
                    </Text>

                    <Text style={styles.subtitle}>
                      {Math.round((selectedVehicle.speed ?? 0) * 3.6)} km/h
                    </Text>
                    <View style={styles.tail} />
                  </Animated.View>
                )}
              </>
            ) : (
              <View style={[styles.center]}>
                <Text style={[whiteTextStyle]}>
                  {error ?? "Location not available."}
                </Text>
                <Button title="Try again" onPress={refreshStatus} />
                <Text style={[greyTextStyle]}>
                  GPS: {gpsEnabled ? "ON" : "OFF"} | Permission:{" "}
                  {permissionStatus}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.footer}>
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-between",
                padding: 10,
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
                  <Fontisto
                    name="spinner-refresh"
                    size={20}
                    color={blueColor}
                  />
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
          </View>
        </View>
      </View>
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bgColor,
    paddingHorizontal: 20,
  },
  header: {
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appTitle: {
    color: "#F9FAFB",
    fontSize: 18,
    fontWeight: "600",
  },
  sidebarContainer: {
    width: "29%",
  },
  mapWrapper: {
    flex: 0.89,
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
  lottie: {
    width: 100,
    height: 100,
  },
  loadingContainer: {
    width: 200,
    paddingVertical: 24,
    borderRadius: 16,
    backgroundColor: "#111",
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    width: "100%",
    bottom: 100,
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
  cardContainer: {
    width: "100%",
    marginBottom: 20,
    backgroundColor: navyColor,
    borderWidth: 1,
    borderColor: strokeColor,
    padding: 20,
    borderRadius: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dotContainer: {
    width: 12,
    height: 12,
    borderRadius: 12,
  },
  infoBubble: {
    position: "absolute",
    alignSelf: "center",
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
