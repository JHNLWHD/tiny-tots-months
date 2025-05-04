
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const CtaSection = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <section className="joyful-gradient-2 py-16" aria-labelledby="cta-heading">
      <div className="container mx-auto px-4 text-center">
        <h2 id="cta-heading" className="text-3xl font-bold mb-6">Start Documenting Your Baby's Journey Today</h2>
        <p className="text-gray-700 max-w-2xl mx-auto mb-8">
          Don't miss a moment of your child's precious first years. Sign up now and start creating memories that will last a lifetime.
        </p>
        <Button asChild size="lg" className="bg-baby-purple hover:bg-baby-purple/90 text-white rounded-full px-8">
          {isAuthenticated ? (
            <Link to="/app">
              Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Link>
          ) : (
            <Link to="/auth">
              Get Started for Free <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Link>
          )}
        </Button>
      </div>
    </section>
  );
};

export default CtaSection;
