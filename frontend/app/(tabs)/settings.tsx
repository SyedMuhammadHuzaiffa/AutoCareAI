import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from "react-native";
import React, { useContext } from "react";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import { spacing, typography } from "../../src/theme/theme";

const APP_VERSION =
  Constants.expoConfig?.version ??
  (Constants as unknown as { manifest?: { version?: string } }).manifest
    ?.version ??
  "1.0.0";

export default function SettingsScreen() {
  const auth = useContext(AuthContext);
  const router = useRouter();
  const { colors, mode, setMode } = useTheme();

  if (!auth) return null;

  const { user, logout } = auth;

  const onLogout = () => {
    Alert.alert("Sign out", "You will need to sign in again.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/(auth)/login");
          } catch {
            Alert.alert("Error", "Could not sign out.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, { color: colors.text }]}>Settings</Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>Appearance</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
              Dark theme
            </Text>
            <Switch
              value={mode === "dark"}
              onValueChange={(v) => setMode(v ? "dark" : "light")}
              trackColor={{ false: "#767577", true: "#6366F1" }}
              thumbColor={Platform.OS === "ios" ? "#f4f3f4" : "#fff"}
            />
          </View>
          <Text style={[styles.hint, { color: colors.label }]}>
            Your theme preference is saved on this device.
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>Account</Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {user?.name ?? "—"}
          </Text>
          <Text style={[styles.metaSmall, { color: colors.muted }]}>
            {user?.email ?? ""}
          </Text>
          <TouchableOpacity
            style={[styles.dangerOutline, { borderColor: colors.danger }]}
            onPress={onLogout}
            activeOpacity={0.88}
          >
            <Text style={[styles.dangerText, { color: colors.danger }]}>
              Sign out
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>About</Text>
          <Text style={[styles.aboutName, { color: colors.text }]}>AutoCareAI</Text>
          <Text style={[styles.aboutBody, { color: colors.textSecondary }]}>
            Track vehicle maintenance, service history, and AI-assisted diagnostics
            in one place.
          </Text>
          <Text style={[styles.version, { color: colors.label }]}>
            Version {APP_VERSION}
          </Text>
          <Text style={[styles.support, { color: colors.textSecondary }]}>
            Support: support@autocareai.example
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  screenTitle: {
    ...typography.titleHero,
    fontSize: 26,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    fontSize: 16,
  },
  hint: {
    marginTop: spacing.sm,
    fontSize: 12,
    lineHeight: 18,
  },
  meta: { fontSize: 16, fontWeight: "600" },
  metaSmall: { fontSize: 14, marginTop: 4 },
  dangerOutline: {
    marginTop: spacing.md,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  dangerText: { fontWeight: "700", fontSize: 15 },
  aboutName: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  aboutBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  version: {
    fontSize: 13,
    marginBottom: 6,
  },
  support: {
    fontSize: 13,
  },
});
