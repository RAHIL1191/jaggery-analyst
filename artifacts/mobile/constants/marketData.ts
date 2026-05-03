export type Region = {
  name: string;
  state: string;
  price: number;
  change: number;
  changePercent: number;
};

export type PricePoint = {
  date: string;
  price: number;
  label: string;
};

export type MarketSignal = {
  label: string;
  value: string;
  sentiment: "bullish" | "bearish" | "neutral";
  weight: number;
};

export type Recommendation = "BUY" | "SELL" | "HOLD";

export type MarketSnapshot = {
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  weekHigh: number;
  weekLow: number;
  monthHigh: number;
  monthLow: number;
  volume: string;
  recommendation: Recommendation;
  confidence: number;
  signals: MarketSignal[];
  regions: Region[];
  priceHistory: PricePoint[];
  lastUpdated: string;
  targetPrice: number;
  stopLoss: number;
};

function generatePriceHistory(): PricePoint[] {
  const basePrice = 4180;
  const days = 30;
  const points: PricePoint[] = [];
  const today = new Date();

  let price = basePrice - 320;
  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const seasonal = Math.sin((d.getMonth() / 12) * Math.PI * 2) * 80;
    const noise = (Math.random() - 0.48) * 60;
    price = Math.max(3600, Math.min(5200, price + noise + seasonal * 0.1));

    const label = i === 0 ? "Today" : `${i}d ago`;
    points.push({
      date: d.toISOString().split("T")[0],
      price: Math.round(price),
      label,
    });
  }
  return points;
}

function computeRecommendation(history: PricePoint[]): {
  recommendation: Recommendation;
  confidence: number;
  signals: MarketSignal[];
  targetPrice: number;
  stopLoss: number;
} {
  const prices = history.map((p) => p.price);
  const current = prices[prices.length - 1];
  const ma7 = prices.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const ma30 = prices.reduce((a, b) => a + b, 0) / prices.length;
  const weekHigh = Math.max(...prices.slice(-7));
  const weekLow = Math.min(...prices.slice(-7));
  const rsi = computeRSI(prices);
  const month = new Date().getMonth();
  const seasonalScore = getSeasonalScore(month);

  const signals: MarketSignal[] = [
    {
      label: "7-Day Moving Avg",
      value: current > ma7 ? "Above MA7 — Bullish" : "Below MA7 — Bearish",
      sentiment: current > ma7 ? "bullish" : "bearish",
      weight: 0.25,
    },
    {
      label: "30-Day Trend",
      value: ma7 > ma30 ? "Rising trend" : "Falling trend",
      sentiment: ma7 > ma30 ? "bullish" : "bearish",
      weight: 0.2,
    },
    {
      label: "RSI (14)",
      value:
        rsi < 35
          ? `${rsi.toFixed(0)} — Oversold`
          : rsi > 65
            ? `${rsi.toFixed(0)} — Overbought`
            : `${rsi.toFixed(0)} — Neutral`,
      sentiment: rsi < 35 ? "bullish" : rsi > 65 ? "bearish" : "neutral",
      weight: 0.2,
    },
    {
      label: "Seasonal Demand",
      value: seasonalScore > 0 ? "Festival season boost" : "Off-season pressure",
      sentiment: seasonalScore > 0 ? "bullish" : "bearish",
      weight: 0.2,
    },
    {
      label: "Price vs MSP",
      value:
        current > 4000
          ? "Above floor price"
          : "Near minimum support price",
      sentiment: current > 4000 ? "bullish" : "neutral",
      weight: 0.15,
    },
  ];

  let score = 0;
  for (const s of signals) {
    if (s.sentiment === "bullish") score += s.weight;
    else if (s.sentiment === "bearish") score -= s.weight;
  }

  let recommendation: Recommendation;
  let confidence: number;

  if (score > 0.2) {
    recommendation = "BUY";
    confidence = Math.min(95, Math.round(60 + score * 80));
  } else if (score < -0.2) {
    recommendation = "SELL";
    confidence = Math.min(95, Math.round(60 + Math.abs(score) * 80));
  } else {
    recommendation = "HOLD";
    confidence = Math.round(55 + Math.abs(score) * 40);
  }

  const targetPrice =
    recommendation === "BUY"
      ? Math.round(current * 1.07)
      : recommendation === "SELL"
        ? Math.round(current * 0.94)
        : Math.round(current * 1.03);

  const stopLoss =
    recommendation === "BUY"
      ? Math.round(current * 0.96)
      : Math.round(current * 1.03);

  return { recommendation, confidence, signals, targetPrice, stopLoss };
}

function computeRSI(prices: number[]): number {
  const n = Math.min(14, prices.length - 1);
  let gains = 0;
  let losses = 0;
  for (let i = prices.length - n; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

function getSeasonalScore(month: number): number {
  const scores: Record<number, number> = {
    0: 0.5,
    1: 0.3,
    2: -0.2,
    3: -0.3,
    4: -0.2,
    5: -0.1,
    6: 0.1,
    7: 0.2,
    8: 0.4,
    9: 0.6,
    10: 0.7,
    11: 0.8,
  };
  return scores[month] ?? 0;
}

export function generateMarketSnapshot(): MarketSnapshot {
  const history = generatePriceHistory();
  const prices = history.map((p) => p.price);
  const current = prices[prices.length - 1];
  const prev = prices[prices.length - 2];
  const change = current - prev;
  const changePercent = (change / prev) * 100;
  const weekPrices = prices.slice(-7);
  const monthPrices = prices;

  const { recommendation, confidence, signals, targetPrice, stopLoss } =
    computeRecommendation(history);

  const regions: Region[] = [
    { name: "Muzaffarnagar", state: "Uttar Pradesh", price: current, change: change, changePercent },
    {
      name: "Kolhapur",
      state: "Maharashtra",
      price: Math.round(current * 0.97 + (Math.random() - 0.5) * 40),
      change: Math.round(change * 0.9),
      changePercent: changePercent * 0.9,
    },
    {
      name: "Sangli",
      state: "Maharashtra",
      price: Math.round(current * 0.98 + (Math.random() - 0.5) * 30),
      change: Math.round(change * 0.85),
      changePercent: changePercent * 0.85,
    },
    {
      name: "Varanasi",
      state: "Uttar Pradesh",
      price: Math.round(current * 1.01 + (Math.random() - 0.5) * 20),
      change: Math.round(change * 1.05),
      changePercent: changePercent * 1.05,
    },
    {
      name: "Coimbatore",
      state: "Tamil Nadu",
      price: Math.round(current * 1.03 + (Math.random() - 0.5) * 50),
      change: Math.round(change * 0.7),
      changePercent: changePercent * 0.7,
    },
    {
      name: "Belgaum",
      state: "Karnataka",
      price: Math.round(current * 0.99 + (Math.random() - 0.5) * 35),
      change: Math.round(change * 1.1),
      changePercent: changePercent * 1.1,
    },
  ];

  const now = new Date();
  const lastUpdated = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return {
    currentPrice: current,
    previousClose: prev,
    change: Math.round(change),
    changePercent: parseFloat(changePercent.toFixed(2)),
    weekHigh: Math.max(...weekPrices),
    weekLow: Math.min(...weekPrices),
    monthHigh: Math.max(...monthPrices),
    monthLow: Math.min(...monthPrices),
    volume: `${(Math.random() * 3 + 1.5).toFixed(1)}K MT`,
    recommendation,
    confidence,
    signals,
    regions,
    priceHistory: history,
    lastUpdated,
    targetPrice,
    stopLoss,
  };
}
