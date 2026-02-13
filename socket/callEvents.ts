// socket/callEvents.ts
import { socketManager } from "./SocketManager";
import type {
  CallAcceptedPayload,
  CallActionPayload,
  CallCanceledPayload,
  CallEndedPayload,
  CallRejectedPayload,
  CancelCallPayload,
  IncomingCallPayload,
  RejectCallPayload,
  StartCallPayload,
} from "./socketTypes";

/* =======================
   INTERNAL HELPER
======================= */
function getSocket() {
  return socketManager.getSocket();
}

/* =======================
   CLIENT → SERVER (EMIT)
======================= */

// Caller start call
export function startCall(payload: StartCallPayload) {
  getSocket()?.emit("call_user", payload);
}

// Callee accept
export function acceptCall(payload: CallActionPayload) {
  getSocket()?.emit("accept_call", payload);
}

// Callee reject
export function rejectCall(payload: RejectCallPayload) {
  getSocket()?.emit("reject_call", payload);
}

// Caller cancel before accepted
export function cancelCall(payload: CancelCallPayload) {
  getSocket()?.emit("cancel_call", payload);
}

// Either side end call
export function endCall(payload: CallEndedPayload) {
  getSocket()?.emit("end_call", payload);
}

/* =======================
   SERVER → CLIENT (ON)
======================= */

export function onIncomingCall(cb: (payload: IncomingCallPayload) => void) {
  const socket = getSocket();
  if (!socket) return () => {};

  socket.on("incoming_call", cb);
  return () => socket.off("incoming_call", cb);
}

export function onCallAccepted(cb: (payload: CallAcceptedPayload) => void) {
  const socket = getSocket();
  if (!socket) return () => {};

  socket.on("call_accepted", cb);
  return () => socket.off("call_accepted", cb);
}

export function onCallRejected(cb: (payload: CallRejectedPayload) => void) {
  const socket = getSocket();
  if (!socket) return () => {};

  socket.on("call_rejected", cb);
  return () => socket.off("call_rejected", cb);
}

export function onCallCancelled(cb: (payload: CallCanceledPayload) => void) {
  const socket = getSocket();
  if (!socket) return () => {};

  socket.on("call_canceled", cb);
  return () => socket.off("call_canceled", cb);
}

export function onCallEnded(cb: any) {
  return socketManager.onConnected((socket) => {
    socket.on("call_ended", cb);
  });
}
