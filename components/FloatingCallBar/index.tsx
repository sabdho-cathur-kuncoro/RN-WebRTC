import {
  greyColor,
  greyTextStyle,
  navyColor,
  redColor,
  strokeColor,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { useCallContext } from "@/contexts/CallContext";
import { useMediasoupContext } from "@/contexts/MediaSoupContext";
import { useCallTimer } from "@/hooks/useCallTimer";
import { formatDuration } from "@/utils/formatDuration";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Gap from "../Gap";
import { MicToggleButton } from "../MicToggleButton";

export function FloatingCallBar() {
  const { callState, calleeId, callerId, isMuted, endCurrentCall } =
    useCallContext();
  const { cleanup, setMuted, remoteAudioActive } = useMediasoupContext();
  const startedCallRef = useRef(false);

  const isConnected = callState === "CONNECTED";
  const peerId = callerId ?? calleeId;

  const seconds = useCallTimer(isConnected);
  const duration = formatDuration(seconds);

  useEffect(() => {
    if (callState !== "CONNECTED") {
      startedCallRef.current = false;
    }
  }, [callState]);

  useEffect(() => {
    setMuted(isMuted);
  }, [isMuted, setMuted]);

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
        {/* {isConnected && (
          <Text
            style={{ color: remoteAudioActive ? "lime" : "red", fontSize: 12 }}
          >
            {remoteAudioActive ? "Audio active" : "No audio"}
          </Text>
        )} */}
      </View>

      <View style={styles.right}>
        <MicToggleButton />
        <Gap width={2} />
        {/* <SpeakerToggleButton /> */}
        <Pressable
          style={[
            styles.endBtn,
            {
              backgroundColor: callState === "MISSED" ? greyColor : redColor,
            },
          ]}
          onPress={() => {
            cleanup("end");
            endCurrentCall();
          }}
        >
          <MaterialIcons
            name={callState === "MISSED" ? "phone-callback" : "call-end"}
            size={28}
            color={whiteColor}
          />
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
    paddingHorizontal: 8,
    paddingVertical: 6,
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
