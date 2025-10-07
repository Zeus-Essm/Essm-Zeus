import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[var(--bg-main)] text-[var(--text-primary)]">
      <img src="https://i.postimg.cc/XJf6gckX/Pump_STARTAP.png" alt="PUMP Logo" className="w-32 h-auto animate-logo-pulse" />
    </div>
  );
};

export default SplashScreen;