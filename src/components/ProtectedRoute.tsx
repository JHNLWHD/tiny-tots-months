
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePremium?: boolean;
}

const ProtectedRoute = ({ children, requirePremium = false }: ProtectedRouteProps) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  
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
    // Redirect to pricing/upgrade page if premium is required but user doesn't have it
    return <Navigate to="/app/upgrade" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
