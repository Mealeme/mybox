import React from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, Mail, MapPin, Phone, Heart, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      
      <div className="relative flex-grow">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-food-yellow/20 rounded-full blur-3xl dark:bg-food-yellow/10"></div>
        <div className="absolute bottom-20 left-10 w-60 h-60 bg-food-green/10 rounded-full blur-3xl dark:bg-food-green/5"></div>
        
        {/* Main content with animations */}
        <main className="container relative mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
          {children}
        </main>
      </div>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pt-12 pb-8 mt-auto relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-food-yellow/10 rounded-full blur-3xl dark:bg-food-yellow/5 z-0"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-food-green/10 rounded-full blur-3xl dark:bg-food-green/5 z-0"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Top Section with columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {/* Column 1: About */}
            <div>
              <div className="flex items-center mb-5">
              <div className="w-10 h-10 flex items-center justify-center mr-3">
                <img 
                  src="/lovable-uploads/23d2f325-ae3d-408a-b27b-35027f5bcd82.png" 
                  alt="MealSync Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-food-orange to-food-green bg-clip-text text-transparent">
                MealSync
              </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                Making meal planning and expense tracking simple and collaborative for groups, roommates, and families.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-food-orange hover:text-white transition-colors">
                  <Facebook size={16} />
                </a>
                <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-food-orange hover:text-white transition-colors">
                  <Twitter size={16} />
                </a>
                <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-food-orange hover:text-white transition-colors">
                  <Instagram size={16} />
                </a>
                <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-food-orange hover:text-white transition-colors">
                  <Linkedin size={16} />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-5">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-food-orange dark:hover:text-food-orange transition-colors flex items-center">
                    <ChevronRight size={14} className="mr-1" />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link to="/groups" className="text-gray-500 dark:text-gray-400 hover:text-food-orange dark:hover:text-food-orange transition-colors flex items-center">
                    <ChevronRight size={14} className="mr-1" />
                    <span>Groups</span>
                  </Link>
                </li>
                <li>
                  <Link to="/reports" className="text-gray-500 dark:text-gray-400 hover:text-food-orange dark:hover:text-food-orange transition-colors flex items-center">
                    <ChevronRight size={14} className="mr-1" />
                    <span>Reports</span>
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="text-gray-500 dark:text-gray-400 hover:text-food-orange dark:hover:text-food-orange transition-colors flex items-center">
                    <ChevronRight size={14} className="mr-1" />
                    <span>Profile</span>
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-500 dark:text-gray-400 hover:text-food-orange dark:hover:text-food-orange transition-colors flex items-center">
                    <ChevronRight size={14} className="mr-1" />
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-500 dark:text-gray-400 hover:text-food-orange dark:hover:text-food-orange transition-colors flex items-center">
                    <ChevronRight size={14} className="mr-1" />
                    <span>Contact Us</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact Us */}
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-5">Contact Us</h3>
              <ul className="space-y-3">
                <li className="text-gray-500 dark:text-gray-400 flex items-start">
                  <MapPin size={16} className="mr-3 mt-1 text-food-orange" />
                  <span>Amrut Garden, Ashok Nagar<br />Nashik, 422008</span>
                </li>
                <li className="text-gray-500 dark:text-gray-400 flex items-center">
                  <Phone size={16} className="mr-3 text-food-orange" />
                  <span>+91 8805231821</span>
                </li>
                <li className="text-gray-500 dark:text-gray-400 flex items-center">
                  <Mail size={16} className="mr-3 text-food-orange" />
                  <span>mealsyncofficial@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-4"></div>

          {/* Bottom section with copyright and legal links */}
          <div className="flex flex-col md:flex-row items-center justify-between text-sm">
            <p className="text-gray-500 dark:text-gray-400 flex items-center mb-4 md:mb-0">
              © {new Date().getFullYear()} MealSync. Made with <Heart size={14} className="mx-1 text-red-500" /> in India
            </p>
            
            <div className="flex items-center justify-center flex-wrap gap-4">
              <Link to="/about" className="text-gray-500 dark:text-gray-400 hover:text-food-orange transition-colors">
                About Us
              </Link>
              <Link to="/privacy-policy" className="text-gray-500 dark:text-gray-400 hover:text-food-orange transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-gray-500 dark:text-gray-400 hover:text-food-orange transition-colors">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-gray-500 dark:text-gray-400 hover:text-food-orange transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
