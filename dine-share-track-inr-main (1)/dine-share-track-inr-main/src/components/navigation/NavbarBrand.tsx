
import React from 'react';
import { Link } from 'react-router-dom';

const NavbarBrand: React.FC = () => {
  return (
    <Link to="/" className="flex items-center">
      <div className="w-14 h-14 flex items-center justify-center mr-3">
        <img 
          src="/lovable-uploads/23d2f325-ae3d-408a-b27b-35027f5bcd82.png" 
          alt="MealSync Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      <span className="font-bold text-2xl bg-gradient-to-r from-food-orange to-food-green bg-clip-text text-transparent">
        MealSync
      </span>
    </Link>
  );
};

export default NavbarBrand;
