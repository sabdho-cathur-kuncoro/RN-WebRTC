import FocusAwareStatusBar from "@/components/FocusAwareStatusbar";
import Gap from "@/components/Gap";
import {
  blackRGBAColor,
  mainContent,
  text,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { Fontisto } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
  interpolate,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const dummy = {
  id: 1,
  device_id: "DVC-001",
  video: [
    {
      id: 1,
      label: "Camera 1",
      img: require("@/assets/images/bodycam.png"),
    },
    {
      id: 2,
      label: "Camera 2",
      img: require("@/assets/images/street.png"),
    },
  ],
};

const Bodycam = () => {
  const [isSelectedVideo, setIsSelectedVideo] = useState<boolean>(false);
  const [focusedCamera, setFocusedCamera] = useState<{
    deviceId: string;
    cameraId: number;
  } | null>(null);

  // 0 = normal, 1 = focused/swap state
  const focus = useSharedValue(0);

  const { height } = useWindowDimensions();

  useEffect(() => {
    focus.value = withSpring(focusedCamera ? 1 : 0, {
      damping: 24,
      stiffness: 160,
    });
  }, [focusedCamera, focus]);

  const mainAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(focus.value, [0, 1], [1, 1.03]),
        },
      ],
      opacity: interpolate(focus.value, [0, 1], [0.9, 1]),
    };
  });

  const pipAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(focus.value, [0, 1], [0.9, 1]),
        },
      ],
      opacity: interpolate(focus.value, [0, 1], [0, 1]),
    };
  });

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <FocusAwareStatusBar barStyle={"light-content"} />
      <Animated.View
        layout={LinearTransition.springify()}
        style={[mainContent, { marginBottom: 20 }]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ width: "auto" }}>
            <Text style={[whiteTextStyle]}>{dummy.device_id}</Text>
          </View>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              width: "15%",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
            activeOpacity={0.7}
          >
            <Fontisto name="spinner-refresh" size={20} color={whiteColor} />
            <Gap width={10} />
            <Text style={[whiteTextStyle]}>Refresh</Text>
          </TouchableOpacity>
        </View>
        <Gap height={20} />
        <Animated.View
          layout={LinearTransition.springify()}
          style={[styles.content, { height: height * 0.75 }]}
        >
          {(() => {
            const isDeviceFocused =
              focusedCamera && focusedCamera.deviceId === dummy.device_id;

            // If this device has a focused camera -> render main + PiP
            if (isDeviceFocused) {
              const videos = dummy.video;
              const main = videos.find(
                (v: any) => v.id === focusedCamera?.cameraId
              );
              const pip = videos.find(
                (v: any) => v.id !== focusedCamera?.cameraId
              );

              if (!main || !pip) return null; // safety

              return (
                <View style={{ flex: 1, position: "relative" }}>
                  {/* MAIN (focused) video */}
                  <Animated.View
                    layout={LinearTransition.springify()}
                    style={styles.focusedContainer}
                  >
                    <Animated.View
                      style={[StyleSheet.absoluteFill, mainAnimatedStyle]}
                    >
                      <Image source={main.img} style={styles.focusedVideo} />
                      <View
                        style={[
                          styles.labelContainer,
                          { paddingHorizontal: 24, paddingVertical: 16 },
                        ]}
                      >
                        <View style={{ width: "auto" }}>
                          <Text style={[whiteTextStyle, text.label]}>
                            {main.label}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => {
                            focus.value = withSpring(0, {
                              damping: 16,
                              stiffness: 180,
                            });
                            if (isSelectedVideo) {
                              setIsSelectedVideo(false);
                              setFocusedCamera(null);
                              return;
                            }
                            setIsSelectedVideo(true);
                          }} // exit focus
                        >
                          <Image
                            source={require("@/assets/icons/ic-fullscreen.png")}
                            style={{ width: 20, height: 20 }}
                          />
                        </Pressable>
                      </View>
                    </Animated.View>
                  </Animated.View>

                  {/* PiP (thumbnail) */}
                  <Animated.View
                    layout={LinearTransition.springify()}
                    entering={FadeInDown.duration(200)}
                    exiting={FadeOutDown.duration(150)}
                    style={styles.pipContainer}
                  >
                    <Animated.View
                      style={[StyleSheet.absoluteFill, pipAnimatedStyle]}
                    >
                      <Pressable
                        onPress={() => {
                          focus.value = withSpring(1, {
                            damping: 12,
                            stiffness: 180,
                          });
                          setFocusedCamera({
                            deviceId: dummy.device_id,
                            cameraId: pip.id,
                          });
                        }}
                      >
                        <Image source={pip.img} style={styles.pipVideo} />
                        <View style={styles.labelContainer}>
                          <View style={{ width: "auto" }}>
                            <Text style={[whiteTextStyle, text.label]}>
                              {pip.label}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    </Animated.View>
                  </Animated.View>
                </View>
              );
            }

            // No focused camera for this device -> normal 2-column layout
            return dummy.video.map((video: any) => (
              <View
                key={video.id}
                style={{
                  width: "49%",
                  height: height * 0.75,
                  borderRadius: 5,
                  overflow: "hidden",
                }}
              >
                <Image
                  source={video.img}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 5,
                    resizeMode: "cover",
                  }}
                />
                <View style={styles.labelContainer}>
                  <View style={{ width: "auto" }}>
                    <Text style={[whiteTextStyle, text.label]}>
                      {video.label}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{ width: "10%", alignItems: "flex-end" }}
                    activeOpacity={0.7}
                    onPress={() => {
                      setFocusedCamera({
                        deviceId: dummy.device_id,
                        cameraId: video.id,
                      });
                      if (isSelectedVideo) {
                        setIsSelectedVideo(false);
                        setFocusedCamera(null);
                        return;
                      }
                      setIsSelectedVideo(true);
                    }}
                  >
                    <Image
                      source={require("@/assets/icons/ic-fullscreen.png")}
                      style={{ width: 20, height: 20 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ));
          })()}
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
};

export default Bodycam;

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // full-screen camera
  focusedContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 5,
    overflow: "hidden",
  },
  focusedVideo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  labelContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: blackRGBAColor,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 10,
  },

  // the PiP (thumbnail)
  pipContainer: {
    position: "absolute",
    bottom: 56,
    right: 24,
    width: 140,
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: blackRGBAColor,
  },
  pipVideo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
