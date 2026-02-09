import * as Notifications from "expo-notifications";
import { useCallback, useState } from "react";

export type NotificationPermissionState =
  | "granted"
  | "denied"
  | "undetermined"
  | "blocked";

export const useNotificationPermission = () => {
  const [showModal, setShowModal] = useState(false);

  /**
   * CHECK permission
   */
  const getNotificationPermission =
    useCallback(async (): Promise<NotificationPermissionState> => {
      const res = await Notifications.getPermissionsAsync();

      // granted
      if (res.status === "granted") {
        setShowModal(false);
        return "granted";
      }

      // denied & cannot ask again
      if (res.status === "denied" && res.canAskAgain === false) {
        setShowModal(true);
        return "blocked";
      }

      // undetermined / denied (still can ask)
      setShowModal(true);
      return res.status === "denied" ? "denied" : "undetermined";
    }, []);

  /**
   * REQUEST permission
   * Dipanggil dari modal CTA
   */
  const requestNotificationPermission =
    useCallback(async (): Promise<boolean> => {
      const res = await Notifications.requestPermissionsAsync();

      const granted = res.status === "granted";
      setShowModal(!granted);

      return granted;
    }, []);

  return {
    showModal,
    setShowModal,
    getNotificationPermission,
    requestNotificationPermission,
  };
};
