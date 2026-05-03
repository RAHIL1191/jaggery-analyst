import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

type Props = {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
};

export function StatCard({ label, value, sub, accent }: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: accent ? colors.primary + "15" : colors.card,
          borderColor: accent ? colors.primary + "40" : colors.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.value, { color: accent ? colors.primary : colors.foreground }]}>
        {value}
      </Text>
      {sub && <Text style={[styles.sub, { color: colors.mutedForeground }]}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  label: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  value: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  sub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
});
