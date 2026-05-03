import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { generateMarketSnapshot, MarketSnapshot } from "@/constants/marketData";

const ALERTS_KEY = "jaggery_alerts_v1";

export type PriceAlert = {
  id: string;
  type: "above" | "below";
  price: number;
  label: string;
  triggered: boolean;
  createdAt: string;
};

export function useMarket() {
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const refresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setSnapshot(generateMarketSnapshot());
      setLastRefresh(new Date());
      setLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { snapshot, loading, refresh, lastRefresh };
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
