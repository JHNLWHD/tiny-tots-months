// Payment Configuration
// This file centralizes payment-related configuration

export type SupportedCurrency = "PHP" | "USD" | "BOTH";

// Environment configuration with fallbacks
export const PAYMENT_CONFIG = {
  // Supported currencies: "PHP", "USD", or "BOTH"
  supportedCurrencies: (import.meta.env.VITE_SUPPORTED_CURRENCIES as SupportedCurrency) || "PHP",
  
  // PHP Payment Details
  gcashNumber: import.meta.env.VITE_GCASH_NUMBER || "0917-123-4567",
  
  // Business Details
  businessName: import.meta.env.VITE_BUSINESS_NAME || "Tiny Tots Milestones",
} as const;

// Helper functions
export const isPhpSupported = () => 
  PAYMENT_CONFIG.supportedCurrencies === "PHP" || PAYMENT_CONFIG.supportedCurrencies === "BOTH";

export const isUsdSupported = () => 
  PAYMENT_CONFIG.supportedCurrencies === "USD" || PAYMENT_CONFIG.supportedCurrencies === "BOTH";

export const isCurrencySwitcherEnabled = () => 
  PAYMENT_CONFIG.supportedCurrencies === "BOTH";

export const getDefaultCurrency = (): "PHP" | "USD" => {
  if (PAYMENT_CONFIG.supportedCurrencies === "PHP") return "PHP";
  if (PAYMENT_CONFIG.supportedCurrencies === "USD") return "USD";
  // For "BOTH", detect based on timezone or default to PHP
  return "PHP";
};

export const getSupportedCurrencies = (): ("PHP" | "USD")[] => {
  if (PAYMENT_CONFIG.supportedCurrencies === "PHP") return ["PHP"];
  if (PAYMENT_CONFIG.supportedCurrencies === "USD") return ["USD"];
  return ["PHP", "USD"];
};
