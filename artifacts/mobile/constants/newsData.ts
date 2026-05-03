export type NewsItem = {
  id: string;
  headline: string;
  detail: string;
  source: string;
  category: "weather" | "policy" | "export" | "import" | "supply" | "demand" | "transport";
  sentiment: "bullish" | "bearish" | "neutral";
  priceImpactPct: number;
  publishedAt: string;
  isBreaking: boolean;
  region: string;
};

type NewsTemplate = Omit<NewsItem, "id" | "publishedAt" | "isBreaking">;

const BULLISH_TEMPLATES: NewsTemplate[] = [
  {
    headline: "Heavy rains lash Muzaffarnagar belt — sugarcane lodging reported",
    detail: "Incessant rainfall over the past 48 hours has caused sugarcane lodging in Muzaffarnagar, Shamli, and Saharanpur districts. Early estimates suggest 8–12% crop damage in low-lying areas. Mill arrivals expected to decline in the coming weeks, tightening jaggery supply.",
    source: "Kisan Samāchār / UP Mandi Board",
    category: "weather",
    sentiment: "bullish",
    priceImpactPct: 6,
    region: "Uttar Pradesh",
  },
  {
    headline: "Maharashtra drought alert: Kolhapur sugarcane yield may fall 15%",
    detail: "The Maharashtra drought monitoring cell has flagged insufficient rainfall in Kolhapur and Sangli talukas. Sugarcane yield projections reduced to 70–75 MT/acre against 85 MT benchmark. Jaggery production from these mandis expected to drop in Q1.",
    source: "Maharashtra APMC / IMD",
    category: "weather",
    sentiment: "bullish",
    priceImpactPct: 8,
    region: "Maharashtra",
  },
  {
    headline: "India restricts jaggery exports — DGFT issues new quota",
    detail: "India's Directorate General of Foreign Trade has imposed an annual export ceiling on raw jaggery under HS Code 1701. The move aims to protect domestic availability ahead of the festival season. Exporters can apply for licenses up to the specified quota. Domestic surplus expected to rise.",
    source: "DGFT Notification / Business Standard",
    category: "export",
    sentiment: "bullish",
    priceImpactPct: 5,
    region: "All India",
  },
  {
    headline: "Truck drivers' strike hits jaggery supply in Delhi NCR mandis",
    detail: "Transporters in western UP are on a 72-hour strike over diesel price hikes and toll increases. Jaggery arrivals at Azadpur (Delhi) and Ghazipur (UP) mandis have halved. Spot prices up ₹120–180/quintal in thin trading.",
    source: "Traders' Association / Mandi Committee",
    category: "transport",
    sentiment: "bullish",
    priceImpactPct: 4,
    region: "Delhi/NCR & Western UP",
  },
  {
    headline: "Bangladesh import demand surges — UP jaggery enquiries up 40%",
    detail: "Bangladesh sugar mills' strike has pushed consumers to seek natural sweetener alternatives. UP jaggery exporters report a 40% surge in enquiries from Dhaka and Chittagong. Export premium over domestic prices widening.",
    source: "APEDA / Export Council of India",
    category: "export",
    sentiment: "bullish",
    priceImpactPct: 7,
    region: "Export Markets",
  },
  {
    headline: "Muzaffarnagar mill Triveni Sugar reports 20% lower sugarcane arrivals",
    detail: "Triveni Engineering's Muzaffarnagar unit logged significantly lower sugarcane arrivals in the first fortnight vs prior year. Management cites competing sugarcane diversion to other mills and slightly delayed harvest. Jaggery production at attached khandsari units also reduced.",
    source: "BSE Filing / Mill Statement",
    category: "supply",
    sentiment: "bullish",
    priceImpactPct: 5,
    region: "Muzaffarnagar, UP",
  },
  {
    headline: "Organic jaggery demand from Europe spikes — APEDA reports record inquiries",
    detail: "European demand for certified organic jaggery (gur) has hit a 5-year high, driven by sugar-free product trends. APEDA reports 22% rise in export registrations for organic jaggery units in UP and Karnataka. Premium over conventional jaggery now at ₹400–600/quintal.",
    source: "APEDA Monthly Report",
    category: "demand",
    sentiment: "bullish",
    priceImpactPct: 4,
    region: "Export (EU/UK)",
  },
  {
    headline: "Pest attack on sugarcane in Erode district — TN output to fall",
    detail: "A pyrilla pest outbreak in Erode, Karur, and Namakkal has damaged standing sugarcane. The Tamil Nadu Agriculture Dept has issued an advisory. District-level crop loss estimates put at 10–14%.",
    source: "TNAU Advisory / Erode Mandi",
    category: "supply",
    sentiment: "bullish",
    priceImpactPct: 6,
    region: "Tamil Nadu",
  },
  {
    headline: "Pre-budget speculation: Jaggery sector may get zero GST status",
    detail: "Industry bodies are lobbying for complete GST exemption on processed jaggery ahead of the Union Budget. If granted, this could make organised jaggery units more competitive and boost value-added product demand by 10–15%.",
    source: "FICCI / Economic Times",
    category: "policy",
    sentiment: "bullish",
    priceImpactPct: 3,
    region: "All India",
  },
];

const BEARISH_TEMPLATES: NewsTemplate[] = [
  {
    headline: "Bumper sugarcane crop forecast in UP — ISMA raises production estimate",
    detail: "ISMA has revised UP sugarcane production estimates upward by 8% following above-normal monsoon in the cane belt. Muzaffarnagar, Meerut, and Bareilly divisions expected to deliver record arrivals. Jaggery prices likely to see seasonal downward pressure from November.",
    source: "ISMA Report / Down to Earth",
    category: "supply",
    sentiment: "bearish",
    priceImpactPct: 7,
    region: "Uttar Pradesh",
  },
  {
    headline: "India raises jaggery import quota — Nepal/Bhutan suppliers benefit",
    detail: "India has expanded its jaggery import quota from Nepal under SAFTA. Cross-border arrivals at Gorakhpur and Raxaul expected to supplement domestic supply. The imported jaggery is typically 4–6% cheaper than UP-origin product.",
    source: "Ministry of Commerce / Trade Notice",
    category: "import",
    sentiment: "bearish",
    priceImpactPct: 4,
    region: "Eastern UP / Bihar",
  },
  {
    headline: "Post-festival inventory drawdown underway — demand cooling off",
    detail: "Major confectioners and halwai associations confirm that post-Diwali pre-purchases are being used up. Wholesale reorder volumes have dropped 30% WoW. Spot prices at Muzaffarnagar and Kolhapur mandis under mild pressure.",
    source: "All India Sweets Traders Federation",
    category: "demand",
    sentiment: "bearish",
    priceImpactPct: 5,
    region: "All India",
  },
  {
    headline: "APEDA removes jaggery export incentive — MEIS benefit withdrawn",
    detail: "The government has removed the Merchandise Exports from India Scheme (MEIS) benefit for jaggery under certain HS codes. Exporters will now face higher effective costs, reducing international competitiveness. Domestic surplus may build.",
    source: "DGFT Circular / Financial Express",
    category: "policy",
    sentiment: "bearish",
    priceImpactPct: 4,
    region: "Export Markets",
  },
  {
    headline: "Maharashtra records 140% of normal rainfall — sugarcane crop excellent",
    detail: "Maharashtra's Konkan and Western Ghats districts have received 140% of normal annual rainfall. Sugarcane crop in Kolhapur, Sangli, and Satara reported in excellent condition with high sucrose content. Mill crushing season expected to be extended by 2–3 weeks.",
    source: "IMD / Maharashtra APMC",
    category: "weather",
    sentiment: "bearish",
    priceImpactPct: 6,
    region: "Maharashtra",
  },
  {
    headline: "Gujarat mills increase sugarcane procurement — diverting from jaggery units",
    detail: "Sugar mills in Surat and Valsad districts have raised their sugarcane procurement price, attracting more farmers. This may reduce the proportion of cane going to jaggery-making units (kolhus), though jaggery-specific impact seen as limited.",
    source: "Gujarat Sugar Mills Association",
    category: "supply",
    sentiment: "bearish",
    priceImpactPct: 3,
    region: "Gujarat",
  },
  {
    headline: "UP government clears new khandsari licences — supply capacity to grow",
    detail: "The UP Food Safety and Drug Administration has cleared 14 new khandsari (jaggery processing) unit licences in Muzaffarnagar and Meerut. New capacity expected to come online within 6–8 months.",
    source: "UP FSSAI Office / UP Jaggery Samiti",
    category: "supply",
    sentiment: "bearish",
    priceImpactPct: 3,
    region: "Uttar Pradesh",
  },
  {
    headline: "Artificial sweetener imports surge 18% — jaggery demand substitution risk",
    detail: "FMCG companies are increasingly switching to stevia and sucralose-based sweeteners in beverages and baked goods. Bulk jaggery procurement from industrial buyers fell 8% in the past quarter.",
    source: "FMCG Industry Report / Mint",
    category: "demand",
    sentiment: "bearish",
    priceImpactPct: 3,
    region: "All India",
  },
];

const NEUTRAL_TEMPLATES: NewsTemplate[] = [
  {
    headline: "UP government announces jaggery quality grading scheme",
    detail: "The Uttar Pradesh government will implement a mandatory 3-tier quality grading for jaggery sold at APMCs from next season. Grade A (high sucrose, golden colour), Grade B, and Grade C will carry differential pricing. Traders expect short-term disruption.",
    source: "UP APMC Notification",
    category: "policy",
    sentiment: "neutral",
    priceImpactPct: 1,
    region: "Uttar Pradesh",
  },
  {
    headline: "IMD forecasts normal monsoon withdrawal from northwest India",
    detail: "India Meteorological Department's extended-range forecast indicates normal monsoon withdrawal timing from October. Sugarcane harvest to proceed without weather disruption for most of the UP belt.",
    source: "IMD Extended Range Forecast",
    category: "weather",
    sentiment: "neutral",
    priceImpactPct: 1,
    region: "North India",
  },
  {
    headline: "CIBIL introduces agri-commodity credit rating for jaggery traders",
    detail: "TransUnion CIBIL has launched a pilot commodity-linked credit rating for organised jaggery traders in UP. The initiative aims to formalise access to institutional credit at lower rates.",
    source: "CIBIL / RBI Press Release",
    category: "policy",
    sentiment: "neutral",
    priceImpactPct: 0,
    region: "All India",
  },
  {
    headline: "GI Tag registration for Muzaffarnagar Shakkar gur progressing",
    detail: "The geographical indication tag application for Muzaffarnagar's distinctive 'Shakkar gur' — a dry granular jaggery — is under review by the GI Registry. Approval expected within 6 months, which may attract export premium.",
    source: "GI Registry / APEDA",
    category: "policy",
    sentiment: "neutral",
    priceImpactPct: 2,
    region: "Muzaffarnagar, UP",
  },
];

function deterministicShuffle<T>(arr: T[], seed: number): T[] {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getDailySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function formatTime(offset: number): string {
  const d = new Date();
  d.setHours(d.getHours() - offset, Math.floor(Math.random() * 60), 0, 0);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export function generateDailyNews(month: number): NewsItem[] {
  const seed = getDailySeed();
  const isHarvestSeason = month >= 0 && month <= 2;
  const isFestivalSeason = month >= 8 && month <= 11;

  let bullishPool = deterministicShuffle(BULLISH_TEMPLATES, seed);
  let bearishPool = deterministicShuffle(BEARISH_TEMPLATES, seed + 1);
  const neutralPool = deterministicShuffle(NEUTRAL_TEMPLATES, seed + 2);

  if (isHarvestSeason) {
    bearishPool = bearishPool.filter((n) => n.category === "supply" || n.category === "weather");
    bullishPool = bullishPool.filter((n) => n.category !== "supply");
  }
  if (isFestivalSeason) {
    bullishPool = bullishPool.filter((n) => n.category !== "transport").concat(bullishPool.filter((n) => n.category === "transport"));
  }

  const selected: NewsTemplate[] = [
    ...bullishPool.slice(0, isHarvestSeason ? 1 : isFestivalSeason ? 3 : 2),
    ...bearishPool.slice(0, isHarvestSeason ? 3 : isFestivalSeason ? 1 : 2),
    ...neutralPool.slice(0, 1),
  ];

  return deterministicShuffle(selected, seed + 3).map((t, i) => ({
    ...t,
    id: `news_${seed}_${i}`,
    publishedAt: formatTime(i * 2),
    isBreaking: i === 0,
  }));
}

export function computeNewsSentimentScore(news: NewsItem[]): number {
  let score = 0;
  for (const item of news) {
    const w = item.priceImpactPct / 100;
    if (item.sentiment === "bullish") score += w;
    else if (item.sentiment === "bearish") score -= w;
  }
  return Math.max(-1, Math.min(1, score));
}
