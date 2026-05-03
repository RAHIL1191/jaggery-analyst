import React, { useState, useRef, useEffect, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useMarket } from "@/hooks/useMarket";
import { SEASONAL_MONTHLY } from "@/constants/seasonalData";

type Message = { id: string; role: "user" | "assistant"; text: string; timestamp: Date };

const SUGGESTED_QUESTIONS = [
  "Should I buy jaggery now?",
  "Best time to sell my stock?",
  "How do festivals affect prices?",
  "What is the best grade to trade?",
  "How to maximise export profit?",
  "What does the harvest season mean?",
  "How much profit can I make this month?",
  "Is transport from Muzaffarnagar to Delhi profitable?",
];

function generateAdvisorResponse(question: string, snapshot: ReturnType<typeof useMarket>["snapshot"]): string {
  if (!snapshot) return "I'm still loading market data. Please try again in a moment.";

  const q = question.toLowerCase();
  const price = snapshot.currentPrice;
  const rec = snapshot.recommendation;
  const month = new Date().getMonth();
  const seasonal = SEASONAL_MONTHLY[month];
  const festival = snapshot.upcomingFestivals[0];
  const harvest = snapshot.harvestInfo;

  if (q.includes("buy") && (q.includes("now") || q.includes("should") || q.includes("today"))) {
    if (rec === "BUY") return `✅ Yes — the current signal is BUY (${snapshot.confidence}% confidence).\n\nAt ₹${price.toLocaleString("en-IN")}/qtl, this is a good entry point. Here's why:\n\n• ${seasonal.signal.includes("buy") ? `Seasonal pattern: ${seasonal.month} is historically a "${seasonal.signal.replace("_", " ")}" month (avg ₹${seasonal.avgPrice.toLocaleString("en-IN")}).` : `Current price is within seasonal range.`}\n${festival ? `• Festival demand: ${festival.name} is ${festival.daysUntil} days away — expect +${festival.demandBoost}% demand boost.\n` : ""}• Harvest phase: ${harvest.phase} — ${harvest.priceEffect === "bearish" ? "supply is high, prices are at seasonal lows. Great stocking opportunity." : harvest.priceEffect === "bullish" ? "supply is tightening, prices rising." : "transitional phase."}\n\nTarget: ₹${snapshot.targetPrice.toLocaleString("en-IN")} | Stop Loss: ₹${snapshot.stopLoss.toLocaleString("en-IN")}\n\nSuggestion: Start with 40–50% of your target quantity. Add more if price dips further.`;
    if (rec === "HOLD") return `⏸️ The signal is HOLD (${snapshot.confidence}% confidence).\n\nCurrent price: ₹${price.toLocaleString("en-IN")}/qtl. Mixed signals right now:\n\n${festival ? `• ${festival.name} is ${festival.daysUntil} days away — demand building but price already pricing it in.\n` : ""}• ${harvest.phase}: ${harvest.description.slice(0, 100)}…\n\nIf you need to buy, consider buying in tranches (e.g., 25% now, 25% in 2 weeks) to average your cost. Don't commit the full quantity at current prices.`;
    return `⚠️ The signal is SELL (${snapshot.confidence}% confidence).\n\nCurrent price ₹${price.toLocaleString("en-IN")}/qtl may face further downward pressure. ${harvest.priceEffect === "bearish" ? "We're in peak harvest — supply is at maximum and prices are likely to fall further." : ""}\n\nRecommendation: Wait for prices to find a base before buying. Watch for prices near ₹${snapshot.monthLow.toLocaleString("en-IN")} (this month's low) for a better entry.`;
  }

  if (q.includes("sell") || (q.includes("stock") && q.includes("sell"))) {
    if (rec === "SELL") return `📉 Yes — the SELL signal is active (${snapshot.confidence}% confidence).\n\nAt ₹${price.toLocaleString("en-IN")}/qtl, current conditions favour selling:\n\n${harvest.priceEffect === "bearish" ? `• New harvest arriving — supply will increase, pushing prices lower.\n` : ""}${!festival ? "• No major festival demand expected in the next 30 days.\n" : `• ${festival.name} in ${festival.daysUntil} days — if you can hold until then, demand may give you +${festival.demandBoost}% more.\n`}\n\nIf your cost of acquisition was below ₹${Math.round(price * 0.92).toLocaleString("en-IN")}/qtl, selling now locks in profit. Don't wait too long.`;
    if (festival && festival.daysUntil <= 30) return `🎯 Not yet — wait for the festival peak!\n\n${festival.name} is only ${festival.daysUntil} days away. Historical data shows +${festival.demandBoost}% demand boost brings prices up ₹${Math.round(price * festival.demandBoost / 100).toLocaleString("en-IN")}–₹${Math.round(price * festival.demandBoost * 1.2 / 100).toLocaleString("en-IN")}/qtl.\n\nCurrent price: ₹${price.toLocaleString("en-IN")} → Festival peak estimate: ₹${Math.round(price * (1 + festival.demandBoost / 200)).toLocaleString("en-IN")}–₹${Math.round(price * (1 + festival.demandBoost / 150)).toLocaleString("en-IN")}/qtl.\n\nHold if your storage costs allow. Sell 1–2 weeks after the festival to catch the peak, not the day of.`;
    return `📊 Hold your stock for now. Current signal is ${rec}.\n\nThe best sell months historically are October–November (Diwali + Chhath season). This year, target selling when price reaches ₹${snapshot.targetPrice.toLocaleString("en-IN")}/qtl.\n\nSeasonal context: ${seasonal.month} average is ₹${seasonal.avgPrice.toLocaleString("en-IN")}. Current price ₹${price.toLocaleString("en-IN")} is ${price > seasonal.avgPrice ? "ABOVE average — good for sellers." : "BELOW average — better to wait."}`;
  }

  if (q.includes("festival") || q.includes("diwali") || q.includes("pongal") || q.includes("demand")) {
    const festivals = snapshot.upcomingFestivals;
    if (festivals.length === 0) return `No major festivals in the next 90 days. This is a quieter demand period — focus on building inventory for the next festival cycle.\n\nNext high-impact period: September–November (Ganesh Chaturthi → Navratri → Diwali → Chhath) is the biggest jaggery demand window of the year. Stock up in June–August at off-season prices.`;
    return `🎉 Upcoming Festivals & Price Impact:\n\n${festivals.map((f) => `• **${f.name}** — ${f.daysUntil === 0 ? "TODAY" : `${f.daysUntil} days`}\n  Impact: ${f.impact.toUpperCase()} · +${f.demandBoost}% demand boost\n  ${f.description}`).join("\n\n")}\n\nRule of thumb: Stock 4–6 weeks before a HIGH-impact festival. Prices peak 1–2 weeks before the festival date, then cool off. Don't wait till the day of.`;
  }

  if (q.includes("grade") || q.includes("quality") || q.includes("a grade") || q.includes("b grade")) {
    return `🏆 Grade Trading Strategy:\n\n**Grade A (Golden, >75% sucrose)**\n• Price: ~₹${Math.round(price * 1.15).toLocaleString("en-IN")}/qtl\n• Best for: Export (UK, USA, UAE), premium confectioners\n• Return: 15% premium over Grade B\n\n**Grade B (Standard)** — ₹${price.toLocaleString("en-IN")}/qtl\n• Best for: Domestic wholesale, retail market\n• Most liquid — easiest to sell\n\n**Grade C (Dark/Coarse)** — ₹${Math.round(price * 0.88).toLocaleString("en-IN")}/qtl\n• Avoid unless you have a specific industrial buyer lined up\n\n💡 Tip: If you can upgrade from Grade B to Grade A through better cane selection and processing, the ₹${Math.round(price * 0.15).toLocaleString("en-IN")}/qtl premium adds up fast on 100+ quintal batches.`;
  }

  if (q.includes("export") || q.includes("international") || q.includes("uk") || q.includes("usa") || q.includes("abroad")) {
    return `🌍 Export Profit Opportunity:\n\nDomestic price today: ₹${price.toLocaleString("en-IN")}/qtl\n\n**Top export premiums:**\n• UK/USA (Organic Grade A): +48–55% → ₹${Math.round(price * 1.52).toLocaleString("en-IN")}–₹${Math.round(price * 1.55).toLocaleString("en-IN")}/qtl FOB\n• UAE/Gulf (Halal Grade A): +22% → ₹${Math.round(price * 1.22).toLocaleString("en-IN")}/qtl FOB\n• Bangladesh (Grade B/C): +12% → ₹${Math.round(price * 1.12).toLocaleString("en-IN")}/qtl FOB\n\n**To access export markets:**\n1. Get APEDA registration (apeda.gov.in)\n2. Get FSSAI export certificate\n3. For organic: get organic certification (APOF/IMO)\n4. Contact export agents in Muzaffarnagar or Kolhapur\n\nOrganics are the highest-margin opportunity — the ₹${Math.round(price * 0.55).toLocaleString("en-IN")}/qtl premium easily covers certification costs.`;
  }

  if (q.includes("harvest") || q.includes("season") || q.includes("crushing")) {
    return `🌾 Harvest Season Explained:\n\n**${harvest.phase}** (${harvest.region})\n${harvest.description}\n\n**Price effect:** ${harvest.priceEffect.toUpperCase()}\n\n📅 Annual Cycle:\n• Oct–Dec: Pre-harvest, mills start, supply building → bearish\n• Jan–Mar: PEAK harvest in UP & Maharashtra → LOWEST prices → BEST BUY window\n• Apr–Jun: South harvest, north off-season → prices recovering → HOLD/SELL\n• Jul–Sep: Off-season, stocks depleting → prices rising → SELL stored stock\n\nCurrent month (${seasonal.month}): ${seasonal.notes}`;
  }

  if (q.includes("profit") || q.includes("money") || q.includes("earn") || q.includes("maximise") || q.includes("maximize")) {
    const festProfit = festival ? Math.round(price * festival.demandBoost / 100) : 0;
    return `💰 Profit Maximisation Strategy:\n\n**Step 1: Buy at seasonal low (Feb)**\nHistorical average: ₹3,650/qtl. This year aim for ₹${Math.round(price * 0.88).toLocaleString("en-IN")}–₹${Math.round(price * 0.92).toLocaleString("en-IN")}/qtl.\n\n**Step 2: Choose Grade A or Organic**\nGrade A gets ₹${Math.round(price * 0.15).toLocaleString("en-IN")}/qtl more. Organic gets 28% more for export.\n\n**Step 3: Store efficiently**\nUse lowest-cost cold storage (₹30–38/qtl/month in Muzaffarnagar). For 3 months: ₹${90 * 35}/qtl storage cost.\n\n**Step 4: Sell at festival peak (Oct–Nov)**\nDiwali season historically adds ₹800–1,200/qtl above Feb lows.${festival ? `\n\n**Upcoming opportunity:** ${festival.name} in ${festival.daysUntil} days could add +₹${festProfit.toLocaleString("en-IN")}/qtl.` : ""}\n\n**Step 5: Export for maximum premium**\nExport to UK/USA as organic = 48–55% above domestic. Best ROI path.`;
  }

  if (q.includes("transport") || q.includes("muzaffarnagar") || q.includes("delhi")) {
    return `🚛 Muzaffarnagar to Delhi NCR Transport:\n\nDistance: ~120 km\nMode: Road (most common)\n\n**Cost breakdown (per 100 quintals = 10 MT):**\n• Freight: ₹3.2/km/MT × 120 km × 10 MT = ₹3,840\n• Loading/Unloading: ₹280/MT × 10 MT = ₹2,800\n• Toll: ~₹480 (1 truck)\n• **Total transport: ₹7,120 = ₹71/quintal**\n\nLanded cost: ₹${(price + 71).toLocaleString("en-IN")}/qtl in Delhi\n\n**Is it viable?** Delhi market typically pays ₹50–150/qtl more than Muzaffarnagar mandi for same grade jaggery (logistics convenience premium). With ₹71/qtl transport cost, this route has thin margins unless you have a direct buyer in Delhi.\n\n💡 Consider: Direct sales to Delhi-based halwais or sweet shops can fetch ₹200–300/qtl premium.`;
  }

  if (q.includes("storage") || q.includes("cold storage") || q.includes("stock")) {
    return `🏭 Storage Strategy:\n\n**Best value storage rates by region:**\n• Muzaffarnagar (UP): ₹30–38/qtl/month\n• Kolhapur (MH): ₹35–42/qtl/month\n• Erode (TN): ₹38–44/qtl/month\n\n**Stocking signal today:** ${snapshot.recommendation === "BUY" ? "✅ STOCK NOW" : snapshot.recommendation === "HOLD" ? "⏸️ PARTIAL STOCK" : "⚠️ WAIT — prices may fall"}\n\n**3-month storage economics:**\nStorage cost: ~₹35/qtl × 3 months = ₹105/qtl\nExpected price gain (off-season): ₹300–500/qtl\n**Net profit from storage: ₹195–395/qtl**\n\n💡 Only stock when the expected price gain exceeds storage cost + opportunity cost of capital.`;
  }

  return `📊 Here's my analysis based on today's market:\n\n**Current Price:** ₹${price.toLocaleString("en-IN")}/qtl\n**Signal:** ${rec} (${snapshot.confidence}% confidence)\n**Harvest Phase:** ${harvest.phase}\n${festival ? `**Next Festival:** ${festival.name} in ${festival.daysUntil} days (+${festival.demandBoost}% demand)\n` : ""}**Seasonal Context:** ${seasonal.month} is typically a "${seasonal.signal.replace("_", " ")}" month with average price ₹${seasonal.avgPrice.toLocaleString("en-IN")}.\n\nTry asking me something specific like:\n• "Should I buy now?"\n• "When is the best time to sell?"\n• "How do festivals affect prices?"\n• "How to maximise export profit?"`;
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { snapshot } = useMarket();
  const scrollRef = useRef<ScrollView>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "👋 Namaskar! I'm your AI Jaggery Market Advisor.\n\nI have access to today's live market data, seasonal trends, festival calendar, and harvest patterns. Ask me anything about buying, selling, storage, export, or market strategy!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    const userText = text.trim();
    if (!userText) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput("");

    const userMsg: Message = { id: `u_${Date.now()}`, role: "user", text: userText, timestamp: new Date() };
    setMessages((m) => [...m, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAdvisorResponse(userText, snapshot);
      const assistantMsg: Message = { id: `a_${Date.now()}`, role: "assistant", text: response, timestamp: new Date() };
      setMessages((m) => [...m, assistantMsg]);
      setIsTyping(false);
    }, 900 + Math.random() * 400);
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>
      <View style={[styles.topBar, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <View style={[styles.aiAvatar, { backgroundColor: colors.primary + "20" }]}>
            <Feather name="cpu" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.topBarTitle, { color: colors.foreground }]}>AI Market Advisor</Text>
            <View style={styles.onlineRow}>
              <View style={[styles.onlineDot, { backgroundColor: colors.buy }]} />
              <Text style={[styles.onlineText, { color: colors.mutedForeground }]}>
                {snapshot ? `Live · ₹${snapshot.currentPrice.toLocaleString("en-IN")}/qtl · ${snapshot.recommendation}` : "Loading market data…"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView ref={scrollRef} style={styles.messageList} contentContainerStyle={[styles.messageContent, { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 130 }]} showsVerticalScrollIndicator={false}>
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.messageBubble, msg.role === "user" ? styles.userBubble : styles.assistantBubble, { backgroundColor: msg.role === "user" ? colors.primary : colors.card, borderColor: msg.role === "user" ? "transparent" : colors.border }]}>
            {msg.role === "assistant" && (
              <View style={[styles.botAvatarSmall, { backgroundColor: colors.primary + "15" }]}>
                <Feather name="cpu" size={12} color={colors.primary} />
              </View>
            )}
            <Text style={[styles.messageText, { color: msg.role === "user" ? colors.primaryForeground : colors.foreground }]}>{msg.text}</Text>
            <Text style={[styles.msgTime, { color: msg.role === "user" ? colors.primaryForeground + "80" : colors.mutedForeground }]}>
              {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
            </Text>
          </View>
        ))}
        {isTyping && (
          <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.botAvatarSmall, { backgroundColor: colors.primary + "15" }]}>
              <Feather name="cpu" size={12} color={colors.primary} />
            </View>
            <View style={styles.typingDots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.dot, { backgroundColor: colors.mutedForeground }]} />
              ))}
            </View>
          </View>
        )}

        {messages.length === 1 && (
          <View style={styles.suggestionsWrap}>
            <Text style={[styles.suggestLabel, { color: colors.mutedForeground }]}>Try asking:</Text>
            <View style={styles.suggestionsGrid}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <TouchableOpacity key={q} onPress={() => sendMessage(q)} style={[styles.suggestChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.suggestText, { color: colors.foreground }]}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Platform.OS === "web" ? 16 : insets.bottom + 100 }]}>
        <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about price, buy/sell, export, storage…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            multiline
            maxLength={300}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={() => sendMessage(input)} disabled={!input.trim() || isTyping} style={[styles.sendBtn, { backgroundColor: input.trim() && !isTyping ? colors.primary : colors.muted }]}>
            <Feather name="send" size={16} color={input.trim() && !isTyping ? colors.primaryForeground : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  topBarCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  aiAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  topBarTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  onlineText: { fontFamily: "Inter_400Regular", fontSize: 11 },
  messageList: { flex: 1 },
  messageContent: { padding: 16, gap: 12 },
  messageBubble: { maxWidth: "85%", borderRadius: 16, padding: 12, borderWidth: 1, gap: 6 },
  userBubble: { alignSelf: "flex-end", borderBottomRightRadius: 4 },
  assistantBubble: { alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  botAvatarSmall: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  messageText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  msgTime: { fontFamily: "Inter_400Regular", fontSize: 10, textAlign: "right" },
  typingDots: { flexDirection: "row", gap: 4, alignItems: "center", padding: 4 },
  dot: { width: 7, height: 7, borderRadius: 3.5, opacity: 0.6 },
  suggestionsWrap: { gap: 10, marginTop: 4 },
  suggestLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },
  suggestionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  suggestText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  inputBar: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  inputWrap: { flexDirection: "row", alignItems: "flex-end", gap: 8, borderRadius: 24, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  input: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, maxHeight: 80 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
