import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useMarket } from "@/hooks/useMarket";
import {
  getStoragesForPin,
  lookupRegion,
  computeStockSignal,
  ColdStorage,
} from "@/constants/storageData";

type SortKey = "rate_low" | "rate_high" | "distance" | "rating";

export default function StorageScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { snapshot } = useMarket();
  const [pinInput, setPinInput] = useState("");
  const [searchedPin, setSearchedPin] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("distance");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const region = useMemo(() => (searchedPin ? lookupRegion(searchedPin) : null), [searchedPin]);
  const rawStorages = useMemo(() => (searchedPin ? getStoragesForPin(searchedPin) : []), [searchedPin]);

  const storages = useMemo(() => {
    const list = [...rawStorages];
    switch (sortKey) {
      case "rate_low": return list.sort((a, b) => a.ratePerQuintalPerMonth - b.ratePerQuintalPerMonth);
      case "rate_high": return list.sort((a, b) => b.ratePerQuintalPerMonth - a.ratePerQuintalPerMonth);
      case "distance": return list.sort((a, b) => a.distanceKm - b.distanceKm);
      case "rating": return list.sort((a, b) => b.rating - a.rating);
    }
  }, [rawStorages, sortKey]);

  const handleSearch = () => {
    if (pinInput.length === 6) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSearchedPin(pinInput);
    }
  };

  const bestRate = storages.length ? Math.min(...storages.map((s) => s.ratePerQuintalPerMonth)) : 0;
  const worstRate = storages.length ? Math.max(...storages.map((s) => s.ratePerQuintalPerMonth)) : 0;

  const stockSignal = useMemo(() => {
    if (!snapshot || !storages.length) return null;
    return computeStockSignal(
      snapshot.currentPrice,
      snapshot.recommendation,
      snapshot.festivalScore,
      snapshot.harvestScore,
      bestRate
    );
  }, [snapshot, storages, bestRate]);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 110 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Storage Finder</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Find cold storage near you with personalised stocking advice
      </Text>

      <View style={[styles.searchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.searchLabel, { color: colors.foreground }]}>Enter your PIN code</Text>
        <View style={styles.searchRow}>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="map-pin" size={16} color={colors.mutedForeground} />
            <TextInput
              value={pinInput}
              onChangeText={(t) => setPinInput(t.replace(/\D/g, "").slice(0, 6))}
              placeholder="e.g. 251001 (Muzaffarnagar)"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              maxLength={6}
              style={[styles.input, { color: colors.foreground }]}
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity
            onPress={handleSearch}
            style={[styles.searchBtn, { backgroundColor: pinInput.length === 6 ? colors.primary : colors.muted }]}
          >
            <Feather name="search" size={18} color={pinInput.length === 6 ? colors.primaryForeground : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
        {!searchedPin && (
          <View style={styles.quickPins}>
            <Text style={[styles.quickLabel, { color: colors.mutedForeground }]}>Quick select:</Text>
            {[
              { pin: "251001", label: "Muzaffarnagar" },
              { pin: "416001", label: "Kolhapur" },
              { pin: "638001", label: "Erode" },
              { pin: "590001", label: "Belagavi" },
            ].map((q) => (
              <TouchableOpacity
                key={q.pin}
                onPress={() => { setPinInput(q.pin); setSearchedPin(q.pin); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[styles.quickPinChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              >
                <Text style={[styles.quickPinText, { color: colors.secondaryForeground }]}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {searchedPin && region && (
        <View style={[styles.regionBanner, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
          <Feather name="map-pin" size={14} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.regionName, { color: colors.foreground }]}>{region.city}, {region.state}</Text>
            {region.isJaggeryHub && (
              <Text style={[styles.hubTag, { color: colors.primary }]}>Major Jaggery Mandi Hub</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => { setSearchedPin(""); setPinInput(""); }}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      )}

      {storages.length > 0 && stockSignal && (
        <StockSignalCard signal={stockSignal} colors={colors} />
      )}

      {storages.length > 0 && (
        <>
          <View style={styles.sortRow}>
            <Text style={[styles.sortLabel, { color: colors.mutedForeground }]}>Sort:</Text>
            {([
              { key: "distance", label: "Nearest" },
              { key: "rate_low", label: "Cheapest" },
              { key: "rate_high", label: "Premium" },
              { key: "rating", label: "Top Rated" },
            ] as { key: SortKey; label: string }[]).map((s) => (
              <TouchableOpacity
                key={s.key}
                onPress={() => setSortKey(s.key)}
                style={[
                  styles.sortChip,
                  { backgroundColor: sortKey === s.key ? colors.primary + "20" : colors.muted, borderColor: sortKey === s.key ? colors.primary : colors.border },
                ]}
              >
                <Text style={[styles.sortChipText, { color: sortKey === s.key ? colors.primary : colors.mutedForeground }]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.rateSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <RateStat label="Lowest Rate" value={`₹${bestRate}/qtl/mo`} color={colors.buy} colors={colors} />
            <View style={[styles.rateDivider, { backgroundColor: colors.border }]} />
            <RateStat label="Highest Rate" value={`₹${worstRate}/qtl/mo`} color={colors.sell} colors={colors} />
            <View style={[styles.rateDivider, { backgroundColor: colors.border }]} />
            <RateStat label="Facilities" value={`${storages.length}`} color={colors.primary} colors={colors} />
          </View>

          {storages.map((s) => (
            <StorageCard key={s.id} storage={s} bestRate={bestRate} worstRate={worstRate} colors={colors} />
          ))}
        </>
      )}

      {!searchedPin && (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
            <Feather name="database" size={28} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Find Cold Storage Near You</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Enter your 6-digit PIN code to find nearby cold storage with rates, capacity, and personalised stocking advice based on market signals.
          </Text>
          <View style={[styles.coverageNote, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="check-circle" size={12} color={colors.primary} />
            <Text style={[styles.coverageText, { color: colors.mutedForeground }]}>
              Covers: Muzaffarnagar · Kolhapur · Sangli · Erode · Belagavi · Varanasi + more jaggery belt areas
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function StockSignalCard({ signal, colors }: { signal: ReturnType<typeof computeStockSignal>; colors: ReturnType<typeof useColors> }) {
  const actionConfig = {
    STOCK_NOW: { color: colors.buy, icon: "trending-up" as const, label: "STOCK NOW" },
    WAIT: { color: colors.hold, icon: "clock" as const, label: "WAIT" },
    PARTIAL_STOCK: { color: colors.primary, icon: "minus-circle" as const, label: "PARTIAL STOCK" },
    SELL_FROM_STORAGE: { color: colors.sell, icon: "trending-down" as const, label: "SELL FROM STORAGE" },
  };
  const cfg = actionConfig[signal.action];
  return (
    <View style={[styles.signalCard, { backgroundColor: cfg.color + "10", borderColor: cfg.color + "40" }]}>
      <View style={styles.signalHeader}>
        <View style={[styles.actionBadge, { backgroundColor: cfg.color + "20", borderColor: cfg.color + "50" }]}>
          <Feather name={cfg.icon} size={16} color={cfg.color} />
          <Text style={[styles.actionText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <Text style={[styles.confText, { color: cfg.color }]}>{signal.confidence}% confidence</Text>
      </View>
      <Text style={[styles.signalReason, { color: colors.foreground }]}>{signal.reason}</Text>
      <View style={styles.signalStats}>
        <SignalStat label="Expected Gain" value={`+${signal.expectedGainPct}%`} color={colors.buy} colors={colors} />
        <SignalStat label="Hold Period" value={`~${signal.holdMonths} mo`} color={colors.primary} colors={colors} />
        <SignalStat label="Break-Even" value={`₹${signal.breakEven.toLocaleString("en-IN")}`} color={colors.foreground} colors={colors} />
      </View>
    </View>
  );
}

function SignalStat({ label, value, color, colors }: { label: string; value: string; color: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.signalStat}>
      <Text style={[styles.signalStatLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.signalStatValue, { color }]}>{value}</Text>
    </View>
  );
}

function RateStat({ label, value, color, colors }: { label: string; value: string; color: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.rateStat}>
      <Text style={[styles.rateStatLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.rateStatValue, { color }]}>{value}</Text>
    </View>
  );
}

function StorageCard({ storage, bestRate, worstRate, colors }: { storage: ColdStorage; bestRate: number; worstRate: number; colors: ReturnType<typeof useColors> }) {
  const [expanded, setExpanded] = useState(false);
  const rateColor = storage.rateLevel === "low" ? colors.buy : storage.rateLevel === "high" ? colors.sell : colors.hold;
  const rateLabel = storage.rateLevel === "low" ? "Best Value" : storage.rateLevel === "high" ? "Premium" : "Standard";

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.9}
      style={[styles.storageCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.storageHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.storageNameRow}>
            <Text style={[styles.storageName, { color: colors.foreground }]}>{storage.name}</Text>
            <View style={[styles.rateLevelBadge, { backgroundColor: rateColor + "15", borderColor: rateColor + "30" }]}>
              <Text style={[styles.rateLevelText, { color: rateColor }]}>{rateLabel}</Text>
            </View>
          </View>
          <Text style={[styles.storageAddress, { color: colors.mutedForeground }]}>{storage.address}, {storage.city}</Text>
        </View>
      </View>
      <View style={styles.storageStats}>
        <View style={styles.storageStat}>
          <Feather name="navigation" size={12} color={colors.mutedForeground} />
          <Text style={[styles.storageStatText, { color: colors.foreground }]}>{storage.distanceKm} km</Text>
        </View>
        <View style={styles.storageStat}>
          <Feather name="dollar-sign" size={12} color={colors.mutedForeground} />
          <Text style={[styles.storageStatText, { color: rateColor, fontFamily: "Inter_700Bold" }]}>₹{storage.ratePerQuintalPerMonth}/qtl/mo</Text>
        </View>
        <View style={styles.storageStat}>
          <Feather name="package" size={12} color={colors.mutedForeground} />
          <Text style={[styles.storageStatText, { color: colors.foreground }]}>{storage.availableCapacity} free</Text>
        </View>
        <View style={styles.storageStat}>
          <Feather name="star" size={12} color="#F59E0B" />
          <Text style={[styles.storageStatText, { color: colors.foreground }]}>{storage.rating}</Text>
        </View>
      </View>
      {expanded && (
        <>
          <View style={[styles.expandDivider, { backgroundColor: colors.border }]} />
          <View style={styles.featureList}>
            {storage.features.map((f) => (
              <View key={f} style={styles.featureRow}>
                <Feather name="check" size={12} color={colors.buy} />
                <Text style={[styles.featureText, { color: colors.mutedForeground }]}>{f}</Text>
              </View>
            ))}
          </View>
          <View style={styles.contactRow}>
            <Feather name="phone" size={12} color={colors.primary} />
            <Text style={[styles.contactText, { color: colors.primary }]}>{storage.contact}</Text>
          </View>
          <View style={[styles.rateBar, { backgroundColor: colors.muted }]}>
            <View style={[styles.rateBarFill, { width: `${((storage.ratePerQuintalPerMonth - bestRate) / Math.max(worstRate - bestRate, 1)) * 100}%`, backgroundColor: rateColor }]} />
          </View>
          <Text style={[styles.rateBarLabel, { color: colors.mutedForeground }]}>
            ₹{bestRate} (cheapest) → ₹{worstRate} (most expensive) in your area
          </Text>
        </>
      )}
      <Text style={[styles.tapHint, { color: colors.mutedForeground }]}>{expanded ? "Tap to collapse" : "Tap for details & contact"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 14 },
  title: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: -8 },
  searchCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  searchLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  searchRow: { flexDirection: "row", gap: 10 },
  inputWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 48 },
  input: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 15, height: 48 },
  searchBtn: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  quickPins: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  quickLabel: { fontFamily: "Inter_400Regular", fontSize: 12 },
  quickPinChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  quickPinText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  regionBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  regionName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  hubTag: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
  signalCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 10 },
  signalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  actionBadge: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  actionText: { fontFamily: "Inter_700Bold", fontSize: 13, letterSpacing: 1 },
  confText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  signalReason: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  signalStats: { flexDirection: "row", justifyContent: "space-between" },
  signalStat: { alignItems: "center", gap: 3 },
  signalStatLabel: { fontFamily: "Inter_400Regular", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  signalStatValue: { fontFamily: "Inter_700Bold", fontSize: 14 },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  sortLabel: { fontFamily: "Inter_400Regular", fontSize: 12 },
  sortChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  sortChipText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  rateSummary: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "center" },
  rateStat: { flex: 1, alignItems: "center", gap: 3 },
  rateStatLabel: { fontFamily: "Inter_400Regular", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" },
  rateStatValue: { fontFamily: "Inter_700Bold", fontSize: 13 },
  rateDivider: { width: 1, height: 30, marginHorizontal: 4 },
  storageCard: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 10 },
  storageHeader: { flexDirection: "row", gap: 10 },
  storageNameRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, flexWrap: "wrap" },
  storageName: { fontFamily: "Inter_600SemiBold", fontSize: 14, flex: 1 },
  storageAddress: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 3 },
  rateLevelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  rateLevelText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  storageStats: { flexDirection: "row", gap: 14, flexWrap: "wrap" },
  storageStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  storageStatText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  expandDivider: { height: StyleSheet.hairlineWidth },
  featureList: { gap: 6 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  featureText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  contactText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  rateBar: { height: 4, borderRadius: 2, overflow: "hidden" },
  rateBarFill: { height: 4, borderRadius: 2 },
  rateBarLabel: { fontFamily: "Inter_400Regular", fontSize: 10, textAlign: "center" },
  tapHint: { fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "center" },
  emptyState: { borderRadius: 16, padding: 24, borderWidth: 1, alignItems: "center", gap: 12 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", lineHeight: 20 },
  coverageNote: { flexDirection: "row", alignItems: "flex-start", gap: 6, padding: 10, borderRadius: 8, borderWidth: 1 },
  coverageText: { fontFamily: "Inter_400Regular", fontSize: 11, flex: 1, lineHeight: 17 },
});
