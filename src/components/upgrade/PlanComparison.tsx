
import React from 'react';
import { PlanCard } from './PlanCard';
import { PaymentForm } from './PaymentForm';

export const PlanComparison: React.FC = () => {
  const freePlanFeatures = [
    { text: "1 baby profile" },
    { text: "Track milestones up to 3 months" },
    { text: "5 photos per month (15 total)" },
    { text: "Unique shareable links" },
  ];
  
  const premiumPlanFeatures = [
    { text: "Unlimited baby profiles" },
    { text: "Complete 12 months milestone tracking" },
    { text: "Unlimited photo uploads" },
    { text: "Video uploads" },
    { text: "Priority support" },
    { text: "Advanced milestone suggestions" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Free Plan */}
      <PlanCard 
        title="Current: Free Plan"
        price="₱0"
        features={freePlanFeatures}
      />
      
      {/* Premium Plan */}
      <PlanCard 
        title="Premium Plan"
        price="₱1,000"
        features={premiumPlanFeatures}
        priceSubtext="one-time payment"
        isPremium
      >
        <PaymentForm />
      </PlanCard>
    </div>
  );
};
