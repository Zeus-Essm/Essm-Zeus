

import React from 'react';
import GradientButton from './GradientButton';
import { CheckCircleIcon, HomeIcon } from './IconComponents';

interface ConfirmationScreenProps {
  message: string;
  onHome: () => void;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({ message, onHome }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-[var(--text-primary)] text-center animate-fadeIn bg-[var(--bg-main)]">
        <CheckCircleIcon className="w-24 h-24 text-[var(--accent-primary)] mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-glow text-[var(--accent-primary)] opacity-90">Tudo Certo!</h1>
        <p className="text-[var(--text-tertiary)] text-lg mb-10">{message}</p>
        <GradientButton onClick={onHome}>
            <div className="flex items-center justify-center gap-2">
                 <HomeIcon className="w-5 h-5" />
                Voltar ao Início
            </div>
        </GradientButton>
    </div>
  );
};

export default ConfirmationScreen;