export type TradeGrade = "A" | "B" | "C";
export type JaggeryType = "Khandsari UP" | "Kolhapuri" | "TN Vellam" | "Organic" | "Shakkar Gur" | "Other";
export type TradeStatus = "holding" | "sold" | "partial";

export type TradeEntry = {
  id: string;
  date: string;
  mandi: string;
  grade: TradeGrade;
  type: JaggeryType;
  quantity: number;
  buyPrice: number;
  status: TradeStatus;
  sellDate?: string;
  sellPrice?: number;
  soldQuantity?: number;
  storageMonths?: number;
  storageCostPerMonth?: number;
  transportCostPerQtl?: number;
  notes?: string;
  createdAt: string;
};

export type TradeStats = {
  totalInvested: number;
  totalRealised: number;
  totalProfit: number;
  roi: number;
  holdingValue: number;
  holdingQuantity: number;
  completedTrades: number;
  activeTrades: number;
  bestTrade: { profit: number; id: string } | null;
  worstTrade: { profit: number; id: string } | null;
};

export function computeTradeProfit(trade: TradeEntry): {
  invested: number;
  storageCost: number;
  transportCost: number;
  grossRevenue: number;
  netProfit: number;
  roi: number;
  breakEven: number;
} {
  const qty = trade.soldQuantity ?? trade.quantity;
  const invested = trade.buyPrice * qty;
  const storageCost = (trade.storageCostPerMonth ?? 0) * (trade.storageMonths ?? 0) * qty;
  const transportCost = (trade.transportCostPerQtl ?? 0) * qty;
  const totalCost = invested + storageCost + transportCost;
  const grossRevenue = (trade.sellPrice ?? 0) * qty;
  const netProfit = grossRevenue - totalCost;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  const breakEven = totalCost / qty;

  return { invested, storageCost, transportCost, grossRevenue, netProfit, roi, breakEven };
}

export function computePortfolioStats(trades: TradeEntry[]): TradeStats {
  let totalInvested = 0, totalRealised = 0, holdingValue = 0, holdingQuantity = 0;
  let completedTrades = 0, activeTrades = 0;
  let bestTrade: { profit: number; id: string } | null = null;
  let worstTrade: { profit: number; id: string } | null = null;

  for (const t of trades) {
    if (t.status === "sold" || t.status === "partial") {
      const stats = computeTradeProfit(t);
      totalInvested += stats.invested + stats.storageCost + stats.transportCost;
      totalRealised += stats.grossRevenue;
      completedTrades++;
      if (!bestTrade || stats.netProfit > bestTrade.profit) bestTrade = { profit: stats.netProfit, id: t.id };
      if (!worstTrade || stats.netProfit < worstTrade.profit) worstTrade = { profit: stats.netProfit, id: t.id };
    } else {
      holdingQuantity += t.quantity;
      holdingValue += t.buyPrice * t.quantity;
      activeTrades++;
    }
  }

  const totalProfit = totalRealised - totalInvested;
  const roi = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
  return { totalInvested, totalRealised, totalProfit, roi, holdingValue, holdingQuantity, completedTrades, activeTrades, bestTrade, worstTrade };
}

export const MANDIS = [
  "Muzaffarnagar (UP)", "Shamli (UP)", "Saharanpur (UP)", "Kolhapur (MH)",
  "Sangli (MH)", "Satara (MH)", "Erode (TN)", "Coimbatore (TN)",
  "Belagavi (KA)", "Varanasi (UP)", "Gorakhpur (UP)", "Other",
];

export const JOURNAL_KEY = "@jaggery_journal_v2";
