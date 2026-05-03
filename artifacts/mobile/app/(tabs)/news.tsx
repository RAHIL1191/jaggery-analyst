import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useMarket } from "@/hooks/useMarket";
import { generateDailyNews, computeNewsSentimentScore, NewsItem } from "@/constants/newsData";
import { NewsCard } from "@/components/NewsCard";

type Filter = "all" | "bullish" | "bearish" | "neutral";

export default function NewsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { snapshot, loading, refresh } = useMarket();
  const [filter, setFilter] = useState<Filter>("all");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const month = new Date().getMonth();
  const allNews = useMemo(() => generateDailyNews(month), [month]);
  const sentimentScore = useMemo(() => computeNewsSentimentScore(allNews), [allNews]);

  const filteredNews: NewsItem[] =
    filter === "all" ? allNews : allNews.filter((n) => n.sentiment === filter);

  const bullishCount = allNews.filter((n) => n.sentiment === "bullish").length;
  const bearishCount = allNews.filter((n) => n.sentiment === "bearish").length;
  const netSentiment = sentimentScore > 0.1 ? "Bullish" : sentimentScore < -0.1 ? "Bearish" : "Mixed";
  const netColor = sentimentScore > 0.1 ? colors.buy : sentimentScore < -0.1 ? colors.sell : colors.hold;

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100 },
      ]}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Daily Signals</Text>
          <Text style={[styles.dateText, { color: colors.mutedForeground }]}>{today}</Text>
        </View>
        <View style={[styles.liveChip, { backgroundColor: colors.buy + "15", borderColor: colors.buy + "30" }]}>
          <View style={[styles.liveDot, { backgroundColor: colors.buy }]} />
          <Text style={[styles.liveText, { color: colors.buy }]}>Live</Text>
        </View>
      </View>

      <View style={[styles.sentimentBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sentimentLeft}>
          <Text style={[styles.sentimentTitle, { color: colors.foreground }]}>Today's Market Sentiment</Text>
          <Text style={[styles.sentimentSub, { color: colors.mutedForeground }]}>
            {allNews.length} signals · {bullishCount} bullish · {bearishCount} bearish
          </Text>
        </View>
        <View style={[styles.sentimentBadge, { backgroundColor: netColor + "20", borderColor: netColor + "40" }]}>
          <Feather
            name={netSentiment === "Bullish" ? "trending-up" : netSentiment === "Bearish" ? "trending-down" : "activity"}
            size={14}
            color={netColor}
          />
          <Text style={[styles.sentimentBadgeText, { color: netColor }]}>{netSentiment}</Text>
        </View>
      </View>

      {snapshot && (
        <View style={[styles.priceImpactBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.priceImpactTitle, { color: colors.foreground }]}>Price Impact Summary</Text>
          <View style={styles.priceImpactRow}>
            <ImpactStat
              label="Bullish Factors"
              value={`+${allNews.filter(n => n.sentiment === "bullish").reduce((a, b) => a + b.priceImpactPct, 0)}%`}
              color={colors.buy}
              colors={colors}
            />
            <ImpactStat
              label="Bearish Factors"
              value={`-${allNews.filter(n => n.sentiment === "bearish").reduce((a, b) => a + b.priceImpactPct, 0)}%`}
              color={colors.sell}
              colors={colors}
            />
            <ImpactStat
              label="Net Impact"
              value={`${sentimentScore >= 0 ? "+" : ""}${(sentimentScore * 20).toFixed(1)}%`}
              color={netColor}
              colors={colors}
            />
            <ImpactStat
              label="Current Price"
              value={`₹${snapshot.currentPrice.toLocaleString("en-IN")}`}
              color={colors.primary}
              colors={colors}
            />
          </View>
        </View>
      )}

      <View style={styles.filterRow}>
        {([
          { key: "all", label: "All News" },
          { key: "bullish", label: "Bullish" },
          { key: "bearish", label: "Bearish" },
          { key: "neutral", label: "Neutral" },
        ] as { key: Filter; label: string }[]).map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  filter === f.key
                    ? f.key === "bullish"
                      ? colors.buy + "20"
                      : f.key === "bearish"
                        ? colors.sell + "20"
                        : colors.primary + "20"
                    : colors.muted,
                borderColor:
                  filter === f.key
                    ? f.key === "bullish"
                      ? colors.buy
                      : f.key === "bearish"
                        ? colors.sell
                        : colors.primary
                    : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    filter === f.key
                      ? f.key === "bullish"
                        ? colors.buy
                        : f.key === "bearish"
                          ? colors.sell
                          : colors.primary
                      : colors.mutedForeground,
                },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredNews.map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}

      <View style={[styles.disclaimer, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Feather name="info" size={12} color={colors.mutedForeground} />
        <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
          News signals are AI-curated market intelligence based on seasonal patterns, historical data, and publicly reported events. Price impact estimates are indicative. Refresh daily for updated signals.
        </Text>
      </View>
    </ScrollView>
  );
}

function ImpactStat({ label, value, color, colors }: { label: string; value: string; color: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.impactStat}>
      <Text style={[styles.impactLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.impactValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 14 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  dateText: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 },
  liveChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  sentimentBar: { borderRadius: 14, padding: 14, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sentimentLeft: { flex: 1, gap: 3 },
  sentimentTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  sentimentSub: { fontFamily: "Inter_400Regular", fontSize: 12 },
  sentimentBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  sentimentBadgeText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  priceImpactBox: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 10 },
  priceImpactTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  priceImpactRow: { flexDirection: "row", justifyContent: "space-between" },
  impactStat: { alignItems: "center", gap: 3 },
  impactLabel: { fontFamily: "Inter_400Regular", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.4, textAlign: "center" },
  impactValue: { fontFamily: "Inter_700Bold", fontSize: 13 },
  filterRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  disclaimer: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: "flex-start" },
  disclaimerText: { fontFamily: "Inter_400Regular", fontSize: 11, flex: 1, lineHeight: 17 },
});
