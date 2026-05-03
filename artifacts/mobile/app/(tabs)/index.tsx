import React from "react";
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
import { RecommendationBadge } from "@/components/RecommendationBadge";
import { StatCard } from "@/components/StatCard";
import { PriceChart } from "@/components/PriceChart";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { snapshot, loading, refresh } = useMarket();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (loading && !snapshot) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Fetching market data...
        </Text>
      </View>
    );
  }

  if (!snapshot) return null;

  const isPositive = snapshot.change >= 0;
  const changeColor = isPositive ? colors.buy : colors.sell;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100 }]}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Jaggery Market
          </Text>
          <View style={styles.headerSub}>
            <View style={[styles.liveDot, { backgroundColor: colors.buy }]} />
            <Text style={[styles.headerSubText, { color: colors.mutedForeground }]}>
              Live · Updated {snapshot.lastUpdated}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={refresh}
          style={[styles.refreshBtn, { backgroundColor: colors.muted }]}
        >
          <Feather name="refresh-cw" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <View style={[styles.priceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.priceRow}>
          <View>
            <Text style={[styles.priceUnit, { color: colors.mutedForeground }]}>
              ₹ / Quintal (100kg)
            </Text>
            <Text style={[styles.priceValue, { color: colors.foreground }]}>
              ₹{snapshot.currentPrice.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.changeContainer}>
            <Feather
              name={isPositive ? "trending-up" : "trending-down"}
              size={18}
              color={changeColor}
            />
            <Text style={[styles.changeText, { color: changeColor }]}>
              {isPositive ? "+" : ""}
              {snapshot.change} ({isPositive ? "+" : ""}
              {snapshot.changePercent}%)
            </Text>
          </View>
        </View>

        <PriceChart data={snapshot.priceHistory} height={120} />

        <View style={styles.recRow}>
          <RecommendationBadge
            recommendation={snapshot.recommendation}
            confidence={snapshot.confidence}
            large
          />
          <View style={styles.targets}>
            <View style={styles.targetItem}>
              <Text style={[styles.targetLabel, { color: colors.mutedForeground }]}>Target</Text>
              <Text style={[styles.targetValue, { color: colors.buy }]}>
                ₹{snapshot.targetPrice.toLocaleString("en-IN")}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.targetItem}>
              <Text style={[styles.targetLabel, { color: colors.mutedForeground }]}>Stop Loss</Text>
              <Text style={[styles.targetValue, { color: colors.sell }]}>
                ₹{snapshot.stopLoss.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          label="52W High"
          value={`₹${snapshot.monthHigh.toLocaleString("en-IN")}`}
          sub="Monthly high"
          accent
        />
        <StatCard
          label="52W Low"
          value={`₹${snapshot.monthLow.toLocaleString("en-IN")}`}
          sub="Monthly low"
        />
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          label="7D High"
          value={`₹${snapshot.weekHigh.toLocaleString("en-IN")}`}
        />
        <StatCard
          label="7D Low"
          value={`₹${snapshot.weekLow.toLocaleString("en-IN")}`}
        />
        <StatCard
          label="Volume"
          value={snapshot.volume}
          sub="Traded today"
        />
      </View>

      <View style={[styles.infoBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <Feather name="info" size={14} color={colors.mutedForeground} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          Prices are for Muzaffarnagar mandi (UP), the largest jaggery market in India. Data updates every minute.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontFamily: "Inter_400Regular", fontSize: 14 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.5,
  },
  headerSub: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerSubText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  priceCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  priceUnit: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  priceValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 38,
    letterSpacing: -1,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  changeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  recRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  targets: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  targetItem: {
    alignItems: "flex-end",
    gap: 2,
  },
  targetLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  targetValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  divider: {
    width: 1,
    height: 28,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  infoBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  infoText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
});
