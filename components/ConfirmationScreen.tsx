
import React from 'react';
import GradientButton from './GradientButton';
import { CheckCircleIcon, HomeIcon } from './IconComponents';

interface ConfirmationScreenProps {
  message: string;
  onHome: () => void;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({ message, onHome }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-white text-center animate-fadeIn bg-black">
        <CheckCircleIcon className="w-24 h-24 text-green-400 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Tudo Certo!</h1>
        <p className="text-gray-300 text-lg mb-10">{message}</p>
        <GradientButton onClick={onHome}>
            <div className="flex items-center justify-center">
                 <HomeIcon className="w-5 h-5 mr-2" />
                Voltar ao Início
            </div>
        </GradientButton>
    </div>
  );
};

export default ConfirmationScreen;