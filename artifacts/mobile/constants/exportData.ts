export type ExportMarket = {
  country: string;
  flag: string;
  demandLevel: "very_high" | "high" | "moderate" | "low";
  avgPriceFOB: number;
  premiumOverDomestic: number;
  monthlyVolumeKT: number;
  preferredVariety: string;
  preferredGrade: string;
  keyRequirements: string[];
  trend: "rising" | "stable" | "falling";
  notes: string;
};

export type DomesticBuyer = {
  category: string;
  icon: string;
  examples: string[];
  avgPremium: number;
  volumeRequirement: string;
  paymentTerms: string;
  notes: string;
};

export const EXPORT_MARKETS: ExportMarket[] = [
  {
    country: "Bangladesh",
    flag: "🇧🇩",
    demandLevel: "very_high",
    avgPriceFOB: 510,
    premiumOverDomestic: 12,
    monthlyVolumeKT: 18.4,
    preferredVariety: "Khandsari UP, Shakkar Gur",
    preferredGrade: "B/C",
    keyRequirements: ["FSSAI certificate", "Phytosanitary cert", "No sulphur"],
    trend: "rising",
    notes: "Largest importer. Demand driven by Eid, Puja sweets. UP border districts (Gorakhpur, Kushinagar) are key dispatch points.",
  },
  {
    country: "UAE / Gulf States",
    flag: "🇦🇪",
    demandLevel: "high",
    avgPriceFOB: 580,
    premiumOverDomestic: 22,
    monthlyVolumeKT: 6.2,
    preferredVariety: "Kolhapuri, Organic",
    preferredGrade: "A",
    keyRequirements: ["Halal certification", "APEDA code", "Grade A only", "Vacuum packed"],
    trend: "rising",
    notes: "Indian expat community drives demand. Ramadan is peak export season. Premium for block form.",
  },
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    demandLevel: "high",
    avgPriceFOB: 720,
    premiumOverDomestic: 48,
    monthlyVolumeKT: 3.8,
    preferredVariety: "Organic Certified, TN Vellam",
    preferredGrade: "A",
    keyRequirements: ["UK Organic cert (Soil Assoc.)", "APEDA", "Pesticide-free report", "EU-equivalent labelling"],
    trend: "rising",
    notes: "Health food market booming. Organic premium 40–55% over domestic. UK-India FTA may reduce tariffs.",
  },
  {
    country: "USA",
    flag: "🇺🇸",
    demandLevel: "high",
    avgPriceFOB: 750,
    premiumOverDomestic: 55,
    monthlyVolumeKT: 2.9,
    preferredVariety: "Organic Certified",
    preferredGrade: "A",
    keyRequirements: ["USDA Organic cert", "FDA registration", "Allergen statement", "Country of origin labelling"],
    trend: "rising",
    notes: "Fastest growing market. Whole Foods, Amazon Premium listings. Indian diaspora + health food segment.",
  },
  {
    country: "Sri Lanka",
    flag: "🇱🇰",
    demandLevel: "moderate",
    avgPriceFOB: 470,
    premiumOverDomestic: 5,
    monthlyVolumeKT: 4.1,
    preferredVariety: "TN Vellam, Khandsari",
    preferredGrade: "B",
    keyRequirements: ["Phytosanitary cert", "SLFTA form"],
    trend: "stable",
    notes: "Cultural demand for jaggery-based sweets. Economic crisis reduced volume but recovering.",
  },
  {
    country: "Malaysia",
    flag: "🇲🇾",
    demandLevel: "moderate",
    avgPriceFOB: 540,
    premiumOverDomestic: 16,
    monthlyVolumeKT: 2.5,
    preferredVariety: "TN Vellam",
    preferredGrade: "A/B",
    keyRequirements: ["Halal cert", "APEDA", "Food safety cert"],
    trend: "stable",
    notes: "South Indian expat community. Halal requirement mandatory.",
  },
];

export const DOMESTIC_BUYERS: DomesticBuyer[] = [
  { category: "Premium Confectioners & Sweet Shops", icon: "gift", examples: ["Haldiram's", "Bikaji", "Bikanerwala", "Chitale Bandhu"], avgPremium: 8, volumeRequirement: "5–50 MT/order", paymentTerms: "Advance or 7-day credit", notes: "Grade A mandatory. Consistent supply contract value. Seasonal spikes (Diwali, Holi)." },
  { category: "Ayurvedic & Health Companies", icon: "heart", examples: ["Dabur", "Patanjali", "Baidyanath", "Sri Sri Tattva"], avgPremium: 12, volumeRequirement: "10–100 MT/month", paymentTerms: "30–45 day credit", notes: "Shakkar Gur and Organic varieties preferred. Long-term supply contracts available." },
  { category: "Exporters (APEDA Registered)", icon: "upload", examples: ["Mehta Overseas", "Agro India", "Krishi Export House"], avgPremium: 15, volumeRequirement: "50–500 MT/shipment", paymentTerms: "LC at sight / TT", notes: "Best prices but compliance-heavy. Need APEDA registration, quality certs." },
  { category: "FMCG & Beverage Companies", icon: "package", examples: ["ITC", "Marico", "Parle Agro", "Godrej Foods"], avgPremium: 5, volumeRequirement: "100–1000 MT/month", paymentTerms: "30–60 day credit", notes: "Volume contracts. Grade B acceptable. Stable year-round demand." },
  { category: "Government Procurement (NAFED)", icon: "file-text", examples: ["NAFED", "State Food Corp", "FCI"], avgPremium: -5, volumeRequirement: "As per tender", paymentTerms: "60–90 day (govt)", notes: "Lower prices but zero collection risk. MSP-linked. Check NAFED portal for tenders." },
  { category: "Local Wholesale Mandis", icon: "shopping-bag", examples: ["Azadpur (Delhi)", "Navi Mumbai APMC", "Erode APMC"], avgPremium: 0, volumeRequirement: "1–10 MT/day", paymentTerms: "Spot/daily", notes: "Benchmark price. Fast liquidation. Commission 1–2%. Good for quick exit." },
];

export const APEDA_SCHEMES = [
  { name: "Market Development Assistance (MDA)", benefit: "50% subsidy on airfare for trade fair participation", eligibility: "APEDA registered exporters" },
  { name: "Infrastructure Development Assistance", benefit: "Up to 25% subsidy on cold storage/pack-house construction", eligibility: "Exporters + co-ops" },
  { name: "Quality Development", benefit: "50–75% subsidy on lab testing, certification", eligibility: "All exporters" },
  { name: "GI Tag Registration", benefit: "Free GI registration for regional jaggery varieties", eligibility: "Producer groups" },
];
