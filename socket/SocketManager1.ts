// // socket/SocketManager.ts
// import { AppState, AppStateStatus } from "react-native";
// import { io, Socket } from "socket.io-client";

// import { Config } from "@/constants/API";
// import { storage } from "@/utils/storage";
// import {
//   ClientToServerEvents,
//   ServerToClientEvents,
//   SocketStatus,
// } from "./socketTypes";
// // import type {
// //   ClientToServerEvents,
// //   ServerToClientEvents,
// //   SocketStatus,
// // } from "./socketTypes";

// /**
//  * SocketManager
//  *
//  * - Singleton
//  * - AppState-aware
//  * - Token-aware
//  * - No call / webrtc logic
//  */
// class SocketManager {
//   private static instance: SocketManager;

//   private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
//     null;

//   private status: SocketStatus = "idle";
//   private listeners = new Set<(status: SocketStatus) => void>();
//   private appState: AppStateStatus = "active";

//   // 🔒 prevent double registration
//   private coreListenersRegistered = false;

//   private constructor() {
//     AppState.addEventListener("change", this.handleAppStateChange);
//   }

//   /* ======================================================
//    * SINGLETON
//    * ==================================================== */
//   static getInstance() {
//     if (!SocketManager.instance) {
//       SocketManager.instance = new SocketManager();
//     }
//     return SocketManager.instance;
//   }

//   /* ======================================================
//    * OBSERVER
//    * ==================================================== */
//   subscribe(listener: (status: SocketStatus) => void) {
//     this.listeners.add(listener);

//     // emit current state immediately
//     listener(this.status);

//     return () => {
//       this.listeners.delete(listener);
//     };
//   }

//   private notify() {
//     this.listeners.forEach((l) => l(this.status));
//   }

//   getStatus() {
//     return this.status;
//   }

//   getSocket() {
//     return this.socket;
//   }

//   /* ======================================================
//    * APP STATE HANDLER
//    * ==================================================== */
//   private handleAppStateChange = (state: AppStateStatus) => {
//     this.appState = state;

//     if (state === "active") {
//       this.connect();
//     } else {
//       this.disconnect();
//     }
//   };

//   /* ======================================================
//    * INIT
//    * ==================================================== */
//   private init() {
//     if (this.socket) return;

//     const token = storage.getString("token");

//     this.socket = io(Config.BASE_URL!, {
//       transports: ["websocket"],
//       autoConnect: false,
//       auth: {
//         token,
//       },
//     });

//     this.registerCoreListeners();
//   }

//   /* ======================================================
//    * AUTH
//    * ==================================================== */
//   updateAuthToken(token: string | null) {
//     this.init();
//     if (!this.socket) return;

//     this.socket.auth = { token };

//     if (this.socket.connected) {
//       this.socket.disconnect();
//     }

//     if (token) {
//       this.connect();
//     } else {
//       this.status = "idle";
//       this.notify();
//     }
//   }

//   /* ======================================================
//    * CONNECTION CONTROL
//    * ==================================================== */
//   connect() {
//     this.init();
//     if (!this.socket) return;

//     const token = storage.getString("token");
//     if (!token) {
//       // ⛔ jangan connect tanpa token
//       this.status = "idle";
//       this.notify();
//       return;
//     }

//     if (this.socket.connected) return;
//     if (this.appState !== "active") return;

//     this.status = "connecting";
//     this.notify();

//     this.socket.connect();
//   }

//   disconnect() {
//     if (!this.socket) return;
//     if (!this.socket.connected) return;

//     this.socket.disconnect();
//   }

//   /* ======================================================
//    * CORE SOCKET EVENTS
//    * ==================================================== */
//   private registerCoreListeners() {
//     if (!this.socket || this.coreListenersRegistered) return;

//     this.coreListenersRegistered = true;

//     this.socket.on("connect", () => {
//       this.status = "connected";
//       this.notify();
//     });

//     this.socket.on("disconnect", () => {
//       this.status = "disconnected";
//       this.notify();
//     });

//     this.socket.on("connect_error", () => {
//       this.status = "error";
//       this.notify();
//     });
//   }
// }

// /* ======================================================
//  * EXPORT SINGLETON
//  * ==================================================== */
// export const socketManager = SocketManager.getInstance();
