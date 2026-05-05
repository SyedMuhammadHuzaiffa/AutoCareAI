declare namespace NodeJS {
  interface ProcessEnv {
    /** HTTP origin only, e.g. http://192.168.0.101:5001 (no /api). */
    EXPO_PUBLIC_API_URL?: string;
  }
}
