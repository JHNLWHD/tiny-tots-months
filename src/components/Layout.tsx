
import React from 'react';
import { Link } from 'react-router-dom';
import { Baby, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

const Layout = ({ children, hideHeader = false }: LayoutProps) => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {!hideHeader && (
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
      )}
      
      {user && (
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
      )}
      
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;
