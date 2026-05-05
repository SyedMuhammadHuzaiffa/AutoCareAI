import * as SplashScreen from "expo-splash-screen";
import { useContext, useEffect } from "react";
import { AuthContext } from "../src/context/AuthContext";

SplashScreen.preventAutoHideAsync().catch(() => {});

export function SplashGate() {
  const auth = useContext(AuthContext);

  useEffect(() => {
    if (auth === undefined) return;
    if (!auth.loading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [auth]);

  return null;
}
