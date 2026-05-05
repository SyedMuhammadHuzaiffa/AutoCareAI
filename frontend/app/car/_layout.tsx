import { Stack } from "expo-router";

export default function CarGroupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#0B0F14" },
        headerTintColor: "#F9FAFB",
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "600" },
        headerBackTitle: "Garage",
        contentStyle: { backgroundColor: "#0B0F14" },
      }}
    >
      <Stack.Screen name="[id]" options={{ title: "Vehicle" }} />
    </Stack>
  );
}
