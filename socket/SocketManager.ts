// socket/SocketManager.ts
import { AppState, AppStateStatus } from "react-native";
import { io, Socket } from "socket.io-client";

import { Config } from "@/constants/API";
import { storage } from "@/utils/storage";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketStatus,
} from "./socketTypes";

/**
 * SocketManager
 *
 * - Singleton
 * - Auto init
 * - Tidak pakai flag isConnected manual
 * - AppState-aware
 * - Token-aware
 */
class SocketManager {
  private static instance: SocketManager;

  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;

  private status: SocketStatus = "idle";
  private listeners = new Set<(status: SocketStatus) => void>();
  private appState: AppStateStatus = "active";

  private constructor() {
    AppState.addEventListener("change", this.handleAppStateChange);
  }

  /* ======================================================
   * SINGLETON
   * ==================================================== */
  static getInstance() {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  /* ======================================================
   * OBSERVER
   * ==================================================== */
  subscribe(listener: (status: SocketStatus) => void) {
    this.listeners.add(listener);

    // emit current state immediately
    listener(this.status);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.status));
  }

  getStatus() {
    return this.status;
  }

  getSocket() {
    return this.socket;
  }

  /* ======================================================
   * APP STATE HANDLER
   * ==================================================== */
  private handleAppStateChange = (state: AppStateStatus) => {
    this.appState = state;

    if (state === "active") {
      this.connect();
    } else {
      this.disconnect();
    }
  };

  /* ======================================================
   * INIT
   * ==================================================== */
  private init() {
    if (this.socket) return;

    const token = storage.getString("token");

    this.socket = io(Config.BASE_URL!, {
      transports: ["websocket"],
      autoConnect: false,
      auth: {
        token,
      },
    });

    this.registerCoreListeners();
  }

  /* ======================================================
   * AUTH
   * ==================================================== */
  updateAuthToken(token: string | null) {
    this.init();
    if (!this.socket) return;

    this.socket.auth = { token };

    // reconnect cleanly
    if (this.socket.connected) {
      this.socket.disconnect();
    }

    this.connect();
  }

  /* ======================================================
   * CONNECTION CONTROL
   * ==================================================== */
  connect() {
    this.init();
    if (!this.socket) return;

    // gunakan state asli socket.io
    if (this.socket.connected) return;
    if (this.appState !== "active") return;

    this.status = "connecting";
    this.notify();

    this.socket.connect();
  }

  disconnect() {
    if (!this.socket) return;
    if (!this.socket.connected) return;

    this.socket.disconnect();
  }

  /* ======================================================
   * CORE SOCKET EVENTS
   * ==================================================== */
  private registerCoreListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.status = "connected";
      this.notify();
    });

    this.socket.on("disconnect", (reason) => {
      this.status = "disconnected";
      this.notify();
    });

    this.socket.on("connect_error", (err) => {
      this.status = "error";
      this.notify();
    });
  }
}

/* ======================================================
 * EXPORT SINGLETON
 * ==================================================== */
export const socketManager = SocketManager.getInstance();
