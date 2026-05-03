import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { MarketSignal } from "@/constants/marketData";
import { useColors } from "@/hooks/useColors";

type Props = {
  signal: MarketSignal;
};

export function SignalRow({ signal }: Props) {
  const colors = useColors();

  const sentimentConfig = {
    bullish: { color: colors.buy, icon: "arrow-up-right" as const },
    bearish: { color: colors.sell, icon: "arrow-down-right" as const },
    neutral: { color: colors.hold, icon: "minus" as const },
  };

  const { color, icon } = sentimentConfig[signal.sentiment];

  return (
    <View style={[styles.row, { borderColor: colors.border }]}>
      <View style={[styles.dot, { backgroundColor: color + "30" }]}>
        <Feather name={icon} size={12} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{signal.label}</Text>
        <Text style={[styles.value, { color: colors.foreground }]}>{signal.value}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: color + "20", borderColor: color + "40" }]}>
        <Text style={[styles.badgeText, { color }]}>
          {signal.sentiment === "bullish" ? "+" : signal.sentiment === "bearish" ? "-" : "~"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  value: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
});
