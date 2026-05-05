/* eslint-disable import/no-duplicates -- RNGH side-effect must load before Reanimated */
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
/* eslint-enable import/no-duplicates */
import "react-native-reanimated";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, AuthContext } from "../src/context/AuthContext";
import { ThemeProvider } from "../src/context/ThemeContext";
import { UnauthorizedBridge } from "../components/garage/UnauthorizedBridge";
import { SplashGate } from "../components/SplashGate";
import { useContext, useEffect, ReactNode } from "react";
import { Platform } from "react-native";

function AuthGate({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!auth) return;
    const { user, loading } = auth;
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    }

    if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [auth, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <SplashGate />
          <UnauthorizedBridge />
          <AuthGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen
                name="add-car"
                options={{
                  headerShown: true,
                  title: "Add vehicle",
                  headerStyle: { backgroundColor: "#0B0F14" },
                  headerTintColor: "#F9FAFB",
                  headerShadowVisible: false,
                  headerTitleStyle: { fontWeight: "600" },
                  contentStyle: { backgroundColor: "#0B0F14" },
                  presentation:
                    Platform.OS === "ios" ? "modal" : "card",
                }}
              />
              <Stack.Screen
                name="car"
                options={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "#0B0F14" },
                }}
              />
              <Stack.Screen name="modal" />
            </Stack>
          </AuthGate>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
