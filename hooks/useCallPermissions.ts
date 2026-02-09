import { openAppSettings } from "@/utils/openSettings";
import { useCallback, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";

type PermissionResult = {
  granted: boolean;
  canAskAgain: boolean;
};

export const useCallPermissions = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Microphone Permission
   * Call ONLY when user taps Call / Accept
   */
  const requestMicrophonePermission =
    useCallback(async (): Promise<PermissionResult> => {
      if (Platform.OS !== "android") {
        return { granted: true, canAskAgain: true };
      }

      setLoading(true);

      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );

      if (granted) {
        setLoading(false);
        return { granted: true, canAskAgain: true };
      }

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );

      setLoading(false);

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        return { granted: true, canAskAgain: true };
      }

      if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        return { granted: false, canAskAgain: false };
      }

      return { granted: false, canAskAgain: true };
    }, []);

  /**
   * Hard denial handler
   */
  const handlePermissionBlocked = useCallback(() => {
    openAppSettings();
  }, []);

  return {
    loading,
    requestMicrophonePermission,
    handlePermissionBlocked,
  };
};
