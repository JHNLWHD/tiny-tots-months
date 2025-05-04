
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Baby, ArrowLeft, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, showBackButton = false, title }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/app';
  const { isAuthenticated, signOut, user } = useAuth();
  
  return (
    <div className="min-h-screen joyful-gradient-2 animate-fade-in">
      <header className="container mx-auto py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Link to="/app" className="p-2 rounded-full bg-white/50 hover:bg-white/70 hover:scale-105 transition-all">
                <ArrowLeft size={24} className="text-baby-purple" />
              </Link>
            )}
            {!showBackButton && (
              <div className="flex items-center">
                <Baby size={28} className="text-baby-purple mr-2 animate-bounce-soft" />
                <h1 className="text-xl font-bold text-baby-purple">Tiny Tots Milestones</h1>
              </div>
            )}
            {title && <h1 className="text-2xl font-bold text-baby-purple">{title}</h1>}
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && (
              <>
                {isHomePage && (
                  <Link 
                    to="/admin" 
                    className="px-4 py-2 bg-white/70 hover:bg-white hover:scale-105 rounded-full text-sm font-medium text-baby-purple shadow-sm transition-all"
                  >
                    Admin
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  onClick={signOut}
                  className="px-4 py-2 hover:bg-red-100 hover:text-red-700 rounded-full text-sm font-medium"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </>
            )}
            {!isAuthenticated && (
              <Link 
                to="/auth" 
                className="px-4 py-2 bg-baby-purple/90 hover:bg-baby-purple hover:scale-105 rounded-full text-sm font-medium text-white shadow-sm transition-all"
              >
                Sign In
              </Link>
            )}
            <Link 
              to="/" 
              className="px-4 py-2 bg-white/70 hover:bg-white hover:scale-105 rounded-full text-sm font-medium text-baby-purple shadow-sm transition-all"
            >
              Landing
            </Link>
          </div>
          
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col h-full">
                  <div className="flex items-center mb-8">
                    <Baby size={28} className="text-baby-purple mr-2" />
                    <h2 className="text-xl font-bold text-baby-purple">Tiny Tots</h2>
                  </div>
                  <nav className="flex flex-col space-y-4">
                    {isAuthenticated ? (
                      <>
                        <Link 
                          to="/app" 
                          className="px-4 py-3 hover:bg-baby-purple/10 rounded-lg transition-colors"
                        >
                          Home
                        </Link>
                        <Link 
                          to="/admin" 
                          className="px-4 py-3 hover:bg-baby-purple/10 rounded-lg transition-colors"
                        >
                          Admin
                        </Link>
                        <Button 
                          variant="ghost" 
                          onClick={signOut}
                          className="px-4 py-3 justify-start hover:bg-red-100 hover:text-red-700 rounded-lg"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </Button>
                      </>
                    ) : (
                      <Link 
                        to="/auth" 
                        className="px-4 py-3 hover:bg-baby-purple/10 rounded-lg transition-colors"
                      >
                        Sign In
                      </Link>
                    )}
                    <Link 
                      to="/" 
                      className="px-4 py-3 hover:bg-baby-purple/10 rounded-lg transition-colors"
                    >
                      Landing
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="container mx-auto py-6 text-center text-baby-purple/80 text-sm">
        <p>© {new Date().getFullYear()} Tiny Tots Milestones</p>
      </footer>
    </div>
  );
};

export default Layout;
