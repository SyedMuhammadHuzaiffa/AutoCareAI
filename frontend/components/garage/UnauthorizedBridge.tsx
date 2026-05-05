import { useContext, useEffect } from "react";
import { useRouter } from "expo-router";
import { AuthContext } from "../../src/context/AuthContext";
import { setUnauthorizedHandler } from "../../src/api/api";

/**
 * Wires API 401 responses → logout + login screen (must render inside AuthProvider).
 */
export function UnauthorizedBridge() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!auth) return;

    const handler = async () => {
      await auth.logout();
      router.replace("/(auth)/login");
    };

    setUnauthorizedHandler(handler);
    return () => {
      setUnauthorizedHandler(null);
    };
  }, [auth, router]);

  return null;
}
