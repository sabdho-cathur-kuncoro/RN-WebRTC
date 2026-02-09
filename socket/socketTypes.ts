/* =======================
   SOCKET STATES
======================= */
export type SocketStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

/* =======================
   CALL STATES
======================= */
export type CallState =
  | "INITIATED"
  | "RINGING"
  | "ACCEPTED"
  | "REJECTED"
  | "MISSED"
  | "CANCELLED"
  | "ENDED";

export type CallUIState =
  | "IDLE"
  | "OUTGOING"
  | "INCOMING"
  | "CONNECTED"
  | "MISSED";

export type WebRTCSessionDescription = {
  type: "offer" | "answer";
  sdp: string;
};

export type WebRTCIceCandidate = {
  candidate: string;
  sdpMid?: string;
  sdpMLineIndex?: number;
};

export type RTCPeerConnectionWithEvents = RTCPeerConnection & {
  onicecandidate?: (event: any) => void;
  onaddstream?: (event: any) => void;
};

/* =======================
   PAYLOADS
======================= */
// CHAT
export interface JoinRoomPayload {
  conversationId: string;
}

export interface SendMessagePayload {
  clientId: string;
  conversationId: string;
  senderId: number;
  content: string;
  createdAt: number;
}

// CALL
export interface IncomingCallPayload {
  roomId: string;
  fromUserId: number;
  toUserId: number;
}

export type OfferPayload = {
  roomId: string;
  sdp: WebRTCSessionDescription;
};

export type AnswerPayload = {
  roomId: string;
  sdp: WebRTCSessionDescription;
};

export type IceCandidatePayload = {
  roomId: string;
  candidate: WebRTCIceCandidate;
};

/* ========= CLIENT → SERVER ========= */
export interface StartCallPayload {
  roomId: string;
  targetUserId: number;
}
export interface CallActionPayload {
  roomId: string;
}
export interface RejectCallPayload {
  roomId: string;
  fromUserId: number;
}
export interface CancelCallPayload {
  roomId: string;
  targetUserId: number;
}

/* ========= SERVER → CLIENT ========= */
export interface CallRejectedPayload {
  roomId: string;
  rejectedBy: number;
}
export interface CallAcceptedPayload {
  roomId: string;
  acceptedBy: number;
}
export interface CallCanceledPayload {
  roomId: string;
  canceledBy: number;
}
export interface CallEndedPayload {
  peerId: string;
}

// export interface IceCandidatePayload {
//   roomId: string;
//   candidate: RTCIceCandidateInit;
// }

// export interface SdpPayload {
//   roomId: string;
//   sdp: RTCSessionDescriptionInit;
// }

/* =======================
   CLIENT → SERVER EVENTS
======================= */
export interface ClientToServerEvents {
  // CHAT
  join_room: (conversationId: string) => void;
  send_message: (payload: SendMessagePayload) => void;

  // CALL
  call_user: (payload: StartCallPayload) => void;
  accept_call: (payload: CallActionPayload) => void;
  reject_call: (payload: RejectCallPayload) => void;
  cancel_call: (payload: CancelCallPayload) => void;
  call_reconnect: (payload: CallActionPayload) => void;
  end_call: () => void;

  webrtc_offer: (payload: OfferPayload) => void;
  webrtc_answer: (payload: AnswerPayload) => void;
  ice_candidate: (payload: IceCandidatePayload) => void;
}

/* =======================
   SERVER → CLIENT EVENTS
======================= */
export interface ServerToClientEvents {
  // CHAT
  new_message: (payload: any) => void;

  // CALL
  incoming_call: (payload: IncomingCallPayload) => void;
  call_accepted: (payload: CallAcceptedPayload) => void;
  call_rejected: (payload: CallRejectedPayload) => void;
  call_canceled: (payload: CallCanceledPayload) => void;
  call_ended: (payload: CallEndedPayload) => void;

  webrtc_offer: (payload: OfferPayload) => void;
  webrtc_answer: (payload: AnswerPayload) => void;
  ice_candidate: (payload: IceCandidatePayload) => void;
}
