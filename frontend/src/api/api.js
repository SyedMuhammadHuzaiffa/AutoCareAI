import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiBaseUrl } from "../env";

// ✅ baseURL already includes /api
const baseURL = getApiBaseUrl();

export const API_BASE_URL = baseURL;

const API = axios.create({
  baseURL,
  timeout: 20000,
});

let unauthorizedHandler = async () => {};

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = typeof fn === "function" ? fn : async () => {};
}

let requestDebugLogged = false;

API.interceptors.request.use(async (config) => {
  const token = (await AsyncStorage.getItem("token"))?.trim();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (__DEV__ && !requestDebugLogged) {
    requestDebugLogged = true;
    console.log("[API BASE]", baseURL);
  }

  return config;
});

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;

    if (__DEV__) {
      console.log("[API ERROR]", error?.response?.data || error.message);
    }

    const url = String(error.config?.url || "");

    const isAuth =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/signup");

    if (status === 401 && !isAuth) {
      await AsyncStorage.multiRemove(["token", "user"]);
      await unauthorizedHandler();
    }

    if (!error.response) {
      error.isNetworkError = true;
    }

    return Promise.reject(error);
  },
);

export default API;
