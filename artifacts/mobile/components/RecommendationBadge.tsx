import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

type Rec = "BUY" | "SELL" | "HOLD";

type Props = {
  recommendation: Rec;
  confidence: number;
  large?: boolean;
};

export function RecommendationBadge({ recommendation, confidence, large }: Props) {
  const colors = useColors();

  const config: Record<Rec, { color: string; icon: string; bg: string }> = {
    BUY: { color: colors.buy, icon: "trending-up", bg: colors.buy + "20" },
    SELL: { color: colors.sell, icon: "trending-down", bg: colors.sell + "20" },
    HOLD: { color: colors.hold, icon: "minus", bg: colors.hold + "20" },
  };

  const { color, icon, bg } = config[recommendation];
  const size = large ? "large" : "small";

  return (
    <View style={[styles.container, styles[size], { backgroundColor: bg, borderColor: color + "40" }]}>
      <Feather name={icon as "trending-up"} size={large ? 22 : 14} color={color} />
      <Text style={[styles.text, large && styles.textLarge, { color }]}>{recommendation}</Text>
      <Text style={[styles.confidence, { color: color + "AA" }]}>{confidence}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  small: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  text: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 1.5,
  },
  textLarge: {
    fontSize: 18,
    letterSpacing: 2,
  },
  confidence: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
});
