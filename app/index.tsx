import { socketManager } from "@/socket/SocketManager";
import { storage } from "@/utils/storage";
import { Redirect } from "expo-router";

export default function Index() {
  // const { token } = useAuthStore();
  const token = storage.getString("token");

  if (token) {
    socketManager.connect();
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
