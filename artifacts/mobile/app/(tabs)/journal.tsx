import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform, Modal, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useJournal } from "@/hooks/useJournal";
import { useMarket } from "@/hooks/useMarket";
import { computeTradeProfit, MANDIS, TradeGrade, JaggeryType, TradeEntry } from "@/constants/journalData";

const GRADES: TradeGrade[] = ["A", "B", "C"];
const TYPES: JaggeryType[] = ["Khandsari UP", "Kolhapuri", "TN Vellam", "Organic", "Shakkar Gur", "Other"];

type AddForm = { mandi: string; grade: TradeGrade; type: JaggeryType; quantity: string; buyPrice: string; storageMonths: string; storageCostPerMonth: string; transportCostPerQtl: string; date: string; notes: string };
type SellForm = { sellPrice: string; soldQuantity: string; sellDate: string };

const EMPTY_FORM: AddForm = { mandi: MANDIS[0], grade: "B", type: "Khandsari UP", quantity: "", buyPrice: "", storageMonths: "0", storageCostPerMonth: "0", transportCostPerQtl: "0", date: new Date().toISOString().split("T")[0], notes: "" };

export default function JournalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { snapshot } = useMarket();
  const { trades, loading, addTrade, markSold, deleteTrade, stats } = useJournal();
  const [tab, setTab] = useState<"overview" | "active" | "history">("overview");
  const [showAdd, setShowAdd] = useState(false);
  const [showSell, setShowSell] = useState<string | null>(null);
  const [form, setForm] = useState<AddForm>(EMPTY_FORM);
  const [sellForm, setSellForm] = useState<SellForm>({ sellPrice: "", soldQuantity: "", sellDate: new Date().toISOString().split("T")[0] });
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const activeTrades = trades.filter((t) => t.status === "holding" || t.status === "partial");
  const completedTrades = trades.filter((t) => t.status === "sold");

  const handleAdd = async () => {
    if (!form.quantity || !form.buyPrice) return;
    await addTrade({ mandi: form.mandi, grade: form.grade, type: form.type, quantity: parseFloat(form.quantity), buyPrice: parseFloat(form.buyPrice), status: "holding", storageMonths: parseFloat(form.storageMonths) || 0, storageCostPerMonth: parseFloat(form.storageCostPerMonth) || 0, transportCostPerQtl: parseFloat(form.transportCostPerQtl) || 0, date: form.date, notes: form.notes });
    setForm(EMPTY_FORM); setShowAdd(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSell = async () => {
    if (!showSell || !sellForm.sellPrice) return;
    const trade = trades.find((t) => t.id === showSell);
    if (!trade) return;
    await markSold(showSell, parseFloat(sellForm.sellPrice), sellForm.sellDate, sellForm.soldQuantity ? parseFloat(sellForm.soldQuantity) : trade.quantity);
    setShowSell(null); setSellForm({ sellPrice: "", soldQuantity: "", sellDate: new Date().toISOString().split("T")[0] });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const confirmDelete = (id: string) => {
    Alert.alert("Delete Trade", "Are you sure you want to delete this trade entry?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTrade(id) },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.foreground }]}>Trade Journal</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Track buys, sells & P&L</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAdd(true)} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
            <Feather name="plus" size={18} color={colors.primaryForeground} />
            <Text style={[styles.addBtnText, { color: colors.primaryForeground }]}>Add Trade</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          {(["overview", "active", "history"] as const).map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabBtn, { backgroundColor: tab === t ? colors.primary + "20" : colors.muted, borderColor: tab === t ? colors.primary : colors.border }]}>
              <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground }]}>{t === "overview" ? "Overview" : t === "active" ? `Active (${activeTrades.length})` : `History (${completedTrades.length})`}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === "overview" && (
          <>
            <View style={[styles.plCard, { backgroundColor: stats.totalProfit >= 0 ? colors.buy + "10" : colors.sell + "10", borderColor: stats.totalProfit >= 0 ? colors.buy + "35" : colors.sell + "35" }]}>
              <Text style={[styles.plLabel, { color: colors.mutedForeground }]}>Total P&L (Realised)</Text>
              <Text style={[styles.plValue, { color: stats.totalProfit >= 0 ? colors.buy : colors.sell }]}>
                {stats.totalProfit >= 0 ? "+" : ""}₹{Math.round(stats.totalProfit).toLocaleString("en-IN")}
              </Text>
              <Text style={[styles.plRoi, { color: stats.roi >= 0 ? colors.buy : colors.sell }]}>
                {stats.roi >= 0 ? "+" : ""}{stats.roi.toFixed(1)}% ROI on completed trades
              </Text>
            </View>
            <View style={styles.statsGrid}>
              {[
                { label: "Total Invested", value: `₹${Math.round(stats.totalInvested).toLocaleString("en-IN")}`, color: colors.sell },
                { label: "Total Realised", value: `₹${Math.round(stats.totalRealised).toLocaleString("en-IN")}`, color: colors.buy },
                { label: "Holding Value", value: `₹${Math.round(stats.holdingValue).toLocaleString("en-IN")}`, color: colors.primary },
                { label: "Holding Stock", value: `${stats.holdingQuantity} qtl`, color: colors.foreground },
                { label: "Active Trades", value: `${stats.activeTrades}`, color: colors.hold },
                { label: "Completed", value: `${stats.completedTrades}`, color: colors.buy },
              ].map((s) => (
                <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                </View>
              ))}
            </View>
            {trades.length === 0 && (
              <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="book-open" size={32} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No trades yet</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Tap "Add Trade" to log your first jaggery purchase and start tracking your P&L.</Text>
              </View>
            )}
          </>
        )}

        {tab === "active" && (
          <>
            {activeTrades.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="package" size={32} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No active holdings</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Add a trade to see your current inventory here.</Text>
              </View>
            ) : activeTrades.map((t) => <TradeCard key={t.id} trade={t} colors={colors} snapshot={snapshot} onSell={() => { setShowSell(t.id); setSellForm((f) => ({ ...f, soldQuantity: String(t.quantity) })); }} onDelete={() => confirmDelete(t.id)} />)}
          </>
        )}

        {tab === "history" && (
          <>
            {completedTrades.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="check-circle" size={32} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No completed trades yet</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Completed (sold) trades will appear here with full P&L breakdown.</Text>
              </View>
            ) : completedTrades.map((t) => <TradeCard key={t.id} trade={t} colors={colors} snapshot={snapshot} onDelete={() => confirmDelete(t.id)} />)}
          </>
        )}
      </ScrollView>

      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAdd(false)}>
        <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingTop: 32, gap: 14 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <Text style={[styles.title, { color: colors.foreground }]}>New Trade</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}><Feather name="x" size={22} color={colors.mutedForeground} /></TouchableOpacity>
          </View>
          <FormField label="Purchase Date" colors={colors}><TextInput value={form.date} onChangeText={(v) => setForm((f) => ({ ...f, date: v }))} style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]} placeholderTextColor={colors.mutedForeground} /></FormField>
          <FormField label="Mandi / Source" colors={colors}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {MANDIS.map((m) => <TouchableOpacity key={m} onPress={() => setForm((f) => ({ ...f, mandi: m }))} style={[styles.chip, { backgroundColor: form.mandi === m ? colors.primary + "20" : colors.muted, borderColor: form.mandi === m ? colors.primary : colors.border }]}><Text style={[styles.chipText, { color: form.mandi === m ? colors.primary : colors.mutedForeground }]}>{m}</Text></TouchableOpacity>)}
            </ScrollView>
          </FormField>
          <FormField label="Grade" colors={colors}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {GRADES.map((g) => <TouchableOpacity key={g} onPress={() => setForm((f) => ({ ...f, grade: g }))} style={[styles.chip, { backgroundColor: form.grade === g ? colors.primary + "20" : colors.muted, borderColor: form.grade === g ? colors.primary : colors.border }]}><Text style={[styles.chipText, { color: form.grade === g ? colors.primary : colors.mutedForeground }]}>Grade {g}</Text></TouchableOpacity>)}
            </View>
          </FormField>
          <FormField label="Type" colors={colors}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {TYPES.map((tp) => <TouchableOpacity key={tp} onPress={() => setForm((f) => ({ ...f, type: tp }))} style={[styles.chip, { backgroundColor: form.type === tp ? colors.primary + "20" : colors.muted, borderColor: form.type === tp ? colors.primary : colors.border }]}><Text style={[styles.chipText, { color: form.type === tp ? colors.primary : colors.mutedForeground }]}>{tp}</Text></TouchableOpacity>)}
            </ScrollView>
          </FormField>
          {[
            { key: "buyPrice", label: "Buy Price (₹/quintal)", placeholder: snapshot ? String(snapshot.currentPrice) : "3650" },
            { key: "quantity", label: "Quantity (quintals)", placeholder: "100" },
            { key: "storageMonths", label: "Storage Months (0 if direct sell)", placeholder: "3" },
            { key: "storageCostPerMonth", label: "Storage Cost (₹/qtl/month)", placeholder: "40" },
            { key: "transportCostPerQtl", label: "Transport Cost (₹/qtl)", placeholder: "80" },
          ].map((f) => (
            <FormField key={f.key} label={f.label} colors={colors}>
              <TextInput value={(form as any)[f.key]} onChangeText={(v) => setForm((fm) => ({ ...fm, [f.key]: v }))} placeholder={f.placeholder} placeholderTextColor={colors.mutedForeground} keyboardType="numeric" style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]} />
            </FormField>
          ))}
          <FormField label="Notes (optional)" colors={colors}>
            <TextInput value={form.notes} onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))} placeholder="Add any notes about this trade..." placeholderTextColor={colors.mutedForeground} multiline numberOfLines={2} style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted, height: 70 }]} />
          </FormField>
          <TouchableOpacity onPress={handleAdd} style={[styles.submitBtn, { backgroundColor: form.quantity && form.buyPrice ? colors.primary : colors.muted }]}>
            <Text style={[styles.submitText, { color: form.quantity && form.buyPrice ? colors.primaryForeground : colors.mutedForeground }]}>Log Trade</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      <Modal visible={!!showSell} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setShowSell(null)}>
        <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingTop: 32, gap: 14 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <Text style={[styles.title, { color: colors.foreground }]}>Mark as Sold</Text>
            <TouchableOpacity onPress={() => setShowSell(null)}><Feather name="x" size={22} color={colors.mutedForeground} /></TouchableOpacity>
          </View>
          {snapshot && (
            <TouchableOpacity onPress={() => setSellForm((f) => ({ ...f, sellPrice: String(snapshot.currentPrice) }))} style={[styles.autofill, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
              <Feather name="zap" size={13} color={colors.primary} />
              <Text style={[styles.autofillText, { color: colors.primary }]}>Use today's market price (₹{snapshot.currentPrice.toLocaleString("en-IN")}/qtl)</Text>
            </TouchableOpacity>
          )}
          {[
            { key: "sellPrice", label: "Sell Price (₹/qtl)", placeholder: "4500" },
            { key: "soldQuantity", label: "Quantity Sold (quintals)", placeholder: "100" },
            { key: "sellDate", label: "Sell Date (YYYY-MM-DD)", placeholder: new Date().toISOString().split("T")[0] },
          ].map((f) => (
            <FormField key={f.key} label={f.label} colors={colors}>
              <TextInput value={(sellForm as any)[f.key]} onChangeText={(v) => setSellForm((fm) => ({ ...fm, [f.key]: v }))} placeholder={f.placeholder} placeholderTextColor={colors.mutedForeground} keyboardType={f.key === "sellDate" ? "default" : "numeric"} style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]} />
            </FormField>
          ))}
          <TouchableOpacity onPress={handleSell} style={[styles.submitBtn, { backgroundColor: sellForm.sellPrice ? colors.buy : colors.muted }]}>
            <Text style={[styles.submitText, { color: sellForm.sellPrice ? "#fff" : colors.mutedForeground }]}>Confirm Sale</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

function FormField({ label, children, colors }: { label: string; children: React.ReactNode; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: "Inter_500Medium", fontSize: 13, color: colors.foreground }}>{label}</Text>
      {children}
    </View>
  );
}

function TradeCard({ trade, colors, snapshot, onSell, onDelete }: { trade: TradeEntry; colors: ReturnType<typeof useColors>; snapshot: ReturnType<typeof useMarket>["snapshot"]; onSell?: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const isActive = trade.status === "holding" || trade.status === "partial";
  const profit = isActive ? null : computeTradeProfit(trade);
  const unrealisedGain = isActive && snapshot ? (snapshot.currentPrice - trade.buyPrice) * trade.quantity : null;

  return (
    <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.9} style={[styles.tradeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.tradeHeader}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={[styles.tradeName, { color: colors.foreground }]}>{trade.mandi}</Text>
            <View style={[styles.gradeChip, { backgroundColor: colors.primary + "15" }]}>
              <Text style={[styles.gradeText, { color: colors.primary }]}>Gr {trade.grade} · {trade.type}</Text>
            </View>
          </View>
          <Text style={[styles.tradeDate, { color: colors.mutedForeground }]}>{trade.date} · {trade.quantity} qtl @ ₹{trade.buyPrice.toLocaleString("en-IN")}/qtl</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isActive ? colors.hold + "20" : colors.buy + "15" }]}>
          <Text style={[styles.statusText, { color: isActive ? colors.hold : colors.buy }]}>{isActive ? "HOLDING" : "SOLD"}</Text>
        </View>
      </View>

      {isActive && unrealisedGain !== null && (
        <View style={[styles.unrealisedRow, { backgroundColor: unrealisedGain >= 0 ? colors.buy + "10" : colors.sell + "10", borderColor: unrealisedGain >= 0 ? colors.buy + "25" : colors.sell + "25" }]}>
          <Feather name={unrealisedGain >= 0 ? "trending-up" : "trending-down"} size={12} color={unrealisedGain >= 0 ? colors.buy : colors.sell} />
          <Text style={[styles.unrealisedText, { color: unrealisedGain >= 0 ? colors.buy : colors.sell }]}>
            Unrealised {unrealisedGain >= 0 ? "gain" : "loss"}: {unrealisedGain >= 0 ? "+" : ""}₹{Math.round(unrealisedGain).toLocaleString("en-IN")} (at ₹{snapshot?.currentPrice.toLocaleString("en-IN")}/qtl)
          </Text>
        </View>
      )}

      {!isActive && profit && (
        <View style={[styles.profitRow, { backgroundColor: profit.netProfit >= 0 ? colors.buy + "10" : colors.sell + "10" }]}>
          <Text style={[styles.profitText, { color: profit.netProfit >= 0 ? colors.buy : colors.sell }]}>
            {profit.netProfit >= 0 ? "Profit:" : "Loss:"} ₹{Math.round(Math.abs(profit.netProfit)).toLocaleString("en-IN")} ({profit.roi.toFixed(1)}% ROI)
          </Text>
        </View>
      )}

      {expanded && (
        <View style={{ gap: 8 }}>
          {profit && (
            <>
              <View style={[styles.expandDivider, { backgroundColor: colors.border }]} />
              {[
                { l: "Buy Price", v: `₹${trade.buyPrice.toLocaleString("en-IN")}/qtl` },
                { l: "Sell Price", v: `₹${trade.sellPrice?.toLocaleString("en-IN") ?? "-"}/qtl` },
                { l: "Storage Cost", v: `₹${Math.round(profit.storageCost).toLocaleString("en-IN")}` },
                { l: "Transport Cost", v: `₹${Math.round(profit.transportCost).toLocaleString("en-IN")}` },
                { l: "Break-even", v: `₹${Math.round(profit.breakEven).toLocaleString("en-IN")}/qtl` },
              ].map((r) => (
                <View key={r.l} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={[styles.expandLabel, { color: colors.mutedForeground }]}>{r.l}</Text>
                  <Text style={[styles.expandValue, { color: colors.foreground }]}>{r.v}</Text>
                </View>
              ))}
            </>
          )}
          {trade.notes ? <Text style={[styles.notesText, { color: colors.mutedForeground }]}>Note: {trade.notes}</Text> : null}
          <View style={styles.actionRow}>
            {isActive && onSell && (
              <TouchableOpacity onPress={onSell} style={[styles.actionBtn, { backgroundColor: colors.buy + "20", borderColor: colors.buy + "40" }]}>
                <Feather name="check-circle" size={14} color={colors.buy} />
                <Text style={[styles.actionText, { color: colors.buy }]}>Mark Sold</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onDelete} style={[styles.actionBtn, { backgroundColor: colors.sell + "15", borderColor: colors.sell + "30" }]}>
              <Feather name="trash-2" size={14} color={colors.sell} />
              <Text style={[styles.actionText, { color: colors.sell }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, letterSpacing: -0.5 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  tabRow: { flexDirection: "row", gap: 8 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 20, borderWidth: 1, alignItems: "center" },
  tabText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  plCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 4 },
  plLabel: { fontFamily: "Inter_400Regular", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  plValue: { fontFamily: "Inter_700Bold", fontSize: 32, letterSpacing: -0.5 },
  plRoi: { fontFamily: "Inter_500Medium", fontSize: 13 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { width: "47%", padding: 12, borderRadius: 12, borderWidth: 1, gap: 4 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 16 },
  emptyState: { borderRadius: 14, padding: 28, borderWidth: 1, alignItems: "center", gap: 10 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", lineHeight: 19 },
  tradeCard: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 10 },
  tradeHeader: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  tradeName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  tradeDate: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 3 },
  gradeChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  gradeText: { fontFamily: "Inter_500Medium", fontSize: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 0.5 },
  unrealisedRow: { flexDirection: "row", alignItems: "center", gap: 6, padding: 8, borderRadius: 8, borderWidth: 1 },
  unrealisedText: { fontFamily: "Inter_500Medium", fontSize: 12, flex: 1 },
  profitRow: { padding: 8, borderRadius: 8 },
  profitText: { fontFamily: "Inter_600SemiBold", fontSize: 13, textAlign: "center" },
  expandDivider: { height: StyleSheet.hairlineWidth },
  expandLabel: { fontFamily: "Inter_400Regular", fontSize: 12 },
  expandValue: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  notesText: { fontFamily: "Inter_400Regular", fontSize: 12, fontStyle: "italic" },
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  actionText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  modalInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontFamily: "Inter_400Regular", fontSize: 14 },
  autofill: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  autofillText: { fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 },
  submitBtn: { paddingVertical: 14, borderRadius: 14, alignItems: "center", marginTop: 8 },
  submitText: { fontFamily: "Inter_700Bold", fontSize: 15 },
});
