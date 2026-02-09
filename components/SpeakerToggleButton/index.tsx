import { blueColor, greyColor, whiteTextStyle } from "@/constants/theme";
import { useCallContext } from "@/contexts/CallContext";
import { Pressable, StyleSheet, Text } from "react-native";

export function SpeakerToggleButton() {
  const { isSpeakerOn, toggleSpeaker, callState } = useCallContext();

  if (callState !== "CONNECTED") return null;

  return (
    <Pressable
      style={[styles.btn, isSpeakerOn ? styles.on : styles.off]}
      onPress={toggleSpeaker}
    >
      <Text style={[styles.text, whiteTextStyle]}>
        {isSpeakerOn ? "Speaker On" : "Speaker Off"}
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
  on: {
    backgroundColor: blueColor, // blue
  },
  off: {
    backgroundColor: greyColor, // gray
  },
  text: {
    fontWeight: "600",
    fontSize: 12,
  },
});
