import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useMarket } from "@/hooks/useMarket";

const SOURCES = [
  { label: "Muzaffarnagar (UP)", lat: 29.47, lng: 77.7 },
  { label: "Kolhapur (MH)", lat: 16.7, lng: 74.24 },
  { label: "Sangli (MH)", lat: 16.86, lng: 74.57 },
  { label: "Erode (TN)", lat: 11.34, lng: 77.73 },
  { label: "Belagavi (KA)", lat: 15.85, lng: 74.5 },
  { label: "Varanasi (UP)", lat: 25.32, lng: 83.0 },
];

const DESTINATIONS = [
  { label: "Delhi / NCR", distanceFrom: { "Muzaffarnagar (UP)": 120, "Kolhapur (MH)": 1620, "Sangli (MH)": 1580, "Erode (TN)": 2200, "Belagavi (KA)": 1750, "Varanasi (UP)": 800 } },
  { label: "Mumbai", distanceFrom: { "Muzaffarnagar (UP)": 1480, "Kolhapur (MH)": 375, "Sangli (MH)": 300, "Erode (TN)": 1200, "Belagavi (KA)": 540, "Varanasi (UP)": 1600 } },
  { label: "Kolkata", distanceFrom: { "Muzaffarnagar (UP)": 1350, "Kolhapur (MH)": 1900, "Sangli (MH)": 1850, "Erode (TN)": 1900, "Belagavi (KA)": 2100, "Varanasi (UP)": 700 } },
  { label: "Chennai", distanceFrom: { "Muzaffarnagar (UP)": 2200, "Kolhapur (MH)": 1200, "Sangli (MH)": 1150, "Erode (TN)": 400, "Belagavi (KA)": 980, "Varanasi (UP)": 2000 } },
  { label: "Bengaluru", distanceFrom: { "Muzaffarnagar (UP)": 2100, "Kolhapur (MH)": 850, "Sangli (MH)": 820, "Erode (TN)": 380, "Belagavi (KA)": 500, "Varanasi (UP)": 1900 } },
  { label: "Hyderabad", distanceFrom: { "Muzaffarnagar (UP)": 1700, "Kolhapur (MH)": 700, "Sangli (MH)": 680, "Erode (TN)": 900, "Belagavi (KA)": 590, "Varanasi (UP)": 1400 } },
  { label: "Ahmedabad", distanceFrom: { "Muzaffarnagar (UP)": 1050, "Kolhapur (MH)": 680, "Sangli (MH)": 700, "Erode (TN)": 1600, "Belagavi (KA)": 880, "Varanasi (UP)": 1200 } },
  { label: "Patna / Bihar", distanceFrom: { "Muzaffarnagar (UP)": 900, "Kolhapur (MH)": 1800, "Sangli (MH)": 1750, "Erode (TN)": 2100, "Belagavi (KA)": 2000, "Varanasi (UP)": 250 } },
  { label: "Export (Nhava Sheva Port)", distanceFrom: { "Muzaffarnagar (UP)": 1500, "Kolhapur (MH)": 380, "Sangli (MH)": 320, "Erode (TN)": 1280, "Belagavi (KA)": 570, "Varanasi (UP)": 1650 } },
];

const TRUCK_RATE_PER_KM_PER_TON = 3.2;
const RAIL_RATE_PER_KM_PER_TON = 1.8;
const LOADING_UNLOADING_PER_TON = 280;
const TOLL_PER_100KM_PER_TRUCK = 120;
const TRUCK_CAPACITY_TONS = 20;

export default function TransportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { snapshot } = useMarket();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [source, setSource] = useState(SOURCES[0].label);
  const [destination, setDestination] = useState(DESTINATIONS[0].label);
  const [quantity, setQuantity] = useState("100");
  const [mode, setMode] = useState<"truck" | "rail">("truck");
  const [buyPrice, setBuyPrice] = useState(snapshot ? String(snapshot.currentPrice) : "3650");
  const [sellPrice, setSellPrice] = useState(snapshot ? String(snapshot.targetPrice) : "4200");

  const result = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const qtyTons = qty / 10;
    const dest = DESTINATIONS.find((d) => d.label === destination);
    const distKm = dest?.distanceFrom[source as keyof typeof dest.distanceFrom] ?? 500;

    const freightPerTon = mode === "truck" ? TRUCK_RATE_PER_KM_PER_TON * distKm : RAIL_RATE_PER_KM_PER_TON * distKm;
    const freightTotal = freightPerTon * qtyTons;
    const loadingUnloading = LOADING_UNLOADING_PER_TON * qtyTons;
    const trucks = Math.ceil(qtyTons / TRUCK_CAPACITY_TONS);
    const tollTotal = mode === "truck" ? (distKm / 100) * TOLL_PER_100KM_PER_TRUCK * trucks : 0;
    const totalTransportCost = freightTotal + loadingUnloading + tollTotal;
    const transportPerQtl = qty > 0 ? totalTransportCost / qty : 0;

    const bp = parseFloat(buyPrice) || 0;
    const sp = parseFloat(sellPrice) || 0;
    const purchaseCost = bp * qty;
    const totalCost = purchaseCost + totalTransportCost;
    const revenue = sp * qty;
    const profit = revenue - totalCost;
    const landedCostPerQtl = qty > 0 ? totalCost / qty : 0;
    const isViable = profit > 0;

    return { distKm, freightTotal, loadingUnloading, tollTotal, totalTransportCost, transportPerQtl, purchaseCost, totalCost, revenue, profit, landedCostPerQtl, isViable, trucks };
  }, [source, destination, quantity, mode, buyPrice, sellPrice]);

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 110 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}><Feather name="arrow-left" size={18} color={colors.foreground} /></TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Transport & Landed Cost</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>True cost from source to destination</Text>
        </View>
      </View>

      <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Route & Mode</Text>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Source Mandi</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {SOURCES.map((s) => (
            <TouchableOpacity key={s.label} onPress={() => setSource(s.label)} style={[styles.chip, { backgroundColor: source === s.label ? colors.primary + "20" : colors.muted, borderColor: source === s.label ? colors.primary : colors.border }]}>
              <Text style={[styles.chipText, { color: source === s.label ? colors.primary : colors.mutedForeground }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Destination</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {DESTINATIONS.map((d) => (
            <TouchableOpacity key={d.label} onPress={() => setDestination(d.label)} style={[styles.chip, { backgroundColor: destination === d.label ? colors.primary + "20" : colors.muted, borderColor: destination === d.label ? colors.primary : colors.border }]}>
              <Text style={[styles.chipText, { color: destination === d.label ? colors.primary : colors.mutedForeground }]}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={[styles.distanceBanner, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" }]}>
          <Feather name="navigation" size={13} color={colors.primary} />
          <Text style={[styles.distanceText, { color: colors.primary }]}>Distance: ~{result.distKm.toLocaleString("en-IN")} km · {result.trucks} truck{result.trucks > 1 ? "s" : ""} needed ({quantity} qtl)</Text>
        </View>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Transport Mode</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {(["truck", "rail"] as const).map((m) => (
            <TouchableOpacity key={m} onPress={() => setMode(m)} style={[styles.modeBtn, { backgroundColor: mode === m ? colors.primary + "20" : colors.muted, borderColor: mode === m ? colors.primary : colors.border }]}>
              <Feather name={m === "truck" ? "truck" : "zap"} size={16} color={mode === m ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.modeBtnText, { color: mode === m ? colors.primary : colors.mutedForeground }]}>{m === "truck" ? "Road (Truck)" : "Rail / Rly"}</Text>
              <Text style={[styles.modeRate, { color: colors.mutedForeground }]}>{m === "truck" ? "₹3.2/km/MT" : "₹1.8/km/MT"}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Quantity (quintals)</Text>
        <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <TextInput value={quantity} onChangeText={setQuantity} placeholder="100" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" style={[styles.input, { color: colors.foreground }]} />
          <Text style={[styles.inputSuffix, { color: colors.mutedForeground }]}>quintals</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Buy Price (₹/qtl)</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <TextInput value={buyPrice} onChangeText={setBuyPrice} keyboardType="numeric" style={[styles.input, { color: colors.foreground }]} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Target Sell (₹/qtl)</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <TextInput value={sellPrice} onChangeText={setSellPrice} keyboardType="numeric" style={[styles.input, { color: colors.foreground }]} />
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.resultCard, { backgroundColor: result.isViable ? colors.buy + "10" : colors.sell + "10", borderColor: result.isViable ? colors.buy + "40" : colors.sell + "40" }]}>
        <View style={styles.resultHeader}>
          <View>
            <Text style={[styles.resultLabel, { color: colors.mutedForeground }]}>Net Profit After Transport</Text>
            <Text style={[styles.resultValue, { color: result.isViable ? colors.buy : colors.sell }]}>
              {result.profit >= 0 ? "+" : ""}₹{Math.round(result.profit).toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={[styles.viableBadge, { backgroundColor: result.isViable ? colors.buy + "20" : colors.sell + "20" }]}>
            <Feather name={result.isViable ? "check-circle" : "x-circle"} size={14} color={result.isViable ? colors.buy : colors.sell} />
            <Text style={[styles.viableText, { color: result.isViable ? colors.buy : colors.sell }]}>{result.isViable ? "VIABLE" : "NOT VIABLE"}</Text>
          </View>
        </View>
        <View style={[styles.landedRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="flag" size={13} color={colors.mutedForeground} />
          <Text style={[styles.landedText, { color: colors.foreground }]}>Landed cost at {destination}: <Text style={{ fontFamily: "Inter_700Bold", color: colors.primary }}>₹{Math.round(result.landedCostPerQtl).toLocaleString("en-IN")}/qtl</Text></Text>
        </View>
      </View>

      <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Cost Breakdown</Text>
        {[
          { l: "Purchase Cost", v: result.purchaseCost, c: colors.foreground },
          { l: "Freight Cost", v: result.freightTotal, c: colors.hold },
          { l: "Loading/Unloading", v: result.loadingUnloading, c: colors.hold },
          { l: "Toll Charges", v: result.tollTotal, c: colors.hold },
          { l: "Transport (per qtl)", v: result.transportPerQtl, c: colors.primary, perQtl: true },
          { l: "Total Cost", v: result.totalCost, c: colors.sell, bold: true },
          { l: "Revenue", v: result.revenue, c: colors.buy, bold: true },
          { l: "Net Profit", v: result.profit, c: result.profit >= 0 ? colors.buy : colors.sell, bold: true },
        ].map((r) => (
          <View key={r.l} style={[styles.breakdownRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.bLabel, { color: colors.mutedForeground, fontFamily: r.bold ? "Inter_600SemiBold" : "Inter_400Regular" }]}>{r.l}</Text>
            <Text style={[styles.bValue, { color: r.c, fontFamily: r.bold ? "Inter_700Bold" : "Inter_600SemiBold" }]}>
              {r.v >= 0 ? "" : "-"}₹{Math.abs(Math.round(r.v)).toLocaleString("en-IN")}{r.perQtl ? "/qtl" : ""}
            </Text>
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
  formCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  fieldLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  distanceBanner: { flexDirection: "row", gap: 8, padding: 10, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  distanceText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  modeBtn: { flex: 1, alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1, gap: 4 },
  modeBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  modeRate: { fontFamily: "Inter_400Regular", fontSize: 10 },
  inputRow: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, height: 44 },
  input: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 15, height: 44 },
  inputSuffix: { fontFamily: "Inter_400Regular", fontSize: 13 },
  resultCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 10 },
  resultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resultLabel: { fontFamily: "Inter_400Regular", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  resultValue: { fontFamily: "Inter_700Bold", fontSize: 28 },
  viableBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  viableText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  landedRow: { flexDirection: "row", gap: 7, padding: 10, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  landedText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1 },
  breakdownCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 2 },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  bLabel: { fontSize: 13 },
  bValue: { fontSize: 13 },
});
