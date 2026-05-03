import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useMarket } from "@/hooks/useMarket";
import { GRADE_SPECS, VARIETY_SPECS, MARKET_GRADE_PRICES, QUALITY_PARAMETERS, JaggeryGrade } from "@/constants/qualityData";

export default function QualityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { snapshot } = useMarket();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [selectedGrade, setSelectedGrade] = useState<JaggeryGrade>("B");
  const [selectedMandi, setSelectedMandi] = useState("Muzaffarnagar");

  const basePrice = snapshot?.currentPrice ?? 3650;
  const selectedSpec = GRADE_SPECS.find((g) => g.grade === selectedGrade)!;
  const adjustedPrice = Math.round(basePrice * (1 + selectedSpec.premiumVsBase / 100));
  const mandiData = MARKET_GRADE_PRICES.find((m) => m.mandi === selectedMandi)!;

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 110 }]} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}><Feather name="arrow-left" size={18} color={colors.foreground} /></TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Quality Grade Pricing</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Grade A/B/C price differentials & specs</Text>
        </View>
      </View>

      <View style={styles.gradeRow}>
        {GRADE_SPECS.map((g) => (
          <TouchableOpacity key={g.grade} onPress={() => setSelectedGrade(g.grade)} style={[styles.gradeBtn, { backgroundColor: selectedGrade === g.grade ? g.color + "20" : colors.muted, borderColor: selectedGrade === g.grade ? g.color : colors.border, borderWidth: selectedGrade === g.grade ? 2 : 1 }]}>
            <Text style={[styles.gradeBtnLabel, { color: selectedGrade === g.grade ? g.color : colors.mutedForeground }]}>Grade {g.grade}</Text>
            <Text style={[styles.gradeBtnSub, { color: selectedGrade === g.grade ? g.color : colors.mutedForeground }]}>{g.premiumVsBase > 0 ? `+${g.premiumVsBase}%` : g.premiumVsBase === 0 ? "Base" : `${g.premiumVsBase}%`}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.gradeDetailCard, { backgroundColor: colors.card, borderColor: selectedSpec.color + "40", borderWidth: 1.5 }]}>
        <View style={styles.gradeDetailHeader}>
          <View style={[styles.gradeIconWrap, { backgroundColor: selectedSpec.color + "18" }]}>
            <Text style={{ fontSize: 22 }}>{selectedGrade === "A" ? "🥇" : selectedGrade === "B" ? "🥈" : "🥉"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.gradeDetailTitle, { color: colors.foreground }]}>{selectedSpec.label}</Text>
            <Text style={[styles.gradeDetailSub, { color: colors.mutedForeground }]}>Shelf life: {selectedSpec.shelfLifeMonths} months</Text>
          </View>
          <View>
            <Text style={[styles.gradePriceLabel, { color: colors.mutedForeground }]}>Est. Price</Text>
            <Text style={[styles.gradePrice, { color: selectedSpec.color }]}>₹{adjustedPrice.toLocaleString("en-IN")}</Text>
          </View>
        </View>
        <View style={styles.gradeSpecRow}>
          {[
            { label: "Sucrose", value: selectedSpec.sucrosePct },
            { label: "Moisture", value: selectedSpec.moisturePct },
            { label: "Colour", value: selectedSpec.colorDesc },
          ].map((s) => (
            <View key={s.label} style={[styles.gradeSpecItem, { backgroundColor: selectedSpec.color + "10" }]}>
              <Text style={[styles.gradeSpecLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              <Text style={[styles.gradeSpecValue, { color: selectedSpec.color }]}>{s.value}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.bestForRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="target" size={12} color={colors.mutedForeground} />
          <Text style={[styles.bestForText, { color: colors.mutedForeground }]}>Best for: <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium" }}>{selectedSpec.bestFor}</Text></Text>
        </View>
      </View>

      <View style={[styles.mandiPriceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Mandi-wise Grade Prices</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
          {MARKET_GRADE_PRICES.map((m) => (
            <TouchableOpacity key={m.mandi} onPress={() => setSelectedMandi(m.mandi)} style={[styles.mandiChip, { backgroundColor: selectedMandi === m.mandi ? colors.primary + "20" : colors.muted, borderColor: selectedMandi === m.mandi ? colors.primary : colors.border }]}>
              <Text style={[styles.mandiChipText, { color: selectedMandi === m.mandi ? colors.primary : colors.mutedForeground }]}>{m.mandi}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.mandiPriceRow}>
          {(["A", "B", "C"] as JaggeryGrade[]).map((g) => {
            const spec = GRADE_SPECS.find((s) => s.grade === g)!;
            const price = g === "A" ? mandiData.gradeA : g === "B" ? mandiData.gradeB : mandiData.gradeC;
            return (
              <View key={g} style={[styles.mandiPriceItem, { backgroundColor: spec.color + "10", borderColor: spec.color + "25", borderWidth: 1 }]}>
                <Text style={[styles.mandiPriceGrade, { color: spec.color }]}>Grade {g}</Text>
                <Text style={[styles.mandiPriceValue, { color: spec.color }]}>₹{price.toLocaleString("en-IN")}</Text>
                <Text style={[styles.mandiPriceSub, { color: colors.mutedForeground }]}>per quintal</Text>
              </View>
            );
          })}
        </View>
        <View style={[styles.premiumNote, { backgroundColor: colors.muted }]}>
          <Text style={[styles.premiumNoteText, { color: colors.mutedForeground }]}>
            Grade A premium over Grade C at {selectedMandi}: ₹{(mandiData.gradeA - mandiData.gradeC).toLocaleString("en-IN")}/qtl ({(((mandiData.gradeA - mandiData.gradeC) / mandiData.gradeC) * 100).toFixed(0)}% premium)
          </Text>
        </View>
      </View>

      <View style={[styles.varietyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Variety Price Multipliers</Text>
        {VARIETY_SPECS.map((v) => {
          const price = Math.round(basePrice * v.basePriceMultiplier);
          const prem = Math.round((v.basePriceMultiplier - 1) * 100);
          const demandColor = v.exportDemand === "high" ? colors.buy : v.exportDemand === "medium" ? colors.hold : colors.sell;
          return (
            <View key={v.variety} style={[styles.varietyRow, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={[styles.varietyName, { color: colors.foreground }]}>{v.variety}</Text>
                  <View style={[styles.exportBadge, { backgroundColor: demandColor + "15" }]}>
                    <Text style={[styles.exportBadgeText, { color: demandColor }]}>{v.exportDemand} export</Text>
                  </View>
                </View>
                <Text style={[styles.varietyRegion, { color: colors.mutedForeground }]}>{v.region}</Text>
                <Text style={[styles.varietyDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{v.description}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 3 }}>
                <Text style={[styles.varietyPrice, { color: colors.foreground }]}>₹{price.toLocaleString("en-IN")}</Text>
                <Text style={[styles.varietyPrem, { color: prem > 0 ? colors.buy : prem < 0 ? colors.sell : colors.mutedForeground }]}>{prem >= 0 ? "+" : ""}{prem}%</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.paramCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>FSSAI Quality Parameters</Text>
        <View style={[styles.paramHeader, { borderBottomColor: colors.border }]}>
          {["Parameter", "Grade A", "Grade B", "Grade C"].map((h, i) => (
            <Text key={h} style={[styles.paramHeaderText, { color: colors.mutedForeground, flex: i === 0 ? 1.5 : 1 }]}>{h}</Text>
          ))}
        </View>
        {QUALITY_PARAMETERS.map((p) => (
          <View key={p.param} style={[styles.paramRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.paramName, { color: colors.foreground, flex: 1.5 }]}>{p.param}</Text>
            <Text style={[styles.paramVal, { color: GRADE_SPECS[0].color, flex: 1 }]}>{p.gradeA}</Text>
            <Text style={[styles.paramVal, { color: GRADE_SPECS[1].color, flex: 1 }]}>{p.gradeB}</Text>
            <Text style={[styles.paramVal, { color: GRADE_SPECS[2].color, flex: 1 }]}>{p.gradeC}</Text>
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
  gradeRow: { flexDirection: "row", gap: 10 },
  gradeBtn: { flex: 1, alignItems: "center", padding: 14, borderRadius: 14, gap: 4 },
  gradeBtnLabel: { fontFamily: "Inter_700Bold", fontSize: 15 },
  gradeBtnSub: { fontFamily: "Inter_500Medium", fontSize: 12 },
  gradeDetailCard: { borderRadius: 14, padding: 16, gap: 12 },
  gradeDetailHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  gradeIconWrap: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  gradeDetailTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  gradeDetailSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  gradePriceLabel: { fontFamily: "Inter_400Regular", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4, textAlign: "right" },
  gradePrice: { fontFamily: "Inter_700Bold", fontSize: 20 },
  gradeSpecRow: { flexDirection: "row", gap: 8 },
  gradeSpecItem: { flex: 1, padding: 10, borderRadius: 10, alignItems: "center", gap: 3 },
  gradeSpecLabel: { fontFamily: "Inter_400Regular", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 },
  gradeSpecValue: { fontFamily: "Inter_700Bold", fontSize: 12, textAlign: "center" },
  bestForRow: { flexDirection: "row", gap: 7, padding: 10, borderRadius: 8, borderWidth: 1, alignItems: "flex-start" },
  bestForText: { fontFamily: "Inter_400Regular", fontSize: 12, flex: 1, lineHeight: 17 },
  mandiPriceCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 12 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  mandiChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  mandiChipText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  mandiPriceRow: { flexDirection: "row", gap: 10 },
  mandiPriceItem: { flex: 1, padding: 12, borderRadius: 12, alignItems: "center", gap: 4 },
  mandiPriceGrade: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  mandiPriceValue: { fontFamily: "Inter_700Bold", fontSize: 18 },
  mandiPriceSub: { fontFamily: "Inter_400Regular", fontSize: 10 },
  premiumNote: { padding: 10, borderRadius: 8 },
  premiumNoteText: { fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center" },
  varietyCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 2 },
  varietyRow: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 10 },
  varietyName: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  varietyRegion: { fontFamily: "Inter_400Regular", fontSize: 11 },
  varietyDesc: { fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 16 },
  exportBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  exportBadgeText: { fontFamily: "Inter_500Medium", fontSize: 10 },
  varietyPrice: { fontFamily: "Inter_700Bold", fontSize: 15 },
  varietyPrem: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  paramCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 0 },
  paramHeader: { flexDirection: "row", paddingBottom: 8, borderBottomWidth: 1, marginBottom: 2 },
  paramHeaderText: { fontFamily: "Inter_500Medium", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 },
  paramRow: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, alignItems: "center" },
  paramName: { fontFamily: "Inter_500Medium", fontSize: 12 },
  paramVal: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
});
