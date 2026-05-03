import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const BASE_PRICES: Record<number, number> = {
  0: 4400, 1: 4200, 2: 4000, 3: 3800, 4: 3700, 5: 3650,
  6: 3750, 7: 3900, 8: 4100, 9: 4300, 10: 4600, 11: 4800,
};

function deterministicPrice(dateStr: string, base: number): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const variation = ((Math.abs(hash) % 180) - 90);
  return Math.round(base + variation);
}

router.get("/market/snapshot", (req: Request, res: Response) => {
  const today = new Date();
  const month = today.getMonth();
  const dateStr = today.toISOString().split("T")[0];
  const manualPriceParam = req.query["manualPrice"];
  const manualPrice = manualPriceParam ? parseFloat(manualPriceParam as string) : null;

  const base = BASE_PRICES[month] ?? 4200;
  const currentPrice = manualPrice ?? deterministicPrice(dateStr, base);
  const prevDateStr = new Date(today.getTime() - 86400000).toISOString().split("T")[0];
  const previousPrice = deterministicPrice(prevDateStr, base);
  const change = currentPrice - previousPrice;

  const weekPrices = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getTime() - i * 86400000).toISOString().split("T")[0];
    return deterministicPrice(d, base);
  });

  const monthPrices = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today.getTime() - i * 86400000).toISOString().split("T")[0];
    return deterministicPrice(d, base);
  });

  res.json({
    source: manualPrice ? "manual" : "deterministic",
    timestamp: today.toISOString(),
    currentPrice,
    previousPrice,
    change,
    changePercent: parseFloat(((change / previousPrice) * 100).toFixed(2)),
    weekHigh: Math.max(...weekPrices),
    weekLow: Math.min(...weekPrices),
    monthHigh: Math.max(...monthPrices),
    monthLow: Math.min(...monthPrices),
    lastUpdated: today.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
    note: manualPrice
      ? "Using manually entered price from settings"
      : "Deterministic price based on seasonal patterns. Set a manual price in app settings to reflect your local mandi rate.",
    integrationHint: {
      agmarknet: "https://agmarknet.gov.in — India's official mandi price portal (no public JSON API)",
      dataGovIn: "https://data.gov.in — Search 'jaggery' for available datasets",
      manual: "Traders can enter their local mandi price in app Settings for best accuracy",
    },
  });
});

router.get("/market/regions", (_req: Request, res: Response) => {
  const today = new Date();
  const month = today.getMonth();
  const dateStr = today.toISOString().split("T")[0];
  const base = BASE_PRICES[month] ?? 4200;
  const muzPrice = deterministicPrice(dateStr, base);

  res.json({
    timestamp: today.toISOString(),
    regions: [
      { name: "Muzaffarnagar", state: "Uttar Pradesh", price: muzPrice, variety: "Khandsari UP" },
      { name: "Kolhapur", state: "Maharashtra", price: Math.round(muzPrice * 1.04 + ((Math.abs(dateStr.length * 7) % 40) - 20)), variety: "Kolhapuri (GI)" },
      { name: "Sangli", state: "Maharashtra", price: Math.round(muzPrice * 1.02 + ((Math.abs(dateStr.length * 5) % 30) - 15)), variety: "Kolhapuri" },
      { name: "Erode", state: "Tamil Nadu", price: Math.round(muzPrice * 1.06 + ((Math.abs(dateStr.length * 3) % 50) - 25)), variety: "TN Vellam" },
      { name: "Belagavi", state: "Karnataka", price: Math.round(muzPrice * 1.03 + ((Math.abs(dateStr.length * 9) % 35) - 17)), variety: "Belagavi Gur" },
      { name: "Varanasi", state: "Uttar Pradesh", price: Math.round(muzPrice * 1.01 + ((Math.abs(dateStr.length * 11) % 20) - 10)), variety: "Khandsari UP" },
    ],
  });
});

export default router;
