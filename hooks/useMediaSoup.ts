// hooks/useMediasoup.ts
import { socketManager } from "@/socket/SocketManager";
import { prepareAndroidAudio } from "@/utils/audioRoute";
import * as mediasoupClient from "mediasoup-client";
import { Consumer, Device, Producer, Transport } from "mediasoup-client/types";
import { useEffect, useRef, useState } from "react";
import { NativeModules } from "react-native";
// import InCallManager from "react-native-incall-manager";
import { mediaDevices, registerGlobals } from "react-native-webrtc";

registerGlobals();

export function useMediasoup() {
  useEffect(() => {
    console.log("🧨 useMediasoup MOUNT");
    return () => console.log("💥 useMediasoup UNMOUNT");
  }, []);

  // const socket = socketManager.getSocket();
  /* =======================
     REFS
  ======================= */
  const deviceRef = useRef<Device | null>(null);
  const sendTransportRef = useRef<Transport | null>(null);
  const recvTransportRef = useRef<Transport | null>(null);

  const audioProducerRef = useRef<Producer | null>(null);
  const consumersRef = useRef<Map<string, Consumer>>(new Map());

  const localStreamRef = useRef<any>(null);
  const startingRef = useRef(false);
  const startedRef = useRef(false);
  const startedRoomRef = useRef<string | null>(null);
  const audioRouteStartedRef = useRef(false);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const hasAudioConsumerRef = useRef(false);

  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [hasRemoteAudio, setHasRemoteAudio] = useState(false);
  // 🔊 audio level indicator (0–100)
  const [remoteAudioActive, setRemoteAudioActive] = useState(false);
  const audioActivityTimerRef = useRef<any>(null);
  const bitrateIntervalRef = useRef<any>(null);

  /* =======================
     INTERNAL HELPERS
  ======================= */
  async function getLocalAudioTrack() {
    if (localStreamRef.current) {
      return localStreamRef.current.getAudioTracks()[0];
    }

    const stream = await mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      } as any,
      video: false,
    });

    localStreamRef.current = stream;

    const track = stream.getAudioTracks()[0];

    console.log("[MIC TRACK]", {
      enabled: track.enabled,
      readyState: track.readyState,
      muted: track.muted,
      settings: track.getSettings?.(),
    });

    return track;
  }

  /* =======================
     JOIN ROOM
  ======================= */
  async function joinRoom(roomId: string) {
    const socket = socketManager.getSocket();
    if (!socket || !socket.connected) {
      console.warn("[MediaSoup] socket not ready");
      return null;
    }

    return new Promise<any>((resolve) => {
      socket.emit("joinRoom", roomId, (res: any) => {
        resolve(res);
      });
    });
  }

  /* =======================
     MEDIASOUP DEVICE
  ======================= */
  function getDevice() {
    if (!deviceRef.current) {
      // console.log("[Mediasoup] creating Device singleton");
      deviceRef.current = new mediasoupClient.Device({
        handlerName: "ReactNative106", // WAJIB di RN
      });
    }
    return deviceRef.current;
  }

  /* =======================
     START MEDIASOUP (CALLER / CALLEE)
  ======================= */
  async function start(roomId: string) {
    if (startingRef.current) {
      console.log("[MEDIASOUP] start already running");
      return;
    }

    startingRef.current = true;

    try {
      const socket = socketManager.getSocket();
      if (!socket) throw new Error("socket not ready");

      console.log("[MEDIASOUP START] init transports");

      /* =========================
       1. JOIN ROOM
    ========================== */
      const routerRtpCapabilities = await joinRoom(roomId);
      if (!routerRtpCapabilities) return;

      const device = getDevice();
      await device.load({ routerRtpCapabilities });
      deviceRef.current = device;

      /* =========================
       2. SEND TRANSPORT
    ========================== */
      const sendParams = await new Promise<any>((res) =>
        socket.emit("createTransport", res)
      );

      const sendTransport = device.createSendTransport(sendParams);
      sendTransportRef.current = sendTransport;

      sendTransport.on("connect", ({ dtlsParameters }, cb) => {
        socket.emit("connectTransport", {
          transportId: sendTransport.id,
          dtlsParameters,
        });
        cb();
      });

      sendTransport.on("produce", ({ kind, rtpParameters }, cb) => {
        socket.emit(
          "produce",
          { transportId: sendTransport.id, kind, rtpParameters },
          ({ id }) => cb({ id })
        );
      });

      /* =========================
       3. PRODUCE AUDIO
    ========================== */
      prepareAndroidAudio();

      const audioTrack = await getLocalAudioTrack();
      audioProducerRef.current = await sendTransport.produce({
        track: audioTrack,
      });

      console.log("[AUDIO PRODUCER]", audioProducerRef.current.id);

      /* =========================
        4. RECV TRANSPORT
      ========================== */
      const recvParams = await new Promise<any>((res) =>
        socket.emit("createTransport", res)
      );

      const recvTransport = device.createRecvTransport(recvParams);
      recvTransportRef.current = recvTransport;

      recvTransport.on("connect", ({ dtlsParameters }, cb) => {
        socket.emit("connectTransport", {
          transportId: recvTransport.id,
          dtlsParameters,
        });
        cb();
      });

      recvTransport.on("connectionstatechange", (state) => {
        console.log("🔥 recvTransport:", state);
      });

      /* =========================
       5. EXISTING PRODUCERS
    ========================== */
      const producerIds = await new Promise<string[]>((res) =>
        socket.emit("getProducers", res)
      );

      console.log("[EXISTING PRODUCERS]", producerIds);

      for (const id of producerIds) {
        await consume(id);
      }

      /* =========================
       6. BARU SET STARTED
       (INI KUNCI UTAMA)
    ========================== */
      startedRef.current = true;
      startedRoomRef.current = roomId;

      console.log("✅ mediasoup fully started");
    } catch (err) {
      console.error("[MEDIASOUP start error]", err);
      cleanup("error");
    } finally {
      startingRef.current = false;
    }
  }

  /* =======================
     CONSUME
  ======================= */
  async function consume(producerId: string) {
    if (!producerId) return;
    if (!recvTransportRef.current || !deviceRef.current) return;

    // 🔥 HANYA SATU AUDIO
    if (hasAudioConsumerRef.current) {
      console.log("[IGNORE] extra audio producer", producerId);
      return;
    }

    const socket = socketManager.getSocket();
    if (!socket) return;

    console.log("[CONSUME]", producerId);

    const params = await new Promise<any>((resolve) =>
      socket.emit(
        "consume",
        {
          transportId: recvTransportRef.current!.id,
          producerId,
          rtpCapabilities: deviceRef.current!.recvRtpCapabilities,
        },
        resolve
      )
    );

    if (!params) {
      console.warn("[consume] empty params");
      return;
    }

    const consumer = await recvTransportRef.current.consume(params);
    consumersRef.current.set(producerId, consumer);
    console.log("[CONSUMER STATE]", {
      id: consumer.id,
      kind: consumer.kind,
      paused: consumer.paused,
      trackReady: consumer.track.readyState,
      trackEnabled: consumer.track.enabled,
      trackMuted: consumer.track.muted,
    });

    console.log("[AUDIO CONSUMER]", {
      id: consumer.id,
      paused: consumer.paused,
    });

    if (consumer.kind !== "audio") return;

    hasAudioConsumerRef.current = true;

    const track = consumer.track;

    // console.log("🔊 [REMOTE AUDIO TRACK]", {
    //   enabled: track.enabled,
    //   muted: track.muted,
    //   readyState: track.readyState,
    // });

    /* =====================================================
    MEDIASTREAM → RTCView
    ===================================================== */
    const stream = new MediaStream();
    stream.addTrack(track);

    remoteStreamRef.current = stream;
    setRemoteStream(stream);

    console.log("🔊 AudioSink stream", stream.id);

    /* =====================================================
    DEBUG RTP (INI AKAN > 0 KBPS JIKA SUKSES)
    ===================================================== */
    // const pc =
    //   (recvTransportRef.current as any)?._handler?._pc ??
    //   (recvTransportRef.current as any)?._handler?._transport?._pc;

    // if (!pc) {
    //   console.warn("[BITRATE] recv PC not found");
    //   return;
    // }

    // setTimeout(async () => {
    //   const stats = await pc.getStats();

    //   const reports =
    //     typeof stats.forEach === "function"
    //       ? Array.from(stats.values())
    //       : Array.isArray(stats)
    //       ? stats
    //       : Object.values(stats);

    //   console.log(
    //     "🧾 [STATS DUMP]",
    //     reports.map((r) => ({
    //       id: r.id,
    //       type: r.type,
    //       kind: r.kind,
    //       mediaType: r.mediaType,
    //       bytesReceived: r.bytesReceived,
    //       packetsReceived: r.packetsReceived,
    //       packetsLost: r.packetsLost,
    //       jitter: r.jitter,
    //       available: Object.keys(r),
    //     }))
    //   );
    // }, 2000);
  }

  /* =======================
     MUTE
  ======================= */
  function setMuted(muted: boolean) {
    const track = audioProducerRef.current?.track;
    if (track) track.enabled = !muted;
  }

  /* =======================
     CLEANUP
  ======================= */
  function cleanup(reason: "end" | "error", roomId?: string) {
    // 🔒 GUARD — hanya boleh sekali
    if (!startedRef.current) {
      console.log("[CLEANUP SKIPPED] already cleaned");
      return;
    }
    if (roomId && startedRoomRef.current !== roomId) {
      console.log("[SKIP CLEANUP] room mismatch", {
        started: startedRoomRef.current,
        incoming: roomId,
      });
      return;
    }
    console.log("[CLEANUP MEDIA]", reason);

    // --- SOCKET ---
    const socket = socketManager.getSocket();
    socket?.off("getProducers");
    socket?.off("newProducer");

    // --- PRODUCER ---
    audioProducerRef.current?.close();
    audioProducerRef.current = null;

    // --- CONSUMERS ---
    consumersRef.current.forEach((c) => c.close());
    consumersRef.current.clear();

    // --- TRANSPORTS ---
    sendTransportRef.current?.close();
    recvTransportRef.current?.close();
    sendTransportRef.current = null;
    recvTransportRef.current = null;

    // --- LOCAL MEDIA ---
    localStreamRef.current?.getTracks().forEach((t: any) => t.stop());
    localStreamRef.current = null;

    hasAudioConsumerRef.current = false;

    // --- REMOTE MEDIA ---
    remoteStreamRef.current = null;
    setRemoteStream(null);
    if (reason === "end") {
      NativeModules.AudioRoute?.abandonAudioFocus?.();
    }

    deviceRef.current = null;
    startedRoomRef.current = null;
    setTimeout(() => {
      audioRouteStartedRef.current = false;
    }, 300);

    // --- AUDIO ROUTE (ONCE) ---
    // InCallManager.setForceSpeakerphoneOn(false);
    // InCallManager.stop();
    startedRef.current = false;

    if (audioActivityTimerRef.current) {
      clearInterval(audioActivityTimerRef.current);
      audioActivityTimerRef.current = null;
    }
    setRemoteAudioActive(false);

    if (bitrateIntervalRef.current) {
      clearInterval(bitrateIntervalRef.current);
      bitrateIntervalRef.current = null;
    }

    console.log("[CLEANUP DONE]");
  }

  return {
    start, // caller & callee pakai sama
    setMuted,
    remoteStream,
    hasRemoteAudio,
    remoteAudioActive,
    cleanup,
  };
}
