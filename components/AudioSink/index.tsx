import { useMediasoupContext } from "@/contexts/MediaSoupContext";
import { useEffect } from "react";
import { RTCView } from "react-native-webrtc";

export function AudioSink() {
  const { remoteStream } = useMediasoupContext();

  useEffect(() => {
    console.log("🔊 COMPONENT AudioSink stream", remoteStream?.id);
  }, [remoteStream]);

  return (
    <RTCView
      streamURL={remoteStream ? remoteStream.toURL() : undefined}
      style={{
        width: 1,
        height: 1,
        opacity: 0.01,
      }}
    />
  );
}
