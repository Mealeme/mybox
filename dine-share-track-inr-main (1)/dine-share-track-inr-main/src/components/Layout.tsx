
import React from 'react';
import Navbar from './Navbar';

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
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
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
            
            <div className="flex items-center justify-center space-x-4 text-sm">
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-food-orange transition-colors">Privacy Policy</a>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-food-orange transition-colors">Terms of Service</a>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-food-orange transition-colors">Contact Us</a>
            </div>
          </div>
          
          <div className="text-center mt-4 text-gray-500 dark:text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} MealSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
