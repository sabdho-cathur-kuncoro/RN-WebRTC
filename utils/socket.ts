// src/socket.js
import { io } from "socket.io-client";

// Use your local IP address during development for Android, not 'localhost'
export const ws = "wss://192.167.61.2:3001/";

export const socket = io(ws, {
  autoConnect: false, // Useful for managing connections (e.g., after authentication)
});
