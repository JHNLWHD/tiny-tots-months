
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
    <div className="min-h-screen baby-gradient-bg animate-fade-in">
      <header className="container mx-auto py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Link to="/app" className="p-2 rounded-full hover:bg-white/50 transition-colors">
                <ArrowLeft size={24} className="text-gray-600" />
              </Link>
            )}
            {!showBackButton && (
              <div className="flex items-center">
                <Baby size={28} className="text-blue-400 mr-2" />
                <h1 className="text-xl font-semibold text-gray-700">Tiny Tots Milestones</h1>
              </div>
            )}
            {title && <h1 className="text-2xl font-bold text-gray-700">{title}</h1>}
          </div>
          
          <div className="flex items-center gap-2">
            {isHomePage && (
              <Link 
                to="/admin" 
                className="px-4 py-2 bg-white/70 hover:bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm transition-all"
              >
                Admin
              </Link>
            )}
            <Link 
              to="/" 
              className="px-4 py-2 bg-white/70 hover:bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm transition-all"
            >
              Landing
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="container mx-auto py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Tiny Tots Milestones</p>
      </footer>
    </div>
  );
};

export default Layout;
