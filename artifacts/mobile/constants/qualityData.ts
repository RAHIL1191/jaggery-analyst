export type JaggeryGrade = "A" | "B" | "C";
export type JaggeryVariety =
  | "Khandsari UP"
  | "Kolhapuri"
  | "TN Vellam"
  | "Organic Certified"
  | "Shakkar Gur"
  | "Dark/Coarse";

export type GradeSpec = {
  grade: JaggeryGrade;
  label: string;
  color: string;
  sucrosePct: string;
  moisturePct: string;
  colorDesc: string;
  premiumVsBase: number;
  bestFor: string;
  shelfLifeMonths: number;
};

export type VarietySpec = {
  variety: JaggeryVariety;
  region: string;
  basePriceMultiplier: number;
  description: string;
  exportDemand: "high" | "medium" | "low";
  premiumMarket: string;
  icon: string;
};

export type MarketGradePrice = {
  mandi: string;
  gradeA: number;
  gradeB: number;
  gradeC: number;
};

export const GRADE_SPECS: GradeSpec[] = [
  {
    grade: "A",
    label: "Grade A — Premium",
    color: "#F59E0B",
    sucrosePct: "75–85%",
    moisturePct: "<3%",
    colorDesc: "Golden yellow",
    premiumVsBase: 15,
    bestFor: "Export, premium confectionery, organic market, sweets brands",
    shelfLifeMonths: 12,
  },
  {
    grade: "B",
    label: "Grade B — Standard",
    color: "#92400E",
    sucrosePct: "65–75%",
    moisturePct: "3–5%",
    colorDesc: "Light to medium brown",
    premiumVsBase: 0,
    bestFor: "Retail market, mid-range confectioners, home use",
    shelfLifeMonths: 8,
  },
  {
    grade: "C",
    label: "Grade C — Economy",
    color: "#374151",
    sucrosePct: "55–65%",
    moisturePct: ">5%",
    colorDesc: "Dark brown to black",
    premiumVsBase: -12,
    bestFor: "Industrial use, cattle feed additive, low-end traders",
    shelfLifeMonths: 5,
  },
];

export const VARIETY_SPECS: VarietySpec[] = [
  { variety: "Khandsari UP", region: "Muzaffarnagar, UP", basePriceMultiplier: 1.0, description: "Most traded variety. Balanced quality and availability. Sets the benchmark price.", exportDemand: "medium", premiumMarket: "Domestic wholesale", icon: "box" },
  { variety: "Kolhapuri", region: "Kolhapur, Maharashtra", basePriceMultiplier: 1.04, description: "GI-tagged. Rich flavour from high-sucrose Amba cane. In demand for traditional sweets.", exportDemand: "high", premiumMarket: "Maharashtra + Export (UK/US)", icon: "award" },
  { variety: "TN Vellam", region: "Erode/Coimbatore, Tamil Nadu", basePriceMultiplier: 1.06, description: "Hard block form. Superior shelf life. High demand in South Indian festivals.", exportDemand: "high", premiumMarket: "South India + Sri Lanka/Malaysia", icon: "shield" },
  { variety: "Organic Certified", region: "Multiple states", basePriceMultiplier: 1.28, description: "APEDA certified organic. Growing demand in EU, USA, UK. 25–35% export premium.", exportDemand: "high", premiumMarket: "Europe, USA, UK (organic stores)", icon: "leaf" },
  { variety: "Shakkar Gur", region: "Muzaffarnagar, UP", basePriceMultiplier: 1.08, description: "Dry granular form. GI application pending. Long shelf life. Preferred for industrial use.", exportDemand: "medium", premiumMarket: "Pharma, Ayurveda, Health foods", icon: "droplet" },
  { variety: "Dark/Coarse", region: "All regions", basePriceMultiplier: 0.82, description: "Low-grade output. Impurities high. Limited to local industrial or cattle feed use.", exportDemand: "low", premiumMarket: "Local/industrial only", icon: "minus-circle" },
];

export const MARKET_GRADE_PRICES: MarketGradePrice[] = [
  { mandi: "Muzaffarnagar", gradeA: 4200, gradeB: 3650, gradeC: 3200 },
  { mandi: "Kolhapur", gradeA: 4400, gradeB: 3800, gradeC: 3350 },
  { mandi: "Erode", gradeA: 4500, gradeB: 3900, gradeC: 3400 },
  { mandi: "Sangli", gradeA: 4300, gradeB: 3750, gradeC: 3300 },
  { mandi: "Varanasi", gradeA: 4100, gradeB: 3600, gradeC: 3150 },
  { mandi: "Belagavi", gradeA: 4350, gradeB: 3800, gradeC: 3300 },
];

export const QUALITY_PARAMETERS = [
  { param: "Sucrose Content", gradeA: "75–85%", gradeB: "65–75%", gradeC: "55–65%", importance: "critical" },
  { param: "Moisture", gradeA: "<3%", gradeB: "3–5%", gradeC: ">5%", importance: "critical" },
  { param: "Colour", gradeA: "Golden yellow", gradeB: "Light brown", gradeC: "Dark brown", importance: "high" },
  { param: "Ash content", gradeA: "<1%", gradeB: "1–2%", gradeC: ">2%", importance: "medium" },
  { param: "Reducing sugars", gradeA: "5–10%", gradeB: "10–15%", gradeC: ">15%", importance: "medium" },
  { param: "Shelf life", gradeA: "10–12 months", gradeB: "6–8 months", gradeC: "4–5 months", importance: "high" },
];
