
import React from 'react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  className = '',
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={`w-full text-white font-black uppercase tracking-[0.2em] text-xs py-5 px-6 rounded-[1.8rem] bg-[#F59E0B]
                  hover:brightness-110 shadow-lg shadow-amber-500/10
                  transition-all duration-300 transform focus:outline-none active:scale-[0.98]
                  disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default GradientButton;
