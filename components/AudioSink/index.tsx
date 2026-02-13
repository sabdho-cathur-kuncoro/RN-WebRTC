import { useMediasoupContext } from "@/contexts/MediaSoupContext";
import { RTCView } from "react-native-webrtc";

export function AudioSink() {
  const { remoteStream } = useMediasoupContext();
  console.log("🔊 AudioSink stream", remoteStream?.id);

  if (!remoteStream) return null;

  return (
    <RTCView
      streamURL={remoteStream.toURL()}
      style={{
        width: 1,
        height: 1,
        opacity: 0.01,
      }}
      objectFit="cover"
    />
  );
}
