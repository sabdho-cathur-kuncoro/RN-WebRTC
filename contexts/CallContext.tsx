import { useCall } from "@/hooks/useCall";
import { createContext, useContext } from "react";

const CallContext = createContext<ReturnType<typeof useCall> | null>(null);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const call: any = useCall();

  // 🔴 UI TEST ONLY (DEV)
  const devActions = __DEV__
    ? {
        __simulateIncomingCall: (callerId = 99) => {
          call["__setTestState"]?.("INCOMING", {
            roomId: "test-room",
            callerId,
          });
        },
        __simulateConnected: () => {
          call["__setTestState"]?.("CONNECTED");
        },
        __simulateEnd: () => {
          call["__setTestState"]?.("IDLE");
        },
      }
    : {};

  return (
    <CallContext.Provider value={{ ...call, ...devActions }}>
      {children}
    </CallContext.Provider>
  );
}

export function useCallContext() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCallContext must be used inside CallProvider");
  return ctx;
}
