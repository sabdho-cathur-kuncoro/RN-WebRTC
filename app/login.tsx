import Button from "@/components/Button";
import FocusAwareStatusBar from "@/components/FocusAwareStatusbar";
import Gap from "@/components/Gap";
import { PermissionModal } from "@/components/PermissionModal";
import {
  bgColor,
  greyColor,
  navyColor,
  strokeColor,
  text,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { useLoading } from "@/hooks/useLoading";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import { useToast } from "@/hooks/useToast";
import { onLoginService } from "@/services/auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { isDevAutoAdvanceEnabled } from "./dev/devMode";
import performMockLogin from "./dev/performMockAuth";
type eyeType = {
  icon: any;
  pass: boolean;
};

const Login = () => {
  const [username, setUsername] = useState("UNIT-01");
  const [password, setPassword] = useState("P@ssw0rd");
  const [isVisiblePass, setIsVisiblePass] = useState<eyeType>({
    icon: "eye-off-outline",
    pass: true,
  });
  const {
    showModal,
    getNotificationPermission,
    requestNotificationPermission,
    setShowModal,
  } = useNotificationPermission();
  const toast = useToast();
  const loading = useLoading();
  const controller = new AbortController();

  useEffect(() => {
    getNotificationPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onLogin() {
    try {
      loading.show({
        message: "Trying to login...",
        cancellable: false,
        // onCancel: () => controller.abort(),
      });
      const form = {
        username,
        password,
      };

      // In mock/dev mode, skip backend login and navigate to the appropriate
      // post-auth destination deterministically so QA can exercise unauthenticated
      // flows without the backend.
      console.log("MOCK LOGIN", isDevAutoAdvanceEnabled());
      if (isDevAutoAdvanceEnabled()) {
        toast.info("Informasi", "Dev: skipping sign-in and continuing flow");
        (async () => {
          try {
            // Ensure dev mock login sets tokens/user so downstream resume logic
            // sees the same state as when using the ManualAuthTester overlay.
            await performMockLogin({ username });
          } catch (e) {
            // ignore failures here - dev flow should still navigate
          }
        })();
        return;
      }

      const res = await onLoginService(form, controller);
      if (res !== 200) {
        toast.error("Wrong", "Something went wrong");
        return;
      }
      router.replace("/(tabs)");
      toast.success("Success", "Login Successfully");
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
    } finally {
      loading.hide();
    }
  }

  const changeVisiblePass = () => {
    setIsVisiblePass((prevState) => ({
      icon:
        prevState.icon === "eye-outline" ? "eye-off-outline" : "eye-outline",
      pass: !prevState.pass,
    }));
  };
  return (
    <View style={[styles.page]}>
      <FocusAwareStatusBar barStyle={"light-content"} />
      <View
        style={{
          padding: 40,
          minWidth: 500,
          maxWidth: 550,
          borderRadius: 14,
          backgroundColor: navyColor,
        }}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
        <Gap height={54} />
        <Text style={[whiteTextStyle, text.label]}>Username</Text>
        <Gap height={12} />
        <View style={styles.inputContainer}>
          <View
            style={{
              width: "auto",
              alignItems: "center",
            }}
          >
            <Image
              source={require("@/assets/icons/ic-user.png")}
              style={styles.iconContainer}
            />
          </View>
          <TextInput
            value={username}
            onChangeText={(text) => setUsername(text)}
            placeholder="Enter username"
            placeholderTextColor={greyColor}
            style={[whiteTextStyle, { width: "90%" }]}
          />
          <View
            style={{
              width: 18,
              alignItems: "center",
            }}
          />
        </View>
        <Gap height={32} />
        <View style={styles.inputContainer}>
          <View
            style={{
              width: "auto",
              alignItems: "center",
            }}
          >
            <Image
              source={require("@/assets/icons/ic-lock.png")}
              style={styles.iconContainer}
            />
          </View>
          <TextInput
            value={password}
            onChangeText={(text) => setPassword(text)}
            placeholder="Password"
            placeholderTextColor={greyColor}
            style={[whiteTextStyle, { width: "90%" }]}
            secureTextEntry={isVisiblePass.pass}
          />
          <TouchableOpacity
            onPress={changeVisiblePass}
            style={{
              width: "auto",
              alignItems: "center",
            }}
          >
            <Ionicons name={isVisiblePass.icon} size={18} color={whiteColor} />
          </TouchableOpacity>
        </View>
        <Gap height={54} />
        <View style={{ width: "auto" }}>
          <Button title="Login" borderRadius={6} onPress={onLogin} />
        </View>
      </View>
      <PermissionModal
        visible={showModal}
        title="Aktifkan Notifikasi"
        description="Untuk memastikan Anda menerima pemberitahuan secara tepat waktu."
        primaryText="Aktifkan"
        secondaryText="Nanti Saja"
        onPrimaryPress={async () => {
          await requestNotificationPermission();
        }}
        onSecondaryPress={() => setShowModal(false)}
      />
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: bgColor,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    alignSelf: "center",
  },
  inputContainer: {
    width: "auto",
    backgroundColor: strokeColor,
    borderRadius: 6,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // overflow: "hidden",
  },
  iconContainer: { width: 18, height: 18, resizeMode: "contain" },
});
