import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useMarket } from "@/hooks/useMarket";
import { PriceChart } from "@/components/PriceChart";
import type { Region } from "@/constants/marketData";

type Period = "7D" | "30D";

export default function MarketScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { snapshot, loading, refresh } = useMarket();
  const [period, setPeriod] = useState<Period>("30D");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (loading && !snapshot) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!snapshot) return null;

  const chartData =
    period === "7D" ? snapshot.priceHistory.slice(-7) : snapshot.priceHistory;

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
      <Text style={[styles.title, { color: colors.foreground }]}>Market Data</Text>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Price Chart</Text>
          <View style={[styles.segmented, { backgroundColor: colors.muted }]}>
            {(["7D", "30D"] as Period[]).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                style={[
                  styles.segment,
                  period === p && { backgroundColor: colors.card },
                  period === p && styles.segmentActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: period === p ? colors.foreground : colors.mutedForeground },
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <PriceChart data={chartData} height={140} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Regional Prices</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
          Price per quintal (₹/100kg)
        </Text>
        {snapshot.regions.map((region: Region, i: number) => (
          <RegionRow key={region.name} region={region} colors={colors} isLast={i === snapshot.regions.length - 1} />
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Range Summary</Text>
        <View style={styles.rangeGrid}>
          <RangeItem label="Today Open" value={`₹${snapshot.previousClose.toLocaleString("en-IN")}`} colors={colors} />
          <RangeItem label="Current" value={`₹${snapshot.currentPrice.toLocaleString("en-IN")}`} colors={colors} highlight />
          <RangeItem label="7D High" value={`₹${snapshot.weekHigh.toLocaleString("en-IN")}`} colors={colors} />
          <RangeItem label="7D Low" value={`₹${snapshot.weekLow.toLocaleString("en-IN")}`} colors={colors} />
          <RangeItem label="Month High" value={`₹${snapshot.monthHigh.toLocaleString("en-IN")}`} colors={colors} />
          <RangeItem label="Month Low" value={`₹${snapshot.monthLow.toLocaleString("en-IN")}`} colors={colors} />
          <RangeItem label="Volume" value={snapshot.volume} colors={colors} />
          <RangeItem label="MSP Floor" value="₹3,600" colors={colors} />
        </View>
      </View>
    </ScrollView>
  );
}

function RegionRow({
  region,
  colors,
  isLast,
}: {
  region: Region;
  colors: ReturnType<typeof useColors>;
  isLast: boolean;
}) {
  const isPositive = region.change >= 0;
  return (
    <View
      style={[
        styles.regionRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
      ]}
    >
      <View style={styles.regionLeft}>
        <Text style={[styles.regionName, { color: colors.foreground }]}>{region.name}</Text>
        <Text style={[styles.regionState, { color: colors.mutedForeground }]}>{region.state}</Text>
      </View>
      <View style={styles.regionRight}>
        <Text style={[styles.regionPrice, { color: colors.foreground }]}>
          ₹{region.price.toLocaleString("en-IN")}
        </Text>
        <View style={styles.regionChange}>
          <Feather
            name={isPositive ? "arrow-up-right" : "arrow-down-right"}
            size={11}
            color={isPositive ? colors.buy : colors.sell}
          />
          <Text style={{ color: isPositive ? colors.buy : colors.sell, fontSize: 12, fontFamily: "Inter_500Medium" }}>
            {isPositive ? "+" : ""}
            {region.changePercent.toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

function RangeItem({
  label,
  value,
  colors,
  highlight,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.rangeItem, { borderColor: colors.border, backgroundColor: highlight ? colors.primary + "10" : "transparent" }]}>
      <Text style={[styles.rangeLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.rangeValue, { color: highlight ? colors.primary : colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  section: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  sectionSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: -4 },
  segmented: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 2,
  },
  segment: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  segmentActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  regionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  regionLeft: { gap: 2 },
  regionName: { fontFamily: "Inter_500Medium", fontSize: 14 },
  regionState: { fontFamily: "Inter_400Regular", fontSize: 11 },
  regionRight: { alignItems: "flex-end", gap: 3 },
  regionPrice: { fontFamily: "Inter_700Bold", fontSize: 15 },
  regionChange: { flexDirection: "row", alignItems: "center", gap: 2 },
  rangeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  rangeItem: {
    width: "47%",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  rangeLabel: { fontFamily: "Inter_400Regular", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  rangeValue: { fontFamily: "Inter_700Bold", fontSize: 16 },
});
