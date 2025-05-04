
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Baby, ArrowLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, showBackButton = false, title }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/app';

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
          
          <div className="flex items-center gap-2">
            {isHomePage && (
              <Link 
                to="/admin" 
                className="px-4 py-2 bg-white/70 hover:bg-white hover:scale-105 rounded-full text-sm font-medium text-baby-purple shadow-sm transition-all"
              >
                Admin
              </Link>
            )}
            <Link 
              to="/" 
              className="px-4 py-2 bg-baby-purple/90 hover:bg-baby-purple hover:scale-105 rounded-full text-sm font-medium text-white shadow-sm transition-all"
            >
              Landing
            </Link>
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
