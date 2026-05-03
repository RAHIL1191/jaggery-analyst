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
  category: "technical" | "festival" | "harvest" | "macro" | "news";
};

export type Festival = {
  name: string;
  date: string;
  daysUntil: number;
  impact: "high" | "medium" | "low";
  demandBoost: number;
  description: string;
};

export type HarvestInfo = {
  phase: string;
  region: string;
  description: string;
  priceEffect: "bullish" | "bearish" | "neutral";
  intensity: number;
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
  upcomingFestivals: Festival[];
  harvestInfo: HarvestInfo;
  festivalScore: number;
  harvestScore: number;
};

function generatePriceHistory(): PricePoint[] {
  const today = new Date();
  const month = today.getMonth();
  const basePrices: Record<number, number> = {
    0: 4400, 1: 4200, 2: 4000, 3: 3800, 4: 3700, 5: 3650,
    6: 3750, 7: 3900, 8: 4100, 9: 4300, 10: 4600, 11: 4800,
  };
  const base = basePrices[month] ?? 4200;
  const points: PricePoint[] = [];
  let price = base - 200;
  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const noise = (Math.random() - 0.47) * 55;
    price = Math.max(3500, Math.min(5500, price + noise));
    points.push({ date: d.toISOString().split("T")[0], price: Math.round(price), label: i === 0 ? "Today" : `${i}d` });
  }
  return points;
}

function getUpcomingFestivals(today: Date): Festival[] {
  const year = today.getFullYear();
  const allFestivals = [
    { name: "Makar Sankranti", month: 0, day: 14, impact: "high" as const, boost: 18, desc: "Tilgul (jaggery+sesame) sweets gifted across Maharashtra & Gujarat. Demand spikes 3–4 weeks prior." },
    { name: "Pongal", month: 0, day: 14, impact: "high" as const, boost: 20, desc: "South Indian harvest festival. Jaggery (vellam) is central — used in pongal dish and sweets. Massive demand in TN & AP." },
    { name: "Holi", month: 2, day: 14, impact: "medium" as const, boost: 10, desc: "Traditional gujiya sweets use jaggery. Demand rises 2 weeks before in UP & Rajasthan." },
    { name: "Ram Navami", month: 3, day: 17, impact: "low" as const, boost: 5, desc: "Prasad preparations include jaggery-based sweets. Moderate uptick in temple districts." },
    { name: "Eid ul-Fitr", month: 3, day: 20, impact: "medium" as const, boost: 8, desc: "Seviyan with jaggery alternative popular. Moderate demand rise in Muslim-majority areas." },
    { name: "Teej", month: 7, day: 7, impact: "medium" as const, boost: 12, desc: "Rajasthani & UP women's festival. Ghewar and other jaggery-based sweets in high demand." },
    { name: "Janmashtami", month: 7, day: 16, impact: "medium" as const, boost: 10, desc: "Panchamrit and panjiri (jaggery-based) offerings. Temple mandis see demand boost." },
    { name: "Ganesh Chaturthi", month: 8, day: 5, impact: "high" as const, boost: 22, desc: "Maharashtra's biggest festival. Modak (jaggery+coconut) is the signature offering. Demand peaks 2 weeks before." },
    { name: "Navratri", month: 9, day: 3, impact: "high" as const, boost: 15, desc: "Fasting foods include jaggery-based sweets and chikki. 9-day festival drives steady demand." },
    { name: "Diwali", month: 9, day: 29, impact: "high" as const, boost: 30, desc: "Largest jaggery demand spike of the year. Chikki, ladoo, halwa production peaks. Prices rise 15–25% in Oct–Nov." },
    { name: "Chhath Puja", month: 10, day: 8, impact: "high" as const, boost: 18, desc: "Bihar & UP festival. Thekua (jaggery wheat cookies) are the primary prasad. Massive local demand in eastern India." },
    { name: "Kartik Purnima", month: 10, day: 15, impact: "low" as const, boost: 4, desc: "Temple-town festivals use jaggery for prasad. Mild uptick in pilgrimage regions." },
  ];

  const festivals: Festival[] = [];
  for (const f of allFestivals) {
    let festDate = new Date(year, f.month, f.day);
    if (festDate < today) festDate = new Date(year + 1, f.month, f.day);
    const diff = Math.round((festDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff <= 90) {
      festivals.push({ name: f.name, date: festDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), daysUntil: diff, impact: f.impact, demandBoost: f.boost, description: f.desc });
    }
  }
  festivals.sort((a, b) => a.daysUntil - b.daysUntil);
  return festivals.slice(0, 4);
}

function getHarvestInfo(month: number): HarvestInfo {
  if (month >= 9 && month <= 11) return { phase: "Pre-Harvest", region: "North India (UP, Punjab, Haryana)", description: "Sugarcane matures Oct–Dec. Mills begin crushing. Supply rises. Prices typically soften from January as supply floods in.", priceEffect: "bearish", intensity: 0.6 };
  if (month >= 0 && month <= 2) return { phase: "Peak Harvest", region: "Uttar Pradesh & Maharashtra", description: "Jan–Mar is peak crushing in UP (Muzaffarnagar) and Maharashtra (Kolhapur). Maximum jaggery output drives prices to seasonal lows. Best time to buy stock cheaply.", priceEffect: "bearish", intensity: 0.85 };
  if (month >= 3 && month <= 5) return { phase: "South Harvest / North Off-Season", region: "Maharashtra, AP, Karnataka", description: "North India mills wrap up. South India (AP, TN, Karnataka) continues until May–June. Northern supply tightens, prices recover.", priceEffect: "neutral", intensity: 0.4 };
  return { phase: "Off-Season / Pre-Sowing", region: "All Major States", description: "Jun–Sep off-season. No major crushing. Stocks deplete. Prices naturally rise heading into festival season. Best window to sell stored jaggery.", priceEffect: "bullish", intensity: 0.7 };
}

function computeFestivalScore(festivals: Festival[]): number {
  let score = 0;
  for (const fest of festivals) {
    const urgency = fest.daysUntil <= 14 ? 1.5 : fest.daysUntil <= 30 ? 1.0 : 0.5;
    const impactMap = { high: 0.3, medium: 0.2, low: 0.1 };
    score += impactMap[fest.impact] * urgency;
  }
  return Math.min(score, 1.0);
}

function computeRSI(prices: number[]): number {
  const n = Math.min(14, prices.length - 1);
  let gains = 0, losses = 0;
  for (let i = prices.length - n; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff; else losses += Math.abs(diff);
  }
  if (losses === 0) return 100;
  return 100 - 100 / (1 + gains / losses);
}

function getNewsSentimentScore(month: number): number {
  // Deterministic daily score derived from date — same day returns same value
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const pseudo = ((seed * 1664525 + 1013904223) & 0x7fffffff) / 0x7fffffff;
  // Bias toward bullish in off-season/festival, bearish in peak harvest
  const bias = (month >= 6 && month <= 11) ? 0.1 : (month >= 0 && month <= 2) ? -0.1 : 0;
  return Math.max(-0.5, Math.min(0.5, (pseudo - 0.5) * 0.6 + bias));
}

function buildSignals(
  prices: number[],
  month: number,
  festivals: Festival[],
  harvestInfo: HarvestInfo,
): MarketSignal[] {
  const current = prices[prices.length - 1];
  const ma7 = prices.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const ma30 = prices.reduce((a, b) => a + b, 0) / prices.length;
  const rsi = computeRSI(prices);
  const nearestFest = festivals[0];
  const newsScore = getNewsSentimentScore(month);

  return [
    {
      label: "7-Day Moving Average",
      value: current > ma7
        ? `₹${Math.round(ma7).toLocaleString("en-IN")} — Price above MA7`
        : `₹${Math.round(ma7).toLocaleString("en-IN")} — Price below MA7`,
      sentiment: current > ma7 ? "bullish" : "bearish",
      weight: 0.16,
      category: "technical",
    },
    {
      label: "30-Day Trend",
      value: ma7 > ma30 ? "Rising trend — upward momentum" : "Falling trend — downward pressure",
      sentiment: ma7 > ma30 ? "bullish" : "bearish",
      weight: 0.14,
      category: "technical",
    },
    {
      label: "RSI (14-Period)",
      value: rsi < 35 ? `${rsi.toFixed(0)} — Oversold, reversal likely` : rsi > 65 ? `${rsi.toFixed(0)} — Overbought, correction risk` : `${rsi.toFixed(0)} — Neutral zone`,
      sentiment: rsi < 35 ? "bullish" : rsi > 65 ? "bearish" : "neutral",
      weight: 0.13,
      category: "technical",
    },
    {
      label: nearestFest ? `Festival: ${nearestFest.name}` : "Festival Demand",
      value: nearestFest
        ? nearestFest.daysUntil === 0 ? `Today! Demand at peak (+${nearestFest.demandBoost}%)`
          : nearestFest.daysUntil <= 14 ? `${nearestFest.daysUntil} days away — demand building (+${nearestFest.demandBoost}% boost)`
          : nearestFest.daysUntil <= 30 ? `${nearestFest.daysUntil} days — pre-festival buying soon`
          : `${nearestFest.daysUntil} days — monitoring`
        : "No major festivals in next 90 days",
      sentiment: nearestFest ? (nearestFest.daysUntil <= 30 ? "bullish" : "neutral") : "neutral",
      weight: 0.20,
      category: "festival",
    },
    {
      label: `Harvest: ${harvestInfo.phase}`,
      value: harvestInfo.description.slice(0, 85) + "…",
      sentiment: harvestInfo.priceEffect,
      weight: 0.18,
      category: "harvest",
    },
    {
      label: "News & External Signals",
      value: newsScore > 0.1
        ? "Today's news flow — net bullish (weather/export/supply factors)"
        : newsScore < -0.1
          ? "Today's news flow — net bearish (bumper crop/import/policy factors)"
          : "Today's news flow — mixed signals, no strong directional bias",
      sentiment: newsScore > 0.05 ? "bullish" : newsScore < -0.05 ? "bearish" : "neutral",
      weight: 0.12,
      category: "news",
    },
    {
      label: "MSP vs Market Price",
      value: current > 4200 ? `₹${current.toLocaleString("en-IN")} — Healthy premium above MSP (₹3,600)` : current > 3800 ? `₹${current.toLocaleString("en-IN")} — Moderate margin over MSP` : `₹${current.toLocaleString("en-IN")} — Near MSP floor — limited downside`,
      sentiment: current > 4000 ? "bullish" : "neutral",
      weight: 0.07,
      category: "macro",
    },
  ];
}

function computeRecommendation(signals: MarketSignal[]): { recommendation: Recommendation; confidence: number } {
  let score = 0;
  for (const s of signals) {
    if (s.sentiment === "bullish") score += s.weight;
    else if (s.sentiment === "bearish") score -= s.weight;
  }
  if (score > 0.18) return { recommendation: "BUY", confidence: Math.min(95, Math.round(58 + score * 90)) };
  if (score < -0.18) return { recommendation: "SELL", confidence: Math.min(95, Math.round(58 + Math.abs(score) * 90)) };
  return { recommendation: "HOLD", confidence: Math.round(52 + Math.abs(score) * 60) };
}

export function generateMarketSnapshot(): MarketSnapshot {
  const today = new Date();
  const month = today.getMonth();
  const history = generatePriceHistory();
  const prices = history.map((p) => p.price);
  const current = prices[prices.length - 1];
  const prev = prices[prices.length - 2];
  const change = current - prev;
  const changePercent = (change / prev) * 100;

  const upcomingFestivals = getUpcomingFestivals(today);
  const harvestInfo = getHarvestInfo(month);
  const festivalScore = computeFestivalScore(upcomingFestivals);
  const harvestScore = harvestInfo.priceEffect === "bullish" ? harvestInfo.intensity : harvestInfo.priceEffect === "bearish" ? -harvestInfo.intensity : 0;

  const signals = buildSignals(prices, month, upcomingFestivals, harvestInfo);
  const { recommendation, confidence } = computeRecommendation(signals);

  const targetPrice = recommendation === "BUY" ? Math.round(current * 1.07) : recommendation === "SELL" ? Math.round(current * 0.94) : Math.round(current * 1.03);
  const stopLoss = recommendation === "BUY" ? Math.round(current * 0.96) : Math.round(current * 1.03);

  const weekPrices = prices.slice(-7);
  return {
    currentPrice: current,
    previousClose: prev,
    change: Math.round(change),
    changePercent: parseFloat(changePercent.toFixed(2)),
    weekHigh: Math.max(...weekPrices),
    weekLow: Math.min(...weekPrices),
    monthHigh: Math.max(...prices),
    monthLow: Math.min(...prices),
    volume: `${(Math.random() * 3 + 1.5).toFixed(1)}K MT`,
    recommendation,
    confidence,
    signals,
    regions: [
      { name: "Muzaffarnagar", state: "Uttar Pradesh", price: current, change, changePercent },
      { name: "Kolhapur", state: "Maharashtra", price: Math.round(current * 0.97 + (Math.random() - 0.5) * 40), change: Math.round(change * 0.9), changePercent: changePercent * 0.9 },
      { name: "Sangli", state: "Maharashtra", price: Math.round(current * 0.98 + (Math.random() - 0.5) * 30), change: Math.round(change * 0.85), changePercent: changePercent * 0.85 },
      { name: "Varanasi", state: "Uttar Pradesh", price: Math.round(current * 1.01 + (Math.random() - 0.5) * 20), change: Math.round(change * 1.05), changePercent: changePercent * 1.05 },
      { name: "Coimbatore", state: "Tamil Nadu", price: Math.round(current * 1.03 + (Math.random() - 0.5) * 50), change: Math.round(change * 0.7), changePercent: changePercent * 0.7 },
      { name: "Belgaum", state: "Karnataka", price: Math.round(current * 0.99 + (Math.random() - 0.5) * 35), change: Math.round(change * 1.1), changePercent: changePercent * 1.1 },
    ],
    priceHistory: history,
    lastUpdated: today.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
    targetPrice,
    stopLoss,
    upcomingFestivals,
    harvestInfo,
    festivalScore,
    harvestScore,
  };
}
