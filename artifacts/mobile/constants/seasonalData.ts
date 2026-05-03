export type MonthlyData = {
  month: string;
  shortMonth: string;
  avgPrice: number;
  highPrice: number;
  lowPrice: number;
  signal: "best_buy" | "buy" | "hold" | "sell" | "best_sell";
  supplyLevel: "very_high" | "high" | "moderate" | "low" | "very_low";
  demandLevel: "very_high" | "high" | "moderate" | "low" | "very_low";
  notes: string;
};

export type YearlyData = {
  year: number;
  monthlyAvg: number[];
};

export const SEASONAL_MONTHLY: MonthlyData[] = [
  { month: "January", shortMonth: "Jan", avgPrice: 3800, highPrice: 4100, lowPrice: 3600, signal: "buy", supplyLevel: "high", demandLevel: "moderate", notes: "Peak harvest in UP begins. Supply rises, prices soften. Good accumulation month." },
  { month: "February", shortMonth: "Feb", avgPrice: 3650, highPrice: 3950, lowPrice: 3450, signal: "best_buy", supplyLevel: "very_high", demandLevel: "low", notes: "Lowest prices of the year. Maximum crushing in UP & Maharashtra. BEST MONTH TO BUY AND STOCK." },
  { month: "March", shortMonth: "Mar", avgPrice: 3750, highPrice: 4050, lowPrice: 3550, signal: "buy", supplyLevel: "very_high", demandLevel: "moderate", notes: "Still peak season. Holi brings mild demand bump. Good time to continue buying." },
  { month: "April", shortMonth: "Apr", avgPrice: 3950, highPrice: 4250, lowPrice: 3750, signal: "hold", supplyLevel: "high", demandLevel: "moderate", notes: "North India mills winding down. South India still crushing. Prices stabilising." },
  { month: "May", shortMonth: "May", avgPrice: 4150, highPrice: 4450, lowPrice: 3950, signal: "hold", supplyLevel: "moderate", demandLevel: "moderate", notes: "Supply tightening. Pre-summer demand from confectioners. Prices recovering." },
  { month: "June", shortMonth: "Jun", avgPrice: 4350, highPrice: 4650, lowPrice: 4100, signal: "sell", supplyLevel: "low", demandLevel: "moderate", notes: "Monsoon begins. No crushing. Stocks deplete. Prices rising — partial selling opportunity." },
  { month: "July", shortMonth: "Jul", avgPrice: 4300, highPrice: 4600, lowPrice: 4050, signal: "hold", supplyLevel: "low", demandLevel: "moderate", notes: "Monsoon month. Stable to slightly falling demand. Watch weather for supply impact." },
  { month: "August", shortMonth: "Aug", avgPrice: 4400, highPrice: 4700, lowPrice: 4150, signal: "sell", supplyLevel: "very_low", demandLevel: "high", notes: "Janmashtami, Teej. Pre-festival demand building. Good selling window." },
  { month: "September", shortMonth: "Sep", avgPrice: 4600, highPrice: 4950, lowPrice: 4300, signal: "sell", supplyLevel: "very_low", demandLevel: "very_high", notes: "Ganesh Chaturthi (Maharashtra). Modak demand surge. Strong prices — sell stored jaggery." },
  { month: "October", shortMonth: "Oct", avgPrice: 4900, highPrice: 5250, lowPrice: 4550, signal: "best_sell", supplyLevel: "low", demandLevel: "very_high", notes: "Navratri + Diwali. PEAK DEMAND. HIGHEST PRICES OF YEAR. BEST MONTH TO SELL STORED STOCK." },
  { month: "November", shortMonth: "Nov", avgPrice: 4750, highPrice: 5100, lowPrice: 4400, signal: "best_sell", supplyLevel: "low", demandLevel: "very_high", notes: "Chhath Puja (Bihar/UP). Thekua demand. Prices near peak. Sell remaining inventory." },
  { month: "December", shortMonth: "Dec", avgPrice: 4300, highPrice: 4650, lowPrice: 4000, signal: "hold", supplyLevel: "moderate", demandLevel: "moderate", notes: "Post-festival correction. New sugarcane arriving. Prices softening — prepare to buy in Jan." },
];

export const HISTORICAL_YEARLY: YearlyData[] = [
  { year: 2020, monthlyAvg: [3600, 3450, 3500, 3700, 3900, 4100, 4000, 4200, 4400, 4600, 4500, 4100] },
  { year: 2021, monthlyAvg: [3750, 3600, 3700, 3900, 4100, 4300, 4200, 4400, 4700, 5000, 4800, 4300] },
  { year: 2022, monthlyAvg: [3900, 3750, 3800, 4050, 4250, 4450, 4350, 4500, 4800, 5100, 4900, 4400] },
  { year: 2023, monthlyAvg: [3800, 3650, 3750, 3950, 4150, 4350, 4300, 4400, 4600, 4900, 4700, 4300] },
  { year: 2024, monthlyAvg: [4000, 3850, 3950, 4150, 4300, 4500, 4450, 4550, 4750, 5050, 4850, 4450] },
];

export function getSeasonalSignalColor(signal: MonthlyData["signal"]): string {
  switch (signal) {
    case "best_buy": return "#0D9488";
    case "buy": return "#16A34A";
    case "hold": return "#F59E0B";
    case "sell": return "#EA580C";
    case "best_sell": return "#EF4444";
  }
}

export function getSeasonalSignalLabel(signal: MonthlyData["signal"]): string {
  switch (signal) {
    case "best_buy": return "BEST BUY";
    case "buy": return "BUY";
    case "hold": return "HOLD";
    case "sell": return "SELL";
    case "best_sell": return "BEST SELL";
  }
}

export function computeAvgByMonth(): number[] {
  const totals = Array(12).fill(0);
  const counts = Array(12).fill(0);
  for (const yr of HISTORICAL_YEARLY) {
    yr.monthlyAvg.forEach((p, i) => { totals[i] += p; counts[i]++; });
  }
  return totals.map((t, i) => Math.round(t / counts[i]));
}
