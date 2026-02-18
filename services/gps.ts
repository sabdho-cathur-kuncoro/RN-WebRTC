import { APIBEARER } from "@/constants/API";
import { gpsDevice, gpsGroup } from "@/type/operation.type";

export async function onGetGPSService() {
  try {
    const res = await APIBEARER.get("mobile/getMaps");
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
export async function onGetMapGroupService(activity_id: string): gpsGroup {
  try {
    const res = await APIBEARER.get(`mobile/getMapGroups/${activity_id}`);
    const status = res.status;
    const tempData = res.data;
    const data = tempData.data;
    const startingPosition = tempData.starting_position;
    // console.log(data.data);
    // console.log(data.data.length);
    if (status === 200) {
      return { data, startingPosition };
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err?.response);
    }
  }
}
export async function onGetGPSPerDeviceService(deviceName: string) {
  try {
    const res = await APIBEARER.get(`mobile/getDevice/${deviceName}`);
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
