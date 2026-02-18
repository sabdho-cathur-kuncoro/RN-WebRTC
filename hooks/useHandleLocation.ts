import {
  onGetGPSPerDeviceService,
  onGetGPSService,
  onGetMapGroupService,
} from "@/services/gps";
import { moveCurrentUserFirst } from "@/utils/helpers";
import { storage } from "@/utils/storage";
import { useCallback, useState } from "react";

const useHandleLocation = () => {
  const [listGPS, setListGPS] = useState<any[]>([]);
  const [perDeviceGPS, setPerDeviceGPS] = useState(null);
  const [startingPosition, setStartingPosition] = useState([]);

  const actions = {
    onGetGPS: useCallback(() => {
      onHandleGetGPS();
    }, []),
    onGetGroupGPS: useCallback((activity_id: string) => {
      onHandleGetGroupGPS(activity_id);
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
  async function onHandleGetGroupGPS(activity_id: string) {
    try {
      const currentUser = storage.getString("user.username");
      const { data, startingPosition }: any = await onGetMapGroupService(
        activity_id
      );
      // console.log(res.length);
      const dataMarker = moveCurrentUserFirst(data, currentUser ?? "");
      // console.log(data.length);
      setListGPS(dataMarker);
      setStartingPosition(startingPosition ?? []);
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
  return { listGPS, perDeviceGPS, startingPosition, actions };
};

export default useHandleLocation;
