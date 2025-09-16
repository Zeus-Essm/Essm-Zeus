
import React, { useEffect } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500); // Show splash for 2.5 seconds
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black text-white">
      <div className="animate-pulse">
        <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-sky-400">
          PUMP
        </h1>
        <h2 className="text-6xl font-black tracking-tighter text-white">
          STYLE
        </h2>
      </div>
      <p className="mt-4 text-gray-400 animate-fadeIn opacity-0" style={{ animationDelay: '500ms' }}>
        Seu provador virtual com IA.
      </p>
    </div>
  );
};

export default SplashScreen;