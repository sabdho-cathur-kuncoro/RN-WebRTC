// hooks/useSocketStatus.ts
import { socketManager } from "@/socket/SocketManager";
import { useEffect, useState } from "react";

export function useSocketStatus() {
  const [status, setStatus] = useState(socketManager.getStatus());

  useEffect(() => {
    return socketManager.subscribe(setStatus);
  }, []);

  return status;
}
