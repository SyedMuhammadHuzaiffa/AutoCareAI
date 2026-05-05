import { View, StyleSheet } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import { radius } from "../../src/theme/theme";

export function HomeListSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap} accessibilityLabel="Loading vehicles">
      {[0, 1, 2, 3].map((k) => (
        <View
          key={k}
          style={[
            styles.row,
            {
              backgroundColor: colors.cardElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.inputBg }]} />
          <View style={styles.col}>
            <View style={[styles.lineLg, { backgroundColor: colors.border }]} />
            <View style={[styles.lineSm, { backgroundColor: colors.inputBorder }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 12, paddingBottom: 120 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 14,
  },
  col: { flex: 1 },
  lineLg: {
    height: 14,
    borderRadius: 6,
    width: "72%",
    marginBottom: 8,
  },
  lineSm: {
    height: 12,
    borderRadius: 6,
    width: "44%",
  },
});
