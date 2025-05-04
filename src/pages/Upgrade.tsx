
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/components/ui/sonner';

const Upgrade = () => {
  const navigate = useNavigate();
  const { isPremium, upgradeToPremium, isUpgrading } = useSubscription();

  const handleUpgrade = async () => {
    // In a real implementation, this would integrate with a payment gateway
    // For this demo, we'll just upgrade the user directly
    try {
      upgradeToPremium();
      // After successful payment/upgrade
      navigate('/app');
    } catch (error) {
      console.error('Upgrade error:', error);
      toast("Upgrade failed", {
        description: "There was a problem processing your upgrade",
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Button 
          variant="ghost" 
          className="mb-8 flex items-center gap-2"
          onClick={() => navigate('/app')}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold text-center mb-8">Upgrade to Premium</h1>

        <div className="max-w-4xl mx-auto">
          {isPremium ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <Card className="p-6 border-gray-200 bg-white">
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-xl font-bold">Current: Free Plan</h3>
                  <p className="text-2xl font-bold mt-2">₱0</p>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>1 baby profile</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Track milestones up to 3 months</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>5 photos per month (15 total)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Unique shareable links</span>
                  </li>
                </ul>
              </Card>
              
              {/* Premium Plan */}
              <Card className="p-6 border-2 border-baby-purple bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-baby-purple text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                  RECOMMENDED
                </div>
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-xl font-bold">Premium Plan</h3>
                  <p className="text-2xl font-bold mt-2">₱1,000</p>
                  <p className="text-sm text-gray-500">one-time payment</p>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-baby-purple mr-2 mt-0.5 flex-shrink-0" />
                    <span>Unlimited baby profiles</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-baby-purple mr-2 mt-0.5 flex-shrink-0" />
                    <span>Complete 12 months milestone tracking</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-baby-purple mr-2 mt-0.5 flex-shrink-0" />
                    <span>Unlimited photo uploads</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-baby-purple mr-2 mt-0.5 flex-shrink-0" />
                    <span>Video uploads</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-baby-purple mr-2 mt-0.5 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-baby-purple mr-2 mt-0.5 flex-shrink-0" />
                    <span>Advanced milestone suggestions</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-baby-purple hover:bg-baby-purple/90" 
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? "Processing..." : "Upgrade Now"}
                </Button>
              </Card>
            </div>
          )}
          
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Need help? Contact our support team at support@tinytotsmilestones.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
