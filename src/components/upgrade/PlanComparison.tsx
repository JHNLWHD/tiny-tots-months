
import React from 'react';
import { PlanCard } from './PlanCard';
import { PaymentForm } from './PaymentForm';
import { useSubscription } from "@/hooks/useSubscription.tsx";

export const PlanComparison: React.FC = () => {
  const { isPremium } = useSubscription();

  const freePlanFeatures = [
    { text: "1 baby profile" },
    { text: "Track milestones up to 3 months" },
    { text: "5 photos per month (15 total)" },
    { text: "No video uploads", isNegative: true },
  ];
  
  const premiumPlanFeatures = [
    { text: "Unlimited baby profiles" },
    { text: "Complete 12 months milestone tracking" },
    { text: "Unlimited photo uploads" },
    { text: "Video uploads (up to 50MB)" },
    { text: "Priority support" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Free Plan */}
      <PlanCard 
        title={isPremium ? "Free Plan" : "Free Plan (Current)"}
        price="₱0"
        features={freePlanFeatures}
      />
      
      {/* Premium Plan */}
      <PlanCard 
        title={isPremium ? "Premium Plan (Current)" : "Premium Plan"}
        price="₱500"
        features={premiumPlanFeatures}
        priceSubtext="one-time payment"
        isPremium
      >
        <PaymentForm />
      </PlanCard>
    </div>
  );
};
