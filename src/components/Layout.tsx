
import React from 'react';
import { Link } from 'react-router-dom';
import { Baby, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

const Layout = ({ children, hideHeader = false }: LayoutProps) => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-baby-purple/5 pb-12">
      {!hideHeader && (
        <header className="container mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-baby-purple rounded-full flex items-center justify-center mr-3 shadow-lg">
                <Baby size={24} className="text-white animate-bounce-soft" />
              </div>
              <h1 className="text-2xl font-bold text-baby-purple font-bubblegum">Tiny Tots Milestones</h1>
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
                className="px-4 py-2 bg-white hover:bg-white hover:scale-105 rounded-full text-sm font-medium text-baby-purple shadow-md transition-all flex items-center"
              >
                <Home className="mr-2 h-4 w-4" />
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
              <div className="w-12 h-12 bg-baby-purple rounded-full flex items-center justify-center mr-3 shadow-lg">
                <Baby size={24} className="text-white animate-bounce-soft" />
              </div>
              <h1 className="text-2xl font-bold text-baby-purple font-bubblegum">Tiny Tots Milestones</h1>
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
                className="px-4 py-2 bg-white hover:bg-white hover:scale-105 rounded-full text-sm font-medium text-baby-purple shadow-md transition-all flex items-center"
              >
                <Home className="mr-2 h-4 w-4" />
                Landing
              </Link>
            </div>
          </div>
        </header>
      )}
      
      <main className="container mx-auto px-4 py-4 animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default Layout;
