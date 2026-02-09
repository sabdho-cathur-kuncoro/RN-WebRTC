import { blackRGBAColor, whiteColor } from "@/constants/theme";
import { useLoadingStore } from "@/stores/loading.store";
import LottieView from "lottie-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const GlobalLoading = () => {
  const visible = useLoadingStore((s) => s.visible);
  const message = useLoadingStore((s) => s.message);
  const cancellable = useLoadingStore((s) => s.cancellable);
  const cancelLoading = useLoadingStore((s) => s.cancelLoading);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <LottieView
          source={require("@/assets/lottie/trail-loading.json")}
          autoPlay
          loop
          style={styles.lottie}
        />

        {message && <Text style={styles.text}>{message}</Text>}

        {cancellable && (
          <Pressable onPress={cancelLoading} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default GlobalLoading;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: blackRGBAColor,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  container: {
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
  text: {
    marginTop: 12,
    color: whiteColor,
    fontSize: 14,
    textAlign: "center",
  },
  cancelBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#555",
  },
  cancelText: {
    color: whiteColor,
    fontSize: 14,
  },
});
