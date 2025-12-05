// Currency utilities using currency.js library
import currency from 'currency.js';


/**
 * Convert amount from dollars/pesos to cents using currency.js
 * @param amount Amount in dollars/pesos (e.g., 24.99)
 * @returns Amount in cents (e.g., 2499)
 */
export const toCents = (amount: number): number => {
  return currency(amount).intValue;
};

/**
 * Convert amount from cents to dollars/pesos using currency.js
 * @param cents Amount in cents (e.g., 2499)
 * @returns Amount in dollars/pesos (e.g., 24.99)
 */
export const fromCents = (cents: number): number => {
  return currency(cents, { fromCents: true }).value;
};

/**
 * Format amount from cents to currency string using currency.js
 * @param cents Amount in cents (e.g., 249900)
 * @param currencyCode Currency code ("PHP" or "USD")
 * @returns Formatted string (e.g., "₱2,499.00" or "$24.99")
 */
export const formatCentsAmount = (cents: number, currencyCode: "PHP" | "USD"): string => {
  if (currencyCode === "PHP") {
    return currency(cents, { fromCents: true, symbol: '₱', separator: ',', decimal: '.' }).format();
  } else {
    return currency(cents, { fromCents: true, symbol: '$', separator: ',', decimal: '.' }).format();
  }
};


/**
 * Convert pricing amounts to cents for database storage using currency.js
 */
export const PRICING_IN_CENTS = {
  CREDIT_PACKAGES: {
    STARTER: { php: currency(20).intValue, usd: currency(0.50).intValue },    // ₱20 = 2000 cents, $0.50 = 50 cents
    VALUE: { php: currency(50).intValue, usd: currency(1.25).intValue },      // ₱50 = 5000 cents, $1.25 = 125 cents
    PREMIUM: { php: currency(100).intValue, usd: currency(2.50).intValue },   // ₱100 = 10000 cents, $2.50 = 250 cents
  },
  SUBSCRIPTION: {
    FAMILY_MONTHLY: { php: currency(99).intValue, usd: currency(2.50).intValue },   // ₱99 = 9900 cents, $2.50 = 250 cents
    FAMILY_YEARLY: { php: currency(999).intValue, usd: currency(25).intValue },     // ₱999 = 99900 cents, $25 = 2500 cents
  },
  LIFETIME: {
    php: currency(2499).intValue, // ₱2,499 = 249900 cents
    usd: currency(62).intValue,   // $62 = 6200 cents
  }
} as const;

/**
 * Get pricing amount in cents for a specific item
 */
export const getPricingInCents = (
  item: keyof typeof PRICING_IN_CENTS,
  currencyCode: "PHP" | "USD",
  variant?: string
): number => {
  const pricing = PRICING_IN_CENTS[item];
  
  if (typeof pricing === 'object' && 'php' in pricing && 'usd' in pricing) {
    return pricing[currencyCode.toLowerCase() as 'php' | 'usd'];
  }
  
  if (typeof pricing === 'object' && variant) {
    const variantPricing = pricing[variant as keyof typeof pricing];
    if (typeof variantPricing === 'object' && 'php' in variantPricing && 'usd' in variantPricing) {
      return variantPricing[currencyCode.toLowerCase() as 'php' | 'usd'];
    }
  }
  
  throw new Error(`Invalid pricing configuration for ${item} ${variant || ''} in ${currencyCode}`);
};

/**
 * Calculate percentage discount
 * @param originalAmount Original amount in cents
 * @param discountedAmount Discounted amount in cents
 * @param currencyCode Currency code for formatting
 * @returns Formatted discount percentage and amounts
 */
export const calculateDiscount = (
  originalAmount: number, 
  discountedAmount: number, 
  currencyCode: "PHP" | "USD"
) => {
  const config = currencyCode === "PHP" 
    ? { fromCents: true, symbol: '₱', separator: ',', decimal: '.' }
    : { fromCents: true, symbol: '$', separator: ',', decimal: '.' };
    
  const original = currency(originalAmount, config);
  const discounted = currency(discountedAmount, config);
  const savings = original.subtract(discounted);
  const percentage = Math.round((savings.value / original.value) * 100);
  
  return {
    originalFormatted: original.format(),
    discountedFormatted: discounted.format(),
    savingsFormatted: savings.format(),
    percentage: `${percentage}%`
  };
};

/**
 * Add two amounts in cents
 * @param amount1 First amount in cents
 * @param amount2 Second amount in cents
 * @param currencyCode Currency code
 * @returns Sum in cents
 */
export const addAmounts = (amount1: number, amount2: number, currencyCode: "PHP" | "USD"): number => {
  const config = { fromCents: true };
  const curr1 = currency(amount1, config);
  const curr2 = currency(amount2, config);
  return curr1.add(curr2).intValue;
};

/**
 * Subtract two amounts in cents
 * @param amount1 First amount in cents
 * @param amount2 Second amount in cents  
 * @param currencyCode Currency code
 * @returns Difference in cents
 */
export const subtractAmounts = (amount1: number, amount2: number, currencyCode: "PHP" | "USD"): number => {
  const config = { fromCents: true };
  const curr1 = currency(amount1, config);
  const curr2 = currency(amount2, config);
  return curr1.subtract(curr2).intValue;
};
