import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useMarket } from "@/hooks/useMarket";

const SUGAR_BASE = 4200;
const MONTHLY_SUGAR: Record<number, number> = { 0: 3950, 1: 3900, 2: 4000, 3: 4100, 4: 4200, 5: 4300, 6: 4350, 7: 4400, 8: 4450, 9: 4500, 10: 4480, 11: 4200 };
const MONTHLY_JAGGERY_BASE: Record<number, number> = { 0: 3800, 1: 3650, 2: 3750, 3: 3950, 4: 4150, 5: 4350, 6: 4300, 7: 4400, 8: 4600, 9: 4900, 10: 4750, 11: 4300 };

type SpreadMonth = { month: string; sugar: number; jaggery: number; spread: number; spreadPct: number; signal: "sell_jaggery" | "buy_jaggery" | "neutral" };

export default function SpreadScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { snapshot } = useMarket();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const currentMonth = new Date().getMonth();

  const currentSugarPrice = MONTHLY_SUGAR[currentMonth] ?? SUGAR_BASE;
  const currentJaggeryPrice = snapshot?.currentPrice ?? MONTHLY_JAGGERY_BASE[currentMonth];
  const currentSpread = currentJaggeryPrice - currentSugarPrice;
  const currentSpreadPct = ((currentSpread) / currentSugarPrice) * 100;
  const avgSpread = Object.keys(MONTHLY_SUGAR).reduce((acc, m) => acc + (MONTHLY_JAGGERY_BASE[Number(m)] - MONTHLY_SUGAR[Number(m)]), 0) / 12;

  const spreadInterpretation = currentSpread > avgSpread + 150
    ? { text: "Jaggery is priced at a HIGH premium over sugar. Health-conscious consumers prefer jaggery anyway, but industrial buyers may switch to sugar. Watch for demand erosion.", signal: "caution", color: colors.sell }
    : currentSpread < avgSpread - 150
      ? { text: "Jaggery is trading CLOSE to sugar prices — unusually attractive value. Expect consumer demand surge, especially from households and halwais. Bullish for jaggery.", signal: "buy", color: colors.buy }
      : { text: "Jaggery–sugar spread is in the NORMAL range. Demand stable. No substitute-driven demand disruption expected.", signal: "neutral", color: colors.hold };

  const months = useMemo<SpreadMonth[]>(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const s = MONTHLY_SUGAR[i];
      const j = MONTHLY_JAGGERY_BASE[i];
      const spread = j - s;
      const spreadPct = (spread / s) * 100;
      const signal = spread > avgSpread + 150 ? "sell_jaggery" : spread < avgSpread - 150 ? "buy_jaggery" : "neutral";
      return { month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i], sugar: s, jaggery: j, spread, spreadPct, signal };
    });
  }, [avgSpread]);

  const maxSpread = Math.max(...months.map((m) => Math.abs(m.spread)));

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 110 }]} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}><Feather name="arrow-left" size={18} color={colors.foreground} /></TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Sugar–Jaggery Spread</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Price differential & substitute demand</Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <View style={[styles.priceBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.priceBoxLabel, { color: colors.mutedForeground }]}>Sugar (Retail)</Text>
          <Text style={[styles.priceBoxValue, { color: colors.foreground }]}>₹{currentSugarPrice.toLocaleString("en-IN")}</Text>
          <Text style={[styles.priceBoxSub, { color: colors.mutedForeground }]}>per quintal est.</Text>
        </View>
        <View style={[styles.vsBox, { backgroundColor: colors.muted }]}><Text style={[styles.vsText, { color: colors.mutedForeground }]}>VS</Text></View>
        <View style={[styles.priceBox, { backgroundColor: colors.card, borderColor: colors.primary + "40" }]}>
          <Text style={[styles.priceBoxLabel, { color: colors.mutedForeground }]}>Jaggery (Market)</Text>
          <Text style={[styles.priceBoxValue, { color: colors.primary }]}>₹{currentJaggeryPrice.toLocaleString("en-IN")}</Text>
          <Text style={[styles.priceBoxSub, { color: colors.mutedForeground }]}>per quintal</Text>
        </View>
      </View>

      <View style={[styles.spreadCard, { backgroundColor: spreadInterpretation.color + "10", borderColor: spreadInterpretation.color + "40" }]}>
        <View style={styles.spreadHeader}>
          <View>
            <Text style={[styles.spreadLabel, { color: colors.mutedForeground }]}>Current Spread</Text>
            <Text style={[styles.spreadValue, { color: spreadInterpretation.color }]}>
              {currentSpread >= 0 ? "+" : ""}₹{Math.round(currentSpread).toLocaleString("en-IN")} ({currentSpreadPct.toFixed(1)}%)
            </Text>
          </View>
          <View style={[styles.spreadSigBadge, { backgroundColor: spreadInterpretation.color + "20" }]}>
            <Text style={[styles.spreadSigText, { color: spreadInterpretation.color }]}>
              {spreadInterpretation.signal === "buy" ? "BUY SIGNAL" : spreadInterpretation.signal === "caution" ? "CAUTION" : "NEUTRAL"}
            </Text>
          </View>
        </View>
        <Text style={[styles.spreadInterpText, { color: colors.foreground }]}>{spreadInterpretation.text}</Text>
        <View style={[styles.avgRow, { borderTopColor: colors.border }]}>
          <Feather name="bar-chart" size={12} color={colors.mutedForeground} />
          <Text style={[styles.avgText, { color: colors.mutedForeground }]}>5-year average spread: ₹{Math.round(avgSpread).toLocaleString("en-IN")}</Text>
        </View>
      </View>

      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Monthly Spread Chart</Text>
        <Text style={[styles.chartSub, { color: colors.mutedForeground }]}>Jaggery price minus sugar price (₹/qtl)</Text>
        <View style={styles.barChart}>
          {months.map((m, i) => {
            const isCurrent = i === currentMonth;
            const barColor = m.signal === "buy_jaggery" ? colors.buy : m.signal === "sell_jaggery" ? colors.sell : colors.hold;
            const barPct = (Math.abs(m.spread) / maxSpread) * 100;
            return (
              <View key={i} style={styles.barCol}>
                <Text style={[styles.barVal, { color: isCurrent ? colors.primary : colors.mutedForeground }]}>{Math.round(m.spread / 100) * 100}</Text>
                <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
                  <View style={[styles.barFill, { height: `${Math.max(barPct, 5)}%`, backgroundColor: barColor, opacity: isCurrent ? 1 : 0.65 }]} />
                </View>
                <Text style={[styles.barLabel, { color: isCurrent ? colors.primary : colors.mutedForeground, fontFamily: isCurrent ? "Inter_700Bold" : "Inter_400Regular" }]}>{m.month}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.tableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Monthly Breakdown</Text>
        <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
          {["Month", "Sugar", "Jaggery", "Spread", "Signal"].map((h) => (
            <Text key={h} style={[styles.tableHeaderText, { color: colors.mutedForeground, flex: h === "Month" ? 1.2 : 1 }]}>{h}</Text>
          ))}
        </View>
        {months.map((m, i) => {
          const isCurrent = i === currentMonth;
          const sigColor = m.signal === "buy_jaggery" ? colors.buy : m.signal === "sell_jaggery" ? colors.sell : colors.hold;
          return (
            <View key={i} style={[styles.tableRow, { borderBottomColor: colors.border, backgroundColor: isCurrent ? colors.primary + "08" : "transparent" }]}>
              <Text style={[styles.tableCell, { color: isCurrent ? colors.primary : colors.foreground, flex: 1.2, fontFamily: isCurrent ? "Inter_700Bold" : "Inter_400Regular" }]}>{m.month}{isCurrent ? " ◀" : ""}</Text>
              <Text style={[styles.tableCell, { color: colors.mutedForeground, flex: 1 }]}>{(m.sugar / 100).toFixed(0)}k</Text>
              <Text style={[styles.tableCell, { color: colors.primary, flex: 1 }]}>{(m.jaggery / 100).toFixed(0)}k</Text>
              <Text style={[styles.tableCell, { color: m.spread >= 0 ? colors.buy : colors.sell, flex: 1 }]}>{m.spread >= 0 ? "+" : ""}{Math.round(m.spread)}</Text>
              <View style={[styles.tableSigChip, { backgroundColor: sigColor + "18", flex: 1 }]}>
                <Text style={[styles.tableSigText, { color: sigColor }]}>{m.signal === "buy_jaggery" ? "BUY" : m.signal === "sell_jaggery" ? "CAUTION" : "HOLD"}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.educationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>How Spread Affects Jaggery Demand</Text>
        {[
          { icon: "trending-up", text: "When jaggery prices fall close to sugar → Demand surges from households, halwais, and food processors who find jaggery a better-value natural sweetener." },
          { icon: "trending-down", text: "When jaggery trades at high premium → Industrial buyers (beverage, pharma) may switch back to refined sugar, reducing bulk demand. Retail demand stays stable." },
          { icon: "zap", text: "Spread below ₹300/qtl → Strong buy signal. Spread above ₹600/qtl → Watch demand erosion from price-sensitive buyers." },
        ].map((e, i) => (
          <View key={i} style={styles.educRow}>
            <Feather name={e.icon as "zap"} size={14} color={colors.primary} />
            <Text style={[styles.educText, { color: colors.mutedForeground }]}>{e.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 }, content: { paddingHorizontal: 16, gap: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, letterSpacing: -0.5 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  priceBox: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1, gap: 4, alignItems: "center" },
  priceBoxLabel: { fontFamily: "Inter_400Regular", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  priceBoxValue: { fontFamily: "Inter_700Bold", fontSize: 20 },
  priceBoxSub: { fontFamily: "Inter_400Regular", fontSize: 10 },
  vsBox: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  vsText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  spreadCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 10 },
  spreadHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  spreadLabel: { fontFamily: "Inter_400Regular", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  spreadValue: { fontFamily: "Inter_700Bold", fontSize: 26 },
  spreadSigBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  spreadSigText: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.5 },
  spreadInterpText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  avgRow: { flexDirection: "row", gap: 6, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, alignItems: "center" },
  avgText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  chartCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 10 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  chartSub: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: -6 },
  barChart: { flexDirection: "row", alignItems: "flex-end", height: 100, gap: 3 },
  barCol: { flex: 1, alignItems: "center", gap: 3, height: "100%" },
  barVal: { fontSize: 7, fontFamily: "Inter_400Regular" },
  barTrack: { flex: 1, width: "100%", borderRadius: 3, overflow: "hidden", justifyContent: "flex-end" },
  barFill: { width: "100%", borderRadius: 3, minHeight: 5 },
  barLabel: { fontSize: 9 },
  tableCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 0 },
  tableHeader: { flexDirection: "row", paddingBottom: 8, borderBottomWidth: 1, marginBottom: 2 },
  tableHeaderText: { fontFamily: "Inter_500Medium", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 },
  tableRow: { flexDirection: "row", paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth, alignItems: "center" },
  tableCell: { fontFamily: "Inter_400Regular", fontSize: 12 },
  tableSigChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, alignItems: "center" },
  tableSigText: { fontFamily: "Inter_700Bold", fontSize: 9 },
  educationCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 12 },
  educRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  educText: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18, flex: 1 },
});
