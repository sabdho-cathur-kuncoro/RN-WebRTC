import { socketManager } from "./SocketManager";
import type {
  AnswerPayload,
  CallActionPayload,
  CancelCallPayload,
  IceCandidatePayload,
  IncomingCallPayload,
  OfferPayload,
  RejectCallPayload,
  StartCallPayload,
} from "./socketTypes";

/* =======================
   EMIT (Client → Server)
======================= */

export function startCall(payload: StartCallPayload) {
  const socket = socketManager.getSocket();
  if (!socket?.connected) return;

  socket.emit("call_user", payload);
}

export function acceptCall(payload: CallActionPayload) {
  const socket = socketManager.getSocket();
  if (!socket?.connected) return;

  socket.emit("accept_call", payload);
}

export function rejectCall(payload: RejectCallPayload) {
  const socket = socketManager.getSocket();
  if (!socket?.connected) return;

  socket.emit("reject_call", payload);
}

export function cancelCall(payload: CancelCallPayload) {
  const socket = socketManager.getSocket();
  if (!socket?.connected) return;

  socket.emit("cancel_call", payload);
}

export function endCall() {
  const socket = socketManager.getSocket();
  if (!socket?.connected) return;

  socket.emit("end_call");
}

/* =======================
   LISTEN (Server → Client)
======================= */

export function onIncomingCall(
  handler: (payload: IncomingCallPayload) => void
) {
  const socket = socketManager.getSocket();
  if (!socket) return;

  socket.off("incoming_call", handler);
  socket.on("incoming_call", handler);
}

export function onCallAccepted(handler: () => void) {
  const socket = socketManager.getSocket();
  if (!socket) return;

  socket.off("call_accepted", handler);
  socket.on("call_accepted", handler);
}

export function onCallRejected(
  handler: (payload: { roomId: string; rejectedBy: number }) => void
) {
  const socket = socketManager.getSocket();
  if (!socket) return;

  socket.off("call_rejected", handler);
  socket.on("call_rejected", handler);
}

export function onCallCancelled(
  handler: (payload: { roomId: string; canceledBy: number }) => void
) {
  const socket = socketManager.getSocket();
  if (!socket) return;

  socket.off("call_canceled", handler);
  socket.on("call_canceled", handler);
}

export function onCallEnded(handler: (payload: { peerId: string }) => void) {
  const socket = socketManager.getSocket();
  if (!socket) return;

  socket.off("call_ended", handler);
  socket.on("call_ended", handler);
}

/* ===== WEBRTC ===== */
/* ===== SEND ===== */

export function sendOffer(payload: OfferPayload) {
  socketManager.getSocket()?.emit("webrtc_offer", payload);
}

export function sendAnswer(payload: AnswerPayload) {
  socketManager.getSocket()?.emit("webrtc_answer", payload);
}

export function sendIceCandidate(payload: IceCandidatePayload) {
  socketManager.getSocket()?.emit("ice_candidate", payload);
}

/* ===== RECEIVE ===== */

export function onOffer(handler: (p: OfferPayload) => void) {
  const s = socketManager.getSocket();
  if (!s) return;
  s.off("webrtc_offer", handler);
  s.on("webrtc_offer", handler);
}

export function onAnswer(handler: (p: AnswerPayload) => void) {
  const s = socketManager.getSocket();
  if (!s) return;
  s.off("webrtc_answer", handler);
  s.on("webrtc_answer", handler);
}

export function onIceCandidate(handler: (p: IceCandidatePayload) => void) {
  const s = socketManager.getSocket();
  if (!s) return;
  s.off("ice_candidate", handler);
  s.on("ice_candidate", handler);
}
