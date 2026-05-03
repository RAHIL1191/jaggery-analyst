import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NewsItem } from "@/constants/newsData";
import { useColors } from "@/hooks/useColors";

const CATEGORY_ICON: Record<NewsItem["category"], string> = {
  weather: "cloud-rain",
  policy: "file-text",
  export: "upload",
  import: "download",
  supply: "package",
  demand: "users",
  transport: "truck",
};

const CATEGORY_LABEL: Record<NewsItem["category"], string> = {
  weather: "Weather",
  policy: "Policy",
  export: "Export",
  import: "Import",
  supply: "Supply",
  demand: "Demand",
  transport: "Transport",
};

type Props = {
  item: NewsItem;
  compact?: boolean;
};

export function NewsCard({ item, compact }: Props) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  const sentimentColor =
    item.sentiment === "bullish"
      ? colors.buy
      : item.sentiment === "bearish"
        ? colors.sell
        : colors.hold;

  const icon = CATEGORY_ICON[item.category] as "cloud-rain";

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.85}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: sentimentColor + "30",
          borderLeftColor: sentimentColor,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.catChip, { backgroundColor: sentimentColor + "15" }]}>
          <Feather name={icon} size={11} color={sentimentColor} />
          <Text style={[styles.catText, { color: sentimentColor }]}>
            {CATEGORY_LABEL[item.category]}
          </Text>
        </View>
        {item.isBreaking && (
          <View style={[styles.breakingBadge, { backgroundColor: colors.sell + "15" }]}>
            <View style={[styles.breakingDot, { backgroundColor: colors.sell }]} />
            <Text style={[styles.breakingText, { color: colors.sell }]}>BREAKING</Text>
          </View>
        )}
        <Text style={[styles.time, { color: colors.mutedForeground }]}>{item.publishedAt}</Text>
      </View>

      <Text style={[styles.headline, { color: colors.foreground }]} numberOfLines={expanded ? undefined : 2}>
        {item.headline}
      </Text>

      {expanded && (
        <>
          <Text style={[styles.detail, { color: colors.mutedForeground }]}>{item.detail}</Text>
          <View style={styles.metaRow}>
            <Feather name="map-pin" size={11} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.region}</Text>
            <Text style={[styles.dot, { color: colors.border }]}>·</Text>
            <Feather name="radio" size={11} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.source}</Text>
          </View>
        </>
      )}

      <View style={styles.bottomRow}>
        <View style={[styles.impactChip, { backgroundColor: sentimentColor + "12" }]}>
          <Feather
            name={item.sentiment === "bullish" ? "arrow-up-right" : item.sentiment === "bearish" ? "arrow-down-right" : "minus"}
            size={11}
            color={sentimentColor}
          />
          <Text style={[styles.impactText, { color: sentimentColor }]}>
            {item.sentiment === "bullish" ? "+" : item.sentiment === "bearish" ? "-" : ""}
            {item.priceImpactPct}% price impact
          </Text>
        </View>
        <Text style={[styles.readMore, { color: colors.primary }]}>
          {expanded ? "Less" : "Read more"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 14,
    gap: 8,
  },
  topRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  catChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  catText: { fontFamily: "Inter_600SemiBold", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  breakingBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  breakingDot: { width: 5, height: 5, borderRadius: 2.5 },
  breakingText: { fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1 },
  time: { fontFamily: "Inter_400Regular", fontSize: 11, marginLeft: "auto" },
  headline: { fontFamily: "Inter_600SemiBold", fontSize: 13, lineHeight: 19 },
  detail: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontFamily: "Inter_400Regular", fontSize: 11 },
  dot: { fontFamily: "Inter_400Regular", fontSize: 11 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  impactChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  impactText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  readMore: { fontFamily: "Inter_500Medium", fontSize: 12 },
});
