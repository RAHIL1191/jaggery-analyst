import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useMarket } from "@/hooks/useMarket";

type Field = {
  key: string; label: string; placeholder: string; prefix?: string; suffix?: string; hint?: string;
};

const FIELDS: Field[] = [
  { key: "buyPrice", label: "Buy Price", placeholder: "e.g. 3650", prefix: "₹", suffix: "/qtl", hint: "Current market price or your purchase price" },
  { key: "quantity", label: "Quantity", placeholder: "e.g. 100", suffix: "quintals", hint: "1 quintal = 100 kg" },
  { key: "storageMonths", label: "Storage Period", placeholder: "e.g. 3", suffix: "months", hint: "How long you plan to hold" },
  { key: "storageCost", label: "Storage Rate", placeholder: "e.g. 40", prefix: "₹", suffix: "/qtl/mo", hint: "Cold storage cost per quintal per month" },
  { key: "transportCost", label: "Transport Cost", placeholder: "e.g. 80", prefix: "₹", suffix: "/qtl", hint: "Freight, loading, toll (round trip)" },
  { key: "targetSellPrice", label: "Target Sell Price", placeholder: "e.g. 4500", prefix: "₹", suffix: "/qtl", hint: "Expected sell price or festival peak" },
];

const SELL_SCENARIOS = [0.03, 0.05, 0.08, 0.12, 0.15, 0.20];

export default function CalculatorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { snapshot } = useMarket();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [values, setValues] = useState<Record<string, string>>({
    buyPrice: snapshot ? String(snapshot.currentPrice) : "",
    quantity: "100",
    storageMonths: "3",
    storageCost: "40",
    transportCost: "80",
    targetSellPrice: snapshot ? String(Math.round(snapshot.currentPrice * 1.12)) : "",
  });

  const num = (k: string) => parseFloat(values[k] || "0") || 0;

  const result = useMemo(() => {
    const buyPrice = num("buyPrice");
    const qty = num("quantity");
    const months = num("storageMonths");
    const storageCostPerMonth = num("storageCost");
    const transport = num("transportCost");
    const sellPrice = num("targetSellPrice");

    if (!buyPrice || !qty) return null;

    const invested = buyPrice * qty;
    const storageCostTotal = storageCostPerMonth * months * qty;
    const transportTotal = transport * qty;
    const totalCost = invested + storageCostTotal + transportTotal;
    const breakEven = totalCost / qty;
    const grossRevenue = sellPrice * qty;
    const netProfit = grossRevenue - totalCost;
    const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
    const isProfit = netProfit >= 0;

    const scenarios = SELL_SCENARIOS.map((pct) => {
      const sp = Math.round(buyPrice * (1 + pct));
      const rev = sp * qty;
      const profit = rev - totalCost;
      return { pct: Math.round(pct * 100), sellPrice: sp, profit: Math.round(profit), roi: parseFloat(((profit / totalCost) * 100).toFixed(1)) };
    });

    return { invested, storageCostTotal, transportTotal, totalCost, breakEven, grossRevenue, netProfit, roi, isProfit, scenarios };
  }, [values]);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 110 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Profit Calculator</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Simulate before you commit</Text>
        </View>
      </View>

      {snapshot && (
        <TouchableOpacity
          onPress={() => setValues((v) => ({ ...v, buyPrice: String(snapshot.currentPrice), targetSellPrice: String(Math.round(snapshot.targetPrice)) }))}
          style={[styles.autofill, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}
        >
          <Feather name="zap" size={13} color={colors.primary} />
          <Text style={[styles.autofillText, { color: colors.primary }]}>
            Auto-fill today's market price (₹{snapshot.currentPrice.toLocaleString("en-IN")}/qtl)
          </Text>
        </TouchableOpacity>
      )}

      <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trade Parameters</Text>
        {FIELDS.map((field) => (
          <View key={field.key} style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{field.label}</Text>
            {field.hint && <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>{field.hint}</Text>}
            <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              {field.prefix && <Text style={[styles.inputAffix, { color: colors.mutedForeground }]}>{field.prefix}</Text>}
              <TextInput
                value={values[field.key]}
                onChangeText={(t) => setValues((v) => ({ ...v, [field.key]: t }))}
                placeholder={field.placeholder}
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                style={[styles.input, { color: colors.foreground }]}
              />
              {field.suffix && <Text style={[styles.inputAffix, { color: colors.mutedForeground }]}>{field.suffix}</Text>}
            </View>
          </View>
        ))}
      </View>

      {result && (
        <>
          <View style={[styles.resultCard, {
            backgroundColor: result.isProfit ? colors.buy + "10" : colors.sell + "10",
            borderColor: result.isProfit ? colors.buy + "40" : colors.sell + "40",
          }]}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={[styles.resultLabel, { color: colors.mutedForeground }]}>Net Profit / Loss</Text>
                <Text style={[styles.resultValue, { color: result.isProfit ? colors.buy : colors.sell }]}>
                  {result.isProfit ? "+" : ""}₹{Math.round(result.netProfit).toLocaleString("en-IN")}
                </Text>
              </View>
              <View style={[styles.roiBadge, { backgroundColor: result.isProfit ? colors.buy + "20" : colors.sell + "20" }]}>
                <Text style={[styles.roiText, { color: result.isProfit ? colors.buy : colors.sell }]}>
                  {result.roi >= 0 ? "+" : ""}{result.roi.toFixed(1)}% ROI
                </Text>
              </View>
            </View>
            <View style={[styles.breakEvenRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="target" size={13} color={colors.mutedForeground} />
              <Text style={[styles.breakEvenText, { color: colors.foreground }]}>
                Break-even price: <Text style={{ fontFamily: "Inter_700Bold", color: colors.hold }}>₹{Math.round(result.breakEven).toLocaleString("en-IN")}/qtl</Text>
              </Text>
            </View>
          </View>

          <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Cost Breakdown</Text>
            {[
              { label: "Purchase Cost", value: result.invested, color: colors.sell },
              { label: "Storage Cost", value: result.storageCostTotal, color: colors.hold },
              { label: "Transport Cost", value: result.transportTotal, color: colors.hold },
              { label: "Total Cost", value: result.totalCost, color: colors.foreground, bold: true },
              { label: "Gross Revenue", value: result.grossRevenue, color: colors.buy },
              { label: "Net Profit", value: result.netProfit, color: result.netProfit >= 0 ? colors.buy : colors.sell, bold: true },
            ].map((row) => (
              <View key={row.label} style={[styles.breakdownRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.breakdownLabel, { color: colors.mutedForeground, fontFamily: row.bold ? "Inter_600SemiBold" : "Inter_400Regular" }]}>{row.label}</Text>
                <Text style={[styles.breakdownValue, { color: row.color, fontFamily: row.bold ? "Inter_700Bold" : "Inter_600SemiBold" }]}>
                  {row.value >= 0 ? "" : "-"}₹{Math.abs(Math.round(row.value)).toLocaleString("en-IN")}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.scenarioCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Profit at Different Sell Prices</Text>
            <Text style={[styles.scenarioSub, { color: colors.mutedForeground }]}>Based on {num("quantity")} quintals</Text>
            {result.scenarios.map((s) => {
              const isGood = s.profit > 0;
              return (
                <View key={s.pct} style={[styles.scenarioRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.scenarioPct, { color: colors.mutedForeground }]}>+{s.pct}%</Text>
                  <Text style={[styles.scPrice, { color: colors.foreground }]}>₹{s.sellPrice.toLocaleString("en-IN")}/qtl</Text>
                  <View style={[styles.scenarioPill, { backgroundColor: isGood ? colors.buy + "15" : colors.sell + "15" }]}>
                    <Text style={[styles.scenarioProfit, { color: isGood ? colors.buy : colors.sell }]}>
                      {isGood ? "+" : ""}₹{s.profit.toLocaleString("en-IN")} ({s.roi}%)
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      {!result && (
        <View style={[styles.placeholder, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="info" size={16} color={colors.mutedForeground} />
          <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
            Fill in buy price and quantity to see profit analysis
          </Text>
        </View>
      )}
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
  autofill: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  autofillText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  formCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 14 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, marginBottom: 4 },
  fieldWrap: { gap: 4 },
  fieldLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  fieldHint: { fontFamily: "Inter_400Regular", fontSize: 11 },
  inputRow: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, height: 44 },
  input: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 15, height: 44 },
  inputAffix: { fontFamily: "Inter_400Regular", fontSize: 13 },
  resultCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 10 },
  resultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resultLabel: { fontFamily: "Inter_400Regular", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  resultValue: { fontFamily: "Inter_700Bold", fontSize: 32, letterSpacing: -0.5 },
  roiBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  roiText: { fontFamily: "Inter_700Bold", fontSize: 16 },
  breakEvenRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 8, borderWidth: 1 },
  breakEvenText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  breakdownCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 4 },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth },
  breakdownLabel: { fontSize: 13 },
  breakdownValue: { fontSize: 13 },
  scenarioCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 4 },
  scenarioSub: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: -8, marginBottom: 6 },
  scenarioRow: { flexDirection: "row", alignItems: "center", paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, gap: 10 },
  scenarioPct: { fontFamily: "Inter_500Medium", fontSize: 12, width: 36 },
  scPrice: { fontFamily: "Inter_600SemiBold", fontSize: 13, flex: 1 },
  scenarioPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  scenarioProfit: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  placeholder: { padding: 20, borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: 10, alignItems: "center" },
  placeholderText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1 },
});
