
import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 h-full w-full bg-[var(--bg-main)] flex items-center justify-center overflow-hidden">
      <img 
        src="https://i.postimg.cc/XJf6gckX/Pump_STARTAP.png" 
        alt="PUMP" 
        className="w-40 h-auto object-contain animate-fadeIn" 
      />
    </div>
  );
};

export default SplashScreen;
