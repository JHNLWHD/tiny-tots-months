
import React from 'react';
import { Baby } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <Baby className="h-8 w-8 text-baby-purple mr-2" aria-hidden="true" />
            <span className="font-bold text-lg text-baby-purple">Tiny Tots Milestones</span>
          </div>
          <nav aria-label="Footer Navigation">
            <ul className="flex flex-wrap gap-6 text-sm text-gray-600">
              <li><a href="#" className="hover:text-baby-purple">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-baby-purple">Terms of Service</a></li>
              <li><a href="#" className="hover:text-baby-purple">Contact Us</a></li>
              <li><a href="#" className="hover:text-baby-purple">Help & Support</a></li>
            </ul>
          </nav>
        </div>
        <div className="text-center mt-10 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Tiny Tots Milestones. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
