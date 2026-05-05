import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import API from "../../src/api/api";
import React, { memo, useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { carLogos } from "../../src/utils/carLogos";
import { normalizeBrand } from "../../src/utils/carBrand";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  type Car,
  carDisplayTitle,
  normalizeCarLenient,
} from "../../src/types/car";
import { getErrorMessage, isLikelyAbortError } from "../../src/utils/errors";
import { useTheme } from "../../src/context/ThemeContext";
import { spacing } from "../../src/theme/theme";

type ServiceItem = {
  _id: string;
  type: string;
  description?: string;
  date?: string;
  cost?: number;
};

function formatServiceDate(raw?: string) {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function parseServicesPayload(payload: unknown): ServiceItem[] {
  if (!Array.isArray(payload)) return [];
  const out: ServiceItem[] = [];
  let i = 0;
  for (const row of payload) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const sid = o._id != null ? String(o._id) : `svc-${i}`;
    const type = String(o.type ?? "").trim() || "Service";
    const description =
      o.description != null ? String(o.description) : undefined;
    let date: string | undefined;
    if (o.date != null) {
      if (typeof o.date === "string") date = o.date;
      else if (o.date instanceof Date) date = o.date.toISOString();
      else date = String(o.date);
    }
    const cost =
      typeof o.cost === "number" && Number.isFinite(o.cost)
        ? o.cost
        : undefined;
    out.push({ _id: sid, type, description, date, cost });
    i += 1;
  }
  return out;
}

function extractMileage(raw: unknown): number | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const m = (raw as Record<string, unknown>).mileage;
  if (typeof m === "number" && Number.isFinite(m)) return m;
  return undefined;
}

function formatRecommendations(raw: unknown): string {
  if (Array.isArray(raw)) {
    const lines = raw.filter((x): x is string => typeof x === "string");
    return lines.length ? lines.join("\n• ") : "—";
  }
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return "—";
}

type DiagnosisPayload = Record<string, unknown>;

function CarDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();
  const { colors } = useTheme();

  const [car, setCar] = useState<Car | null>(null);
  const [mileage, setMileage] = useState<number | undefined>(undefined);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [screenLoading, setScreenLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [aiDiagnosticLoading, setAiDiagnosticLoading] = useState(false);
  const [aiDiagnosticError, setAiDiagnosticError] = useState<string | null>(null);
  const [aiDiagnosticData, setAiDiagnosticData] = useState<DiagnosisPayload | null>(
    null,
  );

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [svcTitle, setSvcTitle] = useState("");
  const [svcDate, setSvcDate] = useState("");
  const [svcCost, setSvcCost] = useState("");
  const [svcNotes, setSvcNotes] = useState("");
  const [svcSubmitting, setSvcSubmitting] = useState(false);

  const deleteLockRef = useRef(false);

  const runAiDiagnostic = useCallback(async (carId: string) => {
    setAiDiagnosticLoading(true);
    setAiDiagnosticError(null);
    try {
      const res = await API.post(`/ai/diagnose`, {
        carId,
        symptom: "general health check",
      });
      const data = res?.data?.data;
      if (data && typeof data === "object" && !Array.isArray(data)) {
        setAiDiagnosticData(data as DiagnosisPayload);
      } else {
        setAiDiagnosticData(null);
        setAiDiagnosticError("No diagnosis data returned.");
      }
    } catch (e) {
      setAiDiagnosticError(getErrorMessage(e, "Diagnostic request failed."));
      setAiDiagnosticData(null);
    } finally {
      setAiDiagnosticLoading(false);
    }
  }, []);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!id) return;
      setScreenLoading(true);
      setLoadError(null);
      setAiDiagnosticData(null);
      setAiDiagnosticError(null);
      try {
        const [carsRes, servicesRes] = await Promise.all([
          API.get("/cars", { signal }),
          API.get(`/services/${id}`, { signal }).catch((err) => {
            if (isLikelyAbortError(err)) throw err;
            return null;
          }),
        ]);

        const rawList = carsRes?.data?.data;
        const list = Array.isArray(rawList) ? rawList : [];
        const foundRaw = list.find(
          (c: unknown) =>
            c &&
            typeof c === "object" &&
            String((c as { _id?: unknown })._id) === id,
        );

        const normalized = foundRaw ? normalizeCarLenient(foundRaw) : null;
        setCar(normalized);
        setMileage(extractMileage(foundRaw));

        const svcPayload =
          servicesRes &&
          typeof servicesRes === "object" &&
          servicesRes.data &&
          typeof servicesRes.data === "object"
            ? (servicesRes.data as { data?: unknown }).data
            : undefined;

        setServices(parseServicesPayload(svcPayload));
      } catch (e: unknown) {
        if (isLikelyAbortError(e)) return;
        setCar(null);
        setMileage(undefined);
        setServices([]);
        setLoadError(getErrorMessage(e, "Could not load this vehicle."));
      } finally {
        setScreenLoading(false);
      }
    },
    [id],
  );

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      void load(controller.signal);
      return () => controller.abort();
    }, [load]),
  );

  const getCarLogo = (brand?: string) => {
    const key = normalizeBrand(brand);
    return carLogos[key as keyof typeof carLogos] || null;
  };

  const deleteCar = () => {
    if (deleteLockRef.current || deleteLoading || aiDiagnosticLoading) return;
    Alert.alert(
      "Delete vehicle",
      "Are you sure you want to delete this vehicle?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!id || deleteLockRef.current) return;
            deleteLockRef.current = true;
            try {
              setDeleteLoading(true);
              await API.delete(`/cars/${id}`);
              router.replace("/(tabs)");
            } catch (err) {
              Alert.alert(
                "Error",
                getErrorMessage(err, "Failed to delete vehicle."),
              );
            } finally {
              setDeleteLoading(false);
              deleteLockRef.current = false;
            }
          },
        },
      ],
    );
  };

  const submitNewService = async () => {
    if (!id || svcSubmitting) return;
    const title = svcTitle.trim();
    if (!title) {
      Alert.alert("Add service", "Enter a service title.");
      return;
    }
    let costNum = 0;
    if (svcCost.trim()) {
      const n = Number(svcCost.replace(/,/g, ""));
      if (!Number.isFinite(n) || n < 0) {
        Alert.alert("Add service", "Enter a valid cost.");
        return;
      }
      costNum = n;
    }
    let dateIso = new Date().toISOString();
    if (svcDate.trim()) {
      const parsed = new Date(svcDate.trim());
      if (!Number.isNaN(parsed.getTime())) dateIso = parsed.toISOString();
    }
    try {
      setSvcSubmitting(true);
      await API.post("/services", {
        carId: id,
        type: title,
        description: svcNotes.trim() || undefined,
        cost: costNum,
        date: dateIso,
      });
      setAddModalOpen(false);
      setSvcTitle("");
      setSvcDate("");
      setSvcCost("");
      setSvcNotes("");
      void load();
    } catch (err) {
      Alert.alert(
        "Add service",
        getErrorMessage(err, "Could not save service."),
      );
    } finally {
      setSvcSubmitting(false);
    }
  };

  const logo = car ? getCarLogo(car.brand) : null;

  const timelineFromApi = [...services].sort((a, b) => {
    const ta = a.date ? new Date(a.date).getTime() : 0;
    const tb = b.date ? new Date(b.date).getTime() : 0;
    return tb - ta;
  });

  const hasServices = timelineFromApi.length > 0;

  const issueStr =
    aiDiagnosticData && typeof aiDiagnosticData.issue === "string"
      ? aiDiagnosticData.issue
      : null;
  const severityStr =
    aiDiagnosticData && typeof aiDiagnosticData.severity === "string"
      ? aiDiagnosticData.severity
      : null;

  if (!id) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["bottom"]}>
        <View style={styles.center}>
          <Text style={[styles.muted, { color: colors.textSecondary }]}>
            Missing vehicle id.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {screenLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.accentMuted} />
              <Text style={[styles.loadingLabel, { color: colors.textSecondary }]}>
                Loading vehicle…
              </Text>
            </View>
          ) : loadError ? (
            <View style={styles.center}>
              <Text style={[styles.muted, { color: colors.textSecondary }]}>
                {loadError}
              </Text>
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: colors.border }]}
                onPress={() => void load()}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : !car ? (
            <View style={styles.center}>
              <Text style={[styles.muted, { color: colors.textSecondary }]}>
                This vehicle is no longer available.
              </Text>
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: colors.border }]}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
                  Back to garage
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View
                style={[
                  styles.headerCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                {logo ? (
                  <Image
                    source={logo}
                    style={styles.headerLogo}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={[styles.headerFallback, { backgroundColor: colors.inputBg }]}>
                    <Text style={styles.headerFallbackText}>
                      {(car.brand || car.model || "?").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.headerTextCol}>
                  <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={2}>
                    {carDisplayTitle(car)}
                  </Text>
                  <Text
                    style={[styles.headerMeta, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {[car.year, car.brand, car.model].filter(Boolean).join(" · ")}
                  </Text>
                  {mileage != null ? (
                    <Text style={[styles.headerMiles, { color: colors.accentMuted }]}>
                      {Number(mileage).toLocaleString()} km
                    </Text>
                  ) : null}
                </View>
              </View>

              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  AI Diagnostic
                </Text>
                <Text style={[styles.cardHint, { color: colors.label }]}>
                  General health check for this vehicle. Tap the button to run — no extra input
                  required.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: colors.accent },
                    aiDiagnosticLoading && styles.btnDisabled,
                  ]}
                  onPress={() => id && runAiDiagnostic(id)}
                  disabled={aiDiagnosticLoading || deleteLoading}
                  activeOpacity={0.9}
                >
                  {aiDiagnosticLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Run AI Diagnostic</Text>
                  )}
                </TouchableOpacity>
                {aiDiagnosticError ? (
                  <Text style={[styles.aiErrorText, { color: colors.danger }]}>
                    {aiDiagnosticError}
                  </Text>
                ) : null}
                {aiDiagnosticData ? (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>
                      Diagnosis
                    </Text>
                    <Text style={[styles.diagBody, { color: colors.text }]}>
                      {issueStr ?? "—"}
                    </Text>
                    <Text style={[styles.diagLabel, { color: colors.textSecondary, marginTop: 8 }]}>
                      Severity
                    </Text>
                    <Text style={[styles.diagBody, { color: colors.text }]}>
                      {severityStr ?? "—"}
                    </Text>
                    <Text style={[styles.diagLabel, { color: colors.textSecondary, marginTop: 8 }]}>
                      Recommendations
                    </Text>
                    <Text style={[styles.diagBody, { color: colors.text }]}>
                      • {formatRecommendations(aiDiagnosticData.recommendation)}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.rowBetween}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Service history
                  </Text>
                  <TouchableOpacity
                    onPress={() => setAddModalOpen(true)}
                    activeOpacity={0.88}
                  >
                    <Text style={[styles.linkBtn, { color: colors.accentMuted }]}>
                      Add record
                    </Text>
                  </TouchableOpacity>
                </View>

                {hasServices ? (
                  timelineFromApi.map((s, i) => {
                    const isLast = i === timelineFromApi.length - 1;
                    const key = s._id || `svc-${i}`;
                    const sub = [formatServiceDate(s.date), s.description]
                      .filter(Boolean)
                      .join(" · ");
                    const costStr =
                      s.cost != null && s.cost > 0
                        ? ` · $${Number(s.cost).toFixed(2)}`
                        : "";
                    return (
                      <View key={key} style={styles.timelineRow}>
                        <View style={styles.timelineRail}>
                          <View
                            style={[styles.timelineDot, { borderColor: colors.border }]}
                          />
                          {!isLast ? (
                            <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                          ) : null}
                        </View>
                        <View style={styles.timelineBody}>
                          <Text style={[styles.timelineTitle, { color: colors.text }]}>
                            {s.type}
                            {costStr}
                          </Text>
                          {sub ? (
                            <Text style={[styles.timelineSub, { color: colors.textSecondary }]}>
                              {sub}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <>
                    <Text style={[styles.emptyServicesTitle, { color: colors.text }]}>
                      No service history yet
                    </Text>
                    <TouchableOpacity
                      style={[styles.primaryOutline, { borderColor: colors.accent }]}
                      onPress={() => setAddModalOpen(true)}
                      activeOpacity={0.88}
                    >
                      <Text style={[styles.primaryOutlineText, { color: colors.accentMuted }]}>
                        Add Service Record
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.dangerBtn,
                  { backgroundColor: colors.danger },
                  deleteLoading && styles.btnDisabled,
                ]}
                onPress={deleteCar}
                disabled={deleteLoading || aiDiagnosticLoading}
              >
                {deleteLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.dangerBtnText}>Delete vehicle</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={addModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add service record
            </Text>
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Title</Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              placeholder="e.g. Oil change"
              placeholderTextColor={colors.muted}
              value={svcTitle}
              onChangeText={setSvcTitle}
            />
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Date</Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              placeholder="YYYY-MM-DD (optional)"
              placeholderTextColor={colors.muted}
              value={svcDate}
              onChangeText={setSvcDate}
            />
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Cost</Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              placeholder="0"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              value={svcCost}
              onChangeText={setSvcCost}
            />
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Notes</Text>
            <TextInput
              style={[
                styles.modalInput,
                styles.modalNotes,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              placeholder="Optional details"
              placeholderTextColor={colors.muted}
              multiline
              value={svcNotes}
              onChangeText={setSvcNotes}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancel, { borderColor: colors.border }]}
                onPress={() => setAddModalOpen(false)}
                disabled={svcSubmitting}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, { backgroundColor: colors.accent }]}
                onPress={submitNewService}
                disabled={svcSubmitting}
              >
                {svcSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default memo(CarDetailScreen);

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 32,
  },
  center: {
    paddingTop: 48,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  loadingLabel: { marginTop: 12, fontSize: 14 },
  muted: { fontSize: 15, textAlign: "center", paddingHorizontal: 12 },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
  },
  headerLogo: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#1C2633",
    marginRight: 16,
  },
  headerFallback: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerFallbackText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  headerTextCol: { flex: 1, minWidth: 0 },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  headerMeta: { marginTop: 6, fontSize: 14 },
  headerMiles: { marginTop: 8, fontSize: 13, fontWeight: "600" },
  card: {
    borderRadius: 20,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
  },
  cardTitle: { fontSize: 17, fontWeight: "700" },
  cardHint: { fontSize: 12, marginTop: 6, marginBottom: 12, lineHeight: 18 },
  aiErrorText: { fontSize: 13, marginTop: 10 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  linkBtn: { fontSize: 14, fontWeight: "700" },
  diagLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  diagBody: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  emptyServicesTitle: { fontSize: 15, fontWeight: "600", marginBottom: 12 },
  primaryOutline: {
    alignSelf: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  primaryOutlineText: { fontWeight: "700", fontSize: 14 },
  timelineRow: { flexDirection: "row", minHeight: 52 },
  timelineRail: { width: 22, alignItems: "center", marginRight: 10 },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#6366F1",
    marginTop: 4,
    borderWidth: 2,
  },
  timelineLine: { flex: 1, width: 2, marginTop: 2, minHeight: 24 },
  timelineBody: { flex: 1, paddingBottom: 14 },
  timelineTitle: { fontSize: 15, fontWeight: "600" },
  timelineSub: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  primaryBtn: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  dangerBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  dangerBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryBtnText: { fontWeight: "600" },
  btnDisabled: { opacity: 0.65 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: { borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 16 },
  modalLabel: { fontSize: 12, fontWeight: "600", marginBottom: 6, marginTop: 10 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  modalNotes: { minHeight: 72, textAlignVertical: "top" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalSave: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center",
  },
  modalSaveText: { color: "#fff", fontWeight: "700" },
});
