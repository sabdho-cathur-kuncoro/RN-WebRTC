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
   CALL STATES (DOMAIN)
======================= */
export type CallState =
  | "INITIATED"
  | "RINGING"
  | "ACCEPTED"
  | "REJECTED"
  | "MISSED"
  | "CANCELLED"
  | "ENDED";

/* =======================
   CALL STATES (UI)
======================= */
export type CallUIState =
  | "IDLE"
  | "OUTGOING"
  | "INCOMING"
  | "CONNECTED"
  | "MISSED";

/* =======================
   WEBRTC SIGNALING TYPES
======================= */
export type WebRTCSessionDescription = {
  type: "offer" | "answer";
  sdp: string;
};

export type WebRTCIceCandidate = {
  candidate: string;
  sdpMid?: string;
  sdpMLineIndex?: number;
};

/* =======================
   PAYLOADS
======================= */

/* ---------- CHAT ---------- */
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

/* ---------- CALL (GENERIC) ---------- */
export interface IncomingCallPayload {
  roomId: string;
  fromUserId: number;
  toUserId: number;
}

/* ---------- WEBRTC ---------- */
export interface OfferPayload {
  roomId: string;
  sdp: WebRTCSessionDescription;
}

export interface AnswerPayload {
  roomId: string;
  sdp: WebRTCSessionDescription;
}

export interface IceCandidatePayload {
  roomId: string;
  candidate: WebRTCIceCandidate;
}

/* =======================
   MEDIASOUP PAYLOADS
======================= */

export type JoinCallPayload = {
  roomId: string;
};

export type CreateTransportPayload = {
  roomId: string;
};

export type ConnectTransportPayload = {
  transportId: string;
  dtlsParameters: any;
};

export type ProducePayload = {
  transportId: string;
  kind: "audio" | "video";
  rtpParameters: any;
};

export type ConsumePayload = {
  transportId: string | null | undefined;
  producerId: string;
  rtpCapabilities: any;
};

export type ExistingProducer = string;

/* =======================
   CLIENT → SERVER
======================= */
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

/* =======================
   SERVER → CLIENT
======================= */
export interface CallAcceptedPayload {
  roomId: string;
  acceptedBy: number;
}

export interface CallRejectedPayload {
  roomId: string;
  rejectedBy: number;
}

export interface CallCanceledPayload {
  roomId: string;
  canceledBy: number;
}

export interface CallEndedPayload {
  roomId: string;
}

/* =======================
   CLIENT → SERVER EVENTS
======================= */
export interface ClientToServerEvents {
  // CHAT
  join_room: (
    conversationId: string,
    cb: (rtpCapabilities: any) => void
  ) => void;
  send_message: (payload: SendMessagePayload) => void;

  // CALL
  call_user: (payload: StartCallPayload) => void;
  accept_call: (payload: CallActionPayload) => void;
  reject_call: (payload: RejectCallPayload) => void;
  cancel_call: (payload: CancelCallPayload) => void;
  call_reconnect: (payload: CallActionPayload) => void;
  end_call: (payload: CallEndedPayload) => void;

  /* ===== MEDIASOUP ===== */
  joinRoom: (roomId: string, cb: (rtpCaps: any) => void) => void;
  createTransport: (cb: (params: any) => void) => void;
  connect_transport: (payload: ConnectTransportPayload) => void;
  produce: (payload: ProducePayload, cb: (res: { id: string }) => void) => void;
  getProducers: (cb: (list: ExistingProducer[]) => void) => void;
  consume: (payload: ConsumePayload, cb: (params: any) => void) => void;
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

  // MEDIASOUP
  getProducers: (list: ExistingProducer[]) => void;
  newProducer: (payload: { producerId: string }) => void;
  producer_closed: (payload: { producerId: string }) => void;
}
