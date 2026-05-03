import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useMarket } from "@/hooks/useMarket";
import { RecommendationBadge } from "@/components/RecommendationBadge";
import { SignalRow } from "@/components/SignalRow";
import type { Festival, HarvestInfo, MarketSignal } from "@/constants/marketData";

type Rec = "BUY" | "SELL" | "HOLD";
type SignalTab = "all" | "festival" | "harvest" | "technical";

const ACTION_TEXT: Record<Rec, { summary: string; action: string; risk: string }> = {
  BUY: {
    summary: "Multiple indicators align — strong buying opportunity.",
    action: "Consider procuring jaggery now. Festival demand and/or off-season tightening are supporting prices. Technical momentum is positive.",
    risk: "A sudden bumper crop or delayed festival buying can soften prices. Always maintain a stop-loss discipline.",
  },
  SELL: {
    summary: "Sell or book profits — downside risk elevated.",
    action: "If holding stock, consider liquidating at current levels. Harvest supply or post-festival demand slump may push prices lower.",
    risk: "Prices may recover if festival demand surprises to the upside. Consider partial selling over all-at-once exit.",
  },
  HOLD: {
    summary: "Mixed signals — wait for a clearer directional move.",
    action: "Neither a strong buy nor sell. Monitor the upcoming festival calendar and harvest progress before committing capital.",
    risk: "Set price alerts at buy and sell thresholds. Re-assess weekly as festival dates approach.",
  },
};

export default function AdvisorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { snapshot, loading, refresh } = useMarket();
  const [activeTab, setActiveTab] = useState<SignalTab>("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (loading && !snapshot) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!snapshot) return null;

  const advice = ACTION_TEXT[snapshot.recommendation];
  const recColor = { BUY: colors.buy, SELL: colors.sell, HOLD: colors.hold }[snapshot.recommendation];

  const filteredSignals: MarketSignal[] =
    activeTab === "all"
      ? snapshot.signals
      : snapshot.signals.filter((s) => s.category === activeTab);

  const tabs: { key: SignalTab; label: string; icon: string }[] = [
    { key: "all", label: "All", icon: "layers" },
    { key: "festival", label: "Festivals", icon: "star" },
    { key: "harvest", label: "Harvest", icon: "sun" },
    { key: "technical", label: "Technical", icon: "bar-chart-2" },
  ];

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
      <Text style={[styles.title, { color: colors.foreground }]}>AI Advisor</Text>

      <View style={[styles.heroCard, { backgroundColor: recColor + "12", borderColor: recColor + "40" }]}>
        <RecommendationBadge recommendation={snapshot.recommendation} confidence={snapshot.confidence} large />
        <Text style={[styles.heroSummary, { color: colors.foreground }]}>{advice.summary}</Text>
        <View style={styles.confBar}>
          <View style={styles.confLabelRow}>
            <Text style={[styles.confLabel, { color: colors.mutedForeground }]}>Confidence Score</Text>
            <Text style={[styles.confValue, { color: recColor }]}>{snapshot.confidence}%</Text>
          </View>
          <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
            <View style={[styles.barFill, { width: `${snapshot.confidence}%`, backgroundColor: recColor }]} />
          </View>
        </View>
        <View style={styles.scoreRow}>
          <ScorePill
            label="Festival Impact"
            score={snapshot.festivalScore}
            icon="star"
            colors={colors}
          />
          <ScorePill
            label={snapshot.harvestScore >= 0 ? "Harvest Bullish" : "Harvest Bearish"}
            score={Math.abs(snapshot.harvestScore)}
            icon="sun"
            positive={snapshot.harvestScore >= 0}
            colors={colors}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <Feather name="zap" size={15} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recommendation</Text>
        </View>
        <Text style={[styles.bodyText, { color: colors.foreground }]}>{advice.action}</Text>
        <View style={styles.pricePair}>
          <View style={[styles.priceBlock, { backgroundColor: colors.buy + "12", borderColor: colors.buy + "30" }]}>
            <Text style={[styles.priceBlockLabel, { color: colors.mutedForeground }]}>Target</Text>
            <Text style={[styles.priceBlockValue, { color: colors.buy }]}>₹{snapshot.targetPrice.toLocaleString("en-IN")}</Text>
          </View>
          <View style={[styles.priceBlock, { backgroundColor: colors.sell + "12", borderColor: colors.sell + "30" }]}>
            <Text style={[styles.priceBlockLabel, { color: colors.mutedForeground }]}>Stop Loss</Text>
            <Text style={[styles.priceBlockValue, { color: colors.sell }]}>₹{snapshot.stopLoss.toLocaleString("en-IN")}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <Feather name="star" size={15} color="#F59E0B" />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Festival Calendar</Text>
        </View>
        {snapshot.upcomingFestivals.length === 0 ? (
          <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>No major festivals in the next 90 days.</Text>
        ) : (
          snapshot.upcomingFestivals.map((fest: Festival) => (
            <FestivalCard key={fest.name} fest={fest} colors={colors} />
          ))
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <Feather name="sun" size={15} color="#D97706" />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Harvest Season</Text>
        </View>
        <HarvestCard info={snapshot.harvestInfo} colors={colors} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <Feather name="bar-chart-2" size={15} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Market Signals</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tabChip,
                {
                  backgroundColor: activeTab === tab.key ? colors.primary + "20" : colors.muted,
                  borderColor: activeTab === tab.key ? colors.primary : colors.border,
                },
              ]}
            >
              <Feather
                name={tab.icon as "layers"}
                size={12}
                color={activeTab === tab.key ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabChipText,
                  { color: activeTab === tab.key ? colors.primary : colors.mutedForeground },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {filteredSignals.map((sig) => (
          <SignalRow key={sig.label} signal={sig} />
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <Feather name="alert-triangle" size={15} color={colors.warning} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Risk Factors</Text>
        </View>
        <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>{advice.risk}</Text>
      </View>

      <View style={[styles.disclaimer, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Feather name="shield" size={12} color={colors.mutedForeground} />
        <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
          Predictions use price technicals, Indian festival calendar, and sugarcane harvest data. Not financial advice — consult a market expert before trading.
        </Text>
      </View>
    </ScrollView>
  );
}

function ScorePill({
  label,
  score,
  icon,
  positive = true,
  colors,
}: {
  label: string;
  score: number;
  icon: string;
  positive?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  const color = positive ? colors.buy : colors.sell;
  const pct = Math.round(score * 100);
  return (
    <View style={[styles.scorePill, { backgroundColor: color + "12", borderColor: color + "30" }]}>
      <Feather name={icon as "star"} size={12} color={color} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.scorePillLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <View style={[styles.miniBarTrack, { backgroundColor: colors.muted }]}>
          <View style={[styles.miniBarFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
      </View>
      <Text style={[styles.scorePillValue, { color }]}>{pct}%</Text>
    </View>
  );
}

function FestivalCard({ fest, colors }: { fest: Festival; colors: ReturnType<typeof useColors> }) {
  const urgencyColor =
    fest.daysUntil <= 14 ? colors.sell : fest.daysUntil <= 30 ? colors.hold : colors.primary;
  const impactMap = { high: "High Impact", medium: "Medium Impact", low: "Low Impact" };

  return (
    <View style={[styles.festCard, { borderColor: urgencyColor + "30", backgroundColor: urgencyColor + "08" }]}>
      <View style={styles.festHeader}>
        <View style={styles.festLeft}>
          <Text style={[styles.festName, { color: colors.foreground }]}>{fest.name}</Text>
          <Text style={[styles.festDate, { color: colors.mutedForeground }]}>{fest.date}</Text>
        </View>
        <View style={styles.festRight}>
          <View style={[styles.daysChip, { backgroundColor: urgencyColor + "20", borderColor: urgencyColor + "40" }]}>
            <Text style={[styles.daysText, { color: urgencyColor }]}>
              {fest.daysUntil === 0 ? "Today" : `${fest.daysUntil}d`}
            </Text>
          </View>
          <Text style={[styles.boostText, { color: colors.buy }]}>+{fest.demandBoost}% demand</Text>
        </View>
      </View>
      <Text style={[styles.festDesc, { color: colors.mutedForeground }]}>{fest.description}</Text>
      <View style={[styles.impactBadge, { backgroundColor: urgencyColor + "15" }]}>
        <Text style={[styles.impactText, { color: urgencyColor }]}>{impactMap[fest.impact]}</Text>
      </View>
    </View>
  );
}

function HarvestCard({ info, colors }: { info: HarvestInfo; colors: ReturnType<typeof useColors> }) {
  const effectColor =
    info.priceEffect === "bullish"
      ? colors.buy
      : info.priceEffect === "bearish"
        ? colors.sell
        : colors.hold;

  const effectLabel =
    info.priceEffect === "bullish"
      ? "Bullish — Supply tightening"
      : info.priceEffect === "bearish"
        ? "Bearish — Supply increasing"
        : "Neutral — Transitional period";

  return (
    <View style={[styles.harvestCard, { borderColor: effectColor + "30", backgroundColor: effectColor + "08" }]}>
      <View style={styles.harvestHeader}>
        <View>
          <Text style={[styles.harvestPhase, { color: colors.foreground }]}>{info.phase}</Text>
          <Text style={[styles.harvestRegion, { color: colors.mutedForeground }]}>{info.region}</Text>
        </View>
        <View style={[styles.effectBadge, { backgroundColor: effectColor + "20", borderColor: effectColor + "40" }]}>
          <Feather
            name={info.priceEffect === "bullish" ? "trending-up" : info.priceEffect === "bearish" ? "trending-down" : "minus"}
            size={12}
            color={effectColor}
          />
          <Text style={[styles.effectText, { color: effectColor }]}>
            {info.priceEffect === "bullish" ? "Price +ve" : info.priceEffect === "bearish" ? "Price -ve" : "Neutral"}
          </Text>
        </View>
      </View>
      <Text style={[styles.harvestDesc, { color: colors.foreground }]}>{info.description}</Text>
      <View style={styles.intensityRow}>
        <Text style={[styles.intensityLabel, { color: colors.mutedForeground }]}>Effect Intensity</Text>
        <View style={[styles.barTrack, { backgroundColor: colors.muted, flex: 1 }]}>
          <View style={[styles.barFill, { width: `${info.intensity * 100}%`, backgroundColor: effectColor }]} />
        </View>
        <Text style={[styles.intensityValue, { color: effectColor }]}>{Math.round(info.intensity * 100)}%</Text>
      </View>
      <Text style={[styles.effectLabel, { color: effectColor }]}>{effectLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  heroCard: { borderRadius: 16, padding: 20, borderWidth: 1, gap: 14, alignItems: "flex-start" },
  heroSummary: { fontFamily: "Inter_500Medium", fontSize: 15, lineHeight: 22 },
  confBar: { width: "100%", gap: 6 },
  confLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  confLabel: { fontFamily: "Inter_400Regular", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.7 },
  confValue: { fontFamily: "Inter_700Bold", fontSize: 13 },
  barTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  barFill: { height: 6, borderRadius: 3 },
  scoreRow: { flexDirection: "row", gap: 10, width: "100%" },
  scorePill: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
    padding: 10, borderRadius: 10, borderWidth: 1,
  },
  scorePillLabel: { fontFamily: "Inter_400Regular", fontSize: 10, marginBottom: 3 },
  miniBarTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  miniBarFill: { height: 4, borderRadius: 2 },
  scorePillValue: { fontFamily: "Inter_700Bold", fontSize: 12 },
  section: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  bodyText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  pricePair: { flexDirection: "row", gap: 10 },
  priceBlock: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, gap: 4 },
  priceBlockLabel: { fontFamily: "Inter_400Regular", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6 },
  priceBlockValue: { fontFamily: "Inter_700Bold", fontSize: 18 },
  tabScroll: { marginBottom: -4 },
  tabChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, marginRight: 8,
  },
  tabChipText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  festCard: { borderRadius: 12, padding: 14, borderWidth: 1, gap: 8 },
  festHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  festLeft: { flex: 1, gap: 2 },
  festName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  festDate: { fontFamily: "Inter_400Regular", fontSize: 12 },
  festRight: { alignItems: "flex-end", gap: 4 },
  daysChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  daysText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  boostText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  festDesc: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  impactBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  impactText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  harvestCard: { borderRadius: 12, padding: 14, borderWidth: 1, gap: 10 },
  harvestHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  harvestPhase: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  harvestRegion: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  effectBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  effectText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  harvestDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  intensityRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  intensityLabel: { fontFamily: "Inter_400Regular", fontSize: 11 },
  intensityValue: { fontFamily: "Inter_700Bold", fontSize: 12 },
  effectLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },
  disclaimer: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: "flex-start" },
  disclaimerText: { fontFamily: "Inter_400Regular", fontSize: 11, flex: 1, lineHeight: 17 },
});
