import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useMarket } from "@/hooks/useMarket";
import { useAlerts, PriceAlert } from "@/hooks/useMarket";

export default function AlertsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { snapshot } = useMarket();
  const { alerts, addAlert, removeAlert } = useAlerts();
  const [showForm, setShowForm] = useState(false);
  const [alertType, setAlertType] = useState<"above" | "below">("above");
  const [priceInput, setPriceInput] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleAdd = () => {
    const price = parseInt(priceInput, 10);
    if (!price || price < 2000 || price > 8000) {
      Alert.alert("Invalid Price", "Enter a valid price between ₹2,000 and ₹8,000");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addAlert(alertType, price);
    setPriceInput("");
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeAlert(id);
  };

  const currentPrice = snapshot?.currentPrice ?? 0;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.foreground }]}>Price Alerts</Text>
        <TouchableOpacity
          onPress={() => setShowForm(!showForm)}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name={showForm ? "x" : "plus"} size={18} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>

      {currentPrice > 0 && (
        <View style={[styles.currentBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="activity" size={14} color={colors.primary} />
          <Text style={[styles.currentText, { color: colors.mutedForeground }]}>
            Current price:{" "}
            <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>
              ₹{currentPrice.toLocaleString("en-IN")}
            </Text>
            {" "}/ quintal
          </Text>
        </View>
      )}

      {showForm && (
        <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.foreground }]}>New Alert</Text>

          <View style={styles.typeRow}>
            {(["above", "below"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setAlertType(t)}
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor:
                      alertType === t
                        ? t === "above"
                          ? colors.buy + "20"
                          : colors.sell + "20"
                        : colors.muted,
                    borderColor:
                      alertType === t
                        ? t === "above"
                          ? colors.buy
                          : colors.sell
                        : colors.border,
                  },
                ]}
              >
                <Feather
                  name={t === "above" ? "arrow-up" : "arrow-down"}
                  size={14}
                  color={
                    alertType === t
                      ? t === "above"
                        ? colors.buy
                        : colors.sell
                      : colors.mutedForeground
                  }
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    {
                      color:
                        alertType === t
                          ? t === "above"
                            ? colors.buy
                            : colors.sell
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  Price goes {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[styles.rupeeSign, { color: colors.mutedForeground }]}>₹</Text>
            <TextInput
              value={priceInput}
              onChangeText={setPriceInput}
              placeholder="Enter price (e.g. 4500)"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              style={[styles.input, { color: colors.foreground }]}
            />
            <Text style={[styles.inputUnit, { color: colors.mutedForeground }]}>/ qtl</Text>
          </View>

          <TouchableOpacity
            onPress={handleAdd}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.submitText, { color: colors.primaryForeground }]}>
              Set Alert
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {alerts.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
            <Feather name="bell-off" size={28} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No alerts set</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Tap the + button to add a price alert for jaggery
          </Text>
        </View>
      ) : (
        <View style={[styles.alertList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.listTitle, { color: colors.foreground }]}>Active Alerts</Text>
          {alerts.map((alert: PriceAlert, i: number) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              colors={colors}
              onDelete={() => handleDelete(alert.id)}
              isLast={i === alerts.length - 1}
              currentPrice={currentPrice}
            />
          ))}
        </View>
      )}

      <View style={[styles.infoSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.infoTitle, { color: colors.foreground }]}>Quick Alert Levels</Text>
        <View style={styles.quickGrid}>
          {[
            { label: "Harvest Low", price: 3800, type: "below" as const },
            { label: "Seasonal High", price: 5000, type: "above" as const },
            { label: "MSP Floor", price: 3600, type: "below" as const },
            { label: "Export Trigger", price: 5200, type: "above" as const },
          ].map((q) => (
            <TouchableOpacity
              key={q.label}
              onPress={() => {
                addAlert(q.type, q.price);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.quickBtn,
                {
                  backgroundColor:
                    q.type === "above" ? colors.buy + "12" : colors.sell + "12",
                  borderColor: q.type === "above" ? colors.buy + "30" : colors.sell + "30",
                },
              ]}
            >
              <Text style={[styles.quickLabel, { color: colors.mutedForeground }]}>{q.label}</Text>
              <Text
                style={[
                  styles.quickPrice,
                  { color: q.type === "above" ? colors.buy : colors.sell },
                ]}
              >
                ₹{q.price.toLocaleString("en-IN")}
              </Text>
              <Feather
                name={q.type === "above" ? "arrow-up-right" : "arrow-down-right"}
                size={12}
                color={q.type === "above" ? colors.buy : colors.sell}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function AlertItem({
  alert,
  colors,
  onDelete,
  isLast,
  currentPrice,
}: {
  alert: PriceAlert;
  colors: ReturnType<typeof useColors>;
  onDelete: () => void;
  isLast: boolean;
  currentPrice: number;
}) {
  const isTriggered =
    alert.type === "above"
      ? currentPrice >= alert.price
      : currentPrice <= alert.price;
  const accentColor = alert.type === "above" ? colors.buy : colors.sell;

  return (
    <View
      style={[
        styles.alertItem,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
      ]}
    >
      <View style={[styles.alertIcon, { backgroundColor: accentColor + "15" }]}>
        <Feather
          name={alert.type === "above" ? "arrow-up" : "arrow-down"}
          size={14}
          color={accentColor}
        />
      </View>
      <View style={styles.alertContent}>
        <Text style={[styles.alertLabel, { color: colors.foreground }]}>{alert.label}</Text>
        {isTriggered && (
          <View style={styles.triggeredRow}>
            <View style={[styles.triggeredDot, { backgroundColor: colors.buy }]} />
            <Text style={[styles.triggeredText, { color: colors.buy }]}>Triggered now</Text>
          </View>
        )}
      </View>
      <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Feather name="trash-2" size={16} color={colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  addBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  currentBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  currentText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  form: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  formTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  typeRow: { flexDirection: "row", gap: 10 },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  typeBtnText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    gap: 4,
  },
  rupeeSign: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  input: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 16, height: 48 },
  inputUnit: { fontFamily: "Inter_400Regular", fontSize: 12 },
  submitBtn: {
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  empty: { alignItems: "center", gap: 12, paddingVertical: 40 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", maxWidth: 240 },
  alertList: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 4,
  },
  listTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 4 },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  alertIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  alertContent: { flex: 1, gap: 2 },
  alertLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  triggeredRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  triggeredDot: { width: 5, height: 5, borderRadius: 2.5 },
  triggeredText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  infoSection: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  infoTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickBtn: {
    width: "47%",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  quickLabel: { fontFamily: "Inter_400Regular", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  quickPrice: { fontFamily: "Inter_700Bold", fontSize: 16 },
});
