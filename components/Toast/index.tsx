/* eslint-disable react-hooks/exhaustive-deps */
import { shadow, whiteColor } from "@/constants/theme";
import { useToastStore } from "@/stores/toast.store";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

type ToastItemProps = {
  data: any;
  onClose: () => void;
  duration: number;
};

const ToastItem = ({ data, onClose, duration }: ToastItemProps) => {
  const translateY = useSharedValue(-30);
  const opacity = useSharedValue(0);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  useEffect(() => {
    // Animate in
    translateY.value = withSpring(0);
    opacity.value = withSpring(1);

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      triggerClose();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const triggerClose = () => {
    if (isExiting) {
      return;
    }
    setIsExiting(true);

    // Animate out
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(-20, { duration: 200 }, (finished) => {
      if (finished) {
        scheduleOnRN(onClose);
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, shadow, styles.toastContainer]}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={[data.fromBGColor, data.toBGColor]}
        style={[styles.toastContent, { borderColor: data.borderColor }]}
      >
        <View style={styles.row}>
          <View style={styles.iconWrapper}>
            <View style={styles.iconContainer}>
              <MaterialIcons name={data.icon} size={20} color={data.color} />
            </View>
          </View>

          <View style={styles.messageWrapper}>
            <Text
              style={[
                // whiteTextStyle,
                {
                  marginBottom: 2,
                  color: "#FEF2F2",
                },
              ]}
            >
              {data.title}
            </Text>
            <Text
              style={[{ fontSize: 12, color: "#FEF2F2" }]}
              numberOfLines={3}
            >
              {data.message}
            </Text>
          </View>

          <Pressable style={styles.closeWrapper} onPress={triggerClose}>
            <MaterialIcons name="close" size={18} color={"#FEF2F2"} />
          </Pressable>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const AppToast = () => {
  const toasts = useToastStore((s) => s.toasts);
  const duration = useToastStore((s) => s.duration);
  const removeToast = useToastStore((s) => s.removeToast);

  // reverse for stacking order (latest on top)
  const orderedToasts = [...toasts].reverse();

  const deleteToast = useCallback(
    (id: number) => {
      removeToast(id);
    },
    [removeToast]
  );

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container}>
      {orderedToasts.map((data) => (
        <ToastItem
          key={data.id}
          data={data}
          duration={duration}
          onClose={() => deleteToast(data.id)}
        />
      ))}
    </View>
  );
};

export default AppToast;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    paddingHorizontal: 16,
    maxHeight: "100%",
    zIndex: 999,
    top: 30,
    right: 16,
    backgroundColor: "transparent",
  },
  toastContainer: {
    width: 400,
    backgroundColor: whiteColor,
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    alignSelf: "center",
  },
  toastContent: {
    width: "100%",
    borderRadius: 10,
    padding: 12,
    borderWidth: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconWrapper: {
    paddingRight: 8,
    justifyContent: "center",
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: whiteColor,
    alignItems: "center",
    justifyContent: "center",
  },
  messageWrapper: {
    flex: 1,
  },
  closeWrapper: {
    paddingLeft: 8,
    justifyContent: "center",
  },
});
