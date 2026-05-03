import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useMarket } from "@/hooks/useMarket";
import { EXPORT_MARKETS, DOMESTIC_BUYERS, APEDA_SCHEMES, ExportMarket } from "@/constants/exportData";

export default function ExportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { snapshot } = useMarket();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [tab, setTab] = useState<"export" | "domestic" | "schemes">("export");
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);

  const basePrice = snapshot?.currentPrice ?? 3650;

  const demandColor = (level: ExportMarket["demandLevel"]) =>
    level === "very_high" ? colors.buy : level === "high" ? "#16A34A" : level === "moderate" ? colors.hold : colors.sell;
  const trendIcon = (t: ExportMarket["trend"]) =>
    t === "rising" ? "trending-up" : t === "falling" ? "trending-down" : "minus";
  const trendColor = (t: ExportMarket["trend"]) =>
    t === "rising" ? colors.buy : t === "falling" ? colors.sell : colors.hold;

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 110 }]} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}><Feather name="arrow-left" size={18} color={colors.foreground} /></TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Export & Buyer Markets</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>International demand, premiums & buyer leads</Text>
        </View>
      </View>

      <View style={[styles.exportOpBanner, { backgroundColor: colors.buy + "10", borderColor: colors.buy + "30" }]}>
        <Feather name="globe" size={14} color={colors.buy} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.bannerTitle, { color: colors.foreground }]}>Export Premium Opportunity</Text>
          <Text style={[styles.bannerSub, { color: colors.mutedForeground }]}>
            UK/USA markets pay <Text style={{ color: colors.buy, fontFamily: "Inter_700Bold" }}>₹{Math.round(basePrice * 0.48).toLocaleString("en-IN")}/qtl more</Text> than domestic for organic Grade A jaggery.
          </Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        {(["export", "domestic", "schemes"] as const).map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabBtn, { backgroundColor: tab === t ? colors.primary + "20" : colors.muted, borderColor: tab === t ? colors.primary : colors.border }]}>
            <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground }]}>{t === "export" ? "Export Markets" : t === "domestic" ? "Domestic Buyers" : "APEDA Schemes"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "export" && EXPORT_MARKETS.map((market) => {
        const isExpanded = expandedMarket === market.country;
        const fobPremium = Math.round(market.avgPriceFOB - basePrice);
        const dColor = demandColor(market.demandLevel);
        return (
          <TouchableOpacity key={market.country} onPress={() => setExpandedMarket(isExpanded ? null : market.country)} activeOpacity={0.9} style={[styles.marketCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.marketHeader}>
              <Text style={styles.marketFlag}>{market.flag}</Text>
              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={[styles.marketName, { color: colors.foreground }]}>{market.country}</Text>
                  <View style={[styles.demandBadge, { backgroundColor: dColor + "18" }]}>
                    <Text style={[styles.demandText, { color: dColor }]}>{market.demandLevel.replace("_", " ")} demand</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Text style={[styles.fobText, { color: colors.buy }]}>FOB: ₹{market.avgPriceFOB.toLocaleString("en-IN")}/qtl</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Feather name={trendIcon(market.trend)} size={12} color={trendColor(market.trend)} />
                    <Text style={[styles.trendText, { color: trendColor(market.trend) }]}>{market.trend}</Text>
                  </View>
                </View>
              </View>
              <View style={{ alignItems: "flex-end", gap: 3 }}>
                <Text style={[styles.premLabel, { color: colors.mutedForeground }]}>Premium</Text>
                <Text style={[styles.premValue, { color: colors.buy }]}>+₹{fobPremium.toLocaleString("en-IN")}</Text>
              </View>
            </View>

            {isExpanded && (
              <View style={{ gap: 10 }}>
                <View style={[styles.expandDivider, { backgroundColor: colors.border }]} />
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Monthly Volume</Text>
                    <Text style={[styles.detailValue, { color: colors.foreground }]}>{market.monthlyVolumeKT} KT</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Preferred Grade</Text>
                    <Text style={[styles.detailValue, { color: colors.foreground }]}>{market.preferredGrade}</Text>
                  </View>
                </View>
                <Text style={[styles.prefVariety, { color: colors.mutedForeground }]}>
                  <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>Best variety: </Text>{market.preferredVariety}
                </Text>
                <Text style={[styles.marketNotes, { color: colors.mutedForeground }]}>{market.notes}</Text>
                <View style={{ gap: 6 }}>
                  <Text style={[styles.reqTitle, { color: colors.foreground }]}>Key Requirements</Text>
                  {market.keyRequirements.map((req) => (
                    <View key={req} style={styles.reqRow}>
                      <Feather name="check-circle" size={12} color={colors.primary} />
                      <Text style={[styles.reqText, { color: colors.mutedForeground }]}>{req}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            <Text style={[styles.tapHint, { color: colors.mutedForeground }]}>{isExpanded ? "Tap to collapse" : "Tap for details"}</Text>
          </TouchableOpacity>
        );
      })}

      {tab === "domestic" && DOMESTIC_BUYERS.map((buyer) => (
        <View key={buyer.category} style={[styles.buyerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.buyerHeader}>
            <View style={[styles.buyerIconWrap, { backgroundColor: colors.primary + "15" }]}>
              <Feather name={buyer.icon as "gift"} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.buyerCategory, { color: colors.foreground }]}>{buyer.category}</Text>
              <Text style={[styles.buyerExamples, { color: colors.mutedForeground }]}>{buyer.examples.join(", ")}</Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 3 }}>
              <Text style={[styles.premLabel, { color: colors.mutedForeground }]}>Premium</Text>
              <Text style={[styles.premValue, { color: buyer.avgPremium > 0 ? colors.buy : colors.sell }]}>{buyer.avgPremium >= 0 ? "+" : ""}{buyer.avgPremium}%</Text>
            </View>
          </View>
          <View style={styles.buyerStats}>
            {[
              { label: "Volume", value: buyer.volumeRequirement },
              { label: "Payment", value: buyer.paymentTerms },
            ].map((s) => (
              <View key={s.label} style={[styles.buyerStat, { backgroundColor: colors.muted }]}>
                <Text style={[styles.buyerStatLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                <Text style={[styles.buyerStatValue, { color: colors.foreground }]}>{s.value}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.buyerNotes, { color: colors.mutedForeground }]}>{buyer.notes}</Text>
        </View>
      ))}

      {tab === "schemes" && (
        <>
          <View style={[styles.schemeIntro, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" }]}>
            <Feather name="award" size={14} color={colors.primary} />
            <Text style={[styles.schemeIntroText, { color: colors.foreground }]}>
              APEDA (Agricultural and Processed Food Products Export Development Authority) offers multiple schemes to reduce your export cost and improve market access.
            </Text>
          </View>
          {APEDA_SCHEMES.map((s) => (
            <View key={s.name} style={[styles.schemeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.schemeName, { color: colors.foreground }]}>{s.name}</Text>
              <View style={[styles.schemeBenefit, { backgroundColor: colors.buy + "10", borderColor: colors.buy + "25" }]}>
                <Feather name="check" size={12} color={colors.buy} />
                <Text style={[styles.schemeBenefitText, { color: colors.buy }]}>{s.benefit}</Text>
              </View>
              <Text style={[styles.schemeElig, { color: colors.mutedForeground }]}>Eligibility: {s.eligibility}</Text>
            </View>
          ))}
          <View style={[styles.apedaContact, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="info" size={14} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.apedaTitle, { color: colors.foreground }]}>How to Register with APEDA</Text>
              <Text style={[styles.apedaText, { color: colors.mutedForeground }]}>
                1. Visit apeda.gov.in or contact nearest APEDA regional office{"\n"}
                2. Submit IEC (Import Export Code) from DGFT{"\n"}
                3. Pay registration fee (~₹5,000 one-time){"\n"}
                4. Get RCMC (Registration cum Membership Certificate) — valid 5 years{"\n"}
                5. Apply for individual schemes once registered
              </Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 }, content: { paddingHorizontal: 16, gap: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, letterSpacing: -0.5 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  exportOpBanner: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  bannerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: 3 },
  bannerSub: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  tabRow: { flexDirection: "row", gap: 8 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 20, borderWidth: 1, alignItems: "center" },
  tabText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  marketCard: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 10 },
  marketHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  marketFlag: { fontSize: 28 },
  marketName: { fontFamily: "Inter_700Bold", fontSize: 15 },
  demandBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  demandText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  fobText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  trendText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  premLabel: { fontFamily: "Inter_400Regular", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 },
  premValue: { fontFamily: "Inter_700Bold", fontSize: 16 },
  expandDivider: { height: StyleSheet.hairlineWidth },
  detailRow: { flexDirection: "row", gap: 16 },
  detailItem: { gap: 3 },
  detailLabel: { fontFamily: "Inter_400Regular", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 },
  detailValue: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  prefVariety: { fontFamily: "Inter_400Regular", fontSize: 12 },
  marketNotes: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  reqTitle: { fontFamily: "Inter_600SemiBold", fontSize: 12, marginBottom: 2 },
  reqRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  reqText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  tapHint: { fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "center" },
  buyerCard: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 10 },
  buyerHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  buyerIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  buyerCategory: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  buyerExamples: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 3 },
  buyerStats: { flexDirection: "row", gap: 10 },
  buyerStat: { flex: 1, padding: 10, borderRadius: 10, gap: 3 },
  buyerStatLabel: { fontFamily: "Inter_400Regular", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 },
  buyerStatValue: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  buyerNotes: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  schemeIntro: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  schemeIntroText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, flex: 1 },
  schemeCard: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 10 },
  schemeName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  schemeBenefit: { flexDirection: "row", gap: 7, padding: 10, borderRadius: 8, borderWidth: 1, alignItems: "flex-start" },
  schemeBenefitText: { fontFamily: "Inter_500Medium", fontSize: 12, flex: 1 },
  schemeElig: { fontFamily: "Inter_400Regular", fontSize: 12 },
  apedaContact: { borderRadius: 14, padding: 14, borderWidth: 1, flexDirection: "row", gap: 10 },
  apedaTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: 6 },
  apedaText: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 20 },
});
