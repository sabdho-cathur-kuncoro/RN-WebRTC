// // hooks/useCall.ts
// import {
//   acceptCall,
//   cancelCall,
//   endCall,
//   onAnswer,
//   onCallAccepted,
//   onCallCancelled,
//   onCallEnded,
//   onCallRejected,
//   onIceCandidate,
//   onIncomingCall,
//   onOffer,
//   rejectCall,
//   sendAnswer,
//   sendIceCandidate,
//   sendOffer,
//   startCall,
// } from "@/socket/callEvents";
// import { CallUIState } from "@/socket/socketTypes";
// import { useCallback, useEffect, useRef, useState } from "react";
// import { useCallPermissions } from "./useCallPermissions";
// import { useWebRTC } from "./useWebRTC";

// const TIMEOUT = 30_000;

// export function useCall() {
//   const [callState, setCallState] = useState<CallUIState>("IDLE");
//   const [roomId, setRoomId] = useState<string | null>(null);
//   const [callerId, setCallerId] = useState<number | null>(null);
//   const [calleeId, setCalleeId] = useState<number | null>(null);
//   const [isMuted, setIsMuted] = useState(false);

//   const offerCreatedRef = useRef(false);

//   const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const callStateRef = useRef(callState);
//   callStateRef.current = callState;

//   const socketBoundRef = useRef(false);

//   const { requestMicrophonePermission } = useCallPermissions();

//   const webrtc = useWebRTC({
//     enabled: callState === "OUTGOING" || callState === "CONNECTED",
//     isMuted,
//     onSendOffer: (sdp) => roomId && sendOffer({ roomId, sdp }),
//     onSendAnswer: (sdp) => roomId && sendAnswer({ roomId, sdp }),
//     onSendIce: (candidate) => roomId && sendIceCandidate({ roomId, candidate }),
//   });

//   /* =======================
//      RESET
//   ======================= */
//   const reset = useCallback(() => {
//     timeoutRef.current && clearTimeout(timeoutRef.current);
//     timeoutRef.current = null;
//     offerCreatedRef.current = false;

//     webrtc.cleanup();
//     setRoomId(null);
//     setCallerId(null);
//     setCalleeId(null);
//     setIsMuted(false);
//     setCallState("IDLE");
//   }, [webrtc]);

//   /* =======================
//      OUTGOING
//   ======================= */
//   const startOutgoingCall = useCallback(
//     async (targetUserId: number, roomId: string) => {
//       const res = await requestMicrophonePermission();
//       if (!res.granted) return;

//       startCall({ roomId, targetUserId });
//       setRoomId(roomId);
//       setCalleeId(targetUserId);
//       setCallState("OUTGOING");

//       timeoutRef.current = setTimeout(() => {
//         setCallState("MISSED");
//       }, TIMEOUT);
//     },
//     [requestMicrophonePermission]
//   );

//   const cancelOutgoingCall = useCallback(() => {
//     if (!roomId || !calleeId) return;
//     cancelCall({ roomId, targetUserId: calleeId });
//     reset();
//   }, [roomId, calleeId, reset]);

//   /* =======================
//      INCOMING
//   ======================= */
//   const acceptIncomingCall = useCallback(async () => {
//     const res = await requestMicrophonePermission();
//     if (!res.granted || !roomId) return;

//     acceptCall({ roomId });
//     setCallState("CONNECTED");
//   }, [requestMicrophonePermission, roomId]);

//   const rejectIncomingCall = useCallback(() => {
//     if (!roomId || !callerId) return;
//     rejectCall({ roomId, fromUserId: callerId });
//     reset();
//   }, [roomId, callerId, reset]);

//   const endCurrentCall = useCallback(() => {
//     endCall();
//     reset();
//   }, [reset]);

//   /* =======================
//      SOCKET LISTENERS (ONCE)
//   ======================= */
//   useEffect(() => {
//     if (socketBoundRef.current) return;
//     socketBoundRef.current = true;

//     onIncomingCall(({ roomId, fromUserId }) => {
//       if (callStateRef.current !== "IDLE") return;

//       setRoomId(roomId);
//       setCallerId(fromUserId);
//       setCallState("INCOMING");

//       timeoutRef.current = setTimeout(() => {
//         setCallState("MISSED");
//       }, TIMEOUT);
//     });

//     onCallAccepted(() => {
//       if (offerCreatedRef.current) return;
//       offerCreatedRef.current = true;
//       webrtc.createOffer();
//       setCallState("CONNECTED");
//     });

//     onOffer(({ sdp }) => webrtc.handleOffer(sdp));
//     onAnswer(({ sdp }) => webrtc.handleAnswer(sdp));
//     onIceCandidate(({ candidate }) => webrtc.addIceCandidate(candidate));

//     onCallRejected(reset);
//     onCallCancelled(reset);
//     onCallEnded(reset);
//   }, [webrtc, reset]);

//   return {
//     callState,
//     roomId,
//     callerId,
//     calleeId,
//     isMuted,

//     startOutgoingCall,
//     cancelOutgoingCall,
//     acceptIncomingCall,
//     rejectIncomingCall,
//     endCurrentCall,

//     toggleMute: () => setIsMuted((v) => !v),
//   };
// }
