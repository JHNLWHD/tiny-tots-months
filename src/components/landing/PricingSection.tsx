
import React from 'react';
import PlanCard from './PlanCard';
import { useAuth } from '@/context/AuthContext';

const PricingSection = () => {
  const { isAuthenticated } = useAuth();
  
  const freePlan = {
    title: "Free",
    description: "Perfect for getting started",
    price: "₱0",
    pricePeriod: "forever",
    features: [
      'Track 1 baby only',
      'Track milestones up to 3 months',
      '5 photos per month (15 total)',
      'Unique shareable links',
      'Basic milestone suggestions',
    ],
    ctaLink: "/auth",
    ctaText: "Get Started"
  };
  
  const premiumPlan = {
    title: "Premium",
    description: "For growing families",
    price: "₱500",
    pricePeriod: "one-time payment",
    features: [
      'Unlimited baby profiles',
      'Complete 12 months milestone tracking',
      'Unlimited photo uploads',
      'Video uploads',
      'Priority support',
      'Unique shareable links',
      'Advanced milestone suggestions',
    ],
    ctaLink: isAuthenticated ? "/app/upgrade" : "/auth",
    ctaText: "Get Premium",
    isPremium: true
  };

  return (
    <section className="bg-white py-16" id="pricing" aria-labelledby="pricing-heading">
      <div className="container mx-auto px-4">
        <h2 id="pricing-heading" className="text-3xl font-bold text-center mb-4">Pricing Plans</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Choose the plan that's right for your family. Start with our free plan and upgrade anytime as your baby grows.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PlanCard {...freePlan} />
          <PlanCard {...premiumPlan} />
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
