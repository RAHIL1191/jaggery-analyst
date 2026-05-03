import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useMarket } from "@/hooks/useMarket";
import { RecommendationBadge } from "@/components/RecommendationBadge";
import { SignalRow } from "@/components/SignalRow";

type Rec = "BUY" | "SELL" | "HOLD";

const ADVICE: Record<Rec, { summary: string; action: string; risk: string; reason: string[] }> = {
  BUY: {
    summary: "Strong buying opportunity detected in the jaggery market.",
    action:
      "Consider procuring jaggery in the current price range. Multiple technical and seasonal indicators point to near-term price appreciation.",
    risk:
      "Monitor for any sudden drop below stop-loss level. Unseasonal weather or bumper sugarcane crop could pressure prices.",
    reason: [
      "Price momentum is positive with 7-day MA pointing upward",
      "Festival season demand typically boosts consumption 15-25%",
      "RSI in healthy zone — not overbought",
      "Adequate margin above MSP floor reduces downside risk",
    ],
  },
  SELL: {
    summary: "Selling or booking profits is advisable at current levels.",
    action:
      "If holding stock, consider liquidating at current prices. Market signals suggest near-term downward pressure on jaggery prices.",
    risk:
      "Prices may recover if demand picks up. Consider partial selling rather than complete exit.",
    reason: [
      "Price momentum has turned negative below 7-day MA",
      "Off-season period — demand typically softens",
      "RSI approaching overbought territory",
      "Prices at a monthly high — mean reversion likely",
    ],
  },
  HOLD: {
    summary: "Mixed signals — hold current positions and monitor closely.",
    action:
      "Neither a strong buy nor sell signal is present. Maintain current stock levels and wait for a clearer directional move.",
    risk:
      "Set price alerts at your buy and sell thresholds. Reassess if RSI moves significantly from current levels.",
    reason: [
      "Technical indicators are conflicting — no strong trend",
      "Price is near fair value based on 30-day average",
      "Seasonal factors are balanced — neither strong upside nor downside",
      "Adequate liquidity in the market — no supply shock",
    ],
  },
};

export default function AdvisorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { snapshot, loading, refresh } = useMarket();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (loading && !snapshot) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!snapshot) return null;

  const advice = ADVICE[snapshot.recommendation];
  const recColor = {
    BUY: colors.buy,
    SELL: colors.sell,
    HOLD: colors.hold,
  }[snapshot.recommendation];

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100 },
      ]}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>AI Advisor</Text>

      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: recColor + "12",
            borderColor: recColor + "40",
          },
        ]}
      >
        <RecommendationBadge
          recommendation={snapshot.recommendation}
          confidence={snapshot.confidence}
          large
        />
        <Text style={[styles.heroSummary, { color: colors.foreground }]}>{advice.summary}</Text>
        <View style={styles.confBar}>
          <Text style={[styles.confLabel, { color: colors.mutedForeground }]}>
            Confidence Score
          </Text>
          <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${snapshot.confidence}%`,
                  backgroundColor: recColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.confValue, { color: recColor }]}>{snapshot.confidence}%</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <Feather name="zap" size={16} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recommended Action</Text>
        </View>
        <Text style={[styles.bodyText, { color: colors.foreground }]}>{advice.action}</Text>

        <View style={styles.pricePair}>
          <View style={[styles.priceBlock, { backgroundColor: colors.buy + "12", borderColor: colors.buy + "30" }]}>
            <Text style={[styles.priceBlockLabel, { color: colors.mutedForeground }]}>
              Target Price
            </Text>
            <Text style={[styles.priceBlockValue, { color: colors.buy }]}>
              ₹{snapshot.targetPrice.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={[styles.priceBlock, { backgroundColor: colors.sell + "12", borderColor: colors.sell + "30" }]}>
            <Text style={[styles.priceBlockLabel, { color: colors.mutedForeground }]}>
              Stop Loss
            </Text>
            <Text style={[styles.priceBlockValue, { color: colors.sell }]}>
              ₹{snapshot.stopLoss.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <Feather name="bar-chart-2" size={16} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Market Signals</Text>
        </View>
        {snapshot.signals.map((sig) => (
          <SignalRow key={sig.label} signal={sig} />
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <Feather name="check-circle" size={16} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Why This Call</Text>
        </View>
        {advice.reason.map((r, i) => (
          <View key={i} style={styles.reasonRow}>
            <View style={[styles.reasonDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.reasonText, { color: colors.foreground }]}>{r}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <Feather name="alert-triangle" size={16} color={colors.warning} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Risk Factors</Text>
        </View>
        <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>{advice.risk}</Text>
      </View>

      <View style={[styles.disclaimer, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Feather name="shield" size={12} color={colors.mutedForeground} />
        <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
          Predictions are based on technical analysis of price patterns. This is not financial
          advice. Always consult a market expert before trading.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  heroCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 14,
    alignItems: "flex-start",
  },
  heroSummary: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    lineHeight: 22,
  },
  confBar: {
    width: "100%",
    gap: 6,
  },
  confLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  confValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  bodyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  pricePair: {
    flexDirection: "row",
    gap: 10,
  },
  priceBlock: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  priceBlockLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  priceBlockValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  reasonRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  reasonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  reasonText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
  disclaimer: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  disclaimerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    flex: 1,
    lineHeight: 17,
  },
});
