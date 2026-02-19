import { greenColor, greyColor, whiteColor } from "@/constants/theme";
import { useCallContext } from "@/contexts/CallContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

export function MicToggleButton() {
  const { isMuted, toggleMute, callState } = useCallContext();

  const visible = callState === "CONNECTED";
  if (!visible) return null;

  return (
    <Pressable
      style={[styles.btn, isMuted ? styles.muted : styles.unmuted]}
      onPress={toggleMute}
    >
      <Ionicons
        name={isMuted ? "mic-off" : "mic"}
        size={28}
        color={whiteColor}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  muted: {
    backgroundColor: greyColor,
  },
  unmuted: {
    backgroundColor: greenColor,
  },
});
