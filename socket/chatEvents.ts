import { socketManager } from "./SocketManager";
import { SendMessagePayload } from "./socketTypes";

export function joinConversation(conversationId: string) {
  const socket = socketManager.getSocket();
  if (!socket?.connected) return;

  socket.emit("join_room", conversationId);
}

export function sendChatMessage(payload: SendMessagePayload) {
  const socket = socketManager.getSocket();
  if (!socket?.connected) return;

  socket.emit("send_message", payload);
}

export function onNewMessage(handler: (msg: any) => void) {
  const socket = socketManager.getSocket();
  if (!socket) return;

  socket.off("new_message", handler);
  socket.on("new_message", handler);
}
