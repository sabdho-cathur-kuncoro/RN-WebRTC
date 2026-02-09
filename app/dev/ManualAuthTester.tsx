import { blackTextStyle, greyTextStyle } from "@/constants/theme";
import { storage } from "@/utils/storage";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import performMockLogin from "./performMockAuth";

// Small dev-only overlay to inject mock credentials into the app state
const ManualAuthTester: React.FC = () => {
  const [username, setUsername] = React.useState<string>();
  const [password, setPassword] = React.useState<string>("P@ssw0rd");

  const [hidden, setHidden] = React.useState<boolean>(false);
  const [refreshMasked, setRefreshMasked] = React.useState<string | null>(null);
  const [showRefresh, setShowRefresh] = React.useState<boolean>(false);

  const windowHeight = Dimensions.get("window").height;
  const maxScrollHeight = Math.max(240, Math.min(520, windowHeight - 160));
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(
    50,
    (insets?.bottom ?? 0) + (Platform.OS === "ios" ? 40 : 40)
  );
  const buttonStyle = {
    backgroundColor: "rgba(0,0,0,0.75)",
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
    width: "100%",
    alignItems: "center" as const,
  } as const;
  const buttonTextStyle = {
    color: "#fafafa",
  } as const;

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      // preload masked refresh token if available
      try {
        const v = storage.getString("dev.manualAuthTester.hidden");
        if (mounted) {
          setHidden(v === "1");
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // (routeForPostAuth is exported at the bottom of the file so it is a
  // top-level module export rather than being declared inside the
  // component closure.)

  const mockLogin = async () => {
    const uid = await performMockLogin({
      username,
    });
    return uid;
  };

  const clear = () => {
    storage.clearAll();
  };

  const hide = async (val: boolean) => {
    setHidden(val);
    try {
      if (val) {
        storage.set("dev.manualAuthTester.hidden", "1");
      } else {
        storage.remove("dev.manualAuthTester.hidden");
      }
    } catch (e) {
      // ignore
    }
  };

  // Allow forcing render in tests via global flag so integration tests can
  // mount the overlay. By default, this component is dev-only and should not
  // render in production or during Jest runs.
  // Use a small typed accessor on globalThis to avoid TS/ESLint complaints
  type DevGlobal = { __FORCE_DEV_RENDER__?: boolean } & typeof globalThis;
  const g = globalThis as DevGlobal;
  const forceRenderInTests = !!g.__FORCE_DEV_RENDER__;
  const isAllowedToRender = __DEV__ || forceRenderInTests;
  if (!isAllowedToRender) {
    return null;
  }

  if (hidden) {
    return (
      <View
        style={[
          styles.collapsed,
          {
            bottom: 60,
            backgroundColor: "rgba(255,255,255,0.75)",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 8,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => hide(false)}
          testID="dev-auth-tester-show"
          accessibilityRole="button"
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ paddingVertical: 6 }}
        >
          <Text style={[blackTextStyle, { fontSize: 12 }]}>
            Show Auth Tester
          </Text>
        </TouchableOpacity>
        {__DEV__ ? (
          <TouchableOpacity
            onPress={async () => {
              try {
                // try a quick mock login and navigate to Home for fast verification
                await mockLogin();
                try {
                  router.replace("/(tabs)");
                } catch (e) {
                  // ignore navigation errors in dev
                }
              } catch (e) {
                // ignore dev errors
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Start Mock Flow"
            style={{
              marginLeft: 8,
              paddingVertical: 6,
            }}
            testID="dev-start-mock-flow-collapsed"
          >
            <Text style={{ fontSize: 14 }}>🚀</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          bottom: bottomOffset,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: "rgba(255,255,255,0.95)",
          },
        ]}
      >
        <View>
          <Text style={styles.title}>Manual Auth Tester (dev only)</Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <Text
              style={[
                blackTextStyle,
                {
                  marginRight: 8,
                },
              ]}
            >
              Overlay visible
            </Text>
            <Switch
              value={!hidden}
              onValueChange={(v) => hide(!v)}
              testID="dev-auth-overlay-toggle"
            />
          </View>
        </View>

        <ScrollView
          style={{ maxHeight: maxScrollHeight }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          <Text
            style={[
              blackTextStyle,
              {
                marginBottom: 4,
              },
            ]}
          >
            Username
          </Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={[inputStyles.input, { backgroundColor: "#fff" }]}
          />
          <Text
            style={[
              blackTextStyle,
              {
                marginBottom: 4,
              },
            ]}
          >
            Password
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={[inputStyles.input, { backgroundColor: "#fff" }]}
            secureTextEntry
          />

          <TouchableOpacity
            style={[buttonStyle, styles.btn]}
            activeOpacity={0.8}
            onPress={async () => {
              await mockLogin();
            }}
            testID="dev-mock-login"
          >
            <Text style={(styles.btnText, buttonTextStyle)}>Mock Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyle, styles.btn, styles.clear]}
            activeOpacity={0.8}
            onPress={clear}
            testID="dev-clear-auth"
          >
            <Text style={[styles.btnText, buttonTextStyle]}>Clear Auth</Text>
          </TouchableOpacity>

          {/* Mock Logout removed */}

          <View
            style={{
              marginTop: 8,
            }}
          >
            <TouchableOpacity
              style={[buttonStyle, styles.btn, { marginTop: 8 }]}
              activeOpacity={0.8}
              onPress={() => {
                try {
                  router.push("/dev/DevSettings");
                } catch (e) {
                  // ignore in tests
                }
              }}
              testID="dev-open-dev-settings"
            >
              <Text style={[styles.btnText, buttonTextStyle]}>
                Open Dev Settings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[buttonStyle, styles.btn, { marginTop: 8 }]}
              activeOpacity={0.8}
              onPress={async () => {
                // try {
                //   const rt = await tokenStorage.getRefreshToken();
                //   setShowRefresh((s) => !s);
                //   if (rt) {
                //     // preload in case copy is used immediately
                //   }
                // } catch (e) {
                //   // ignore
                // }
              }}
              testID="dev-show-refresh"
            >
              <Text style={[styles.btnText, buttonTextStyle]}>
                {showRefresh ? "Hide" : "Show"} Refresh Token
              </Text>
            </TouchableOpacity>
            {showRefresh && refreshMasked ? (
              <Text
                style={[
                  greyTextStyle,
                  {
                    fontSize: 11,
                    marginTop: 6,
                  },
                ]}
                testID="dev-refresh-masked"
              >
                {refreshMasked}
              </Text>
            ) : null}
            {showRefresh ? (
              <TouchableOpacity
                style={[buttonStyle, styles.btn, { marginTop: 8 }]}
                activeOpacity={0.8}
                onPress={async () => {
                  try {
                    // const rt = await tokenStorage.getRefreshToken();
                    // if (!rt) {
                    //   //   toast.show("No refresh token available", {
                    //   //     type: "normal",
                    //   //   });
                    //   return;
                    // }
                    // Try to copy using optional clipboard package when available.
                    // try {
                    //   // try to require optional clipboard package
                    //   const Clipboard = require("@react-native-clipboard/clipboard");
                    //   if (
                    //     Clipboard &&
                    //     typeof Clipboard.setString === "function"
                    //   ) {
                    //     Clipboard.setString(rt);
                    //     toast.show("Refresh token copied to clipboard", {
                    //       type: "success",
                    //     });
                    //     return;
                    //   }
                    // } catch (e) {
                    //   // Clipboard not installed, fall back to Share
                    // }
                    // await Share.share({ message: rt });
                    // toast.show("Shared refresh token", {
                    //   type: "success",
                    // });
                  } catch (e) {
                    // toast.show("Failed to copy refresh token", {
                    //   type: "warning",
                    // });
                  }
                }}
                testID="dev-copy-refresh"
              >
                <Text style={[styles.btnText, buttonTextStyle]}>
                  Copy Refresh Token
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    bottom: 50,
    zIndex: 9999,
  },
  card: {
    padding: 12,
    borderRadius: 8,
    width: 280,
  },
  title: {
    fontWeight: "700",
    marginBottom: 8,
  },
  btn: {
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  hideBtn: {
    position: "absolute",
    right: 8,
    top: 8,
    padding: 4,
  },
  collapsed: {
    position: "absolute",
    left: 12,
    bottom: 12,
    zIndex: 10000,
    padding: 8,
    borderRadius: 6,
  },
  clear: {},
  btnText: {
    textAlign: "center",
    fontWeight: "600",
  },
});

const inputStyles = StyleSheet.create({
  input: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
});

export default ManualAuthTester;
