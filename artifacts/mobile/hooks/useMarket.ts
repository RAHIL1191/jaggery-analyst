import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { generateMarketSnapshot, MarketSnapshot } from "@/constants/marketData";

const ALERTS_KEY = "jaggery_alerts_v1";
const AI_CONFIG_KEY = "@jaggery_ai_config_v2";

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

async function loadManualPrice(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(AI_CONFIG_KEY);
    if (!raw) return null;
    const config = JSON.parse(raw) as { useManualPrice?: boolean; manualPrice?: string };
    if (config.useManualPrice && config.manualPrice) {
      const parsed = parseFloat(config.manualPrice);
      return isNaN(parsed) ? null : parsed;
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

  const refresh = useCallback(() => {
    setLoading(true);
    Promise.all([
      new Promise<MarketSnapshot>((resolve) => {
        setTimeout(() => resolve(generateMarketSnapshot()), 400);
      }),
      loadManualPrice(),
    ])
      .then(([base, manualPrice]) => {
        if (manualPrice !== null) {
          setSnapshot(applyManualPrice(base, manualPrice));
          setManualPriceActive(true);
        } else {
          setSnapshot(base);
          setManualPriceActive(false);
        }
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

  return { snapshot, loading, refresh, lastRefresh, manualPriceActive };
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
