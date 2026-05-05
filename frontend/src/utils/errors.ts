import axios from "axios";

export function isLikelyAbortError(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false;
  return (
    err.code === "ERR_CANCELED" ||
    err.message === "canceled" ||
    (typeof err.message === "string" && err.message.includes("abort"))
  );
}

export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    if (err.code === "ECONNABORTED") {
      return "Request timed out. Check your connection and try again.";
    }
    if (!err.response) {
      return "Unable to reach the server. Check your connection and try again.";
    }
    const data = err.response?.data as { message?: string } | undefined;
    const msg =
      (typeof data?.message === "string" && data.message) ||
      err.message ||
      fallback;
    return msg;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
