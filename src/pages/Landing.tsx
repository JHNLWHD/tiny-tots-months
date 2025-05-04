
import React, { useEffect } from 'react';
import HeroSection from '@/components/landing/HeroSection';
import ProblemSolutionSection from '@/components/landing/ProblemSolutionSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';
import CtaSection from '@/components/landing/CtaSection';
import Footer from '@/components/landing/Footer';

const Landing = () => {
  // Set page title and description dynamically
  useEffect(() => {
    document.title = "Tiny Tots Milestones - Track Your Baby's Development";
  }, []);
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Problem/Solution Section */}
      <ProblemSolutionSection />

      {/* Key Features Section */}
      <FeaturesSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <CtaSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
