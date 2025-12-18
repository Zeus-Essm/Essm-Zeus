
import React from 'react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const GradientButton: React.FC<GradientButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`w-full text-white font-black uppercase tracking-[0.2em] text-xs py-4 px-6 rounded-2xl bg-[#F59E0B]
                 hover:bg-amber-400 shadow-[0_10px_20px_rgba(245,158,11,0.2)]
                 transition-all duration-300 transform focus:outline-none active:scale-[0.98]
                 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default GradientButton;
