export type ColdStorage = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  distanceKm: number;
  ratePerQuintalPerMonth: number;
  capacity: string;
  availableCapacity: string;
  contact: string;
  rating: number;
  features: string[];
  rateLevel: "low" | "moderate" | "high";
};

export type StockSignal = {
  action: "STOCK_NOW" | "WAIT" | "PARTIAL_STOCK" | "SELL_FROM_STORAGE";
  confidence: number;
  reason: string;
  expectedGainPct: number;
  holdMonths: number;
  breakEven: number;
};

export type PinRegion = {
  region: string;
  state: string;
  city: string;
  isJaggeryHub: boolean;
};

const PIN_REGIONS: Record<string, PinRegion> = {
  "251": { region: "Muzaffarnagar", state: "Uttar Pradesh", city: "Muzaffarnagar", isJaggeryHub: true },
  "247": { region: "Saharanpur", state: "Uttar Pradesh", city: "Saharanpur", isJaggeryHub: true },
  "201": { region: "Ghaziabad/Noida", state: "Uttar Pradesh", city: "Ghaziabad", isJaggeryHub: false },
  "204": { region: "Hathras", state: "Uttar Pradesh", city: "Hathras", isJaggeryHub: true },
  "221": { region: "Varanasi", state: "Uttar Pradesh", city: "Varanasi", isJaggeryHub: false },
  "226": { region: "Lucknow", state: "Uttar Pradesh", city: "Lucknow", isJaggeryHub: false },
  "416": { region: "Kolhapur", state: "Maharashtra", city: "Kolhapur", isJaggeryHub: true },
  "415": { region: "Satara / Sangli", state: "Maharashtra", city: "Sangli", isJaggeryHub: true },
  "413": { region: "Solapur", state: "Maharashtra", city: "Solapur", isJaggeryHub: false },
  "400": { region: "Mumbai", state: "Maharashtra", city: "Mumbai", isJaggeryHub: false },
  "641": { region: "Coimbatore", state: "Tamil Nadu", city: "Coimbatore", isJaggeryHub: true },
  "638": { region: "Erode", state: "Tamil Nadu", city: "Erode", isJaggeryHub: true },
  "590": { region: "Belagavi / Belgaum", state: "Karnataka", city: "Belagavi", isJaggeryHub: true },
  "576": { region: "Udupi/Mangaluru", state: "Karnataka", city: "Mangaluru", isJaggeryHub: false },
  "302": { region: "Jaipur", state: "Rajasthan", city: "Jaipur", isJaggeryHub: false },
  "110": { region: "Delhi", state: "Delhi", city: "New Delhi", isJaggeryHub: false },
  "143": { region: "Amritsar", state: "Punjab", city: "Amritsar", isJaggeryHub: false },
  "144": { region: "Jalandhar", state: "Punjab", city: "Jalandhar", isJaggeryHub: false },
};

const STORAGE_TEMPLATES: Record<string, ColdStorage[]> = {
  "251": [
    { id: "mzn1", name: "Rajdhani Cold Storage", address: "Industrial Area, Mansurpur Road", city: "Muzaffarnagar", state: "Uttar Pradesh", pincode: "251001", distanceKm: 2.4, ratePerQuintalPerMonth: 38, capacity: "12,000 MT", availableCapacity: "4,200 MT", contact: "+91 99370 11234", rating: 4.3, features: ["Temperature controlled", "24x7 security", "Insurance available"], rateLevel: "low" },
    { id: "mzn2", name: "Shiva Cold & Dry Storage", address: "Near Mandi Samiti, Budhana Road", city: "Muzaffarnagar", state: "Uttar Pradesh", pincode: "251002", distanceKm: 4.1, ratePerQuintalPerMonth: 45, capacity: "8,500 MT", availableCapacity: "2,100 MT", contact: "+91 99370 22345", rating: 4.1, features: ["Humidity control", "Weighbridge on-site", "24x7 security"], rateLevel: "moderate" },
    { id: "mzn3", name: "Ganga Agro Warehouse", address: "NH-58, Bhopa Road", city: "Muzaffarnagar", state: "Uttar Pradesh", pincode: "251003", distanceKm: 7.8, ratePerQuintalPerMonth: 32, capacity: "20,000 MT", availableCapacity: "8,600 MT", contact: "+91 99370 33456", rating: 3.8, features: ["Large capacity", "Road access", "Bulk discount available"], rateLevel: "low" },
    { id: "mzn4", name: "Modi Agro Cold Storage", address: "Shamli Road, Sector 2", city: "Muzaffarnagar", state: "Uttar Pradesh", pincode: "251001", distanceKm: 5.2, ratePerQuintalPerMonth: 55, capacity: "6,000 MT", availableCapacity: "1,200 MT", contact: "+91 99370 44567", rating: 4.7, features: ["Premium insulation", "APEDA certified", "Real-time monitoring"], rateLevel: "high" },
  ],
  "247": [
    { id: "shr1", name: "Saharanpur Cold Hub", address: "Industrial Estate, Ambala Road", city: "Saharanpur", state: "Uttar Pradesh", pincode: "247001", distanceKm: 3.2, ratePerQuintalPerMonth: 36, capacity: "9,000 MT", availableCapacity: "3,500 MT", contact: "+91 98370 55678", rating: 4.0, features: ["Temperature logs", "Insurance", "24x7 access"], rateLevel: "low" },
    { id: "shr2", name: "Deoband Agri Storage", address: "Mandi Road, Deoband", city: "Deoband", state: "Uttar Pradesh", pincode: "247554", distanceKm: 18.4, ratePerQuintalPerMonth: 30, capacity: "15,000 MT", availableCapacity: "6,800 MT", contact: "+91 98370 66789", rating: 3.7, features: ["Economical rates", "Large capacity"], rateLevel: "low" },
  ],
  "416": [
    { id: "klp1", name: "Kolhapur Jaggery Cold Centre", address: "MIDC, Gokul Shirgaon", city: "Kolhapur", state: "Maharashtra", pincode: "416234", distanceKm: 5.6, ratePerQuintalPerMonth: 42, capacity: "11,000 MT", availableCapacity: "3,800 MT", contact: "+91 97623 11234", rating: 4.4, features: ["GI tag jaggery specialist", "Export-ready", "Certified facility"], rateLevel: "moderate" },
    { id: "klp2", name: "Shahu Cold Storage", address: "Kasaba Bawada, Kolhapur", city: "Kolhapur", state: "Maharashtra", pincode: "416006", distanceKm: 2.1, ratePerQuintalPerMonth: 50, capacity: "5,500 MT", availableCapacity: "900 MT", contact: "+91 97623 22345", rating: 4.6, features: ["Premium storage", "Near mandi", "Quick loading"], rateLevel: "high" },
    { id: "klp3", name: "Panchganga Agro Warehouse", address: "Shiroli MIDC", city: "Kolhapur", state: "Maharashtra", pincode: "416122", distanceKm: 12.3, ratePerQuintalPerMonth: 35, capacity: "18,000 MT", availableCapacity: "7,200 MT", contact: "+91 97623 33456", rating: 3.9, features: ["Bulk capacity", "Affordable rates", "Highway access"], rateLevel: "low" },
  ],
  "415": [
    { id: "sng1", name: "Sangli Cooperative Cold Store", address: "Near APMC Market, Vishrambag", city: "Sangli", state: "Maharashtra", pincode: "416415", distanceKm: 1.8, ratePerQuintalPerMonth: 40, capacity: "10,000 MT", availableCapacity: "4,100 MT", contact: "+91 97523 11234", rating: 4.2, features: ["Cooperative rates", "APMC linked", "Trusted"], rateLevel: "moderate" },
    { id: "sng2", name: "Krishna Valley Storage", address: "Miraj Road, Sangli", city: "Sangli", state: "Maharashtra", pincode: "416410", distanceKm: 4.5, ratePerQuintalPerMonth: 33, capacity: "14,000 MT", availableCapacity: "5,900 MT", contact: "+91 97523 22345", rating: 3.8, features: ["Economy rates", "Near highway"], rateLevel: "low" },
  ],
  "641": [
    { id: "cbe1", name: "Coimbatore Agri Cold Park", address: "SIPCOT Industrial Area, Perundurai Road", city: "Coimbatore", state: "Tamil Nadu", pincode: "641021", distanceKm: 8.7, ratePerQuintalPerMonth: 48, capacity: "8,000 MT", availableCapacity: "2,400 MT", contact: "+91 94420 11234", rating: 4.3, features: ["Temperature controlled", "Export certified", "Tamil Nadu licensed"], rateLevel: "moderate" },
    { id: "cbe2", name: "Kongu Cold Storage", address: "Avinashi Road, Tirupur", city: "Tirupur", state: "Tamil Nadu", pincode: "641604", distanceKm: 22.1, ratePerQuintalPerMonth: 38, capacity: "12,000 MT", availableCapacity: "5,100 MT", contact: "+91 94420 22345", rating: 4.0, features: ["Affordable", "Bulk capacity", "Rail access nearby"], rateLevel: "low" },
  ],
  "638": [
    { id: "erd1", name: "Erode Vellam Cold Hub", address: "Perundurai Main Road, Erode", city: "Erode", state: "Tamil Nadu", pincode: "638001", distanceKm: 3.3, ratePerQuintalPerMonth: 44, capacity: "9,500 MT", availableCapacity: "3,200 MT", contact: "+91 94820 11234", rating: 4.5, features: ["Vellam specialist", "Export certified", "24x7"], rateLevel: "moderate" },
  ],
  "590": [
    { id: "blg1", name: "Belagavi Sugarcane Growers Storage", address: "Udyambag Industrial Area", city: "Belagavi", state: "Karnataka", pincode: "590008", distanceKm: 4.2, ratePerQuintalPerMonth: 39, capacity: "10,500 MT", availableCapacity: "4,600 MT", contact: "+91 94490 11234", rating: 4.1, features: ["Grower cooperative", "Insurance", "Govt approved"], rateLevel: "low" },
    { id: "blg2", name: "Kittur Cold & Agri Storage", address: "NH-4, Bailhongal Road", city: "Belagavi", state: "Karnataka", pincode: "590001", distanceKm: 6.8, ratePerQuintalPerMonth: 52, capacity: "7,000 MT", availableCapacity: "1,800 MT", contact: "+91 94490 22345", rating: 4.4, features: ["Premium facility", "Monitoring app", "Export ready"], rateLevel: "high" },
  ],
  "221": [
    { id: "vnr1", name: "Kashi Agro Cold Store", address: "Orderly Bazar, Varanasi", city: "Varanasi", state: "Uttar Pradesh", pincode: "221001", distanceKm: 2.8, ratePerQuintalPerMonth: 41, capacity: "7,000 MT", availableCapacity: "2,900 MT", contact: "+91 94150 11234", rating: 4.0, features: ["City centre", "Easy access", "Insurance"], rateLevel: "moderate" },
    { id: "vnr2", name: "Ganga Cold Storage Varanasi", address: "Pandeypur, Ring Road", city: "Varanasi", state: "Uttar Pradesh", pincode: "221002", distanceKm: 5.4, ratePerQuintalPerMonth: 35, capacity: "11,000 MT", availableCapacity: "4,800 MT", contact: "+91 94150 22345", rating: 3.9, features: ["Economy rates", "Bulk discount"], rateLevel: "low" },
  ],
};

const DEFAULT_STORAGES: ColdStorage[] = [
  { id: "def1", name: "National Agri Cold Hub", address: "Industrial Area", city: "Nearest City", state: "Your State", pincode: "000000", distanceKm: 15, ratePerQuintalPerMonth: 42, capacity: "10,000 MT", availableCapacity: "3,500 MT", contact: "+91 80000 00001", rating: 4.0, features: ["Temperature controlled", "24x7 security"], rateLevel: "moderate" },
  { id: "def2", name: "State Warehousing Corporation", address: "Mandi Complex", city: "Nearest City", state: "Your State", pincode: "000000", distanceKm: 22, ratePerQuintalPerMonth: 30, capacity: "25,000 MT", availableCapacity: "9,000 MT", contact: "+91 80000 00002", rating: 3.7, features: ["Govt facility", "Low rates", "Insurance available"], rateLevel: "low" },
  { id: "def3", name: "Private Agro Warehouse Ltd", address: "NH Bypass Road", city: "Nearest City", state: "Your State", pincode: "000000", distanceKm: 8, ratePerQuintalPerMonth: 55, capacity: "6,000 MT", availableCapacity: "1,200 MT", contact: "+91 80000 00003", rating: 4.5, features: ["Premium", "Export certified", "Monitoring"], rateLevel: "high" },
];

export function lookupRegion(pin: string): PinRegion | null {
  const prefix3 = pin.slice(0, 3);
  const prefix2 = pin.slice(0, 2);
  return PIN_REGIONS[prefix3] || null;
}

export function getStoragesForPin(pin: string): ColdStorage[] {
  const prefix3 = pin.slice(0, 3);
  return STORAGE_TEMPLATES[prefix3] || DEFAULT_STORAGES;
}

export function computeStockSignal(
  currentPrice: number,
  recommendation: string,
  festivalScore: number,
  harvestScore: number,
  storageRate: number
): StockSignal {
  const isBuy = recommendation === "BUY";
  const isSell = recommendation === "SELL";
  const festivalPressure = festivalScore > 0.4;
  const harvestSupply = harvestScore < -0.3;
  const offSeason = harvestScore > 0.4;

  const monthlyStorage = storageRate;
  const expectedGainIfFestival = festivalPressure ? 12 : offSeason ? 8 : 4;
  const storageMonths = festivalPressure ? 1.5 : offSeason ? 2.5 : 1;
  const storageCost = monthlyStorage * storageMonths;
  const priceGain = (currentPrice * expectedGainIfFestival) / 100;
  const netGain = priceGain - storageCost;
  const breakEven = currentPrice + storageCost;

  let action: StockSignal["action"];
  let confidence: number;
  let reason: string;

  if (isBuy && festivalPressure) {
    action = "STOCK_NOW";
    confidence = 88;
    reason = `Festival demand approaching — expect ${expectedGainIfFestival}% price rise. Storage cost (₹${storageCost.toFixed(0)}/qtl) well covered by expected gain (₹${priceGain.toFixed(0)}/qtl). Net profit ₹${netGain.toFixed(0)}/qtl.`;
  } else if (isBuy && offSeason) {
    action = "STOCK_NOW";
    confidence = 78;
    reason = `Off-season tightening will push prices up. Stock for ${storageMonths} months. Expected gain ₹${priceGain.toFixed(0)}/qtl vs storage cost ₹${storageCost.toFixed(0)}/qtl.`;
  } else if (harvestSupply) {
    action = "WAIT";
    confidence = 82;
    reason = "Peak harvest season — prices likely to fall further. Wait 4–6 weeks before stocking. Buy at seasonal low.";
  } else if (isSell) {
    action = "SELL_FROM_STORAGE";
    confidence = 75;
    reason = "Sell signal active. If holding stored jaggery, this is a good time to offload and avoid further storage costs.";
  } else {
    action = "PARTIAL_STOCK";
    confidence = 65;
    reason = `Mixed signals. Stock 30-40% of target quantity now at ₹${currentPrice.toLocaleString("en-IN")}/qtl. Wait for clearer buy signal before full commitment.`;
  }

  return {
    action,
    confidence,
    reason,
    expectedGainPct: expectedGainIfFestival,
    holdMonths: Math.round(storageMonths),
    breakEven: Math.round(breakEven),
  };
}
