import { APIBEARER } from "@/constants/API";

export async function onGetOperationsService() {
  try {
    const res = await APIBEARER.get("mobile/operations");
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
export async function onGetDetailOperationsService(id: number) {
  try {
    const res = await APIBEARER.get(`mobile/detailsoperation/${id}`);
    const status = res.status;
    const data = res.data.data;
    if (status === 200) {
      return data;
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err?.response);
    }
  }
}
