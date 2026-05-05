import { Platform } from "react-native";

const DEV_BASE =
  Platform.OS === "android"
    ? "http://10.0.2.2:5001/api"
    : "http://192.168.0.101:5001/api";

export function getApiBaseUrl(): string {
  const env = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (env) {
    return env.replace(/\/+$/, "");
  }

  return DEV_BASE;
}
