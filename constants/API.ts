import { storage } from "@/utils/storage";
import axios from "axios";
// import { refreshToken } from "../../utils/refreshToken";
// import { getData, storeData } from "../../utils/storage";

// const SOCKET_URL_UAT = "wss://192.167.61.2:3001/";
const SOCKET_URL_UAT = "wss://192.167.0.6:3001/";
const SOCKET_URL_PRD = "wss://192.167.61.2:3001/";
const UAT = "http://192.167.0.6:3001/";
// http://192.167.61.17:3001/
// const UAT = "http://192.167.61.2:3001/";
const PRD = "http://192.167.61.2:3001/";
const DEV = "https://komando.modoto.net/";
// const DEV = "http://31.97.67.18:3001/";
const bearerUat = "ErpTSJUat ";
const bearerPrd = "ErpTSJPrd ";

export const Config = {
  BASE_URL: DEV,
  API_TIMEOUT: 11 * 60 * 1000,
  BEARER: bearerUat,
  SOCKET: SOCKET_URL_UAT,
};

export const APIBASIC = axios.create({
  baseURL: Config.BASE_URL,
  timeout: Config.API_TIMEOUT,
});

export const APIBEARER = axios.create({
  baseURL: Config.BASE_URL,
  timeout: Config.API_TIMEOUT,
});

APIBEARER.interceptors.request.use(
  async (config: any) => {
    const token = storage.getString("token");
    if (token) {
      // Ensure headers exists
      if (!config.headers) {
        config.headers = {};
      }

      const headers: any = config.headers;

      if (typeof headers.set === "function") {
        headers.set("Authorization", `Bearer ${token}`);
      } else {
        // Fallback for plain object headers
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: any) => {
    new Promise((resolve, reject) => {
      reject(error);
    });
  }
);

APIBEARER.interceptors.response.use(
  (response: any) => {
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      //   return refreshToken()
      //     .then(async (resp: any) => {
      //       const config = error.config;
      //       if (resp.code === 200 && resp.message === "Authentication success") {
      //         await storeData("token", { value: resp.token });
      //         await storeData("refreshToken", { value: resp.refreshToken });
      //         config.headers.Authorization = `${Config.BEARER} ${resp.token}`;
      // // Update token
      // socketManager.updateAuthToken(resp?.token);

      //         return new Promise((resolve, reject) => {
      //           axios
      //             .request(config)
      //             .then((res: any) => {
      //               resolve(res);
      //             })
      //             .catch((err: any) => {
      //               reject(err);
      //             });
      //         });
      //       }
      //     })
      //     .catch((err: any) => {
      //       Promise.reject(err);
      //     });
    }

    return new Promise((resolve, reject) => {
      reject(error);
    });
  }
);
