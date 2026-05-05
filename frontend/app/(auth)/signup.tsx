import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { AuthContext } from "../../src/context/AuthContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";

export default function Signup() {
  const auth = useContext(AuthContext);
  const router = useRouter();
  const { colors } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!auth) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.danger }}>Auth unavailable.</Text>
      </View>
    );
  }

  const { register, login } = auth;

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      Alert.alert(
        "Create account",
        "Enter your name, email, and a password (at least 6 characters).",
      );
      return;
    }
    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not create account.";
      Alert.alert("Sign up failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={[styles.brand, { color: colors.text }]}>AutoCareAI</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Create your account
          </Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder="Jane Driver"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
            editable={!loading}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder="you@example.com"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.accent },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={[styles.link, { color: colors.accentMuted }]}>
              Already have an account? Sign in
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  fill: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    flexGrow: 1,
    justifyContent: "center",
  },
  brand: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    marginTop: 8,
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  linkBtn: { marginTop: 20, alignItems: "center" },
  link: { fontSize: 15, fontWeight: "600" },
});
