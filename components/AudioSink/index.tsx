import { useMediasoupContext } from "@/contexts/MediaSoupContext";
import { RTCView } from "react-native-webrtc";

export function AudioSink() {
  const { remoteStream } = useMediasoupContext();

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
