import React from 'react';
import GradientButton from './GradientButton';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-white text-center animate-fadeIn bg-black">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="text-center mb-12">
            <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-sky-400">
            PUMP
            </h1>
            <h2 className="text-5xl font-black tracking-tighter text-white">
            STYLE
            </h2>
        </div>
        <p className="text-gray-300 text-lg">Seu provador virtual com IA.</p>
      </div>

      <div className="w-full flex-shrink-0">
        <GradientButton onClick={onLogin}>
            Começar Agora
        </GradientButton>
        <p className="text-xs text-gray-500 mt-4">
          Bem-vindo(a) à sua experiência de moda personalizada.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;