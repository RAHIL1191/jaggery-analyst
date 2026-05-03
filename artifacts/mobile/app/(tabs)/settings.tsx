import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Platform, Switch, Alert, ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import {
  useAIConfig, AIProvider, AIConfig,
  isLocalProvider, getOllamaEndpoint, getCustomEndpoint,
  getModelPlaceholder, getBaseUrlPlaceholder, getApiBase,
} from "@/hooks/useAIConfig";

type ProviderCard = {
  id: AIProvider;
  label: string;
  icon: string;
  subtitle: string;
  color: string;
  isLocal: boolean;
};

const PROVIDERS: ProviderCard[] = [
  { id: "openai", label: "OpenAI", icon: "zap", subtitle: "GPT-4o, GPT-4o Mini", color: "#10A37F", isLocal: false },
  { id: "anthropic", label: "Anthropic", icon: "cpu", subtitle: "Claude 3.5, Haiku", color: "#D97706", isLocal: false },
  { id: "ollama", label: "Ollama (Local)", icon: "server", subtitle: "Llama, Phi, Gemma…", color: "#7C3AED", isLocal: true },
  { id: "custom", label: "Custom / LM Studio", icon: "settings", subtitle: "Any OpenAI-compatible", color: "#0284C7", isLocal: true },
];

const OPENAI_MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"];
const ANTHROPIC_MODELS = ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-haiku-20240307"];
const OLLAMA_MODELS = ["llama3.2", "llama3.1", "phi4", "gemma2", "mistral", "qwen2.5", "deepseek-r1"];

function getModelSuggestions(provider: AIProvider): string[] {
  if (provider === "openai") return OPENAI_MODELS;
  if (provider === "anthropic") return ANTHROPIC_MODELS;
  if (provider === "ollama") return OLLAMA_MODELS;
  return [];
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { config, loading, updateConfig, resetConfig } = useAIConfig();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  const update = useCallback(<K extends keyof AIConfig>(key: K, value: AIConfig[K]) => {
    updateConfig({ [key]: value });
    setTestResult(null);
  }, [updateConfig]);

  const testConnection = useCallback(async () => {
    if (!config.enabled) {
      setTestResult({ ok: false, message: "Enable AI Assistant first." });
      return;
    }
    setTesting(true);
    setTestResult(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const testMessages = [{ role: "user" as const, content: "Reply with exactly 3 words: 'Connection test successful'" }];

    try {
      if (isLocalProvider(config.provider)) {
        const endpoint = config.provider === "ollama"
          ? getOllamaEndpoint(config.baseUrl)
          : getCustomEndpoint(config.baseUrl);

        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`;

        const res = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: config.model || getModelPlaceholder(config.provider),
            messages: testMessages,
            max_tokens: 20,
            stream: false,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
        }
        const data = await res.json() as { choices: { message: { content: string } }[] };
        const content = data?.choices?.[0]?.message?.content;
        setTestResult({ ok: true, message: `Connected! Response: "${content?.slice(0, 60) ?? "ok"}"` });
      } else {
        const res = await fetch(`${getApiBase()}/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: testMessages,
            provider: config.provider,
            apiKey: config.apiKey,
            model: config.model,
          }),
        });

        if (!res.ok) {
          const data = await res.json() as { error: string };
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }
        const data = await res.json() as { content: string };
        setTestResult({ ok: true, message: `Connected to ${config.provider}! Response: "${data.content?.slice(0, 60) ?? "ok"}"` });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({ ok: false, message: msg });
    } finally {
      setTesting(false);
    }
  }, [config]);

  const confirmReset = () => {
    Alert.alert("Reset All Settings", "This will clear your API key, model config, and manual price. Continue?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: resetConfig },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const selectedProvider = PROVIDERS.find((p) => p.id === config.provider)!;
  const modelSuggestions = getModelSuggestions(config.provider);
  const isLocal = isLocalProvider(config.provider);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 110 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>AI & Data Settings</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Configure AI advisor & live price source</Text>
        </View>
      </View>

      {/* ── SECTION: AI ASSISTANT ── */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: colors.primary + "18" }]}>
            <Feather name="cpu" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>AI Assistant</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              {config.enabled ? `Active · ${selectedProvider.label} · ${config.model || getModelPlaceholder(config.provider)}` : "Disabled — using built-in rule-based advisor"}
            </Text>
          </View>
          <Switch
            value={config.enabled}
            onValueChange={(v) => update("enabled", v)}
            trackColor={{ false: colors.muted, true: colors.primary + "60" }}
            thumbColor={config.enabled ? colors.primary : colors.mutedForeground}
          />
        </View>

        {config.enabled && (
          <>
            {/* Provider Cards */}
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Provider</Text>
            <View style={styles.providerGrid}>
              {PROVIDERS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => { update("provider", p.id); update("model", ""); }}
                  style={[styles.providerCard, {
                    backgroundColor: config.provider === p.id ? p.color + "15" : colors.muted,
                    borderColor: config.provider === p.id ? p.color : colors.border,
                    borderWidth: config.provider === p.id ? 1.5 : 1,
                  }]}
                >
                  <Feather name={p.icon as "zap"} size={18} color={config.provider === p.id ? p.color : colors.mutedForeground} />
                  <Text style={[styles.providerLabel, { color: config.provider === p.id ? p.color : colors.foreground }]}>{p.label}</Text>
                  <Text style={[styles.providerSub, { color: colors.mutedForeground }]}>{p.subtitle}</Text>
                  {p.isLocal && (
                    <View style={[styles.localBadge, { backgroundColor: "#7C3AED18" }]}>
                      <Text style={[styles.localBadgeText, { color: "#7C3AED" }]}>LOCAL</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Cloud: API Key */}
            {!isLocal && (
              <>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                  {config.provider === "openai" ? "OpenAI API Key" : "Anthropic API Key"}
                </Text>
                <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <TextInput
                    value={config.apiKey}
                    onChangeText={(v) => update("apiKey", v)}
                    placeholder={config.provider === "openai" ? "sk-..." : "sk-ant-..."}
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={!showKey}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[styles.input, { color: colors.foreground }]}
                  />
                  <TouchableOpacity onPress={() => setShowKey(!showKey)} style={styles.eyeBtn}>
                    <Feather name={showKey ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  {config.provider === "openai"
                    ? "Get your key at platform.openai.com → API Keys. Stored only on your device."
                    : "Get your key at console.anthropic.com → API Keys. Stored only on your device."}
                </Text>
              </>
            )}

            {/* Local: Base URL */}
            {isLocal && (
              <>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                  {config.provider === "ollama" ? "Ollama Server URL" : "API Base URL"}
                </Text>
                <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <TextInput
                    value={config.baseUrl}
                    onChangeText={(v) => update("baseUrl", v)}
                    placeholder={getBaseUrlPlaceholder(config.provider)}
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    style={[styles.input, { color: colors.foreground }]}
                  />
                </View>
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  {config.provider === "ollama"
                    ? "Run Ollama on your computer. Enter its local IP. Both must be on the same WiFi. Example: http://192.168.1.5:11434"
                    : "LM Studio: http://192.168.1.5:1234  |  Jan AI: http://192.168.1.5:1337  |  Any OpenAI-compatible server."}
                </Text>

                {config.provider === "custom" && (
                  <>
                    <Text style={[styles.fieldLabel, { color: colors.foreground }]}>API Key (optional)</Text>
                    <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                      <TextInput
                        value={config.apiKey}
                        onChangeText={(v) => update("apiKey", v)}
                        placeholder="Leave blank if not required"
                        placeholderTextColor={colors.mutedForeground}
                        secureTextEntry={!showKey}
                        autoCapitalize="none"
                        style={[styles.input, { color: colors.foreground }]}
                      />
                      <TouchableOpacity onPress={() => setShowKey(!showKey)} style={styles.eyeBtn}>
                        <Feather name={showKey ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </>
            )}

            {/* Model */}
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Model</Text>
            {modelSuggestions.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 8 }}>
                {modelSuggestions.map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => update("model", m)}
                    style={[styles.modelChip, {
                      backgroundColor: config.model === m ? selectedProvider.color + "18" : colors.muted,
                      borderColor: config.model === m ? selectedProvider.color : colors.border,
                    }]}
                  >
                    <Text style={[styles.modelChipText, { color: config.model === m ? selectedProvider.color : colors.mutedForeground }]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <TextInput
                value={config.model}
                onChangeText={(v) => update("model", v)}
                placeholder={getModelPlaceholder(config.provider)}
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.input, { color: colors.foreground }]}
              />
            </View>

            {/* Test Connection */}
            <TouchableOpacity
              onPress={testConnection}
              disabled={testing}
              style={[styles.testBtn, {
                backgroundColor: testing ? colors.muted : selectedProvider.color + "18",
                borderColor: selectedProvider.color + "40",
              }]}
            >
              {testing ? (
                <ActivityIndicator size="small" color={selectedProvider.color} />
              ) : (
                <Feather name="wifi" size={15} color={selectedProvider.color} />
              )}
              <Text style={[styles.testBtnText, { color: testing ? colors.mutedForeground : selectedProvider.color }]}>
                {testing ? "Testing connection…" : "Test Connection"}
              </Text>
            </TouchableOpacity>

            {testResult && (
              <View style={[styles.testResult, { backgroundColor: testResult.ok ? colors.buy + "10" : colors.sell + "10", borderColor: testResult.ok ? colors.buy + "35" : colors.sell + "35" }]}>
                <Feather name={testResult.ok ? "check-circle" : "x-circle"} size={14} color={testResult.ok ? colors.buy : colors.sell} />
                <Text style={[styles.testResultText, { color: testResult.ok ? colors.buy : colors.sell }]}>
                  {testResult.message}
                </Text>
              </View>
            )}

            {/* Local LLM Setup Guide */}
            {isLocal && (
              <View style={[styles.guideCard, { backgroundColor: colors.primary + "08", borderColor: colors.primary + "20" }]}>
                <Text style={[styles.guideTitle, { color: colors.foreground }]}>
                  {config.provider === "ollama" ? "Ollama Setup Guide" : "Local LLM Setup Guide"}
                </Text>
                {config.provider === "ollama" ? (
                  <>
                    {[
                      "1. Install Ollama: ollama.com/download on your PC/Mac",
                      "2. Pull a model: ollama pull llama3.2",
                      "3. Allow external connections: set OLLAMA_HOST=0.0.0.0",
                      "4. Find your computer's local IP (e.g. 192.168.1.5)",
                      "5. Enter http://{your-ip}:11434 above",
                      "6. Both phone and PC must be on same WiFi network",
                    ].map((step) => (
                      <Text key={step} style={[styles.guideStep, { color: colors.mutedForeground }]}>{step}</Text>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      "LM Studio: Download from lmstudio.ai, load any model, enable 'Local Server' on port 1234",
                      "Jan AI: Download from jan.ai, start local server on port 1337",
                      "Enter your computer's local IP and port above",
                      "Both devices must be on the same WiFi network",
                    ].map((step) => (
                      <Text key={step} style={[styles.guideStep, { color: colors.mutedForeground }]}>{step}</Text>
                    ))}
                  </>
                )}
              </View>
            )}
          </>
        )}
      </View>

      {/* ── SECTION: MARKET DATA ── */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: colors.hold + "20" }]}>
            <Feather name="trending-up" size={18} color={colors.hold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Market Price Source</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              {config.useManualPrice && config.manualPrice ? `Manual: ₹${config.manualPrice}/qtl` : "Auto (seasonal model)"}
            </Text>
          </View>
          <Switch
            value={config.useManualPrice}
            onValueChange={(v) => update("useManualPrice", v)}
            trackColor={{ false: colors.muted, true: colors.hold + "60" }}
            thumbColor={config.useManualPrice ? colors.hold : colors.mutedForeground}
          />
        </View>

        {config.useManualPrice && (
          <>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Today's Mandi Price (₹/quintal)</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: config.manualPrice ? colors.hold + "60" : colors.border }]}>
              <Text style={[styles.rupeePrefix, { color: colors.mutedForeground }]}>₹</Text>
              <TextInput
                value={config.manualPrice}
                onChangeText={(v) => update("manualPrice", v)}
                placeholder="e.g. 3650"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                style={[styles.input, { color: colors.foreground }]}
              />
              <Text style={[styles.rupeePrefix, { color: colors.mutedForeground }]}>/qtl</Text>
            </View>
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              Enter the price you see at your local mandi today. All calculations (profit, signals, AI advice) will use this as the base price.
            </Text>
            {config.manualPrice && (
              <View style={[styles.priceActiveBar, { backgroundColor: colors.hold + "12", borderColor: colors.hold + "30" }]}>
                <Feather name="check-circle" size={13} color={colors.hold} />
                <Text style={[styles.priceActiveText, { color: colors.hold }]}>
                  ₹{config.manualPrice}/qtl set as today's price for all calculations
                </Text>
              </View>
            )}
          </>
        )}

        {!config.useManualPrice && (
          <View style={[styles.autoExplain, { backgroundColor: colors.muted }]}>
            <Text style={[styles.autoExplainText, { color: colors.mutedForeground }]}>
              Auto mode uses a seasonal model based on real jaggery market patterns. Prices vary by month (lowest Feb–Mar harvest, highest Oct–Nov festival). Enable manual to override with your actual mandi rate.
            </Text>
          </View>
        )}

        <View style={[styles.dataSourceInfo, { borderTopColor: colors.border }]}>
          <Feather name="info" size={12} color={colors.mutedForeground} />
          <Text style={[styles.dataSourceText, { color: colors.mutedForeground }]}>
            Live jaggery data APIs: Check agmarknet.gov.in (official mandi prices) or data.gov.in. For accurate trading, enter your local mandi price manually above.
          </Text>
        </View>
      </View>

      {/* ── SECTION: ABOUT ── */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
        {[
          { label: "AI Proxy", value: "Your API key stays on device. Cloud AI calls go via our secure server." },
          { label: "Local LLM", value: "Ollama/LM Studio calls go directly from your phone to the local server — never through cloud." },
          { label: "Data Privacy", value: "Trade journal, settings, and prices stored only in your device's local storage." },
          { label: "AI Providers", value: "OpenAI, Anthropic (cloud) · Ollama, LM Studio, Jan AI, any OpenAI-compatible server (local)." },
        ].map((row) => (
          <View key={row.label} style={[styles.aboutRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.aboutLabel, { color: colors.foreground }]}>{row.label}</Text>
            <Text style={[styles.aboutValue, { color: colors.mutedForeground }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={confirmReset} style={[styles.resetBtn, { backgroundColor: colors.sell + "10", borderColor: colors.sell + "30" }]}>
        <Feather name="trash-2" size={15} color={colors.sell} />
        <Text style={[styles.resetBtnText, { color: colors.sell }]}>Reset All Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, letterSpacing: -0.5 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  section: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  sectionIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  sectionSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  fieldLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  providerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  providerCard: { width: "47%", borderRadius: 12, padding: 12, borderWidth: 1, gap: 5, position: "relative" },
  providerLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  providerSub: { fontFamily: "Inter_400Regular", fontSize: 11 },
  localBadge: { position: "absolute", top: 8, right: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  localBadgeText: { fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 0.5 },
  inputRow: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, height: 46, gap: 6 },
  input: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, height: 46 },
  rupeePrefix: { fontFamily: "Inter_500Medium", fontSize: 15 },
  eyeBtn: { padding: 4 },
  hint: { fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 17, marginTop: -6 },
  modelChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  modelChipText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  testBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  testBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  testResult: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: "flex-start" },
  testResultText: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18, flex: 1 },
  guideCard: { borderRadius: 10, padding: 12, borderWidth: 1, gap: 5 },
  guideTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: 4 },
  guideStep: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  priceActiveBar: { flexDirection: "row", gap: 7, padding: 10, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  priceActiveText: { fontFamily: "Inter_500Medium", fontSize: 12, flex: 1 },
  autoExplain: { padding: 12, borderRadius: 8 },
  autoExplainText: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  dataSourceInfo: { flexDirection: "row", gap: 7, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, alignItems: "flex-start" },
  dataSourceText: { fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 16, flex: 1 },
  aboutRow: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 3 },
  aboutLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  aboutValue: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  resetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 14, borderWidth: 1 },
  resetBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
