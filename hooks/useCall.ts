// hooks/useCall.ts
import {
  acceptCall,
  cancelCall,
  endCall,
  onAnswer,
  onCallAccepted,
  onCallCancelled,
  onCallEnded,
  onCallRejected,
  onIceCandidate,
  onIncomingCall,
  onOffer,
  rejectCall,
  sendAnswer,
  sendIceCandidate,
  sendOffer,
  startCall,
} from "@/socket/callEvents";
import { CallUIState } from "@/socket/socketTypes";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCallPermissions } from "./useCallPermissions";
import { useWebRTC } from "./useWebRTC";

const INCOMING_TIMEOUT_MS = 30_000; // 30 s
const OUTGOING_TIMEOUT_MS = 30_000;

export function useCall() {
  /* =======================
     STATE
  ======================= */
  const [showMicModal, setShowMicModal] = useState(false);
  const [callState, setCallState] = useState<CallUIState>("IDLE");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  // caller / callee tracking
  const [callerId, setCallerId] = useState<number | null>(null);
  const [calleeId, setCalleeId] = useState<number | null>(null);

  const { requestMicrophonePermission } = useCallPermissions();

  const isCallerRef = useRef(false);
  const offerSentRef = useRef(false);

  const incomingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const outgoingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const callStateRef = useRef(callState);
  callStateRef.current = callState;

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn((prev) => !prev);
  }, []);

  /* =======================
     WEBRTC (ALWAYS CALLED)
  ======================= */
  const webrtc = useWebRTC({
    enabled: !!roomId,
    isMuted,
    onSendOffer: (sdp) => {
      if (!roomId) return;
      sendOffer({ roomId, sdp });
    },
    onSendAnswer: (sdp) => {
      if (!roomId) return;
      sendAnswer({ roomId, sdp });
    },
    onSendIce: (candidate) => {
      if (!roomId) return;
      sendIceCandidate({ roomId, candidate });
    },
  });

  /* =======================
     RESET
  ======================= */
  const reset = useCallback(() => {
    incomingTimeoutRef.current && clearTimeout(incomingTimeoutRef.current);
    outgoingTimeoutRef.current && clearTimeout(outgoingTimeoutRef.current);

    incomingTimeoutRef.current = null;
    outgoingTimeoutRef.current = null;

    webrtc.cleanup();
    setRoomId(null);
    setCallerId(null);
    setCalleeId(null);
    setIsMuted(false);
    setIsSpeakerOn(false);
    setCallState("IDLE");
  }, [webrtc]);

  const dismissMissedCall = useCallback(() => {
    if (callState !== "MISSED") return;
    reset();
  }, [callState, reset]);

  /* =======================
     OUTGOING (CALLER)
  ======================= */
  const startOutgoingCall = useCallback(
    async (targetUserId: number, roomId: string) => {
      const res = await requestMicrophonePermission();

      if (!res.granted) {
        setShowMicModal(true);
        return;
      }
      isCallerRef.current = true;
      offerSentRef.current = false;
      startCall({ roomId, targetUserId });
      setRoomId(roomId);
      setCalleeId(targetUserId);
      setCallState("OUTGOING");
    },
    [requestMicrophonePermission]
  );

  const cancelOutgoingCall = useCallback(() => {
    if (!roomId || !calleeId) return;

    cancelCall({
      roomId,
      targetUserId: calleeId,
    });

    reset();
  }, [roomId, calleeId, reset]);

  /* =======================
     INCOMING (CALLEE)
  ======================= */
  const acceptIncomingCall = useCallback(async () => {
    const res = await requestMicrophonePermission();

    if (!res.granted) {
      setShowMicModal(true);
      return;
    }
    if (!roomId) return;

    acceptCall({ roomId });

    // caller akan create offer setelah call_accepted
    setCallState("CONNECTED");
  }, [requestMicrophonePermission, roomId]);

  const rejectIncomingCall = useCallback(() => {
    if (!roomId || !callerId) return;

    rejectCall({
      roomId,
      fromUserId: callerId,
    });

    reset();
  }, [roomId, callerId, reset]);

  /* =======================
     END CALL (BOTH)
  ======================= */
  const endCurrentCall = useCallback(() => {
    endCall(); // server TIDAK menerima payload
    reset();
  }, [reset]);

  // INCOMING CALL
  useEffect(() => {
    if (callState !== "INCOMING") {
      if (incomingTimeoutRef.current) {
        clearTimeout(incomingTimeoutRef.current);
        incomingTimeoutRef.current = null;
      }
      return;
    }

    incomingTimeoutRef.current = setTimeout(() => {
      setCallState("MISSED");
    }, INCOMING_TIMEOUT_MS);

    return () => {
      if (incomingTimeoutRef.current) {
        clearTimeout(incomingTimeoutRef.current);
        incomingTimeoutRef.current = null;
      }
    };
  }, [callState]);

  // OUTGOING CALL
  useEffect(() => {
    if (callState !== "OUTGOING") return;

    const t = setTimeout(() => {
      setCallState("MISSED");
    }, OUTGOING_TIMEOUT_MS);

    return () => clearTimeout(t);
  }, [callState]);

  /* =======================
     SOCKET LISTENERS
  ======================= */
  useEffect(() => {
    /* ---------- incoming call ---------- */
    onIncomingCall((payload) => {
      if (callStateRef.current !== "IDLE") return;

      isCallerRef.current = false;
      offerSentRef.current = false;

      setRoomId(payload.roomId);
      setCallerId(payload.fromUserId);
      setCallState("INCOMING");
    });

    /* ---------- call accepted ---------- */
    onCallAccepted(() => {
      // 🔒 HANYA CALLER
      if (!isCallerRef.current) return;

      // 🔒 HANYA SEKALI
      if (offerSentRef.current) return;
      offerSentRef.current = true;

      // beri 1 tick agar native siap
      setTimeout(() => {
        webrtc.createOffer();
      }, 0);

      setCallState("CONNECTED");
    });

    /* ---------- call rejected ---------- */
    onCallRejected(() => {
      reset();
    });

    /* ---------- call canceled ---------- */
    onCallCancelled(() => {
      reset();
    });

    /* ---------- call ended ---------- */
    onCallEnded(() => {
      reset();
    });

    /* ---------- WEBRTC SIGNALING ---------- */
    onOffer(({ sdp }) => {
      webrtc.handleOffer(sdp);
    });

    onAnswer(({ sdp }) => {
      webrtc.handleAnswer(sdp);
    });

    onIceCandidate(({ candidate }) => {
      webrtc.addIceCandidate(candidate);
    });
  }, [webrtc, reset]);

  /* =======================
     PUBLIC API
  ======================= */

  // ⬇️ UI TEST ONLY
  const __setTestState = useCallback(
    (state: CallUIState, payload?: { roomId?: string; callerId?: number }) => {
      setCallState(state);

      if (payload?.roomId) setRoomId(payload.roomId);
      if (payload?.callerId) setCallerId(payload.callerId);
    },
    []
  );

  // DEV ONLY — UI testing helpers
  const __simulateOutgoing = useCallback(() => {
    setRoomId("test-room");
    setCallState("OUTGOING");
  }, []);

  const __simulateIncomingCall = useCallback((callerId = 99) => {
    setRoomId("test-room");
    setCallerId(callerId);
    setCallState("INCOMING");
  }, []);

  const __simulateConnected = useCallback(() => {
    setCallState("CONNECTED");
  }, []);

  const __simulateMissed = useCallback(() => {
    setCallState("MISSED");
  }, []);

  const __simulateEnd = useCallback(() => {
    setRoomId(null);
    setCallerId(null);
    setCalleeId(null);
    setCallState("IDLE");
  }, []);
  return {
    callState,
    roomId,
    callerId,
    calleeId,

    isMuted,
    isSpeakerOn,

    showMicModal,

    // outgoing
    startOutgoingCall,
    cancelOutgoingCall,

    // incoming
    acceptIncomingCall,
    rejectIncomingCall,

    // end
    endCurrentCall,
    dismissMissedCall,

    toggleMute,
    toggleSpeaker,

    ...(__DEV__ && {
      __setTestState,
      __simulateOutgoing,
      __simulateIncomingCall,
      __simulateConnected,
      __simulateMissed,
      __simulateEnd,
    }),
  };
}
