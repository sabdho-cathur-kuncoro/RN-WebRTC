import {
  bgColor,
  greenColor,
  greyColor,
  orangeColor,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { storage } from "@/utils/storage";
import React from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

// Persisted key for the mock toggle. Standardized to `dev.useMockApi`.
// If older persisted values exist under other keys they will be ignored
// by this codepath; a migration can be added if required.
const KEY = "dev.useMockApi";

const DevSettings: React.FC = () => {
  const [enabled, setEnabled] = React.useState<boolean>(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const v = storage.getString(KEY);
        if (mounted) {
          setEnabled(v === "1");
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const [useMockApi, setUseMockApi] = React.useState<boolean>(false);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const v = storage.getString(KEY);

        // prepare safe access to globals/process
        const gv = typeof globalThis !== "undefined" ? globalThis : undefined;
        type GlobalLike = {
          process?:
            | { env?: Record<string, string | boolean | number | undefined> }
            | undefined;
          __USE_MOCK_API?: boolean;
          USE_MOCK_API?: boolean;
          NODE_ENV?: string;
        };
        const g = gv as GlobalLike;
        const proc = g.process;
        const envUseMock =
          proc?.env?.USE_MOCK_API ?? g.__USE_MOCK_API ?? g.USE_MOCK_API;
        const nodeEnv = proc?.env?.NODE_ENV ?? g.NODE_ENV;

        // Diagnostic logging: expose key runtime info to JS console so devs can see why the switch is off/on
        try {
          // Prefer react-native-config when available
          let config: Record<string, unknown> | undefined;
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            config = require("react-native-config");
          } catch (_e) {
            // ignore
          }

          const diag = {
            __DEV: typeof __DEV__ !== "undefined" ? __DEV__ : false,
            persistedValue: v,
            reactNativeConfig: config
              ? {
                  USE_MOCK_API: config.USE_MOCK_API,
                  NODE_ENV: config.NODE_ENV,
                }
              : undefined,
            runtimeGlobal: g.__USE_MOCK_API ?? g.USE_MOCK_API,
            processEnv: proc?.env
              ? {
                  USE_MOCK_API: proc.env.USE_MOCK_API,
                  NODE_ENV: proc.env.NODE_ENV,
                }
              : undefined,
            computedEnvUseMock: envUseMock,
            computedNodeEnv: nodeEnv,
          } as const;
          console.info("[DevSettings diagnostics]", JSON.stringify(diag));
        } catch (e) {
          // ignore diagnostics failure
        }

        if (mounted) {
          if (v === "1") {
            setUseMockApi(true);
            // Ensure the runtime global is set immediately when a persisted
            // value is present so other modules reading the global see the
            // expected mock toggle synchronously.
            try {
              (gv as Record<string, unknown>).__USE_MOCK_API = "1";
            } catch (e) {
              // ignore
            }
          } else {
            // No persisted value — fall back to runtime environment/global
            try {
              if (
                (envUseMock === "1" ||
                  envUseMock === "true" ||
                  envUseMock === true) &&
                nodeEnv
              ) {
                // enable and persist
                setUseMockApi(true);
                try {
                  (gv as Record<string, unknown>).__USE_MOCK_API = "1";
                  storage.set(KEY, "1");
                } catch (e) {
                  // ignore storage errors
                }
              } else {
                setUseMockApi(false);
              }
            } catch (e) {
              setUseMockApi(false);
            }
          }
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setEnabledState = async (v: boolean) => {
    setEnabled(v);
    try {
      const gv = globalThis;
      // Standardize runtime global to __USE_MOCK_API so all modules use the
      // same flag.
      (gv as Record<string, unknown>).__USE_MOCK_API = v ? "1" : undefined;
      if (v) {
        storage.set(KEY, "1");
      } else {
        storage.remove(KEY);
      }
    } catch (e) {
      // ignore
    }
  };

  const setUseMockApiState = async (v: boolean) => {
    setUseMockApi(v);
    try {
      const gv = globalThis as Record<string, unknown>;
      // runtime toggle used by devMode helper
      gv.__USE_MOCK_API = v ? "1" : undefined;
      if (v) {
        storage.set(KEY, "1");
      } else {
        storage.remove(KEY);
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <View style={[styles.container, { padding: 8, backgroundColor: bgColor }]}>
      <Text style={[styles.title, whiteTextStyle]}>Dev Settings</Text>
      <View style={styles.row}>
        <Text style={[styles.label, whiteTextStyle]}>Enable Mock Auth</Text>
        <Switch
          value={enabled}
          onValueChange={setEnabledState}
          trackColor={{
            true: greenColor,
            false: greyColor,
          }}
          thumbColor={whiteColor}
        />
      </View>
      <TouchableOpacity
        style={[
          styles.forceBtn,
          { backgroundColor: orangeColor, marginBottom: 8 },
        ]}
        onPress={() => setUseMockApiState(true)}
        testID="dev-force-enable-mock"
      >
        <Text style={[styles.btnText, whiteTextStyle]}>
          Force Enable Mock API
        </Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <Text style={[styles.label, whiteTextStyle]}>
          Enable Mock API (USE_MOCK_API)
        </Text>
        <Switch
          value={useMockApi}
          onValueChange={setUseMockApiState}
          trackColor={{
            true: greenColor,
            false: greyColor,
          }}
          thumbColor={whiteColor}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  title: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: { fontSize: 16 },
  btn: {
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  forceBtn: {
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  clear: {},
  btnText: { textAlign: "center" },
});

export default DevSettings;
