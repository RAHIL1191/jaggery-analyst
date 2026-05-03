import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TradeEntry, computePortfolioStats, TradeStats, JOURNAL_KEY } from "@/constants/journalData";

export function useJournal() {
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(JOURNAL_KEY);
      if (raw) setTrades(JSON.parse(raw));
    } catch (e) {
      console.error("Journal load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (updated: TradeEntry[]) => {
    try {
      await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
      setTrades(updated);
    } catch (e) {
      console.error("Journal save error:", e);
    }
  }, []);

  const addTrade = useCallback(async (trade: Omit<TradeEntry, "id" | "createdAt">) => {
    const newTrade: TradeEntry = { ...trade, id: `t_${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [newTrade, ...trades];
    await save(updated);
    return newTrade;
  }, [trades, save]);

  const markSold = useCallback(async (id: string, sellPrice: number, sellDate: string, soldQuantity?: number) => {
    const updated = trades.map((t) =>
      t.id === id ? { ...t, status: "sold" as const, sellPrice, sellDate, soldQuantity: soldQuantity ?? t.quantity } : t
    );
    await save(updated);
  }, [trades, save]);

  const deleteTrade = useCallback(async (id: string) => {
    await save(trades.filter((t) => t.id !== id));
  }, [trades, save]);

  const stats: TradeStats = computePortfolioStats(trades);

  return { trades, loading, addTrade, markSold, deleteTrade, stats };
}
