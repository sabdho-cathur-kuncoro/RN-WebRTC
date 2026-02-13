// // hooks/useWebRTC.ts
// import {
//   WebRTCIceCandidate,
//   WebRTCSessionDescription,
// } from "@/socket/socketTypes";
// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   mediaDevices,
//   MediaStream,
//   RTCIceCandidate,
//   RTCPeerConnection,
//   RTCSessionDescription,
// } from "react-native-webrtc";

// type Params = {
//   enabled: boolean;
//   isMuted: boolean;
//   onSendOffer: (sdp: WebRTCSessionDescription) => void;
//   onSendAnswer: (sdp: WebRTCSessionDescription) => void;
//   onSendIce: (candidate: WebRTCIceCandidate) => void;
// };

// export function useWebRTC({
//   enabled,
//   isMuted,
//   onSendOffer,
//   onSendAnswer,
//   onSendIce,
// }: Params) {
//   const pcRef = useRef<RTCPeerConnection | null>(null);
//   const localStreamRef = useRef<MediaStream | null>(null);
//   const offerCreatedRef = useRef(false);

//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

//   /* =======================
//      INIT / CLEANUP
//   ======================= */
//   useEffect(() => {
//     if (!enabled) {
//       cleanup();
//       return;
//     }

//     const pc = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     const pcWithEvents = pc as unknown as {
//       onicecandidate?: (event: any) => void;
//       onaddstream?: (event: any) => void;
//     };

//     pcWithEvents.onicecandidate = (event) => {
//       const c = event?.candidate;
//       if (!c || !c.candidate) return;

//       onSendIce({
//         candidate: c.candidate,
//         sdpMid: c.sdpMid ?? undefined,
//         sdpMLineIndex: c.sdpMLineIndex ?? undefined,
//       });
//     };

//     pcRef.current = pc;

//     return () => cleanup();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [enabled]);

//   /* =======================
//      LOCAL AUDIO (ONCE)
//   ======================= */
//   const ensureLocalStream = useCallback(async () => {
//     if (localStreamRef.current) return localStreamRef.current;
//     if (!pcRef.current) return null;

//     const stream = await mediaDevices.getUserMedia({
//       audio: true,
//       video: false,
//     });

//     localStreamRef.current = stream;

//     stream.getTracks().forEach((track) => {
//       pcRef.current!.addTrack(track, stream);
//     });

//     return stream;
//   }, []);

//   /* =======================
//      MUTE
//   ======================= */
//   useEffect(() => {
//     const stream = localStreamRef.current;
//     if (!stream) return;

//     stream.getAudioTracks().forEach((t) => {
//       t.enabled = !isMuted;
//     });
//   }, [isMuted]);

//   /* =======================
//      OFFER / ANSWER
//   ======================= */
//   const createOffer = useCallback(async () => {
//     if (!pcRef.current) return;
//     if (pcRef.current.signalingState !== "stable") {
//       console.warn(
//         "Skip createOffer, signalingState:",
//         pcRef.current.signalingState
//       );
//       return;
//     }
//     if (offerCreatedRef.current) return;

//     offerCreatedRef.current = true;

//     await ensureLocalStream();

//     const offer = await pcRef.current.createOffer();
//     await pcRef.current.setLocalDescription(offer);

//     onSendOffer({
//       type: "offer",
//       sdp: offer.sdp!,
//     });
//   }, [ensureLocalStream, onSendOffer]);

//   const handleOffer = useCallback(
//     async (sdp: WebRTCSessionDescription) => {
//       if (!pcRef.current) return;

//       await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));

//       await ensureLocalStream();

//       const answer = await pcRef.current.createAnswer();
//       await pcRef.current.setLocalDescription(answer);

//       onSendAnswer({
//         type: "answer",
//         sdp: answer.sdp!,
//       });
//     },
//     [ensureLocalStream, onSendAnswer]
//   );

//   const handleAnswer = useCallback(async (sdp: WebRTCSessionDescription) => {
//     if (!pcRef.current) return;

//     await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//   }, []);

//   /* =======================
//      ICE
//   ======================= */
//   const addIceCandidate = useCallback(async (c: WebRTCIceCandidate) => {
//     if (!pcRef.current) return;
//     await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
//   }, []);

//   /* =======================
//      CLEANUP
//   ======================= */
//   const cleanup = useCallback(() => {
//     offerCreatedRef.current = false;

//     localStreamRef.current?.getTracks().forEach((t) => t.stop());
//     localStreamRef.current = null;

//     pcRef.current?.close();
//     pcRef.current = null;

//     setRemoteStream(null);
//   }, []);

//   return {
//     remoteStream,
//     createOffer,
//     handleOffer,
//     handleAnswer,
//     addIceCandidate,
//     cleanup,
//   };
// }

// // const pcWithEvents = pc as unknown as {
// //   onicecandidate?: (event: any) => void;
// //   onaddstream?: (event: any) => void;
// // };

// // pcWithEvents.onicecandidate = (event) => {
// //   const c = event?.candidate;
// //   if (!c || !c.candidate) return;

// //   onSendIce({
// //     candidate: c.candidate,
// //     sdpMid: c.sdpMid ?? undefined,
// //     sdpMLineIndex: c.sdpMLineIndex ?? undefined,
// //   });
// // };
