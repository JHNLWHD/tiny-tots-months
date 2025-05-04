
import React from 'react';
import { Link } from 'react-router-dom';
import { Baby, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const HeroSection = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <section className="joyful-gradient py-16 sm:py-24" aria-labelledby="hero-heading">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-full shadow-lg">
            <Baby size={48} className="text-baby-purple animate-bounce-soft" aria-hidden="true" />
          </div>
        </div>
        <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
          Capture Every Precious <span className="text-baby-purple">Milestone</span> of Your Little One
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Document and share your baby's developmental journey month by month with photos, videos, and milestone tracking.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-baby-purple hover:bg-baby-purple/90 text-white rounded-full px-8">
            {isAuthenticated ? (
              <Link to="/app">
                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            ) : (
              <Link to="/auth">
                Get Started <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            )}
          </Button>
          <Button asChild variant="outline" size="lg" className="border-baby-purple text-baby-purple hover:bg-baby-purple/10 rounded-full px-8">
            <a href="#features">
              Learn More
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
