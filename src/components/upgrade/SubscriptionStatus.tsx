
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SubscriptionStatusProps {
  isPremium: boolean;
  isPending: boolean;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ 
  isPremium, 
  isPending 
}) => {
  const navigate = useNavigate();
  
  if (isPremium) {
    return (
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-4">You're already on Premium!</h2>
        <p className="text-gray-600 mb-6">
          You already have access to all our premium features. Enjoy tracking your baby's milestones without limitations.
        </p>
        <Button onClick={() => navigate('/app')}>
          Go to Dashboard
        </Button>
      </Card>
    );
  }
  
  if (isPending) {
    return (
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <Clock className="h-16 w-16 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Your Premium Request is Pending</h2>
        <p className="text-gray-600 mb-6">
          We've received your payment proof and are currently processing your request. Your premium features will be activated within 24 hours.
        </p>
        <Button onClick={() => navigate('/app')}>
          Go to Dashboard
        </Button>
      </Card>
    );
  }
  
  return null;
};
