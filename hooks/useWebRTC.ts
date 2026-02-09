import {
  WebRTCIceCandidate,
  WebRTCSessionDescription,
} from "@/socket/socketTypes";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from "react-native-webrtc";

console.log("RN-WEBRTC CHECK:", {
  mediaDevices,
  getUserMedia: mediaDevices?.getUserMedia,
});

type UseWebRTCParams = {
  enabled: boolean;
  isMuted: boolean;
  onSendOffer: (sdp: WebRTCSessionDescription) => void;
  onSendAnswer: (sdp: WebRTCSessionDescription) => void;
  onSendIce: (candidate: WebRTCIceCandidate) => void;
};

export function useWebRTC({
  enabled,
  isMuted,
  onSendOffer,
  onSendAnswer,
  onSendIce,
}: UseWebRTCParams) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  /* =======================
     INIT PEER CONNECTION
  ======================= */
  useEffect(() => {
    if (!enabled) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    const pcWithEvents = pc as unknown as {
      onicecandidate?: (event: any) => void;
      onaddstream?: (event: any) => void;
    };

    pcWithEvents.onicecandidate = (event) => {
      const c = event?.candidate;
      if (!c || !c.candidate) return;

      onSendIce({
        candidate: c.candidate,
        sdpMid: c.sdpMid ?? undefined,
        sdpMLineIndex: c.sdpMLineIndex ?? undefined,
      });
    };

    pcWithEvents.onaddstream = (event) => {
      setRemoteStream(event.stream);
    };

    pcRef.current = pc;

    return () => {
      // DO NOT cleanup stream here
      pc.close();
      pcRef.current = null;
    };
  }, [enabled, onSendIce]);

  /* =======================
     LOCAL AUDIO
  ======================= */
  const ensureLocalAudioStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    if (!pcRef.current) return null;

    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    localStreamRef.current = stream;

    stream.getTracks().forEach((track) => {
      pcRef.current!.addTrack(track, stream);
    });

    return stream;
  }, []);

  /* =======================
     MUTE
  ======================= */
  useEffect(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    stream.getAudioTracks().forEach((t) => {
      t.enabled = !isMuted;
    });
  }, [isMuted]);

  /* =======================
     OFFER / ANSWER
  ======================= */
  const createOffer = useCallback(async () => {
    if (!pcRef.current) return;

    await ensureLocalAudioStream();

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    onSendOffer({
      type: "offer",
      sdp: offer.sdp!,
    });
  }, [ensureLocalAudioStream, onSendOffer]);

  const handleOffer = useCallback(
    async (sdp: WebRTCSessionDescription) => {
      if (!pcRef.current) return;

      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));

      await ensureLocalAudioStream();

      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      onSendAnswer({
        type: "answer",
        sdp: answer.sdp!,
      });
    },
    [ensureLocalAudioStream, onSendAnswer]
  );

  const handleAnswer = useCallback(async (sdp: WebRTCSessionDescription) => {
    if (!pcRef.current) return;

    await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
  }, []);

  /* =======================
     ICE
  ======================= */
  const addIceCandidate = useCallback(async (candidate: WebRTCIceCandidate) => {
    if (!pcRef.current) return;
    await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
  }, []);

  /* =======================
     CLEANUP (MANUAL)
  ======================= */
  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;

    pcRef.current?.close();
    pcRef.current = null;

    setRemoteStream(null);
  }, []);

  return {
    remoteStream,
    createOffer,
    handleOffer,
    handleAnswer,
    addIceCandidate,
    cleanup,
  };
}
