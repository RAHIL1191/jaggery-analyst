import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AIProvider = "openai" | "anthropic" | "ollama" | "custom";

export type DataSourceMode = "deterministic" | "manual" | "remote";

export type AIConfig = {
  enabled: boolean;
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  manualPrice: string;
  useManualPrice: boolean;
  dataSourceMode: DataSourceMode;
  marketApiUrl: string;
  marketApiKey: string;
  marketDatasetUrl: string;
  marketDatasetFormat: "csv" | "json";
  marketDatasetNotes: string;
};

export const DEFAULT_AI_CONFIG: AIConfig = {
  enabled: false,
  provider: "openai",
  apiKey: "",
  baseUrl: "http://localhost:11434",
  model: "gpt-4o-mini",
  manualPrice: "",
  useManualPrice: false,
  dataSourceMode: "deterministic",
  marketApiUrl: "",
  marketApiKey: "",
  marketDatasetUrl: "",
  marketDatasetFormat: "csv",
  marketDatasetNotes: "",
};

const CONFIG_KEY = "@jaggery_ai_config_v3";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? "localhost"}/api`;

export function getApiBase(): string {
  return API_BASE;
}

export function isLocalProvider(provider: AIProvider): boolean {
  return provider === "ollama" || provider === "custom";
}

export function getOllamaEndpoint(baseUrl: string): string {
  const url = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${url}/v1/chat/completions`;
}

export function getCustomEndpoint(baseUrl: string): string {
  const url = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  if (url.endsWith("/v1/chat/completions")) return url;
  if (url.endsWith("/v1")) return `${url}/chat/completions`;
  return `${url}/v1/chat/completions`;
}

export function getModelPlaceholder(provider: AIProvider): string {
  switch (provider) {
    case "openai": return "gpt-4o-mini";
    case "anthropic": return "claude-3-5-haiku-20241022";
    case "ollama": return "llama3.2";
    case "custom": return "gpt-4o-mini or any model name";
  }
}

export function getBaseUrlPlaceholder(provider: AIProvider): string {
  switch (provider) {
    case "ollama": return "http://192.168.1.100:11434";
    case "custom": return "http://192.168.1.100:1234";
    default: return "";
  }
}

function normalizeConfig(next: Partial<AIConfig>): Partial<AIConfig> {
  if (!next.provider) return next;
  if (next.provider === "openai" || next.provider === "anthropic") {
    return {
      ...next,
      baseUrl: "",
    };
  }
  if (next.provider === "ollama") {
    return {
      ...next,
      baseUrl: next.baseUrl ?? "http://localhost:11434",
    };
  }
  return next;
}

export function useAIConfig() {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CONFIG_KEY).then((raw) => {
      if (raw) {
        try {
          setConfig({ ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) });
        } catch {}
      }
      setLoading(false);
    });
  }, []);

  const updateConfig = useCallback(async (updates: Partial<AIConfig>) => {
    const merged = { ...config, ...normalizeConfig(updates) };
    if (merged.provider === "openai" || merged.provider === "anthropic") {
      merged.baseUrl = "";
    }
    if (merged.provider === "ollama" && !merged.baseUrl) {
      merged.baseUrl = "http://localhost:11434";
    }
    setConfig(merged);
    await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(merged));
  }, [config]);

  const resetConfig = useCallback(async () => {
    setConfig(DEFAULT_AI_CONFIG);
    await AsyncStorage.removeItem(CONFIG_KEY);
  }, []);

  const manualPrice = config.useManualPrice && config.manualPrice
    ? parseFloat(config.manualPrice)
    : null;

  return { config, loading, updateConfig, resetConfig, manualPrice };
}
