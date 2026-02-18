import { NativeModules, Platform } from "react-native";

export function prepareAndroidAudio() {
  if (Platform.OS !== "android") return;

  const { AudioRoute } = NativeModules;

  if (!AudioRoute) {
    console.error("[AudioRoute] Native module NOT linked");
    return;
  }

  console.log("[AudioRoute] calling prepareMediaAudio()");
  AudioRoute.prepareMediaAudio();
}
