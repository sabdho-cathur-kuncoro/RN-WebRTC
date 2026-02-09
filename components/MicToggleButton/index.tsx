import { greenColor, greyColor, whiteTextStyle } from "@/constants/theme";
import { useCallContext } from "@/contexts/CallContext";
import { Pressable, StyleSheet, Text } from "react-native";

export function MicToggleButton() {
  const { isMuted, toggleMute, callState } = useCallContext();

  const visible = callState === "CONNECTED";
  if (!visible) return null;

  return (
    <Pressable
      style={[styles.btn, isMuted ? styles.muted : styles.unmuted]}
      onPress={toggleMute}
    >
      <Text style={[styles.text, whiteTextStyle]}>
        {isMuted ? "Mic Off" : "Mic On"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  muted: {
    backgroundColor: greyColor,
  },
  unmuted: {
    backgroundColor: greenColor,
  },
  text: {
    fontWeight: "600",
    fontSize: 12,
  },
});
