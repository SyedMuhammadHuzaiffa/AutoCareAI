import { memo } from "react";
import { View, Text, StyleSheet, Image, type ImageSourcePropType } from "react-native";
import {
  type Car,
  carDisplaySubtitle,
  carDisplayTitle,
} from "../../src/types/car";
import { useTheme } from "../../src/context/ThemeContext";
import { radius } from "../../src/theme/theme";

type Props = {
  item: Car;
  logoSource?: ImageSourcePropType;
  initial: string;
};

function GarageCarListItemInner({ item, logoSource, initial }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardElevated,
          borderColor: colors.border,
        },
      ]}
    >
      {logoSource ? (
        <Image
          source={logoSource}
          style={[styles.carLogo, { backgroundColor: colors.inputBg }]}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.fallback, { backgroundColor: colors.inputBg }]}>
          <Text style={[styles.fallbackText, { color: colors.text }]}>
            {initial}
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={[styles.carName, { color: colors.text }]} numberOfLines={1}>
          {carDisplayTitle(item)}
        </Text>
        <Text
          style={[styles.carModel, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {carDisplaySubtitle(item)}
        </Text>
      </View>

      <Text style={[styles.arrow, { color: colors.muted }]}>›</Text>
    </View>
  );
}

export const GarageCarListItem = memo(GarageCarListItemInner);

const styles = StyleSheet.create({
  card: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  carLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 14,
  },
  fallback: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  fallbackText: { fontWeight: "800", fontSize: 18 },
  info: { flex: 1, minWidth: 0 },
  carName: { fontSize: 16, fontWeight: "600" },
  carModel: { marginTop: 4, fontSize: 14 },
  arrow: { fontSize: 22, marginLeft: 6 },
});
