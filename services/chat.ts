import { APIBEARER } from "@/constants/API";

export async function onGetConversationsService() {
  try {
    const res = await APIBEARER.get("conversations/getUserConversations");
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
export async function onGetMessagesService(convoId: string) {
  try {
    const res = await APIBEARER.get(`messages/${convoId}?limit=20`);
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
