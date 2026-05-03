import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { SEASONAL_MONTHLY, HISTORICAL_YEARLY, getSeasonalSignalColor, getSeasonalSignalLabel, computeAvgByMonth, MonthlyData } from "@/constants/seasonalData";

export default function SeasonalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [view, setView] = useState<"calendar" | "chart">("calendar");

  const avgByMonth = useMemo(() => computeAvgByMonth(), []);
  const maxAvg = Math.max(...avgByMonth);
  const minAvg = Math.min(...avgByMonth);

  const selected = SEASONAL_MONTHLY[selectedMonth];
  const selectedSignalColor = getSeasonalSignalColor(selected.signal);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 110 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Seasonal Analysis</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>5-year historical price patterns</Text>
        </View>
      </View>

      <View style={[styles.quickInsight, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" }]}>
        <Feather name="zap" size={14} color={colors.primary} />
        <Text style={[styles.quickInsightText, { color: colors.foreground }]}>
          <Text style={{ fontFamily: "Inter_700Bold" }}>Best Buy:</Text> Feb (avg ₹{avgByMonth[1].toLocaleString("en-IN")})  •  <Text style={{ fontFamily: "Inter_700Bold" }}>Best Sell:</Text> Oct–Nov (avg ₹{avgByMonth[9].toLocaleString("en-IN")}–₹{avgByMonth[10].toLocaleString("en-IN")})
        </Text>
      </View>

      <View style={styles.viewToggle}>
        {(["calendar", "chart"] as const).map((v) => (
          <TouchableOpacity
            key={v}
            onPress={() => setView(v)}
            style={[styles.toggleBtn, { backgroundColor: view === v ? colors.primary : colors.muted, borderColor: view === v ? colors.primary : colors.border }]}
          >
            <Feather name={v === "calendar" ? "calendar" : "bar-chart-2"} size={14} color={view === v ? colors.primaryForeground : colors.mutedForeground} />
            <Text style={[styles.toggleText, { color: view === v ? colors.primaryForeground : colors.mutedForeground }]}>
              {v === "calendar" ? "Month Detail" : "Price Chart"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {view === "chart" && (
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>5-Year Average Price by Month</Text>
          <View style={styles.barChart}>
            {avgByMonth.map((price, i) => {
              const heightPct = ((price - minAvg) / (maxAvg - minAvg)) * 100;
              const sig = SEASONAL_MONTHLY[i].signal;
              const barColor = getSeasonalSignalColor(sig);
              const isCurrentMonth = i === currentMonth;
              return (
                <TouchableOpacity key={i} onPress={() => { setSelectedMonth(i); setView("calendar"); }} style={styles.barWrap}>
                  <Text style={[styles.barPrice, { color: isCurrentMonth ? colors.primary : colors.mutedForeground, fontSize: isCurrentMonth ? 9 : 8 }]}>
                    {Math.round(price / 100) * 100}
                  </Text>
                  <View style={[styles.barOuter, { backgroundColor: colors.muted }]}>
                    <View style={[styles.barInner, { height: `${Math.max(heightPct, 8)}%`, backgroundColor: barColor, opacity: isCurrentMonth ? 1 : 0.7 }]} />
                  </View>
                  <Text style={[styles.barMonth, { color: isCurrentMonth ? colors.primary : colors.mutedForeground, fontFamily: isCurrentMonth ? "Inter_700Bold" : "Inter_400Regular" }]}>
                    {SEASONAL_MONTHLY[i].shortMonth}
                  </Text>
                  {isCurrentMonth && <View style={[styles.currentDot, { backgroundColor: colors.primary }]} />}
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.legendRow}>
            {[
              { sig: "best_buy", label: "Best Buy" }, { sig: "buy", label: "Buy" }, { sig: "hold", label: "Hold" },
              { sig: "sell", label: "Sell" }, { sig: "best_sell", label: "Best Sell" },
            ].map((l) => (
              <View key={l.sig} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getSeasonalSignalColor(l.sig as MonthlyData["signal"]) }]} />
                <Text style={[styles.legendText, { color: colors.mutedForeground }]}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Select Month</Text>
      <View style={styles.monthGrid}>
        {SEASONAL_MONTHLY.map((m, i) => {
          const sigColor = getSeasonalSignalColor(m.signal);
          const isSelected = i === selectedMonth;
          const isCurrent = i === currentMonth;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedMonth(i)}
              style={[styles.monthChip, {
                backgroundColor: isSelected ? sigColor : sigColor + "15",
                borderColor: isSelected ? sigColor : sigColor + "40",
                borderWidth: isCurrent ? 2 : 1,
              }]}
            >
              <Text style={[styles.monthChipText, { color: isSelected ? "#fff" : sigColor, fontFamily: isCurrent ? "Inter_700Bold" : "Inter_500Medium" }]}>
                {m.shortMonth}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: selectedSignalColor + "40" }]}>
        <View style={styles.detailHeader}>
          <View>
            <Text style={[styles.detailMonth, { color: colors.foreground }]}>{selected.month}</Text>
            <View style={[styles.sigBadge, { backgroundColor: selectedSignalColor + "20" }]}>
              <Text style={[styles.sigText, { color: selectedSignalColor }]}>{getSeasonalSignalLabel(selected.signal)}</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <Text style={[styles.detailPriceLabel, { color: colors.mutedForeground }]}>Avg Price</Text>
            <Text style={[styles.detailPrice, { color: selectedSignalColor }]}>₹{selected.avgPrice.toLocaleString("en-IN")}</Text>
          </View>
        </View>

        <View style={styles.priceRangeRow}>
          <View style={styles.rangeItem}>
            <Text style={[styles.rangeLabel, { color: colors.mutedForeground }]}>Typical Low</Text>
            <Text style={[styles.rangeValue, { color: colors.buy }]}>₹{selected.lowPrice.toLocaleString("en-IN")}</Text>
          </View>
          <View style={[styles.rangeSep, { backgroundColor: colors.border }]} />
          <View style={styles.rangeItem}>
            <Text style={[styles.rangeLabel, { color: colors.mutedForeground }]}>Typical High</Text>
            <Text style={[styles.rangeValue, { color: colors.sell }]}>₹{selected.highPrice.toLocaleString("en-IN")}</Text>
          </View>
          <View style={[styles.rangeSep, { backgroundColor: colors.border }]} />
          <View style={styles.rangeItem}>
            <Text style={[styles.rangeLabel, { color: colors.mutedForeground }]}>Supply</Text>
            <Text style={[styles.rangeValue, { color: colors.foreground }]}>{selected.supplyLevel.replace("_", " ")}</Text>
          </View>
        </View>

        <Text style={[styles.detailNotes, { color: colors.mutedForeground }]}>{selected.notes}</Text>

        {currentMonth === selectedMonth && (
          <View style={[styles.currentMonthBanner, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "25" }]}>
            <Feather name="navigation" size={12} color={colors.primary} />
            <Text style={[styles.currentMonthText, { color: colors.primary }]}>You are here — take action based on the {getSeasonalSignalLabel(selected.signal)} signal above</Text>
          </View>
        )}
      </View>

      <View style={[styles.yearCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Year-by-Year Comparison</Text>
        <Text style={[styles.yearSub, { color: colors.mutedForeground }]}>{selected.month} price across years</Text>
        {HISTORICAL_YEARLY.map((yr) => {
          const price = yr.monthlyAvg[selectedMonth];
          const maxYearPrice = Math.max(...HISTORICAL_YEARLY.map((y) => y.monthlyAvg[selectedMonth]));
          const barPct = (price / maxYearPrice) * 100;
          return (
            <View key={yr.year} style={styles.yearRow}>
              <Text style={[styles.yearLabel, { color: colors.mutedForeground }]}>{yr.year}</Text>
              <View style={[styles.yearBar, { backgroundColor: colors.muted }]}>
                <View style={[styles.yearBarFill, { width: `${barPct}%`, backgroundColor: selectedSignalColor }]} />
              </View>
              <Text style={[styles.yearPrice, { color: colors.foreground }]}>₹{price.toLocaleString("en-IN")}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, letterSpacing: -0.5 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  quickInsight: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: "flex-start" },
  quickInsightText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1, lineHeight: 19 },
  viewToggle: { flexDirection: "row", gap: 10 },
  toggleBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  toggleText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  chartCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 12 },
  barChart: { flexDirection: "row", alignItems: "flex-end", height: 130, gap: 3 },
  barWrap: { flex: 1, alignItems: "center", gap: 4, height: "100%" },
  barPrice: { fontFamily: "Inter_400Regular", fontSize: 8, textAlign: "center" },
  barOuter: { flex: 1, width: "100%", borderRadius: 3, overflow: "hidden", justifyContent: "flex-end" },
  barInner: { width: "100%", borderRadius: 3, minHeight: 8 },
  barMonth: { fontSize: 9, textAlign: "center" },
  currentDot: { width: 5, height: 5, borderRadius: 2.5 },
  legendRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: "Inter_400Regular", fontSize: 11 },
  monthGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  monthChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  monthChipText: { fontSize: 12 },
  detailCard: { borderRadius: 14, padding: 16, borderWidth: 1.5, gap: 12 },
  detailHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  detailMonth: { fontFamily: "Inter_700Bold", fontSize: 20, marginBottom: 6 },
  sigBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  sigText: { fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 0.5 },
  detailPriceLabel: { fontFamily: "Inter_400Regular", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  detailPrice: { fontFamily: "Inter_700Bold", fontSize: 24 },
  priceRangeRow: { flexDirection: "row", alignItems: "center" },
  rangeItem: { flex: 1, alignItems: "center", gap: 3 },
  rangeLabel: { fontFamily: "Inter_400Regular", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4, textAlign: "center" },
  rangeValue: { fontFamily: "Inter_700Bold", fontSize: 13 },
  rangeSep: { width: 1, height: 28, marginHorizontal: 4 },
  detailNotes: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  currentMonthBanner: { flexDirection: "row", gap: 7, padding: 10, borderRadius: 8, borderWidth: 1, alignItems: "flex-start" },
  currentMonthText: { fontFamily: "Inter_500Medium", fontSize: 12, flex: 1, lineHeight: 18 },
  yearCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 10 },
  yearSub: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: -8 },
  yearRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  yearLabel: { fontFamily: "Inter_500Medium", fontSize: 12, width: 56 },
  yearBar: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  yearBarFill: { height: 8, borderRadius: 4 },
  yearPrice: { fontFamily: "Inter_600SemiBold", fontSize: 12, width: 60, textAlign: "right" },
});
