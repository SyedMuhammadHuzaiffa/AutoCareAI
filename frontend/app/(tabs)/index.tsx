import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  type ListRenderItemInfo,
} from "react-native";
import React, {
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../src/context/AuthContext";
import API from "../../src/api/api";
import { useRouter } from "expo-router";
import { carLogos } from "../../src/utils/carLogos";
import { normalizeBrand } from "../../src/utils/carBrand";
import { type Car, parseCarsResponse } from "../../src/types/car";
import { getErrorMessage, isLikelyAbortError } from "../../src/utils/errors";
import { SwipeableCarRow } from "../../components/garage/SwipeableCarRow";
import { GarageCarListItem } from "../../components/garage/GarageCarListItem";
import { HomeListSkeleton } from "../../components/garage/HomeListSkeleton";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";
import type { ThemeColors } from "../../src/theme/theme";
import { spacing, radius } from "../../src/theme/theme";

function resolveCarLogo(brand?: string) {
  const key = normalizeBrand(brand);
  return carLogos[key as keyof typeof carLogos] || null;
}

function getInitial(text?: string) {
  return text?.charAt(0)?.toUpperCase() || "C";
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    container: {
      flex: 1,
      backgroundColor: colors.bg,
      paddingHorizontal: spacing.lg,
    },
    errorBanner: {
      marginTop: 12,
      padding: 12,
      borderRadius: radius.sm,
      backgroundColor: isDark ? "#1C1416" : "#FEE2E2",
      borderWidth: 1,
      borderColor: colors.danger,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    errorText: {
      color: isDark ? "#FCA5A5" : "#991B1B",
      flex: 1,
      fontSize: 13,
    },
    errorRetry: { color: colors.accentMuted, fontWeight: "700", fontSize: 14 },
    header: {
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    greeting: { color: colors.textSecondary, fontSize: 14 },
    username: { color: colors.text, fontSize: 24, fontWeight: "700" },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.cardElevated,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: { color: colors.text, fontWeight: "700", fontSize: 16 },
    hero: { marginTop: 22 },
    heroLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    statsCard: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 18,
      paddingVertical: 18,
      paddingHorizontal: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    statItem: { flex: 1, alignItems: "center" },
    statValue: { color: colors.text, fontSize: 22, fontWeight: "700" },
    statLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
    line: { width: 1, height: 36, backgroundColor: colors.border },
    sectionHead: {
      marginTop: 26,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 12,
    },
    title: { color: colors.text, fontSize: 18, fontWeight: "700" },
    hint: {
      color: colors.label,
      fontSize: 11,
      flexShrink: 1,
      textAlign: "right",
    },
    listContent: { paddingBottom: 120 },
    listEmpty: { flexGrow: 1, paddingBottom: 120 },
    fab: {
      position: "absolute",
      bottom: 28,
      right: 20,
      left: 20,
      backgroundColor: colors.accent,
      paddingVertical: 14,
      borderRadius: radius.md,
      alignItems: "center",
      shadowColor: "#312E81",
      shadowOpacity: 0.35,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    fabText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    emptyWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
      paddingTop: 24,
    },
    emptyIllustration: {
      marginBottom: 20,
    },
    emptyIconCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    emptyIconGlyph: { fontSize: 40 },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "700",
      textAlign: "center",
    },
    emptyBody: {
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
      marginTop: 10,
      maxWidth: 320,
    },
    emptyCta: {
      marginTop: 24,
      paddingVertical: 14,
      paddingHorizontal: 22,
      borderRadius: 14,
    },
    emptyCtaText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  });
}

export default function Home() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const router = useRouter();
  const { colors, mode } = useTheme();
  const isDark = mode === "dark";

  const styles = useMemo(
    () => createStyles(colors, isDark),
    [colors, isDark],
  );

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const carsRef = useRef<Car[]>([]);
  const deletingIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    carsRef.current = cars;
  }, [cars]);

  const loadList = useCallback(
    async (opts: { mode: "focus" | "refresh"; signal?: AbortSignal }) => {
      const { mode: loadMode, signal } = opts;
      const silent = loadMode === "focus" && carsRef.current.length > 0;

      if (loadMode === "refresh") setRefreshing(true);
      if (!silent) setLoading(true);
      setListError(null);

      try {
        const res = await API.get("/cars", { signal });
        const raw = res?.data?.data;
        const parsed = parseCarsResponse(raw);
        setCars(parsed);
      } catch (err: unknown) {
        if (isLikelyAbortError(err)) return;
        const msg = getErrorMessage(err, "Could not load vehicles");
        setListError(msg);
        if (!silent) setCars([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      void loadList({ mode: "focus", signal: controller.signal });
      return () => controller.abort();
    }, [loadList]),
  );

  const onRefresh = useCallback(() => {
    void loadList({ mode: "refresh" });
  }, [loadList]);

  const performRemoveCar = useCallback(async (carId: string) => {
    if (deletingIdsRef.current.has(carId)) return;
    deletingIdsRef.current.add(carId);

    let snapshot: Car[] = [];
    setCars((prev) => {
      snapshot = prev.slice();
      return prev.filter((c) => c._id !== carId);
    });
    setOpenRowId(null);

    try {
      await API.delete(`/cars/${carId}`);
    } catch (err) {
      setCars(snapshot);
      Alert.alert(
        "Error",
        getErrorMessage(err, "Could not remove this vehicle."),
      );
    } finally {
      deletingIdsRef.current.delete(carId);
    }
  }, []);

  const onRequestDelete = useCallback(
    (carId: string) => {
      performRemoveCar(carId);
    },
    [performRemoveCar],
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Car>) => {
      const logo = resolveCarLogo(item.brand);
      return (
        <SwipeableCarRow
          rowId={item._id}
          isOpen={openRowId === item._id}
          onOpen={setOpenRowId}
          onRequestDelete={() => onRequestDelete(item._id)}
          index={index}
          onPress={() => router.push(`/car/${item._id}`)}
        >
          <GarageCarListItem
            item={item}
            logoSource={logo ?? undefined}
            initial={getInitial(item.brand || item.model)}
          />
        </SwipeableCarRow>
      );
    },
    [openRowId, onRequestDelete, router],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyWrap}>
        <View style={styles.emptyIllustration}>
          <View
            style={[
              styles.emptyIconCircle,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={styles.emptyIconGlyph}>🚗</Text>
          </View>
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Your garage is empty
        </Text>
        <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
          Add a vehicle to track maintenance, AI diagnostics, and service history.
        </Text>
        <TouchableOpacity
          style={[styles.emptyCta, { backgroundColor: colors.accent }]}
          onPress={() => router.push("/add-car")}
          activeOpacity={0.88}
        >
          <Text style={styles.emptyCtaText}>Add your first vehicle</Text>
        </TouchableOpacity>
      </View>
    ),
    [router, styles, colors],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.username}>{user?.name ?? "Driver"}</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </Text>
          </View>
        </View>

        {listError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{listError}</Text>
            <TouchableOpacity onPress={() => void loadList({ mode: "refresh" })}>
              <Text style={styles.errorRetry}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Garage overview</Text>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{cars.length}</Text>
              <Text style={styles.statLabel}>Vehicles</Text>
            </View>
            <View style={styles.line} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {cars.length > 0 ? "Ready" : "—"}
              </Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.title}>Your garage</Text>
          <Text style={styles.hint}>Swipe left on a card to delete</Text>
        </View>

        {loading ? (
          <HomeListSkeleton />
        ) : (
          <FlatList
            data={cars}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            extraData={openRowId}
            removeClippedSubviews
            windowSize={7}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            updateCellsBatchingPeriod={50}
            contentContainerStyle={
              cars.length === 0 ? styles.listEmpty : styles.listContent
            }
            ListEmptyComponent={listError ? null : renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accentMuted}
              />
            }
            renderItem={renderItem}
          />
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/add-car")}
          activeOpacity={0.9}
        >
          <Text style={styles.fabText}>＋ Add vehicle</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
