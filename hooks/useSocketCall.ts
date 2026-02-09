// src/hooks/useSocketCall.ts
import { useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://your-socket-server.com";

export const useSocketCall = () => {
  const socketRef = useRef<Socket | null>(null);

  const connectSocket = useCallback((userId: string) => {
    if (socketRef.current) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { userId },
    });
  }, []);

  const disconnectSocket = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  const joinCallRoom = useCallback((callId: string) => {
    socketRef.current?.emit("call:join", { callId });
  }, []);

  // ----------- CALL LIFECYCLE -----------

  const emitAcceptCall = useCallback((callId: string) => {
    socketRef.current?.emit("call:accept", { callId });
  }, []);

  const emitRejectCall = useCallback((callId: string) => {
    socketRef.current?.emit("call:reject", { callId });
  }, []);

  const emitEndCall = useCallback((callId: string) => {
    socketRef.current?.emit("call:end", { callId });
  }, []);

  // ----------- WEBRTC SIGNALING -----------

  const emitOffer = useCallback((callId: string, sdp: any) => {
    socketRef.current?.emit("webrtc:offer", { callId, sdp });
  }, []);

  const emitAnswer = useCallback((callId: string, sdp: any) => {
    socketRef.current?.emit("webrtc:answer", { callId, sdp });
  }, []);

  const emitIceCandidate = useCallback((callId: string, candidate: any) => {
    socketRef.current?.emit("webrtc:ice", { callId, candidate });
  }, []);

  // ----------- LISTENERS -----------

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler);
  }, []);

  const off = useCallback(
    (event: string, handler?: (...args: any[]) => void) => {
      socketRef.current?.off(event, handler);
    },
    []
  );

  return {
    connectSocket,
    disconnectSocket,
    joinCallRoom,

    emitAcceptCall,
    emitRejectCall,
    emitEndCall,

    emitOffer,
    emitAnswer,
    emitIceCandidate,

    on,
    off,
  };
};
