// hooks/useMediasoup.ts
import { socketManager } from "@/socket/SocketManager";
import { ExistingProducer } from "@/socket/socketTypes";
import * as mediasoupClient from "mediasoup-client";
import type {
  Consumer,
  Device,
  Producer,
  Transport,
} from "mediasoup-client/types";
import { useEffect, useRef, useState } from "react";
import { NativeModules, Platform } from "react-native";
import InCallManager from "react-native-incall-manager";
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
    try {
      if (startingRef.current) {
        console.log("[MEDIASOUP] start already in progress");
        return;
      }

      startingRef.current = true;
      const socket = socketManager.getSocket();
      if (!socket) {
        console.warn("[MediaSoup] socket not initialized yet");
        return null;
      }
      if (startedRoomRef.current === roomId) {
        console.warn("[MediaSoup] already started for room", roomId);
        return;
      }
      if (startedRef.current) {
        console.log("[MediaSoup] already started");
        return;
      }
      if (sendTransportRef.current || recvTransportRef.current) {
        console.log("[MEDIASOUP START SKIPPED] transport exists");
        return;
      }

      console.log("[MEDIASOUP START] init transports");

      /* ---- 1. join room & load device ---- */
      const routerRtpCapabilities = await joinRoom(roomId);
      if (!routerRtpCapabilities) return;
      startedRoomRef.current = roomId;
      startedRef.current = true;

      console.log("RTCPeerConnection exists:", !!global.RTCPeerConnection);

      const device = getDevice();
      await device.load({ routerRtpCapabilities });

      console.log("[Mediasoup] Device loaded", {
        canProduceAudio: device.canProduce("audio"),
        rtpCapabilities: device.rtpCapabilities,
      });
      deviceRef.current = device;
      console.log("[START] after device.load");

      /* ---- 2. SEND TRANSPORT ---- */
      console.log("[START] before createTransport send");
      const sendParams = await new Promise<any>((resolve, reject) => {
        console.log("[START] emit createTransport (send)");
        socket.emit("createTransport", (res) => {
          if (!res) return reject(new Error("no send transport response"));
          resolve(res);
        });
      });
      console.log("[START] after sendTransport params");

      const sendTransport = device.createSendTransport(sendParams);
      sendTransportRef.current = sendTransport;

      console.log("[Mediasoup] sendTransport created", sendTransport.id);

      sendTransport.on("connect", ({ dtlsParameters }, cb) => {
        console.log("[Mediasoup] sendTransport connect");
        socket?.emit("connect_transport", {
          transportId: sendTransport.id,
          dtlsParameters,
        });
        cb();
      });
      // Monitoring status: connecting, connected, failed, closed
      // Digunakan untuk debug network
      sendTransport.on("connectionstatechange", (state) => {
        console.log("🔥 sendTransport state:", state);

        if (state === "failed" || state === "disconnected") {
          console.warn("[MEDIASOUP] sendTransport failed");

          // 🔥 cleanup INTERNAL, BUKAN end call
          cleanup("error");
        }
      });

      sendTransport.on("produce", ({ kind, rtpParameters }, cb) => {
        console.log("[Mediasoup] produce", kind);
        socket?.emit(
          "produce",
          {
            transportId: sendTransport.id,
            kind,
            rtpParameters,
          },
          ({ id }) => {
            console.log("[Mediasoup] producer created", id);
            cb({ id });
          }
        );
      });

      /* ---- 3. PRODUCE AUDIO ---- */
      const audioTrack = await getLocalAudioTrack();
      audioProducerRef.current = await sendTransport.produce({
        track: audioTrack,
      });
      console.log(
        "[Mediasoup] audio producer started",
        audioProducerRef.current.id
      );
      console.log("[AUDIO PRODUCER]", {
        id: audioProducerRef.current.id,
        paused: audioProducerRef.current.paused,
        kind: audioProducerRef.current.kind,
      });

      /* ---- 4. RECV TRANSPORT ---- */
      console.log("[START] request createTransport (recv)");
      const recvParams = await new Promise<any>((resolve) => {
        socket?.emit("createTransport", (res) => {
          console.log("[START] createTransport (recv) response", res);
          resolve(res);
        });
      });
      console.log("[START] after recvTransport params");

      const recvTransport = device.createRecvTransport(recvParams);
      recvTransportRef.current = recvTransport;

      console.log("[Mediasoup] recvTransport created", recvTransport.id);

      recvTransport.on("connect", ({ dtlsParameters }, cb) => {
        socket?.emit("connect_transport", {
          transportId: recvTransport.id,
          dtlsParameters,
        });
        cb();
      });
      // Monitoring koneksi: connecting → connected → failed
      // 📌 Sangat berguna untuk debug ICE / network
      recvTransport.on("connectionstatechange", (state) => {
        console.log("🔥 recvTransport state:", state);
      });

      /* ---- 5. EXISTING PRODUCERS ---- */
      socket.off("getProducers");
      socket.off("newProducer");

      console.log("[Mediasoup] request existing producers");
      const existingProducers = await new Promise<ExistingProducer[]>(
        (resolve) => {
          socket.emit("getProducers", resolve);
        }
      );

      console.log("[Mediasoup] existing producers", existingProducers);

      // for (const producerId of existingProducers) {
      //   await consume(producerId);
      // }
      const audioProducerId = existingProducers[0];
      await consume(audioProducerId);
      // const audioProducer = existingProducers.find((p) => p.kind === "audio");
      // if (audioProducer) {
      //   await consume(audioProducer.id);
      // }

      // socket.on("newProducer", async ({ producerId }) => {
      //   console.log("[Mediasoup] new producer", producerId);
      //   await consume(producerId);
      // });
    } catch (err) {
      console.log("[Mediasoup start error]", err);
    } finally {
      startingRef.current = false;
    }
  }

  /* =======================
     CONSUME
  ======================= */
  async function consume(producerId: string) {
    if (!producerId) {
      console.warn("[consume skipped] invalid producerId");
      return;
    }

    if (!startedRef.current) {
      console.log("[consume skipped] mediasoup not started");
      return;
    }

    const socket = socketManager.getSocket();

    if (!socket || !deviceRef.current || !recvTransportRef.current) {
      console.warn("[Mediasoup] consume skipped - not ready");
      return;
    }

    console.log("[Mediasoup] consume request", {
      transportId: recvTransportRef.current.id,
      producerId,
      rtpCapabilities: deviceRef.current.rtpCapabilities,
    });

    const params = await new Promise<any>((resolve) => {
      socket.emit(
        "consume",
        {
          transportId: recvTransportRef?.current?.id, // 🔥 WAJIB
          producerId, // 🔥 WAJIB
          rtpCapabilities: deviceRef.current!.rtpCapabilities, // 🔥 WAJIB
        },
        resolve
      );
    });

    if (!params) {
      console.warn("[Mediasoup] consume params empty");
      return;
    }

    const consumer = await recvTransportRef.current.consume(params);

    if (consumer.kind === "audio" && hasAudioConsumerRef.current) {
      console.log("[IGNORE] extra audio consumer", consumer.id);
      consumer.close(); // aman KARENA BELUM attach ke stream
      return;
    }

    // 🔥 CEGAH MULTIPLE AUDIO
    // if (consumer.kind === "audio" && consumersRef.current.size > 0) {
    //   console.log("[SKIP] extra audio consumer", consumer.id);
    //   consumer.close();
    //   return;
    // }

    console.log("[AUDIO CONSUMER]", {
      id: consumer.id,
      kind: consumer.kind,
      paused: consumer.paused,
    });

    // simpan consumer
    consumersRef.current.set(consumer.id, consumer);

    if (consumer.kind === "audio") {
      console.log("[AUDIO CONSUMER]", consumer.id);
      hasAudioConsumerRef.current = true;
      setHasRemoteAudio(true);

      const track = consumer.track;

      console.log("🔊 [REMOTE AUDIO TRACK]", {
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
        settings: track.getSettings?.(),
      });

      // 🔥 buat stream BARU (jangan reuse)
      const stream = new MediaStream();
      stream.addTrack(track);
      remoteStreamRef.current = stream;

      track.onmute = () => {
        console.warn("🔇 remote audio muted");
        setHasRemoteAudio(false);
      };

      track.onunmute = () => {
        console.log("🔊 remote audio unmuted");
        setHasRemoteAudio(true);
      };

      // 🔥 start audio route SEKALI SAJA
      if (!audioRouteStartedRef.current) {
        console.log("[AUDIO ROUTE] init");

        // InCallManager.start({
        //   media: "audio",
        //   ringback: "",
        // });

        InCallManager.setForceSpeakerphoneOn(true);
        InCallManager.setSpeakerphoneOn(true);
        InCallManager.setMicrophoneMute(false);

        audioRouteStartedRef.current = true;
      }

      // setRemoteStream(stream);
      setTimeout(() => {
        setRemoteStream(stream);
        console.log("[AUDIO OUTPUT] stream attached (delayed)");
      }, 200);

      console.log("[AUDIO OUTPUT] stream attached");

      if (Platform.OS === "android") {
        setTimeout(() => {
          console.log("🛠 ANDROID TABLET AUDIO FIX");

          const { RNInCallManager } = NativeModules;

          // 🔥 JANGAN COMMUNICATION MODE
          RNInCallManager?.setMode?.("normal");

          // 🔥 PAKSA SPEAKER
          InCallManager.setForceSpeakerphoneOn(true);
          InCallManager.setSpeakerphoneOn(true);

          // 🔥 PAKSA STREAM MUSIC (INI PALING PENTING)
          RNInCallManager?.setVolume?.(1.0, "music");
        }, 500);
      }

      // 🔥 RTP AUDIO LEVEL POLLING (ANDROID)
      // 🔥 ACTIVITY PROBE (ANDROID SAFE)
      if (!audioActivityTimerRef.current) {
        audioActivityTimerRef.current = setInterval(() => {
          if (
            track.readyState === "live" &&
            track.enabled === true &&
            track.muted === false
          ) {
            setRemoteAudioActive(true);
            console.log("📢 [REMOTE AUDIO] active");
          } else {
            setRemoteAudioActive(false);
          }
        }, 500);
      }
    }
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

    deviceRef.current = null;
    startedRoomRef.current = null;
    audioRouteStartedRef.current = false;

    // --- AUDIO ROUTE (ONCE) ---
    InCallManager.setForceSpeakerphoneOn(false);
    InCallManager.stop();

    startedRef.current = false;

    if (audioActivityTimerRef.current) {
      clearInterval(audioActivityTimerRef.current);
      audioActivityTimerRef.current = null;
    }
    setRemoteAudioActive(false);

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
