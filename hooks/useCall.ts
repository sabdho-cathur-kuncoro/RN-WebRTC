// hooks/useCall.ts
import { useMediasoupContext } from "@/contexts/MediaSoupContext";
import {
  acceptCall,
  cancelCall,
  endCall,
  onCallAccepted,
  onCallCancelled,
  onCallEnded,
  onCallRejected,
  onIncomingCall,
  rejectCall,
  startCall,
} from "@/socket/callEvents";
import { CallUIState } from "@/socket/socketTypes";
import { storage } from "@/utils/storage";
import { useCallback, useEffect, useRef, useState } from "react";
import InCallManager from "react-native-incall-manager";
import { useCallPermissions } from "./useCallPermissions";

const INCOMING_TIMEOUT_MS = 30_000;
const OUTGOING_TIMEOUT_MS = 30_000;

export function useCall() {
  /* =======================
     STATE
  ======================= */
  const [callState, setCallState] = useState<CallUIState>("IDLE");
  const [roomId, setRoomId] = useState<string | null>(null);

  const [callerId, setCallerId] = useState<number | null>(null);
  const [calleeId, setCalleeId] = useState<number | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [showMicModal, setShowMicModal] = useState(false);

  const callStateRef = useRef<CallUIState>(callState);
  const prevCallStateRef = useRef<CallUIState>("IDLE");
  const callAcceptedOnceRef = useRef(false);
  const rejectedRoomRef = useRef<string | null>(null);
  const roomIdRef = useRef<string | null>(null);

  callStateRef.current = callState;

  const incomingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const outgoingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { requestMicrophonePermission } = useCallPermissions();

  useEffect(() => {
    prevCallStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    if (callState === "IDLE") {
      rejectedRoomRef.current = null;
    }
  }, [callState]);

  /* =======================
     MEDIASOUP (MEDIA ONLY)
  ======================= */
  const mediasoup = useMediasoupContext();

  /* =======================
     RESET
  ======================= */
  const resetUI = useCallback(() => {
    callStateRef.current = "IDLE";
    setCallState("IDLE");

    setRoomId(null);
    setCallerId(null);
    setCalleeId(null);
    setIsMuted(false);

    incomingTimeoutRef.current && clearTimeout(incomingTimeoutRef.current);
    outgoingTimeoutRef.current && clearTimeout(outgoingTimeoutRef.current);

    incomingTimeoutRef.current = null;
    outgoingTimeoutRef.current = null;
  }, []);

  const forceEndCall = useCallback(
    (reason: string) => {
      if (callStateRef.current === "IDLE") return;

      console.log("[FORCE END CALL]", reason);

      callAcceptedOnceRef.current = false;

      callStateRef.current = "IDLE";
      // 🔥 SATU-SATUNYA cleanup mediasoup
      mediasoup?.cleanup("end", roomIdRef.current ?? undefined);

      resetUI();
    },
    [mediasoup, resetUI]
  );

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

      await mediasoup?.start(roomId);
      startCall({ roomId, targetUserId });

      setRoomId(roomId);
      setCalleeId(targetUserId);
      setCallState("OUTGOING");
    },
    [mediasoup, requestMicrophonePermission]
  );

  const cancelOutgoingCall = useCallback(() => {
    if (!roomId || !calleeId) return;

    cancelCall({ roomId, targetUserId: calleeId });
    resetUI();
  }, [roomId, calleeId, resetUI]);

  /* =======================
     INCOMING (CALLEE)
  ======================= */
  const acceptIncomingCall = useCallback(async () => {
    const res = await requestMicrophonePermission();
    if (!res.granted || !roomId) {
      setShowMicModal(true);
      return;
    }

    await mediasoup?.start(roomId);
    acceptCall({ roomId });
    InCallManager.stopRingtone();
    // mediasoup.start() → dipicu dari call_accepted
  }, [mediasoup, requestMicrophonePermission, roomId]);

  const rejectIncomingCall = useCallback(() => {
    if (callStateRef.current !== "INCOMING") return;
    if (!roomId || !callerId) return;

    rejectedRoomRef.current = roomId;
    rejectCall({ roomId, fromUserId: callerId });

    // ⛔ clear timeout incoming
    incomingTimeoutRef.current && clearTimeout(incomingTimeoutRef.current);
    incomingTimeoutRef.current = null;

    // 🔥 terminal reset
    forceEndCall("reject incoming");
  }, [roomId, callerId, forceEndCall]);

  /* =======================
     END CALL
  ======================= */
  const endCurrentCall = useCallback(() => {
    const rid = roomIdRef.current;
    const state = callStateRef.current;

    if (!rid) return;

    if (state === "OUTGOING" || state === "MISSED") {
      cancelCall({ roomId: rid, targetUserId: calleeId! });
      resetUI();
      return;
    }

    if (state === "CONNECTED") {
      endCall({ roomId: rid });

      forceEndCall("local end call");
    }
  }, [calleeId, forceEndCall, resetUI]);

  /* =======================
     TIMEOUT HANDLING
  ======================= */
  useEffect(() => {
    if (callState !== "INCOMING") return;

    incomingTimeoutRef.current = setTimeout(() => {
      setCallState("MISSED");
    }, INCOMING_TIMEOUT_MS);

    return () => {
      incomingTimeoutRef.current && clearTimeout(incomingTimeoutRef.current);
    };
  }, [callState]);

  useEffect(() => {
    if (callState !== "OUTGOING") return;

    outgoingTimeoutRef.current = setTimeout(() => {
      setCallState("MISSED");
    }, OUTGOING_TIMEOUT_MS);

    return () => {
      outgoingTimeoutRef.current && clearTimeout(outgoingTimeoutRef.current);
    };
  }, [callState]);

  /* =======================
     SOCKET EVENTS
     (SINGLE, STABLE, CLEAN)
  ======================= */
  useEffect(() => {
    const offIncoming = onIncomingCall((payload) => {
      if (callStateRef.current !== "IDLE") return;
      const userId = storage.getString("user.id");
      const callee = payload.toUserId;

      if (callee.toString() === userId) {
        // 🔥 RESET ACCEPT FLAG UNTUK CALL BARU
        callAcceptedOnceRef.current = false;

        setRoomId(payload.roomId);
        setCallerId(payload.fromUserId);
        setCallState("INCOMING");
        // InCallManager.startRingtone("_BUNDLE_", 2, "", 10);
      }
    });

    const offAccepted = onCallAccepted(async ({ roomId }) => {
      if (callAcceptedOnceRef.current) {
        console.log("[CALL_ACCEPTED IGNORED]");
        return;
      }

      callAcceptedOnceRef.current = true;

      setCallState("CONNECTED");
      // await mediasoup?.start(roomId);
    });

    const resetCallAccepted = () => {
      callAcceptedOnceRef.current = false;
    };

    // const offRejected = onCallRejected(() => {
    //   if (callStateRef.current !== "IDLE") {
    //     resetUI();
    //     resetCallAccepted();
    //   }
    // });
    const offRejected = onCallRejected(() => {
      if (callStateRef.current === "CONNECTED") {
        forceEndCall("rejected after connected");
        return;
      }
      resetUI();
      callAcceptedOnceRef.current = false;
      InCallManager.stopRingtone();
    });

    const offCancelled = onCallCancelled(() => {
      if (callStateRef.current !== "IDLE") {
        resetUI();
        resetCallAccepted();
      }
    });
    const offEnded = onCallEnded(() => {
      console.log("[CALL_ENDED RECEIVED]");

      // 🔥 server hanya kirim peerId → anggap terminal
      if (callStateRef.current === "IDLE") return;

      forceEndCall("call ended by peer");
    });

    return () => {
      offIncoming?.();
      offAccepted?.();
      offRejected?.();
      offCancelled?.();
      offEnded?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =======================
     MUTE SYNC
  ======================= */
  useEffect(() => {
    mediasoup?.setMuted(isMuted);
  }, [isMuted, mediasoup]);

  /* =======================
     PUBLIC API
  ======================= */
  return {
    callState,
    roomId,
    callerId,
    calleeId,

    isMuted,
    showMicModal,

    isSpeakerOn,

    // outgoing
    startOutgoingCall,
    cancelOutgoingCall,

    // incoming
    acceptIncomingCall,
    rejectIncomingCall,

    // end
    endCurrentCall,

    // mic
    toggleMute: () => setIsMuted((v) => !v),
    // speaker
    toggleSpeaker: () => setIsSpeakerOn((v) => !v),
  };
}
