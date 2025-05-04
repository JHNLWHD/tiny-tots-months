
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Baby, LogOut, Home, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

const Layout = ({ children, hideHeader = false }: LayoutProps) => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-baby-purple/5 pb-12">
      {!hideHeader && (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
          <div className="container mx-auto py-3 px-4">
            <div className="flex items-center justify-between">
              <Link to="/app" className="flex items-center group">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-baby-purple to-baby-blue rounded-full flex items-center justify-center mr-2 md:mr-3 shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
                  <Baby size={isMobile ? 18 : 24} className="text-white animate-bounce-soft" />
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-baby-purple to-baby-blue font-bubblegum">
                  Tiny Tots Milestones
                </h1>
              </Link>
              
              {/* Mobile menu button */}
              <div className="block md:hidden">
                <Button
                  variant="ghost"
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6 text-baby-purple" />
                  ) : (
                    <Menu className="h-6 w-6 text-baby-purple" />
                  )}
                </Button>
              </div>
              
              {/* Desktop navigation */}
              <div className="hidden md:flex items-center gap-3">
                {user && (
                  <div className="mr-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 font-medium truncate max-w-[200px]">
                    {user.email}
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  onClick={signOut}
                  className="px-4 py-2 hover:bg-red-100 hover:text-red-700 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </Button>
                <Link 
                  to="/" 
                  className="px-4 py-2 bg-white border border-baby-purple/30 hover:border-baby-purple hover:bg-white/80 hover:scale-105 rounded-full text-sm font-medium text-baby-purple shadow-sm hover:shadow-md transition-all duration-200 flex items-center"
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span>Landing</span>
                </Link>
              </div>
            </div>
            
            {/* Mobile menu */}
            <div className={cn(
              "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
              mobileMenuOpen ? "max-h-60 opacity-100 mt-3" : "max-h-0 opacity-0"
            )}>
              <div className="py-2 flex flex-col gap-2 bg-white/90 rounded-lg">
                {user && (
                  <div className="px-4 py-2 bg-gray-100 rounded-md text-sm text-gray-700 font-medium truncate mx-2">
                    {user.email}
                  </div>
                )}
                <Link 
                  to="/" 
                  className="flex items-center px-4 py-2 text-baby-purple hover:bg-baby-purple/10 rounded-md mx-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span>Landing Page</span>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center justify-start px-4 py-2 text-red-600 hover:bg-red-50 rounded-md mx-2"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}
      
      {/* Remove duplicate header when user is logged in */}
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6 animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default Layout;
