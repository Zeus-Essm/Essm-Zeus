import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black text-white">
      <img src="https://i.postimg.cc/htGw97By/Sem-Ti-tulo-1.png" alt="MEU ESTILO Logo" className="w-32 h-auto animate-pulse" />
    </div>
  );
};

export default SplashScreen;