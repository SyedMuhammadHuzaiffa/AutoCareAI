import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useMemo, useState } from "react";
import API from "../src/api/api";
import { useRouter } from "expo-router";
import { getErrorMessage } from "../src/utils/errors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../src/context/ThemeContext";
import type { ThemeColors } from "../src/theme/theme";
import { spacing, radius, typography } from "../src/theme/theme";

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: { flex: 1 },
    fill: { flex: 1 },
    inner: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
    title: {
      ...typography.titleHero,
      color: colors.text,
      marginTop: spacing.sm,
    },
    subtitle: {
      ...typography.subtitle,
      color: colors.textSecondary,
      marginTop: spacing.sm,
      lineHeight: 20,
    },
    form: { marginTop: spacing.xl },
    label: {
      ...typography.label,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      marginTop: spacing.lg,
    },
    input: {
      backgroundColor: colors.inputBg,
      padding: spacing.md,
      borderRadius: radius.sm,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      fontSize: 16,
    },
    button: {
      marginTop: spacing.xl,
      backgroundColor: colors.accent,
      padding: spacing.md,
      borderRadius: radius.md,
      alignItems: "center",
    },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
  });
}

export default function AddCar() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  const [loading, setLoading] = useState(false);

  const isValid =
    brand.trim().length > 0 &&
    model.trim().length > 0 &&
    year.trim().length === 4;

  const handleAddCar = async () => {
    if (!isValid || loading) return;

    try {
      setLoading(true);

      await API.post("/cars", {
        brand: brand.trim(),
        model: model.trim(),
        year: Number(year.trim()),
      });

      Alert.alert("Success", "Vehicle added successfully");

      setBrand("");
      setModel("");
      setYear("");

      router.back();
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err, "Failed to add vehicle."));
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
        <View style={styles.inner}>
          <Text style={styles.title}>Add Vehicle</Text>

          <Text style={styles.subtitle}>
            Register your car for service tracking & AI diagnostics
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Brand</Text>
            <TextInput
              placeholder="e.g. Honda"
              placeholderTextColor={colors.muted}
              value={brand}
              onChangeText={setBrand}
              style={styles.input}
              editable={!loading}
            />

            <Text style={styles.label}>Model</Text>
            <TextInput
              placeholder="e.g. Civic"
              placeholderTextColor={colors.muted}
              value={model}
              onChangeText={setModel}
              style={styles.input}
              editable={!loading}
            />

            <Text style={styles.label}>Year</Text>
            <TextInput
              placeholder="e.g. 2022"
              placeholderTextColor={colors.muted}
              value={year}
              onChangeText={setYear}
              style={styles.input}
              keyboardType="numeric"
              maxLength={4}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, (!isValid || loading) && styles.buttonDisabled]}
            onPress={handleAddCar}
            disabled={!isValid || loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Save Vehicle</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
