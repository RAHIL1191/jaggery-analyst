import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Platform, KeyboardAvoidingView, ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useMarket } from "@/hooks/useMarket";
import { SEASONAL_MONTHLY } from "@/constants/seasonalData";
import {
  useAIConfig, isLocalProvider, getOllamaEndpoint, getCustomEndpoint,
  getModelPlaceholder, getApiBase,
} from "@/hooks/useAIConfig";

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

function buildRuleBasedResponse(
  question: string,
  snapshot: ReturnType<typeof useMarket>["snapshot"],
): string {
  if (!snapshot) return "I'm still loading market data. Please try again in a moment.";
  const q = question.toLowerCase();
  const price = snapshot.currentPrice;
  const rec = snapshot.recommendation;
  const month = new Date().getMonth();
  const seasonal = SEASONAL_MONTHLY[month];
  const festival = snapshot.upcomingFestivals[0];
  const harvest = snapshot.harvestInfo;

  if (q.includes("buy") && (q.includes("now") || q.includes("should") || q.includes("today"))) {
    if (rec === "BUY") return `✅ Yes — signal is BUY (${snapshot.confidence}% confidence).\n\nAt ₹${price.toLocaleString("en-IN")}/qtl:\n• ${seasonal.signal.includes("buy") ? `${seasonal.month} is historically a "${seasonal.signal.replace("_", " ")}" month (avg ₹${seasonal.avgPrice.toLocaleString("en-IN")}).` : "Within seasonal range."}\n${festival ? `• ${festival.name} in ${festival.daysUntil} days — +${festival.demandBoost}% demand.\n` : ""}• Harvest: ${harvest.phase} — ${harvest.priceEffect}\n\nTarget ₹${snapshot.targetPrice.toLocaleString("en-IN")} | Stop ₹${snapshot.stopLoss.toLocaleString("en-IN")}. Start with 40–50% of target quantity.`;
    if (rec === "HOLD") return `⏸️ Signal is HOLD (${snapshot.confidence}% confidence).\n\nMixed signals at ₹${price.toLocaleString("en-IN")}. ${festival ? `${festival.name} in ${festival.daysUntil} days — demand building but price may already reflect it.` : ""}\n\nBuy in tranches: 25% now, 25% in 2 weeks to average your cost.`;
    return `⚠️ Signal is SELL. Wait for a better entry. ${harvest.priceEffect === "bearish" ? "Peak harvest — supply at max, prices may fall further." : ""} Watch for prices near ₹${snapshot.monthLow.toLocaleString("en-IN")} (month low).`;
  }

  if (q.includes("sell") || q.includes("when") && q.includes("sell")) {
    if (festival && festival.daysUntil <= 30) return `🎯 Hold! ${festival.name} is ${festival.daysUntil} days away.\n\nFestival demand: +${festival.demandBoost}% → potential +₹${Math.round(price * festival.demandBoost / 200).toLocaleString("en-IN")}–₹${Math.round(price * festival.demandBoost / 150).toLocaleString("en-IN")}/qtl.\n\nSell 1–2 weeks after festival peak for best price.`;
    if (rec === "SELL") return `📉 SELL signal active (${snapshot.confidence}% confidence). Current ₹${price.toLocaleString("en-IN")}/qtl. ${harvest.priceEffect === "bearish" ? "New harvest increasing supply — prices may fall." : ""} If cost < ₹${Math.round(price * 0.92).toLocaleString("en-IN")}/qtl, selling now locks profit.`;
    return `Hold for Oct–Nov festival peak (Diwali, Chhath). Target ₹${snapshot.targetPrice.toLocaleString("en-IN")}/qtl.\n\n${seasonal.month} avg: ₹${seasonal.avgPrice.toLocaleString("en-IN")}. Current ₹${price.toLocaleString("en-IN")} is ${price > seasonal.avgPrice ? "ABOVE average — good for sellers." : "BELOW average — better to wait."}`;
  }

  if (q.includes("festival") || q.includes("diwali") || q.includes("demand")) {
    const festivals = snapshot.upcomingFestivals;
    if (!festivals.length) return "No major festivals in next 90 days. Build inventory for Sep–Nov (Ganesh Chaturthi → Navratri → Diwali → Chhath) — the biggest jaggery demand season.";
    return `🎉 Upcoming Festivals:\n\n${festivals.map((f) => `• ${f.name} — ${f.daysUntil === 0 ? "TODAY" : `${f.daysUntil} days`}\n  Impact: ${f.impact.toUpperCase()} · +${f.demandBoost}% demand\n  ${f.description.slice(0, 80)}…`).join("\n\n")}\n\nRule: Stock 4–6 weeks before a HIGH-impact festival. Sell 1–2 weeks before the date.`;
  }

  if (q.includes("grade") || q.includes("quality")) {
    return `🏆 Grade Strategy:\n\n• Grade A (Golden): ~₹${Math.round(price * 1.15).toLocaleString("en-IN")}/qtl — Export, premium confectioners (+15%)\n• Grade B (Standard): ₹${price.toLocaleString("en-IN")}/qtl — Most liquid, domestic wholesale\n• Grade C (Dark): ~₹${Math.round(price * 0.88).toLocaleString("en-IN")}/qtl — Avoid unless industrial buyer confirmed\n\nUpgrading B→A on 100 qtl adds ₹${Math.round(price * 0.15 * 100).toLocaleString("en-IN")} revenue.`;
  }

  if (q.includes("export") || q.includes("international")) {
    return `🌍 Export Premiums over ₹${price.toLocaleString("en-IN")} domestic:\n\n• UK/USA (Organic A): +48–55% → ₹${Math.round(price * 1.52).toLocaleString("en-IN")}–₹${Math.round(price * 1.55).toLocaleString("en-IN")}/qtl FOB\n• UAE (Halal A): +22% → ₹${Math.round(price * 1.22).toLocaleString("en-IN")}/qtl\n• Bangladesh (B/C): +12% → ₹${Math.round(price * 1.12).toLocaleString("en-IN")}/qtl\n\nNeeds APEDA registration. Organic cert adds biggest premium.`;
  }

  return `📊 Market Summary:\n\n• Price: ₹${price.toLocaleString("en-IN")}/qtl\n• Signal: ${rec} (${snapshot.confidence}%)\n• Harvest: ${harvest.phase}\n${festival ? `• Festival: ${festival.name} in ${festival.daysUntil} days (+${festival.demandBoost}%)\n` : ""}• ${seasonal.month}: historically "${seasonal.signal.replace("_", " ")}"\n\nTry: "Should I buy now?", "Best time to sell?", "Export opportunities?"`;
}

async function callAI(
  question: string,
  history: Message[],
  config: ReturnType<typeof useAIConfig>["config"],
  snapshot: ReturnType<typeof useMarket>["snapshot"],
): Promise<string> {
  const month = new Date().getMonth();
  const seasonal = snapshot ? SEASONAL_MONTHLY[month] : null;
  const festival = snapshot?.upcomingFestivals[0];
  const harvest = snapshot?.harvestInfo;

  const context = snapshot ? {
    currentPrice: snapshot.currentPrice,
    recommendation: snapshot.recommendation,
    confidence: snapshot.confidence,
    harvestPhase: harvest?.phase,
    harvestRegion: harvest?.region,
    harvestEffect: harvest?.priceEffect,
    upcomingFestival: festival?.name,
    festivalDays: festival?.daysUntil,
    festivalBoost: festival?.demandBoost,
    seasonalMonth: seasonal?.month,
    seasonalSignal: seasonal?.signal,
    mandiPrices: snapshot.regions?.map((r) => `${r.name}:₹${r.price}`).join(", "),
  } : {};

  const messages = [
    ...history.slice(-10).map((m) => ({ role: m.role as "user" | "assistant", content: m.text })),
    { role: "user" as const, content: question },
  ];

  if (isLocalProvider(config.provider)) {
    const endpoint = config.provider === "ollama"
      ? getOllamaEndpoint(config.baseUrl)
      : getCustomEndpoint(config.baseUrl);

    const systemPrompt = `You are a jaggery market expert. Current: ₹${snapshot?.currentPrice ?? "?"}/qtl, Signal: ${snapshot?.recommendation ?? "?"}, Harvest: ${harvest?.phase ?? "?"}.${festival ? ` Festival: ${festival.name} in ${festival.daysUntil} days.` : ""} Be concise and practical. Quote prices in ₹/quintal.`;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: config.model || getModelPlaceholder(config.provider),
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 600,
        stream: false,
        temperature: 0.65,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Local LLM error (${res.status}): ${text.slice(0, 200)}`);
    }

    const data = await res.json() as { choices: { message: { content: string } }[] };
    return data?.choices?.[0]?.message?.content ?? "No response from model.";
  }

  const res = await fetch(`${getApiBase()}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model || getModelPlaceholder(config.provider),
      context,
    }),
  });

  if (!res.ok) {
    const data = await res.json() as { error: string };
    throw new Error(data.error ?? `Server error ${res.status}`);
  }

  const data = await res.json() as { content: string };
  return data.content ?? "No response.";
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { snapshot } = useMarket();
  const { config } = useAIConfig();
  const scrollRef = useRef<ScrollView>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const aiActive = config.enabled && (
    isLocalProvider(config.provider) ? !!config.baseUrl : !!config.apiKey
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `👋 Namaskar! I'm your Jaggery Market Advisor.\n\n${aiActive ? `AI powered by ${config.provider === "openai" ? "OpenAI" : config.provider === "anthropic" ? "Anthropic" : config.provider === "ollama" ? "Ollama (local)" : "Custom LLM"} (${config.model || getModelPlaceholder(config.provider)}). Ask me anything!` : "Using built-in market analysis. Configure AI in Settings → Tools → AI & Data Settings for smarter, conversational responses."}`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (text: string) => {
    const userText = text.trim();
    if (!userText || isTyping) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput("");
    setError(null);

    const userMsg: Message = { id: `u_${Date.now()}`, role: "user", text: userText, timestamp: new Date() };
    setMessages((m) => [...m, userMsg]);
    setIsTyping(true);

    try {
      let responseText: string;

      if (aiActive) {
        responseText = await callAI(userText, messages, config, snapshot);
      } else {
        await new Promise((r) => setTimeout(r, 700 + Math.random() * 300));
        responseText = buildRuleBasedResponse(userText, snapshot);
      }

      const assistantMsg: Message = {
        id: `a_${Date.now()}`,
        role: "assistant",
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      const errMsg: Message = {
        id: `err_${Date.now()}`,
        role: "assistant",
        text: `⚠️ AI Error: ${msg}\n\nFalling back to built-in analysis:\n\n${buildRuleBasedResponse(userText, snapshot)}`,
        timestamp: new Date(),
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, config, snapshot, aiActive, isTyping]);

  const providerColor = config.provider === "openai" ? "#10A37F"
    : config.provider === "anthropic" ? "#D97706"
    : config.provider === "ollama" ? "#7C3AED"
    : "#0284C7";

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <View style={[styles.aiAvatar, { backgroundColor: aiActive ? providerColor + "20" : colors.muted }]}>
            <Feather name={aiActive ? "cpu" : "message-circle"} size={18} color={aiActive ? providerColor : colors.mutedForeground} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.topBarTitle, { color: colors.foreground }]}>Market Advisor</Text>
            <View style={styles.onlineRow}>
              <View style={[styles.onlineDot, { backgroundColor: aiActive ? providerColor : colors.hold }]} />
              <Text style={[styles.onlineText, { color: colors.mutedForeground }]}>
                {aiActive
                  ? `${config.provider === "ollama" ? "Ollama" : config.provider === "custom" ? "Custom LLM" : config.provider === "openai" ? "OpenAI" : "Anthropic"} · ${config.model || getModelPlaceholder(config.provider)}`
                  : "Built-in analysis · Configure AI in Settings"}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/settings")} style={[styles.settingsBtn, { backgroundColor: colors.muted }]}>
            <Feather name="settings" size={15} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* AI not configured banner */}
      {!aiActive && config.enabled && (
        <TouchableOpacity onPress={() => router.push("/(tabs)/settings")} style={[styles.configBanner, { backgroundColor: colors.hold + "12", borderColor: colors.hold + "30" }]}>
          <Feather name="alert-circle" size={13} color={colors.hold} />
          <Text style={[styles.configBannerText, { color: colors.hold }]}>
            AI enabled but {isLocalProvider(config.provider) ? "Base URL" : "API key"} not set. Tap to configure →
          </Text>
        </TouchableOpacity>
      )}

      {!config.enabled && (
        <TouchableOpacity onPress={() => router.push("/(tabs)/settings")} style={[styles.configBanner, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" }]}>
          <Feather name="zap" size={13} color={colors.primary} />
          <Text style={[styles.configBannerText, { color: colors.primary }]}>
            Connect AI (OpenAI, Anthropic, or local Ollama) for smarter advice → Settings
          </Text>
        </TouchableOpacity>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messageList}
        contentContainerStyle={[styles.messageContent, { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 130 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.bubble,
              msg.role === "user" ? styles.userBubble : styles.aiBubble,
              {
                backgroundColor: msg.role === "user" ? colors.primary : colors.card,
                borderColor: msg.role === "user" ? "transparent" : colors.border,
              },
            ]}
          >
            {msg.role === "assistant" && (
              <View style={[styles.botIcon, { backgroundColor: aiActive ? providerColor + "18" : colors.muted }]}>
                <Feather name={aiActive ? "cpu" : "message-circle"} size={11} color={aiActive ? providerColor : colors.mutedForeground} />
              </View>
            )}
            <Text style={[styles.bubbleText, { color: msg.role === "user" ? colors.primaryForeground : colors.foreground }]}>
              {msg.text}
            </Text>
            <Text style={[styles.bubbleTime, { color: msg.role === "user" ? colors.primaryForeground + "80" : colors.mutedForeground }]}>
              {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
            </Text>
          </View>
        ))}

        {isTyping && (
          <View style={[styles.bubble, styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.botIcon, { backgroundColor: aiActive ? providerColor + "18" : colors.muted }]}>
              <Feather name="cpu" size={11} color={aiActive ? providerColor : colors.mutedForeground} />
            </View>
            <View style={styles.typingRow}>
              <ActivityIndicator size="small" color={aiActive ? providerColor : colors.mutedForeground} />
              <Text style={[styles.typingText, { color: colors.mutedForeground }]}>
                {aiActive ? "Thinking…" : "Analysing…"}
              </Text>
            </View>
          </View>
        )}

        {messages.length === 1 && !isTyping && (
          <View style={styles.suggestions}>
            <Text style={[styles.suggestLabel, { color: colors.mutedForeground }]}>Try asking:</Text>
            <View style={styles.suggestGrid}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <TouchableOpacity
                  key={q}
                  onPress={() => sendMessage(q)}
                  style={[styles.suggestChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Text style={[styles.suggestText, { color: colors.foreground }]}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Platform.OS === "web" ? 16 : insets.bottom + 100 }]}>
        <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={aiActive ? `Ask your ${config.provider} advisor…` : "Ask about market, prices, export, storage…"}
            placeholderTextColor={colors.mutedForeground}
            style={[styles.textInput, { color: colors.foreground }]}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            style={[styles.sendBtn, { backgroundColor: input.trim() && !isTyping ? (aiActive ? providerColor : colors.primary) : colors.muted }]}
          >
            {isTyping
              ? <ActivityIndicator size="small" color={colors.mutedForeground} />
              : <Feather name="send" size={16} color={input.trim() ? colors.primaryForeground : colors.mutedForeground} />
            }
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  settingsBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  topBarCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  aiAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  topBarTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  onlineText: { fontFamily: "Inter_400Regular", fontSize: 11 },
  configBanner: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginTop: 8, padding: 10, borderRadius: 8, borderWidth: 1 },
  configBannerText: { fontFamily: "Inter_500Medium", fontSize: 12, flex: 1 },
  messageList: { flex: 1 },
  messageContent: { padding: 16, gap: 12 },
  bubble: { maxWidth: "86%", borderRadius: 16, padding: 12, borderWidth: 1, gap: 6 },
  userBubble: { alignSelf: "flex-end", borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  botIcon: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  bubbleText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  bubbleTime: { fontFamily: "Inter_400Regular", fontSize: 10, textAlign: "right" },
  typingRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 2 },
  typingText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  suggestions: { gap: 10, marginTop: 4 },
  suggestLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },
  suggestGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  suggestText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  inputBar: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  inputWrap: { flexDirection: "row", alignItems: "flex-end", gap: 8, borderRadius: 24, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  textInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, maxHeight: 80, minHeight: 20 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
