
import React from 'react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const GradientButton: React.FC<GradientButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`w-full text-[var(--accent-primary)] font-bold uppercase tracking-wider py-4 px-6 rounded-lg border-2 border-[var(--accent-primary)]
                 bg-black/20 hover:bg-yellow-400/10 hover:shadow-[0_0_15px_rgba(251,191,36,0.6)] hover:text-[var(--text-primary)]
                 transition-all duration-300 transform focus:outline-none 
                 focus:ring-4 focus:ring-yellow-400/30 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default GradientButton;