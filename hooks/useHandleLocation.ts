import { onGetGPSPerDeviceService, onGetGPSService } from "@/services/gps";
import { moveCurrentUserFirst } from "@/utils/helpers";
import { storage } from "@/utils/storage";
import { useCallback, useState } from "react";

const useHandleLocation = () => {
  const [listGPS, setListGPS] = useState<any[]>([]);
  const [perDeviceGPS, setPerDeviceGPS] = useState(null);

  const actions = {
    onGetGPS: useCallback(() => {
      onHandleGetGPS();
    }, []),
    onGetPerDeviceGPS: useCallback((val: string) => {
      onHandleGetPerDeviceGPS(val);
    }, []),
    onSendDeviceGPS: useCallback((val: any) => {
      onHandleSendDeviceGPS(val);
    }, []),
  };

  async function onHandleGetGPS() {
    try {
      const currentUser = storage.getString("user.username");
      const res = await onGetGPSService();
      const data = moveCurrentUserFirst(res, currentUser ?? "");
      setListGPS(data);
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
    }
  }
  async function onHandleGetPerDeviceGPS(deviceName: string) {
    try {
      const res = await onGetGPSPerDeviceService("UNIT-02");
      setPerDeviceGPS(res);
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
    }
  }
  async function onHandleSendDeviceGPS(body: any) {
    try {
      await onGetGPSPerDeviceService("UNIT-02");
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
    }
  }
  return { listGPS, perDeviceGPS, actions };
};

export default useHandleLocation;
