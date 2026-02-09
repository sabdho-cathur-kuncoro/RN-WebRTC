import {
  greyColor,
  greyTextStyle,
  navyColor,
  redColor,
  strokeColor,
  whiteTextStyle,
} from "@/constants/theme";
import { useCallContext } from "@/contexts/CallContext";
import { useCallTimer } from "@/hooks/useCallTimer";
import { formatDuration } from "@/utils/formatDuration";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MicToggleButton } from "../MicToggleButton";
import { SpeakerToggleButton } from "../SpeakerToggleButton";

export function FloatingCallBar() {
  const { callState, endCurrentCall, calleeId, callerId, isMuted } =
    useCallContext();

  const isConnected = callState === "CONNECTED";

  const seconds = useCallTimer(isConnected);
  const duration = formatDuration(seconds);

  // if (callState !== "CONNECTED" && callState !== "OUTGOING") return null;

  // const label = callState === "OUTGOING" ? "Calling…" : "On call";

  let label = "";

  switch (callState) {
    case "OUTGOING":
      label = "Calling…";
      break;

    case "MISSED":
      label = "No answer";
      break;

    case "CONNECTED":
      label = "On call";
      break;

    default:
      label = "";
  }

  if (!label) {
    return null;
  }

  const peerId = callerId ?? calleeId;

  return (
    <View style={styles.container}>
      <View>
        <Text style={[styles.title, whiteTextStyle]}>{label}</Text>
        {isConnected && (
          <Text style={[styles.subtitle, whiteTextStyle]}>
            {duration} {isMuted ? "• Mic off" : ""}
          </Text>
        )}
        {isConnected && peerId && (
          <Text style={[styles.subtitle, greyTextStyle]}>
            User ID: {peerId}
          </Text>
        )}
      </View>

      <View style={styles.right}>
        <MicToggleButton />
        <SpeakerToggleButton />
        <Pressable
          style={[
            styles.endBtn,
            { backgroundColor: callState === "MISSED" ? greyColor : redColor },
          ]}
          onPress={endCurrentCall}
        >
          <Text style={[styles.endText, whiteTextStyle]}>
            {callState === "MISSED" ? "Close" : "End"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: navyColor,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: strokeColor,
    zIndex: 999,

    // shadow
    shadowColor: greyColor,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  endBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  endText: {
    fontWeight: "600",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
