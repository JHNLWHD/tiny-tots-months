import React from 'react';
import { Baby, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return <footer className="bg-white py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center mb-6 md:mb-0">
            <Baby className="h-8 w-8 text-baby-purple mr-2" aria-hidden="true" />
            <span className="font-bold text-lg text-baby-purple">Tiny Tots Milestones</span>
          </div>
          
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-baby-purple transition-colors" aria-label="Follow us on Facebook">
              <Facebook size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-baby-purple transition-colors" aria-label="Follow us on Instagram">
              <Instagram size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-baby-purple transition-colors" aria-label="Follow us on Twitter">
              <Twitter size={20} />
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">About Us</h3>
            <p className="text-sm text-gray-600">
              Tiny Tots Milestones helps parents capture and cherish their little one's journey from the first smile to the first steps and beyond.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <nav aria-label="Footer Navigation - Main">
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/" className="hover:text-baby-purple">Home</Link></li>
                <li><a href="#features" className="hover:text-baby-purple">Features</a></li>
                <li><a href="#pricing" className="hover:text-baby-purple">Pricing</a></li>
                <li><Link to="/auth" className="hover:text-baby-purple">Sign Up</Link></li>
              </ul>
            </nav>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <nav aria-label="Footer Navigation - Legal">
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/privacy-policy" className="hover:text-baby-purple">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-baby-purple">Terms of Service</Link></li>
                <li><Link to="/contact" className="hover:text-baby-purple">Contact Us</Link></li>
                <li><Link to="/help" className="hover:text-baby-purple">Help & Support</Link></li>
              </ul>
            </nav>
          </div>
        </div>
        
        <div className="text-center pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500">© {currentYear} Tiny Tots Milestones. All rights reserved.</p>
          
          <p className="text-xs text-gray-400 mt-2">Helping parents document their baby's precious moments since 2025.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;