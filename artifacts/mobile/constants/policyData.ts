export type MSPRecord = {
  year: string;
  mspPerQtl: number;
  change: number;
  changePct: number;
};

export type PolicyItem = {
  id: string;
  title: string;
  category: "msp" | "export" | "gst" | "state" | "apeda" | "scheme";
  date: string;
  description: string;
  impact: "positive" | "negative" | "neutral";
  impactDetail: string;
  authority: string;
};

export type StateScheme = {
  state: string;
  schemes: { name: string; benefit: string; eligibility: string }[];
};

export const MSP_HISTORY: MSPRecord[] = [
  { year: "2019–20", mspPerQtl: 3150, change: 0, changePct: 0 },
  { year: "2020–21", mspPerQtl: 3150, change: 0, changePct: 0 },
  { year: "2021–22", mspPerQtl: 3150, change: 0, changePct: 0 },
  { year: "2022–23", mspPerQtl: 3300, change: 150, changePct: 4.8 },
  { year: "2023–24", mspPerQtl: 3400, change: 100, changePct: 3.0 },
  { year: "2024–25", mspPerQtl: 3500, change: 100, changePct: 2.9 },
  { year: "2025–26", mspPerQtl: 3600, change: 100, changePct: 2.9 },
];

export const POLICY_ITEMS: PolicyItem[] = [
  {
    id: "p1", title: "GST on Jaggery — 0% (Unprocessed)", category: "gst", date: "July 2022",
    description: "The GST Council exempted unprocessed/natural jaggery (gur) from GST entirely. However, processed or packaged jaggery in quantities above 25kg attracts 5% GST.",
    impact: "positive", impactDetail: "Zero GST on bulk unprocessed jaggery saves 5% on every transaction. Packaged product above 25kg: 5% slab.",
    authority: "GST Council / CBIC",
  },
  {
    id: "p2", title: "APEDA Export Promotion — Jaggery Included", category: "apeda", date: "Ongoing",
    description: "APEDA includes jaggery under 'Other Processed Foods' for export promotion. Registered exporters get MDA, quality development subsidies, and access to trade fairs.",
    impact: "positive", impactDetail: "Up to 50% subsidy on testing & certification. 50% airfare for trade missions.",
    authority: "APEDA / MoCI",
  },
  {
    id: "p3", title: "UP Sugarcane Pricing — SAP ₹370/qtl (2024–25)", category: "state", date: "October 2024",
    description: "UP government set the State Advised Price (SAP) for sugarcane at ₹370/quintal for 2024–25 season. Higher cane price directly impacts jaggery production cost — jaggery needs ~8–10 kg cane per kg.",
    impact: "negative", impactDetail: "Input cost rises ~₹30–40/quintal for jaggery producers. Pushes market price support floor up.",
    authority: "UP Cane Commissioner",
  },
  {
    id: "p4", title: "India–UK FTA (Proposed) — Jaggery Duty Reduction", category: "export", date: "2025 (ongoing)",
    description: "India–UK Free Trade Agreement under negotiation includes reduction of UK import duty on Indian jaggery from 3.5% to 0%. Expected to boost organic jaggery exports significantly.",
    impact: "positive", impactDetail: "Will reduce export price by ~3.5% → more competitive vs Thai jaggery in UK market. Export volumes may rise 20–30%.",
    authority: "Ministry of Commerce",
  },
  {
    id: "p5", title: "FSSAI Standard for Jaggery (IS 12923)", category: "gst", date: "Updated 2023",
    description: "FSSAI has updated quality standards for jaggery products. Mandatory lab testing for export-grade jaggery. Moisture max 7%, sucrose min 70%, ash content limits defined.",
    impact: "neutral", impactDetail: "Increases compliance cost (₹500–2,000/batch for testing). Grade A producers benefit from premium pricing signal.",
    authority: "FSSAI",
  },
  {
    id: "p6", title: "NABARD — Kisan Credit Card for Jaggery Producers", category: "scheme", date: "Ongoing",
    description: "Jaggery producers and traders are eligible for Kisan Credit Card (KCC) with interest subvention. Working capital up to ₹3 lakh at 4% effective interest rate after 3% government subvention.",
    impact: "positive", impactDetail: "Access to short-term credit at 4% p.a. for buying sugarcane or jaggery stock. Reduces cost of carry.",
    authority: "NABARD / Cooperative Banks",
  },
  {
    id: "p7", title: "Maharashtra GI Tag — Kolhapuri Jaggery", category: "state", date: "2022",
    description: "Kolhapuri jaggery received Geographical Indication (GI) tag. Only jaggery produced in specific Kolhapur talukas can use this name.",
    impact: "positive", impactDetail: "GI-certified Kolhapuri commands ₹200–400/qtl premium. Export potential increases. Verify certification before paying premium.",
    authority: "GI Registry / Maharashtra Govt",
  },
  {
    id: "p8", title: "Export Restriction Risk — Historical Precedent", category: "export", date: "Advisory",
    description: "India has periodically imposed export restrictions on jaggery (as in 2022–23 for sugar). Traders should monitor DGFT notifications, especially in years of domestic sugar shortage.",
    impact: "negative", impactDetail: "Export restriction can crash export prices by 8–15% overnight. Hedge by having domestic buyer contracts as backup.",
    authority: "DGFT / Ministry of Commerce",
  },
];

export const STATE_SCHEMES: StateScheme[] = [
  {
    state: "Uttar Pradesh",
    schemes: [
      { name: "UP Jaggery Samiti Registration", benefit: "Market access, MSP guarantee, credit linkage", eligibility: "Jaggery producers in UP" },
      { name: "Mukhyamantri Yuva Swarozgar Yojana", benefit: "Up to ₹25L loan at 4% for agro-processing units", eligibility: "18–40 years, UP resident" },
      { name: "Cold Storage Subsidy (NHM)", benefit: "35% capital subsidy on cold storage construction", eligibility: "UP Horticulture Dept registered" },
    ],
  },
  {
    state: "Maharashtra",
    schemes: [
      { name: "Kolhapuri Jaggery GI Certification", benefit: "₹200–400/qtl price premium in markets", eligibility: "Kolhapur district producers only" },
      { name: "MSAMB Agri Marketing", benefit: "Free mandi registration, reduced commission", eligibility: "Maharashtra APMC registered" },
    ],
  },
  {
    state: "Tamil Nadu",
    schemes: [
      { name: "TN Jaggery Producers Cooperative", benefit: "Collective bargaining, export linkages", eligibility: "TN registered producers" },
      { name: "TNAU Quality Certification", benefit: "Testing subsidy 50%", eligibility: "All jaggery producers" },
    ],
  },
];
