import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSubscription } from "@/hooks/useSubscription";
import { usePricing } from "@/hooks/usePricing";
import { PaymentFlow } from "@/components/upgrade/PaymentFlow";
import { trackEvent, trackPageView } from "@/lib/analytics";
import { ArrowLeft, Zap, Star, Crown, CreditCard, CheckCircle2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PaymentRequest } from "@/hooks/usePaymentIntegration";

const Upgrade = () => {
	const navigate = useNavigate();
	const { 
		isPremium, 
		isFamily, 
		isLifetime, 
		isPending, 
		loading, 
		tier, 
		creditsBalance,
		purchaseCredits,
		requestSubscriptionUpgrade,
		isProcessing
	} = useSubscription();
	
	const {
		currency,
		setCurrency,
		formatPrice,
		getCreditPackagePrice,
		getSubscriptionPrice,
		getLifetimePrice,
		isDetecting,
		isCurrencySwitcherEnabled
	} = usePricing();

	const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
	const [selectedTab, setSelectedTab] = useState("credits");
	const [showPaymentDialog, setShowPaymentDialog] = useState(false);
	const [currentPaymentRequest, setCurrentPaymentRequest] = useState<PaymentRequest | null>(null);
	const [paymentStep, setPaymentStep] = useState<"method" | "details" | "proof" | "processing" | "success">("method");

	// Track page view with additional details
	useEffect(() => {
		trackPageView();
		const pageType = isPremium
			? "already_premium"
			: isPending
				? "pending_upgrade"
				: "can_upgrade";
		trackEvent("viewed_upgrade_page", { page_type: pageType, tier });
	}, [isPremium, isPending, tier]);

	const handleCreditPurchase = (packageIndex: number) => {
		const pkg = getCreditPackagePrice(packageIndex);
		if (!pkg) return;

		trackEvent("credit_purchase_initiated", {
			credits: pkg.credits,
			amount: pkg.amount,
			currency: currency
		});

		setCurrentPaymentRequest({
			amount: pkg.amount,
			currency: currency,
			type: "credits",
			description: `${pkg.credits} Credits Purchase`,
			metadata: { credits: pkg.credits, packageIndex }
		});
		setShowPaymentDialog(true);
	};

	const handleSubscriptionUpgrade = (tier: string, billingType?: "monthly" | "yearly") => {
		trackEvent("subscription_upgrade_initiated", { tier, currency, billingType });
		
		let amount: number;
		let description: string;
		
		if (tier === "family") {
			const pricing = getSubscriptionPrice(0, billingType || billingCycle);
			if (!pricing) return;
			amount = pricing.amount;
			description = `Family Subscription (${billingType || billingCycle})`;
		} else if (tier === "lifetime") {
			const pricing = getLifetimePrice();
			if (!pricing) return;
			amount = pricing.amount;
			description = "Lifetime Premium Access";
		} else {
			return;
		}

		setCurrentPaymentRequest({
			amount,
			currency: currency,
			type: tier === "lifetime" ? "lifetime" : "subscription",
			description,
			metadata: { tier, billingType: billingType || billingCycle }
		});
		setShowPaymentDialog(true);
	};

	const handlePaymentSuccess = (paymentTransactionId: string) => {
		setShowPaymentDialog(false);
		
		// Don't grant credits/subscription immediately - wait for payment approval
		// Credits will be granted when payment status is updated to "completed" by admin
		if (currentPaymentRequest?.type === "credits") {
			trackEvent("credit_purchase_submitted", {
				paymentId: paymentTransactionId,
				credits: currentPaymentRequest.metadata?.credits || 0,
				amount: currentPaymentRequest.amount,
				currency: currentPaymentRequest.currency
			});
		} else {
			// Handle subscription upgrade - also wait for approval
			const tier = currentPaymentRequest?.metadata?.tier;
			if (tier) {
				trackEvent("subscription_upgrade_submitted", {
					paymentId: paymentTransactionId,
					tier,
					amount: currentPaymentRequest?.amount,
					currency: currentPaymentRequest?.currency
				});
			}
		}
		
		setCurrentPaymentRequest(null);
	};

	const handlePaymentCancel = () => {
		setShowPaymentDialog(false);
		setCurrentPaymentRequest(null);
	};

	if (loading || isDetecting) {
		return (
			<div className="min-h-screen bg-gray-50 py-12">
				<div className="container mx-auto px-4">
					<Card className="p-8 text-center max-w-md mx-auto">
						<div className="animate-pulse text-baby-purple">
							Loading upgrade options...
						</div>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="container mx-auto px-4">
				<Button
					variant="ghost"
					className="mb-8 flex items-center gap-2"
					onClick={() => navigate("/app")}
				>
					<ArrowLeft size={16} />
					Back to App
				</Button>

				{/* Current Status */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-4">Upgrade Your Plan</h1>
					<div className="flex justify-center items-center gap-4 mb-6">
						<Badge variant={isPremium ? "default" : "secondary"} className="text-sm">
							Current: {tier === "free" ? "Free Plan" : tier === "family" ? "Family Subscription" : "Lifetime Premium"}
						</Badge>
						{creditsBalance > 0 && (
							<Badge variant="outline" className="text-sm">
								{creditsBalance} Credits Available
							</Badge>
						)}
					</div>
					
					{/* Currency Switcher or Currency Notice */}
					{isCurrencySwitcherEnabled && setCurrency ? (
						<div className="flex justify-center items-center gap-4 mb-6">
							<span className="text-sm text-gray-600">Currency:</span>
							<div className="flex bg-gray-100 rounded-lg p-1">
								<button
									onClick={() => setCurrency("PHP")}
									className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
										currency === "PHP"
											? "bg-baby-purple text-white"
											: "text-gray-600 hover:text-gray-900"
									}`}
								>
									₱ PHP
								</button>
								<button
									onClick={() => setCurrency("USD")}
									className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
										currency === "USD"
											? "bg-baby-purple text-white"
											: "text-gray-600 hover:text-gray-900"
									}`}
								>
									$ USD
								</button>
							</div>
						</div>
					) : (
						<div className="text-center mb-6">
							<span className="text-sm text-gray-600">
								All prices in {currency === "PHP" ? "Philippine Pesos (₱)" : "US Dollars ($)"}
							</span>
						</div>
					)}
				</div>

				<div className="max-w-6xl mx-auto">
					<Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
						<TabsList className="grid w-full grid-cols-3 mb-8">
							<TabsTrigger value="credits" className="flex items-center gap-2">
								<Zap className="w-4 h-4" />
								Buy Credits
							</TabsTrigger>
							<TabsTrigger value="subscription" className="flex items-center gap-2">
								<Star className="w-4 h-4" />
								Family Plan
							</TabsTrigger>
							<TabsTrigger value="lifetime" className="flex items-center gap-2">
								<Crown className="w-4 h-4" />
								Lifetime
							</TabsTrigger>
						</TabsList>

						{/* Credits Tab */}
						<TabsContent value="credits">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
								{[0, 1, 2].map((index) => {
									const pkg = getCreditPackagePrice(index);
									if (!pkg) return null;
									
									return (
										<Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
											<div className="mb-4">
												<Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
												<h3 className="text-xl font-bold">{pkg.credits} Credits</h3>
											</div>
											<div className="text-3xl font-bold text-baby-purple mb-4">
												{pkg.formatted}
											</div>
											<div className="text-sm text-gray-600 mb-6">
												{(pkg.amount / pkg.credits).toFixed(2)} per credit
											</div>
											<Button
												onClick={() => handleCreditPurchase(index)}
												disabled={isProcessing}
												className="w-full"
												variant={index === 1 ? "default" : "outline"}
											>
												{isProcessing ? "Processing..." : "Buy Credits"}
											</Button>
										</Card>
									);
								})}
							</div>
							
							<Card className="p-6 bg-blue-50 border-blue-200">
								<h4 className="font-semibold mb-3">What can you do with credits?</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
									<div className="flex items-center gap-2">
										<CheckCircle2 className="w-4 h-4 text-green-500" />
										<span>Extra baby profile: 15 credits</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 className="w-4 h-4 text-green-500" />
										<span>Video upload: 2 credits each</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 className="w-4 h-4 text-green-500" />
										<span>Extra photos: 1 credit per 10</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 className="w-4 h-4 text-green-500" />
										<span>Premium templates: 3 credits</span>
									</div>
								</div>
							</Card>
						</TabsContent>

						{/* Family Subscription Tab */}
						<TabsContent value="subscription">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
								{/* Monthly Plan */}
								<Card className="p-6 text-center">
									<div className="mb-4">
										<Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
										<h3 className="text-xl font-bold">Monthly Plan</h3>
									</div>
									<div className="text-3xl font-bold text-baby-purple mb-2">
										{getSubscriptionPrice(0, "monthly")?.formatted}
									</div>
									<div className="text-sm text-gray-600 mb-6">per month</div>
									<Button
										onClick={() => handleSubscriptionUpgrade("family", "monthly")}
										disabled={isProcessing || isFamily}
										className="w-full mb-4"
										variant="outline"
									>
										{isFamily ? "Current Plan" : isProcessing ? "Processing..." : "Choose Monthly"}
									</Button>
								</Card>

								{/* Yearly Plan */}
								<Card className="p-6 text-center border-2 border-baby-purple relative">
									<Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500">
										Save 17%
									</Badge>
									<div className="mb-4">
										<Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
										<h3 className="text-xl font-bold">Yearly Plan</h3>
									</div>
									<div className="text-3xl font-bold text-baby-purple mb-2">
										{getSubscriptionPrice(0, "yearly")?.formatted}
									</div>
									<div className="text-sm text-gray-600 mb-2">per year</div>
									<div className="text-xs text-green-600 mb-6">2 months free!</div>
									<Button
										onClick={() => handleSubscriptionUpgrade("family", "yearly")}
										disabled={isProcessing || isFamily}
										className="w-full mb-4"
									>
										{isFamily ? "Current Plan" : isProcessing ? "Processing..." : "Choose Yearly"}
									</Button>
								</Card>
							</div>

							<Card className="p-6 bg-purple-50 border-purple-200">
								<h4 className="font-semibold mb-3">Family Subscription includes:</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
									{[
										"Unlimited baby profiles",
										"Unlimited photos & videos",
										"Premium milestone templates",
										"Priority support",
										"Advanced analytics",
										"Family collaboration",
										"Export capabilities",
										"Cancel anytime"
									].map((feature, index) => (
										<div key={index} className="flex items-center gap-2">
											<CheckCircle2 className="w-4 h-4 text-green-500" />
											<span>{feature}</span>
										</div>
									))}
								</div>
							</Card>
						</TabsContent>

						{/* Lifetime Tab */}
						<TabsContent value="lifetime">
							<div className="max-w-md mx-auto">
								<Card className="p-8 text-center border-2 border-gold-400">
									<div className="mb-6">
										<Crown className="w-12 h-12 text-gold-500 mx-auto mb-4" />
										<h3 className="text-2xl font-bold">Lifetime Premium</h3>
										<p className="text-gray-600 mt-2">One payment, lifetime access</p>
									</div>
									
									<div className="text-4xl font-bold text-baby-purple mb-2">
										{getLifetimePrice()?.formatted}
									</div>
									<div className="text-sm text-gray-600 mb-6">one-time payment</div>
									
									<Button
										onClick={() => handleSubscriptionUpgrade("lifetime")}
										disabled={isProcessing || isLifetime}
										className="w-full mb-6"
										size="lg"
									>
										{isLifetime ? "Current Plan" : isProcessing ? "Processing..." : "Get Lifetime Access"}
									</Button>
									
									<div className="text-left space-y-2 text-sm">
										{[
											"All Family Subscription features",
											"Lifetime access guarantee",
											"No recurring payments ever",
											"Priority feature access",
											"Grandfathered pricing protection"
										].map((feature, index) => (
											<div key={index} className="flex items-center gap-2">
												<CheckCircle2 className="w-4 h-4 text-green-500" />
												<span>{feature}</span>
											</div>
										))}
									</div>
								</Card>
							</div>
						</TabsContent>
					</Tabs>

					<div className="mt-12 text-center text-gray-500 text-sm">
						<p className="mb-2">
							🔒 Secure payments • 30-day money back guarantee • Cancel anytime
						</p>
						<p>
							Need help? Contact our support team at{" "}
							<a href="mailto:hello@tinytotsmilestones.com" className="text-baby-purple hover:underline">
								hello@tinytotsmilestones.com
							</a>
						</p>
					</div>
				</div>

				{/* Payment Dialog */}
				<Dialog 
					open={showPaymentDialog} 
					onOpenChange={(open) => {
						// Prevent closing when on success step - user must click "Got it" button
						if (!open && paymentStep === "success") {
							return;
						}
						setShowPaymentDialog(open);
					}}
				>
					<DialogContent 
						className="max-w-lg"
						onInteractOutside={(e) => {
							// Prevent closing on outside click when on success step
							if (paymentStep === "success") {
								e.preventDefault();
							}
						}}
						onEscapeKeyDown={(e) => {
							// Prevent closing on Escape key when on success step
							if (paymentStep === "success") {
								e.preventDefault();
							}
						}}
					>
						<DialogHeader>
							<DialogTitle>Complete Payment</DialogTitle>
						</DialogHeader>
						{currentPaymentRequest && (
							<PaymentFlow
								request={currentPaymentRequest}
								onSuccess={handlePaymentSuccess}
								onCancel={handlePaymentCancel}
								onStepChange={setPaymentStep}
							/>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
};

export default Upgrade;
