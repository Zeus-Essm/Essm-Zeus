
import React from 'react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const GradientButton: React.FC<GradientButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`w-full text-white font-bold py-4 px-6 rounded-lg bg-blue-500 hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default GradientButton;