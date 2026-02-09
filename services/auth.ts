import { APIBASIC } from "@/constants/API";
import { socketManager } from "@/socket/SocketManager";
import { useAuthStore } from "@/stores/auth.store";

export async function onLoginService(form: any, controller: any) {
  try {
    const res = await APIBASIC.post("login", form, {
      signal: controller.signal,
    });
    const status = res.status;
    const data = res.data;
    if (status === 200) {
      const userId = data.user.id;
      const username = data.user.username;

      // Update auth store with login data
      useAuthStore
        .getState()
        .login(data?.token, data?.refreshToken ?? "", String(userId), username);
      // Update token
      socketManager.updateAuthToken(data?.token);
      return status;
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(err?.response?.message ?? "Something went wrong");
  }
}
