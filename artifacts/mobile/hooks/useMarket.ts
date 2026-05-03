import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { generateMarketSnapshot, MarketSnapshot } from "@/constants/marketData";
import { DEFAULT_AI_CONFIG, type AIConfig } from "@/hooks/useAIConfig";

const ALERTS_KEY = "jaggery_alerts_v1";
const AI_CONFIG_KEY = "@jaggery_ai_config_v3";

export type PriceAlert = {
  id: string;
  type: "above" | "below";
  price: number;
  label: string;
  triggered: boolean;
  createdAt: string;
};

function applyManualPrice(snapshot: MarketSnapshot, manualPrice: number): MarketSnapshot {
  const change = manualPrice - snapshot.previousClose;
  const changePercent = (change / snapshot.previousClose) * 100;
  return {
    ...snapshot,
    currentPrice: manualPrice,
    change,
    changePercent: parseFloat(changePercent.toFixed(2)),
    weekHigh: Math.max(snapshot.weekHigh, manualPrice),
    weekLow: Math.min(snapshot.weekLow, manualPrice),
    monthHigh: Math.max(snapshot.monthHigh, manualPrice),
    monthLow: Math.min(snapshot.monthLow, manualPrice),
    targetPrice: Math.round(manualPrice * (snapshot.recommendation === "BUY" ? 1.07 : 1.03)),
    stopLoss: Math.round(manualPrice * 0.965),
    regions: snapshot.regions.map((r) => ({
      ...r,
      price: Math.round(manualPrice * (r.price / snapshot.currentPrice)),
      change: r.change,
      changePercent: r.changePercent,
    })),
  };
}

async function loadConfig(): Promise<AIConfig | null> {
  try {
    const raw = await AsyncStorage.getItem(AI_CONFIG_KEY);
    if (!raw) return null;
    return { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

function normalizeCsvPrice(text: string): number | null {
  const match = text.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const value = parseFloat(match[1]);
  return Number.isFinite(value) ? value : null;
}

async function loadRemoteSnapshot(apiUrl: string, apiKey?: string): Promise<MarketSnapshot | null> {
  if (!apiUrl) return null;
  try {
    const res = await fetch(apiUrl, {
      headers: {
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const price = Number(data.currentPrice ?? data.price ?? data.mandiPrice ?? data.lastPrice);
    if (!Number.isFinite(price)) return null;
    const base = generateMarketSnapshot();
    return applyManualPrice(base, price);
  } catch {
    return null;
  }
}

async function loadDatasetSnapshot(url: string, format: "csv" | "json"): Promise<MarketSnapshot | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    const base = generateMarketSnapshot();
    if (format === "json") {
      const parsed = JSON.parse(text) as { prices?: Array<{ price?: number }>; currentPrice?: number; price?: number };
      const direct = Number(parsed.currentPrice ?? parsed.price);
      if (Number.isFinite(direct)) return applyManualPrice(base, direct);
      const arrPrice = parsed.prices?.[0]?.price;
      if (Number.isFinite(arrPrice)) return applyManualPrice(base, Number(arrPrice));
      return null;
    }
    const rows = text.split(/\r?\n/).filter(Boolean);
    for (const row of rows) {
      const price = normalizeCsvPrice(row);
      if (price !== null) return applyManualPrice(base, price);
    }
    return null;
  } catch {
    return null;
  }
}

export function useMarket() {
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [manualPriceActive, setManualPriceActive] = useState(false);
  const [sourceLabel, setSourceLabel] = useState<string>("Deterministic seasonal model");

  const refresh = useCallback(() => {
    setLoading(true);
    Promise.all([
      new Promise<MarketSnapshot>((resolve) => {
        setTimeout(() => resolve(generateMarketSnapshot()), 400);
      }),
      loadConfig(),
    ])
      .then(async ([base, config]) => {
        let next = base;
        let label = "Deterministic seasonal model";
        if (config?.dataSourceMode === "manual" && config.manualPrice) {
          const manual = parseFloat(config.manualPrice);
          if (Number.isFinite(manual)) {
            next = applyManualPrice(base, manual);
            label = "Manual price from Settings";
            setManualPriceActive(true);
          }
        } else if (config?.dataSourceMode === "remote") {
          const remote = await loadRemoteSnapshot(config.marketApiUrl, config.marketApiKey);
          if (remote) {
            next = remote;
            label = "Remote live market URL";
            setManualPriceActive(true);
          } else {
            const dataset = await loadDatasetSnapshot(config.marketDatasetUrl, config.marketDatasetFormat);
            if (dataset) {
              next = dataset;
              label = `Dataset import (${config.marketDatasetFormat.toUpperCase()})`;
              setManualPriceActive(true);
            } else {
              setManualPriceActive(false);
            }
          }
        } else {
          setManualPriceActive(false);
        }

        setSnapshot(next);
        setSourceLabel(label);
        setLastRefresh(new Date());
      })
      .catch((e) => {
        console.error("Market snapshot error:", e);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { snapshot, loading, refresh, lastRefresh, manualPriceActive, sourceLabel };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(ALERTS_KEY).then((raw) => {
      if (raw) setAlerts(JSON.parse(raw));
    });
  }, []);

  const save = useCallback((next: PriceAlert[]) => {
    setAlerts(next);
    AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(next));
  }, []);

  const addAlert = useCallback(
    (type: "above" | "below", price: number) => {
      const alert: PriceAlert = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
        type,
        price,
        label:
          type === "above"
            ? `Alert when price goes above ₹${price}`
            : `Alert when price falls below ₹${price}`,
        triggered: false,
        createdAt: new Date().toISOString(),
      };
      save([...alerts, alert]);
    },
    [alerts, save]
  );

  const removeAlert = useCallback(
    (id: string) => {
      save(alerts.filter((a) => a.id !== id));
    },
    [alerts, save]
  );

  return { alerts, addAlert, removeAlert };
}
