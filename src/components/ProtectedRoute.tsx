
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useLocation, Link } from 'react-router-dom';
import { Baby, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePremium?: boolean;
}

const ProtectedRoute = ({ children, requirePremium = false }: ProtectedRouteProps) => {
  const { isAuthenticated, loading: authLoading, signOut } = useAuth();
  const { isPremium, isPending, loading: subscriptionLoading } = useSubscription();
  const location = useLocation();
  const isHomePage = location.pathname === '/app';
  
  const loading = authLoading || subscriptionLoading;
  
  if (loading) {
    return (
      <div className="min-h-screen joyful-gradient flex items-center justify-center">
        <div className="animate-pulse text-baby-purple">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  if (requirePremium && !isPremium) {
    // If subscription is pending, show a message that it's being processed
    if (isPending) {
      return (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
              <div className="text-amber-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">Premium Upgrade in Process</h2>
              <p className="text-gray-600 mb-6">
                Your premium upgrade is currently being processed. This typically takes up to 24 hours. You'll gain access to this feature once your upgrade is approved.
              </p>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-baby-purple text-white rounded hover:bg-baby-purple/90"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Otherwise redirect to upgrade page
    return <Navigate to="/app/upgrade" replace />;
  }

  return (
    <>
      <header className="container mx-auto py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Baby size={28} className="text-baby-purple mr-2 animate-bounce-soft" />
            <h1 className="text-xl font-bold text-baby-purple">Tiny Tots Milestones</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={signOut}
              className="px-4 py-2 hover:bg-red-100 hover:text-red-700 rounded-full text-sm font-medium"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
            <Link 
              to="/" 
              className="px-4 py-2 bg-white/70 hover:bg-white hover:scale-105 rounded-full text-sm font-medium text-baby-purple shadow-sm transition-all"
            >
              Landing
            </Link>
          </div>
        </div>
      </header>
      {children}
    </>
  );
};

export default ProtectedRoute;
