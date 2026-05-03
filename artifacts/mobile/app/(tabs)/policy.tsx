import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useMarket } from "@/hooks/useMarket";
import { MSP_HISTORY, POLICY_ITEMS, STATE_SCHEMES } from "@/constants/policyData";

export default function PolicyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { snapshot } = useMarket();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [tab, setTab] = useState<"msp" | "policy" | "states">("msp");
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

  const currentMSP = MSP_HISTORY[MSP_HISTORY.length - 1];
  const currentPrice = snapshot?.currentPrice ?? 3650;
  const mspPremium = currentPrice - currentMSP.mspPerQtl;
  const mspPremiumPct = ((mspPremium) / currentMSP.mspPerQtl) * 100;

  const impactColor = (impact: string) =>
    impact === "positive" ? colors.buy : impact === "negative" ? colors.sell : colors.hold;

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 110 }]} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}><Feather name="arrow-left" size={18} color={colors.foreground} /></TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Policy & MSP Tracker</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>MSP history, GST rules & govt schemes</Text>
        </View>
      </View>

      <View style={[styles.mspSnapshot, { backgroundColor: currentPrice > currentMSP.mspPerQtl ? colors.buy + "10" : colors.sell + "10", borderColor: currentPrice > currentMSP.mspPerQtl ? colors.buy + "35" : colors.sell + "35" }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.mspSnapLabel, { color: colors.mutedForeground }]}>Current MSP (2025–26)</Text>
          <Text style={[styles.mspSnapValue, { color: colors.foreground }]}>₹{currentMSP.mspPerQtl.toLocaleString("en-IN")}/qtl</Text>
        </View>
        <View style={[styles.mspGapBox, { backgroundColor: currentPrice > currentMSP.mspPerQtl ? colors.buy + "20" : colors.sell + "20" }]}>
          <Text style={[styles.mspGapLabel, { color: colors.mutedForeground }]}>Market Premium</Text>
          <Text style={[styles.mspGapValue, { color: currentPrice > currentMSP.mspPerQtl ? colors.buy : colors.sell }]}>
            +₹{Math.round(mspPremium).toLocaleString("en-IN")} ({mspPremiumPct.toFixed(1)}%)
          </Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        {(["msp", "policy", "states"] as const).map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabBtn, { backgroundColor: tab === t ? colors.primary + "20" : colors.muted, borderColor: tab === t ? colors.primary : colors.border }]}>
            <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground }]}>{t === "msp" ? "MSP History" : t === "policy" ? "Policy Updates" : "State Schemes"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "msp" && (
        <>
          <View style={[styles.mspCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>MSP Trend (2019–2026)</Text>
            {MSP_HISTORY.map((record, i) => {
              const isCurrent = i === MSP_HISTORY.length - 1;
              const barPct = (record.mspPerQtl / Math.max(...MSP_HISTORY.map((r) => r.mspPerQtl))) * 100;
              return (
                <View key={record.year} style={[styles.mspRow, { borderBottomColor: colors.border, backgroundColor: isCurrent ? colors.primary + "08" : "transparent" }]}>
                  <Text style={[styles.mspYear, { color: isCurrent ? colors.primary : colors.foreground, fontFamily: isCurrent ? "Inter_700Bold" : "Inter_500Medium" }]}>{record.year}{isCurrent ? " ◀" : ""}</Text>
                  <View style={[styles.mspBar, { backgroundColor: colors.muted }]}>
                    <View style={[styles.mspBarFill, { width: `${barPct}%`, backgroundColor: isCurrent ? colors.primary : colors.primary + "60" }]} />
                  </View>
                  <Text style={[styles.mspPrice, { color: isCurrent ? colors.primary : colors.foreground }]}>₹{record.mspPerQtl.toLocaleString("en-IN")}</Text>
                  {record.change > 0 && <Text style={[styles.mspChange, { color: colors.buy }]}>+{record.change}</Text>}
                  {record.change === 0 && i > 0 && <Text style={[styles.mspChange, { color: colors.mutedForeground }]}>—</Text>}
                </View>
              );
            })}
          </View>
          <View style={[styles.mspInsightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>MSP vs Market Price Insight</Text>
            {[
              { icon: "shield", text: "MSP is a FLOOR price — the government will not let prices fall below it. Your downside is theoretically capped at the MSP level." },
              { icon: "trending-up", text: `Current market is ₹${Math.round(mspPremium).toLocaleString("en-IN")} (${mspPremiumPct.toFixed(0)}%) above MSP — historically healthy premium. Safe to hold.` },
              { icon: "alert-triangle", text: "If market price falls near MSP, NAFED or state agencies begin buying. This creates a natural support floor for prices." },
              { icon: "calendar", text: "MSP revisions happen annually before the kharif/rabi season. A higher MSP signals stronger govt support and typically lifts market prices." },
            ].map((tip, i) => (
              <View key={i} style={styles.insightRow}>
                <Feather name={tip.icon as "shield"} size={14} color={colors.primary} />
                <Text style={[styles.insightText, { color: colors.mutedForeground }]}>{tip.text}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {tab === "policy" && (
        <>
          <View style={[styles.gstBox, { backgroundColor: colors.buy + "10", borderColor: colors.buy + "30" }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Feather name="percent" size={16} color={colors.buy} />
              <Text style={[styles.gstTitle, { color: colors.foreground }]}>GST on Jaggery — Key Rule</Text>
            </View>
            <Text style={[styles.gstText, { color: colors.mutedForeground }]}>
              <Text style={{ fontFamily: "Inter_700Bold", color: colors.buy }}>0% GST</Text> on unpackaged/bulk jaggery (most trades).{"\n"}
              <Text style={{ fontFamily: "Inter_700Bold", color: colors.hold }}>5% GST</Text> on packaged jaggery in quantities over 25 kg (branded retail).
            </Text>
          </View>
          {POLICY_ITEMS.map((item) => {
            const isExpanded = expandedPolicy === item.id;
            const iColor = impactColor(item.impact);
            return (
              <TouchableOpacity key={item.id} onPress={() => setExpandedPolicy(isExpanded ? null : item.id)} activeOpacity={0.9} style={[styles.policyCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: iColor, borderLeftWidth: 3 }]}>
                <View style={styles.policyHeader}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[styles.policyTitle, { color: colors.foreground }]}>{item.title}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={[styles.catChip, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.catText, { color: colors.mutedForeground }]}>{item.category.toUpperCase()}</Text>
                      </View>
                      <Text style={[styles.policyDate, { color: colors.mutedForeground }]}>{item.date}</Text>
                    </View>
                  </View>
                  <View style={[styles.impactBadge, { backgroundColor: iColor + "18" }]}>
                    <Feather name={item.impact === "positive" ? "arrow-up-right" : item.impact === "negative" ? "arrow-down-right" : "minus"} size={12} color={iColor} />
                    <Text style={[styles.impactText, { color: iColor }]}>{item.impact}</Text>
                  </View>
                </View>
                {isExpanded && (
                  <View style={{ gap: 8 }}>
                    <View style={[styles.policyDivider, { backgroundColor: colors.border }]} />
                    <Text style={[styles.policyDesc, { color: colors.mutedForeground }]}>{item.description}</Text>
                    <View style={[styles.impactDetail, { backgroundColor: iColor + "10", borderColor: iColor + "25" }]}>
                      <Feather name="zap" size={12} color={iColor} />
                      <Text style={[styles.impactDetailText, { color: iColor }]}>{item.impactDetail}</Text>
                    </View>
                    <Text style={[styles.policyAuthority, { color: colors.mutedForeground }]}>Source: {item.authority}</Text>
                  </View>
                )}
                <Text style={[styles.tapHint, { color: colors.mutedForeground }]}>{isExpanded ? "Tap to collapse" : "Tap to read"}</Text>
              </TouchableOpacity>
            );
          })}
        </>
      )}

      {tab === "states" && STATE_SCHEMES.map((ss) => (
        <View key={ss.state} style={[styles.stateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.stateName, { color: colors.foreground }]}>{ss.state}</Text>
          {ss.schemes.map((s) => (
            <View key={s.name} style={[styles.schemeItem, { borderTopColor: colors.border }]}>
              <Text style={[styles.schemeName, { color: colors.foreground }]}>{s.name}</Text>
              <View style={[styles.benefitRow, { backgroundColor: colors.buy + "10", borderColor: colors.buy + "25" }]}>
                <Feather name="check" size={12} color={colors.buy} />
                <Text style={[styles.benefitText, { color: colors.buy }]}>{s.benefit}</Text>
              </View>
              <Text style={[styles.eligText, { color: colors.mutedForeground }]}>Eligibility: {s.eligibility}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 }, content: { paddingHorizontal: 16, gap: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, letterSpacing: -0.5 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  mspSnapshot: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 14, borderWidth: 1, gap: 12 },
  mspSnapLabel: { fontFamily: "Inter_400Regular", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  mspSnapValue: { fontFamily: "Inter_700Bold", fontSize: 24 },
  mspGapBox: { padding: 12, borderRadius: 10, alignItems: "center", gap: 3 },
  mspGapLabel: { fontFamily: "Inter_400Regular", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 },
  mspGapValue: { fontFamily: "Inter_700Bold", fontSize: 14 },
  tabRow: { flexDirection: "row", gap: 8 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 20, borderWidth: 1, alignItems: "center" },
  tabText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, marginBottom: 4 },
  mspCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 2 },
  mspRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  mspYear: { fontSize: 12, width: 80 },
  mspBar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  mspBarFill: { height: 6, borderRadius: 3 },
  mspPrice: { fontFamily: "Inter_600SemiBold", fontSize: 13, width: 52, textAlign: "right" },
  mspChange: { fontFamily: "Inter_500Medium", fontSize: 11, width: 32, textAlign: "right" },
  mspInsightCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 12 },
  insightRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  insightText: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18, flex: 1 },
  gstBox: { borderRadius: 12, padding: 14, borderWidth: 1, gap: 8 },
  gstTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  gstText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  policyCard: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 10 },
  policyHeader: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  policyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, lineHeight: 18 },
  catChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  catText: { fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.5 },
  policyDate: { fontFamily: "Inter_400Regular", fontSize: 11 },
  impactBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  impactText: { fontFamily: "Inter_600SemiBold", fontSize: 10, textTransform: "uppercase" },
  policyDivider: { height: StyleSheet.hairlineWidth },
  policyDesc: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  impactDetail: { flexDirection: "row", gap: 7, padding: 10, borderRadius: 8, borderWidth: 1, alignItems: "flex-start" },
  impactDetailText: { fontFamily: "Inter_500Medium", fontSize: 12, flex: 1, lineHeight: 17 },
  policyAuthority: { fontFamily: "Inter_400Regular", fontSize: 11, fontStyle: "italic" },
  tapHint: { fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "center" },
  stateCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 12 },
  stateName: { fontFamily: "Inter_700Bold", fontSize: 16 },
  schemeItem: { paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, gap: 8 },
  schemeName: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  benefitRow: { flexDirection: "row", gap: 7, padding: 9, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  benefitText: { fontFamily: "Inter_500Medium", fontSize: 12, flex: 1 },
  eligText: { fontFamily: "Inter_400Regular", fontSize: 12 },
});
