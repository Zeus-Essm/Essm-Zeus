import React from 'react';
import { ArrowLeftIcon, ShieldCheckIcon } from './IconComponents';
import GradientButton from './GradientButton';

interface VerificationIntroScreenProps {
  onBack: () => void;
  onStart: () => void;
}

const VerificationIntroScreen: React.FC<VerificationIntroScreenProps> = ({ onBack, onStart }) => {
  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-main)] text-[var(--text-primary)] animate-fadeIn">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-2 flex items-center bg-[var(--bg-header)] backdrop-blur-md z-10">
        <button onClick={onBack} className="p-2 mr-2 -ml-2 rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors">
          <ArrowLeftIcon className="w-5 h-5 text-[var(--accent-primary)]" />
        </button>
        <h1 className="text-lg font-bold text-[var(--accent-primary)] text-glow tracking-wider uppercase">Verificação</h1>
      </header>

      <main className="flex-grow pt-16 flex flex-col items-center text-center p-6 overflow-y-auto">
        <ShieldCheckIcon className="w-24 h-24 text-zinc-800 dark:text-white mb-6" />
        <h2 className="text-3xl font-bold mb-4">Torne-se Verificado</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
          Confirme sua identidade para desbloquear benefícios exclusivos e construir confiança na comunidade PUMP.
        </p>

        <div className="w-full max-w-sm text-left space-y-4 bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
          <h3 className="font-bold text-lg mb-2 text-[var(--accent-primary)]">Benefícios da Verificação:</h3>
          {/* Benefit items */}
          <div className="flex items-start gap-3">
            <span className="text-green-400 mt-1">✓</span>
            <p><span className="font-semibold">Selo de Verificação Preto:</span> Mostre a todos que seu perfil é autêntico.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 mt-1">✓</span>
            <p><span className="font-semibold">Acesso a Afiliações:</span> Colabore com as melhores marcas da plataforma.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 mt-1">✓</span>
            <p><span className="font-semibold">Monetização:</span> Habilite futuras oportunidades de ganhos.</p>
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] mt-8">
          O processo leva cerca de 2 minutos. Você precisará de um documento de identidade válido e acesso à sua câmera.
        </p>
      </main>
      
      <footer className="p-4 flex-shrink-0 bg-[var(--bg-main)] border-t border-[var(--border-primary)]">
        <GradientButton onClick={onStart}>
          Iniciar Verificação
        </GradientButton>
      </footer>
    </div>
  );
};

export default VerificationIntroScreen;
