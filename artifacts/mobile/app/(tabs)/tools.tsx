import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useMarket } from "@/hooks/useMarket";

type Tool = {
  id: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
  route: string;
  badge?: string;
};

const TOOLS: Tool[] = [
  { id: "calculator", title: "Profit Calculator", description: "Simulate trade P&L before committing", icon: "percent", accent: "#16A34A", route: "/(tabs)/calculator", badge: "HIGH IMPACT" },
  { id: "journal", title: "Trade Journal", description: "Track buys, sells & portfolio P&L", icon: "book-open", accent: "#B45309", route: "/(tabs)/journal" },
  { id: "seasonal", title: "Seasonal Analysis", description: "Best buy/sell months — 5-year history", icon: "bar-chart-2", accent: "#7C3AED", route: "/(tabs)/seasonal", badge: "SMART" },
  { id: "spread", title: "Sugar–Jaggery Spread", description: "Price spread & substitute demand signal", icon: "activity", accent: "#0284C7", route: "/(tabs)/spread" },
  { id: "quality", title: "Quality Grade Pricing", description: "Grade A/B/C price differentials & specs", icon: "award", accent: "#D97706", route: "/(tabs)/quality" },
  { id: "transport", title: "Transport & Landed Cost", description: "True cost from source to destination", icon: "truck", accent: "#374151", route: "/(tabs)/transport" },
  { id: "export", title: "Export & Buyer Markets", description: "International demand, premiums & buyers", icon: "globe", accent: "#059669", route: "/(tabs)/export" },
  { id: "policy", title: "Policy & MSP Tracker", description: "MSP history, GST rules & govt schemes", icon: "file-text", accent: "#DC2626", route: "/(tabs)/policy" },
  { id: "advisor", title: "AI Market Advisor", description: "Ask questions, get expert market advice", icon: "cpu", accent: "#6D28D9", route: "/(tabs)/advisor", badge: "AI" },
  { id: "alerts", title: "Price Alerts", description: "Set price thresholds & notifications", icon: "bell", accent: "#EF4444", route: "/(tabs)/alerts" },
];

export default function ToolsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { snapshot } = useMarket();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleTool = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as Parameters<typeof router.push>[0]);
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 110 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Tools</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Advanced analytics to maximise your trading profit
      </Text>

      {snapshot && (
        <View style={[styles.snapshotBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.snapItem}>
            <Text style={[styles.snapLabel, { color: colors.mutedForeground }]}>Market Price</Text>
            <Text style={[styles.snapValue, { color: colors.foreground }]}>₹{snapshot.currentPrice.toLocaleString("en-IN")}/qtl</Text>
          </View>
          <View style={[styles.snapDivider, { backgroundColor: colors.border }]} />
          <View style={styles.snapItem}>
            <Text style={[styles.snapLabel, { color: colors.mutedForeground }]}>Signal</Text>
            <Text style={[styles.snapValue, { color: snapshot.recommendation === "BUY" ? colors.buy : snapshot.recommendation === "SELL" ? colors.sell : colors.hold }]}>
              {snapshot.recommendation} {snapshot.confidence}%
            </Text>
          </View>
          <View style={[styles.snapDivider, { backgroundColor: colors.border }]} />
          <View style={styles.snapItem}>
            <Text style={[styles.snapLabel, { color: colors.mutedForeground }]}>Harvest</Text>
            <Text style={[styles.snapValue, { color: snapshot.harvestScore > 0 ? colors.buy : colors.sell }]}>
              {snapshot.harvestScore > 0 ? "Bullish" : "Bearish"}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.grid}>
        {TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            onPress={() => handleTool(tool.route)}
            activeOpacity={0.85}
            style={[styles.toolCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.iconWrap, { backgroundColor: tool.accent + "18" }]}>
              <Feather name={tool.icon as "percent"} size={22} color={tool.accent} />
            </View>
            {tool.badge && (
              <View style={[styles.badge, { backgroundColor: tool.accent + "20" }]}>
                <Text style={[styles.badgeText, { color: tool.accent }]}>{tool.badge}</Text>
              </View>
            )}
            <Text style={[styles.toolTitle, { color: colors.foreground }]}>{tool.title}</Text>
            <Text style={[styles.toolDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
              {tool.description}
            </Text>
            <View style={styles.arrowRow}>
              <View style={[styles.arrowChip, { backgroundColor: tool.accent + "12" }]}>
                <Feather name="arrow-right" size={13} color={tool.accent} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.proTip, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" }]}>
        <Feather name="zap" size={14} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.proTipTitle, { color: colors.foreground }]}>Pro Tip</Text>
          <Text style={[styles.proTipText, { color: colors.mutedForeground }]}>
            Use Profit Calculator before every purchase. Combine with Seasonal Analysis to find the best entry and exit months. Log trades in the Journal to track your actual ROI.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16 },
  title: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: -10 },
  snapshotBar: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "center" },
  snapItem: { flex: 1, alignItems: "center", gap: 3 },
  snapLabel: { fontFamily: "Inter_400Regular", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  snapValue: { fontFamily: "Inter_700Bold", fontSize: 13 },
  snapDivider: { width: 1, height: 28, marginHorizontal: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  toolCard: {
    width: "47.5%", borderRadius: 16, borderWidth: 1,
    padding: 14, gap: 8, position: "relative",
  },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 0.8 },
  toolTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, lineHeight: 18 },
  toolDesc: { fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 16 },
  arrowRow: { flexDirection: "row", justifyContent: "flex-end" },
  arrowChip: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  proTip: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  proTipTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: 3 },
  proTipText: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
});
