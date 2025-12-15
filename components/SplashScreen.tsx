
import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 h-full w-full bg-[var(--bg-main)] flex items-center justify-center overflow-hidden">
      <div className="animate-spin h-12 w-12 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full"></div>
    </div>
  );
};

export default SplashScreen;
