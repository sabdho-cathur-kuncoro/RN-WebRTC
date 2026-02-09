import { APIBEARER } from "@/constants/API";

type gpsDevice = {
  device_id: string;
  latlon: string;
};

export async function onGetGPSService() {
  try {
    const res = await APIBEARER.get("gps");
    const status = res.status;
    const data = res.data;
    if (status === 200) {
      return data?.data;
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err?.response);
    }
  }
}
export async function onGetGPSPerDeviceService(deviceName: string) {
  try {
    const res = await APIBEARER.get(`gps/device/${deviceName}`);
    const status = res.status;
    const data = res.data;
    if (status === 200) {
      return data;
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err?.response);
    }
  }
}
export async function onSendGPSDeviceService(body: gpsDevice) {
  try {
    const res = await APIBEARER.post("gps/create", body);
    const status = res.status;
    const data = res.data;
    if (status === 200) {
      return data;
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err?.response);
    }
  }
}
