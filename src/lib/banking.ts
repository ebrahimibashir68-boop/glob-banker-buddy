// Simulated multi-country banking data. Rules approximate the intent of each
// jurisdiction's central bank (SBP, CBI, FED, ECB, BOE, RBI, CBN, CBUAE, etc.).
// This is a prototype — no real money movement, no real regulator connection.

export type CountryCode =
  | "US" | "GB" | "EU" | "PK" | "IR" | "IN" | "AE" | "NG" | "TR" | "JP" | "BR";

export interface CentralBank {
  code: CountryCode;
  country: string;
  flag: string;
  centralBank: string;
  currency: string;
  currencySymbol: string;
  fxToUsd: number; // 1 unit local = X USD (mock)
  // Simulated regulator constraints
  dailyTransferCap: number; // in local currency
  intlDailyCap: number;
  requiresIban: boolean;
  requiresSwift: boolean;
  taxOnIntlPct: number; // withholding / stamp
  billers: string[];
  mobileOperators: string[];
  notes: string;
}

export const COUNTRIES: CentralBank[] = [
  {
    code: "US", country: "United States", flag: "🇺🇸",
    centralBank: "Federal Reserve System (Fed)", currency: "USD", currencySymbol: "$",
    fxToUsd: 1, dailyTransferCap: 50000, intlDailyCap: 10000,
    requiresIban: false, requiresSwift: true, taxOnIntlPct: 0,
    billers: ["Con Edison", "PG&E", "Comcast Xfinity", "AT&T", "Verizon Fios", "Spectrum", "City Water"],
    mobileOperators: ["Verizon", "T-Mobile", "AT&T Mobility", "Mint Mobile"],
    notes: "Transfers > $10,000 auto-report to FinCEN. ACH cutoff 5pm ET.",
  },
  {
    code: "GB", country: "United Kingdom", flag: "🇬🇧",
    centralBank: "Bank of England (BoE)", currency: "GBP", currencySymbol: "£",
    fxToUsd: 1.27, dailyTransferCap: 25000, intlDailyCap: 10000,
    requiresIban: true, requiresSwift: true, taxOnIntlPct: 0,
    billers: ["British Gas", "EDF Energy", "Thames Water", "BT", "Sky", "Virgin Media", "TV Licensing"],
    mobileOperators: ["EE", "O2", "Vodafone UK", "Three"],
    notes: "Faster Payments up to £1,000,000. CHAPS for same-day large transfers.",
  },
  {
    code: "EU", country: "Euro Area", flag: "🇪🇺",
    centralBank: "European Central Bank (ECB)", currency: "EUR", currencySymbol: "€",
    fxToUsd: 1.08, dailyTransferCap: 50000, intlDailyCap: 15000,
    requiresIban: true, requiresSwift: true, taxOnIntlPct: 0,
    billers: ["Enel", "EDF", "Vattenfall", "Deutsche Telekom", "Orange", "Movistar"],
    mobileOperators: ["Vodafone", "Orange", "Telefónica", "Deutsche Telekom"],
    notes: "SEPA Instant Credit Transfer up to €100,000. IBAN required.",
  },
  {
    code: "PK", country: "Pakistan", flag: "🇵🇰",
    centralBank: "State Bank of Pakistan (SBP)", currency: "PKR", currencySymbol: "₨",
    fxToUsd: 0.0036, dailyTransferCap: 5000000, intlDailyCap: 300000,
    requiresIban: true, requiresSwift: true, taxOnIntlPct: 1,
    billers: ["K-Electric", "SNGPL", "SSGC", "WAPDA", "PTCL", "Karachi Water Board"],
    mobileOperators: ["Jazz", "Zong", "Telenor Pakistan", "Ufone"],
    notes: "SBP requires purpose code on outward remittances. RAAST instant transfers 24/7.",
  },
  {
    code: "IR", country: "Iran", flag: "🇮🇷",
    centralBank: "Central Bank of Iran (CBI)", currency: "IRR", currencySymbol: "﷼",
    fxToUsd: 0.0000024, dailyTransferCap: 1000000000, intlDailyCap: 0,
    requiresIban: true, requiresSwift: false, taxOnIntlPct: 0,
    billers: ["Tavanir (Electricity)", "NIGC (Gas)", "Abfa (Water)", "TCI", "Shahrdari"],
    mobileOperators: ["Hamrah-e-Aval (MCI)", "Irancell", "Rightel"],
    notes: "IR-SHETAB card network. SHEBA IBAN required. Outward SWIFT restricted under sanctions.",
  },
  {
    code: "IN", country: "India", flag: "🇮🇳",
    centralBank: "Reserve Bank of India (RBI)", currency: "INR", currencySymbol: "₹",
    fxToUsd: 0.012, dailyTransferCap: 1000000, intlDailyCap: 250000,
    requiresIban: false, requiresSwift: true, taxOnIntlPct: 5,
    billers: ["Tata Power", "Adani Electricity", "BSES", "Mahanagar Gas", "Airtel Broadband", "Jio Fiber"],
    mobileOperators: ["Jio", "Airtel", "Vi (Vodafone Idea)", "BSNL"],
    notes: "UPI instant transfers. LRS cap $250,000/year for individuals. TCS on foreign remittance.",
  },
  {
    code: "AE", country: "United Arab Emirates", flag: "🇦🇪",
    centralBank: "Central Bank of the UAE (CBUAE)", currency: "AED", currencySymbol: "د.إ",
    fxToUsd: 0.272, dailyTransferCap: 500000, intlDailyCap: 200000,
    requiresIban: true, requiresSwift: true, taxOnIntlPct: 0,
    billers: ["DEWA", "SEWA", "ADDC", "Etisalat", "du", "Empower Cooling"],
    mobileOperators: ["Etisalat (e&)", "du", "Virgin Mobile UAE"],
    notes: "AED is pegged to USD at 3.6725. IBAN required. AAEFTS instant clearing.",
  },
  {
    code: "NG", country: "Nigeria", flag: "🇳🇬",
    centralBank: "Central Bank of Nigeria (CBN)", currency: "NGN", currencySymbol: "₦",
    fxToUsd: 0.00065, dailyTransferCap: 5000000, intlDailyCap: 500000,
    requiresIban: false, requiresSwift: true, taxOnIntlPct: 0,
    billers: ["Ikeja Electric", "EKEDC", "AEDC", "MTN Home", "Spectranet", "Lagos Water"],
    mobileOperators: ["MTN Nigeria", "Airtel Nigeria", "Glo", "9mobile"],
    notes: "NIP instant transfer via NIBSS. BVN required. CBN FX window rate applies.",
  },
  {
    code: "TR", country: "Türkiye", flag: "🇹🇷",
    centralBank: "Central Bank of the Republic of Türkiye (TCMB)", currency: "TRY", currencySymbol: "₺",
    fxToUsd: 0.031, dailyTransferCap: 500000, intlDailyCap: 50000,
    requiresIban: true, requiresSwift: true, taxOnIntlPct: 0.2,
    billers: ["BEDAŞ", "İGDAŞ", "İSKİ", "Türk Telekom", "Turkcell Superonline"],
    mobileOperators: ["Turkcell", "Vodafone TR", "Türk Telekom"],
    notes: "FAST instant payment 24/7 up to ₺500,000. IBAN required.",
  },
  {
    code: "JP", country: "Japan", flag: "🇯🇵",
    centralBank: "Bank of Japan (BoJ)", currency: "JPY", currencySymbol: "¥",
    fxToUsd: 0.0067, dailyTransferCap: 5000000, intlDailyCap: 1000000,
    requiresIban: false, requiresSwift: true, taxOnIntlPct: 0,
    billers: ["TEPCO", "Tokyo Gas", "NTT East", "SoftBank Hikari"],
    mobileOperators: ["NTT Docomo", "au (KDDI)", "SoftBank", "Rakuten Mobile"],
    notes: "Zengin System for domestic transfers. Reports to MoF over ¥1M outward.",
  },
  {
    code: "BR", country: "Brazil", flag: "🇧🇷",
    centralBank: "Banco Central do Brasil (BCB)", currency: "BRL", currencySymbol: "R$",
    fxToUsd: 0.19, dailyTransferCap: 100000, intlDailyCap: 50000,
    requiresIban: false, requiresSwift: true, taxOnIntlPct: 0.38,
    billers: ["Enel Brasil", "Light", "Sabesp", "Vivo Fibra", "Claro Net"],
    mobileOperators: ["Vivo", "Claro", "TIM Brasil"],
    notes: "PIX instant payment 24/7. IOF tax on FX transactions.",
  },
];

export function getCountry(code: CountryCode) {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}

export function formatMoney(amount: number, c: CentralBank) {
  const digits = c.currency === "JPY" || c.currency === "IRR" ? 0 : 2;
  return `${c.currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

// Pi Network mock rate
export const PI_USD = 0.42;

export interface Account {
  id: string;
  name: string;
  type: "Checking" | "Savings" | "Pi Wallet";
  number: string;
  balance: number;
}

export function seedAccounts(c: CentralBank): Account[] {
  const base = c.code === "IR" ? 500_000_000 : c.code === "PK" ? 850_000 : c.code === "JP" ? 1_250_000 : 12_450;
  return [
    { id: "chk", name: "Everyday Checking", type: "Checking", number: "**** 4021", balance: base },
    { id: "sav", name: "High-Yield Savings", type: "Savings", number: "**** 7788", balance: base * 3.4 },
    { id: "pi",  name: "Pi Wallet",          type: "Pi Wallet", number: "π **** 9F2A", balance: 428.73 },
  ];
}

export interface Txn {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number; // negative = debit
}

export function seedTxns(): Txn[] {
  return [
    { id: "1", date: "Today",     merchant: "Electricity Bill",   category: "Utilities", amount: -84.20 },
    { id: "2", date: "Today",     merchant: "Mobile Top-up",      category: "Mobile",    amount: -15.00 },
    { id: "3", date: "Yesterday", merchant: "Salary — Acme Inc.", category: "Income",    amount: 3200.00 },
    { id: "4", date: "Yesterday", merchant: "Transfer to Aisha",  category: "Transfer",  amount: -250.00 },
    { id: "5", date: "Mon",       merchant: "Pi → USD Swap",      category: "Pi",        amount: 42.10 },
    { id: "6", date: "Sun",       merchant: "Water Board",        category: "Utilities", amount: -22.75 },
    { id: "7", date: "Sat",       merchant: "Intl Wire — Lagos",  category: "Intl",      amount: -600.00 },
  ];
}
