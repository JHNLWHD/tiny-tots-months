import { useState, useEffect } from "react";
import { 
	getSupportedCurrencies, 
	getDefaultCurrency, 
	isCurrencySwitcherEnabled 
} from "@/config/payment";

export type PricingTier = {
	name: string;
	credits: number;
	php: number;
	usd: number;
};

export type SubscriptionPlan = {
	name: string;
	tier: string;
	php: {
		monthly: number;
		yearly: number;
	};
	usd: {
		monthly: number;
		yearly: number;
	};
};

export const CREDIT_PACKAGES: PricingTier[] = [
	{
		name: "Starter Pack",
		credits: 10,
		php: 20,
		usd: 0.50,
	},
	{
		name: "Value Pack",
		credits: 30,
		php: 50,
		usd: 1.25,
	},
	{
		name: "Premium Pack",
		credits: 70,
		php: 100,
		usd: 2.50,
	},
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
	{
		name: "Family Subscription",
		tier: "family",
		php: {
			monthly: 99,
			yearly: 999,
		},
		usd: {
			monthly: 2.50,
			yearly: 25,
		},
	},
];

export const LIFETIME_PRICING = {
	php: 2499,
	usd: 62,
};

export const usePricing = () => {
	const supportedCurrencies = getSupportedCurrencies();
	const [currency, setCurrency] = useState<"PHP" | "USD">(getDefaultCurrency());
	const [isDetecting, setIsDetecting] = useState(isCurrencySwitcherEnabled());

	// Auto-detect currency based on user location (only if both currencies supported)
	useEffect(() => {
		if (!isCurrencySwitcherEnabled()) {
			// If only one currency is supported, use the default and skip detection
			setIsDetecting(false);
			return;
		}

		const detectCurrency = async () => {
			try {
				// Try to get timezone first
				const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
				
				if (timezone.includes("Manila") || timezone.includes("Asia")) {
					setCurrency("PHP");
				} else {
					// Fallback to IP-based detection or default to USD
					setCurrency("USD");
				}
			} catch (error) {
				console.error("Error detecting currency:", error);
				setCurrency("USD"); // Default fallback
			} finally {
				setIsDetecting(false);
			}
		};

		detectCurrency();
	}, []);

	const formatPrice = (amount: number, currencyCode: "PHP" | "USD" = currency) => {
		const symbol = currencyCode === "PHP" ? "₱" : "$";
		return `${symbol}${amount.toLocaleString()}`;
	};

	const getCreditPackagePrice = (packageIndex: number) => {
		const pkg = CREDIT_PACKAGES[packageIndex];
		if (!pkg) return null;
		
		// Only return price if the current currency is supported
		if (!supportedCurrencies.includes(currency)) return null;
		
		return {
			amount: currency === "PHP" ? pkg.php : pkg.usd,
			formatted: formatPrice(currency === "PHP" ? pkg.php : pkg.usd),
			credits: pkg.credits,
		};
	};

	const getSubscriptionPrice = (planIndex: number, billing: "monthly" | "yearly") => {
		const plan = SUBSCRIPTION_PLANS[planIndex];
		if (!plan) return null;

		// Only return price if the current currency is supported
		if (!supportedCurrencies.includes(currency)) return null;

		const amount = currency === "PHP" ? plan.php[billing] : plan.usd[billing];
		
		return {
			amount,
			formatted: formatPrice(amount),
			savings: billing === "yearly" ? 2 : 0, // 2 months free for yearly
		};
	};

	const getLifetimePrice = () => {
		// Only return price if the current currency is supported
		if (!supportedCurrencies.includes(currency)) return null;

		const amount = currency === "PHP" ? LIFETIME_PRICING.php : LIFETIME_PRICING.usd;
		
		return {
			amount,
			formatted: formatPrice(amount),
		};
	};

	return {
		currency,
		setCurrency: isCurrencySwitcherEnabled() ? setCurrency : undefined,
		isDetecting,
		supportedCurrencies,
		isCurrencySwitcherEnabled: isCurrencySwitcherEnabled(),
		formatPrice,
		getCreditPackagePrice,
		getSubscriptionPrice,
		getLifetimePrice,
		creditPackages: CREDIT_PACKAGES,
		subscriptionPlans: SUBSCRIPTION_PLANS,
	};
};
