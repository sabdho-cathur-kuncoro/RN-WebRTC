import { Slot } from "expo-router";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { CallProvider } from "@/contexts/CallContext";
import { useAuthStore } from "@/stores/auth.store";

import { AudioSink } from "@/components/AudioSink";
import { FloatingCallBar } from "@/components/FloatingCallBar";
import GlobalLoading from "@/components/GlobalLoading";
import { IncomingCallOverlay } from "@/components/IncomingCallOverlay";
import AppToast from "@/components/Toast";
import { MediasoupProvider } from "@/contexts/MediaSoupContext";
import { socketManager } from "@/socket/SocketManager";

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, token, isHydrated, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    console.log("[AUTH]", { isLoggedIn, token, isHydrated });
    if (!isHydrated) return;

    if (isLoggedIn && token) {
      socketManager.updateAuthToken(token);
      // socketManager.connect();
    } else {
      socketManager.disconnect();
    }
  }, [isHydrated, isLoggedIn, token]);

  return <>{children}</>;
}

export default function RootLayout() {
  // const pathname = usePathname();
  // const { isLoggedIn } = useAuthStore();

  // tunggu hydration
  // if (!isHydrated) {
  //   return <AuthBootstrap>{null}</AuthBootstrap>;
  // }

  // const isLoginRoute = pathname === "/login";

  // belum login → login (HANYA INI)
  // if (!isLoggedIn && !isLoginRoute) {
  //   return <Redirect href="/login" />;
  // }

  let DevManual: React.ComponentType<unknown> | null = null;
  if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    DevManual = require("./dev/ManualAuthTester")
      .default as React.ComponentType<unknown>;
  }

  return (
    <AuthBootstrap>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MediasoupProvider>
          <CallProvider>
            <SafeAreaView style={{ flex: 1 }}>
              <Slot />

              {DevManual ? React.createElement(DevManual) : null}

              <AppToast />
              <GlobalLoading />
              <IncomingCallOverlay />
              <FloatingCallBar />
              <AudioSink />
              {/* <CallDebugPanel /> */}
            </SafeAreaView>
          </CallProvider>
        </MediasoupProvider>
      </GestureHandlerRootView>
    </AuthBootstrap>
  );
}
