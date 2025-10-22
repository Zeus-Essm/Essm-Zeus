import React from 'react';
import GradientButton from './GradientButton';

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface VeoApiKeyModalProps {
  onClose: () => void;
  onSelectKey: () => void;
}

const VeoApiKeyModal: React.FC<VeoApiKeyModalProps> = ({ onClose, onSelectKey }) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-sm flex items-center justify-center z-50 animate-modalFadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="veo-key-title"
    >
      <div
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl w-11/12 max-w-sm p-6 text-[var(--text-primary)] animate-modalZoomIn relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors"
          aria-label="Fechar"
        >
          <XIcon className="w-6 h-6" />
        </button>
        
        <h2 id="veo-key-title" className="text-2xl font-bold mb-3 text-center text-[var(--accent-primary)] text-glow">Chave de API Necessária</h2>
        
        <p className="text-[var(--text-secondary)] text-center mb-6">
          A geração de vídeo com Veo requer que você selecione uma chave de API com uma conta de faturamento ativa.
        </p>

        <GradientButton onClick={onSelectKey}>
          Selecionar Chave de API
        </GradientButton>

        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-center text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] underline mt-4"
        >
          Saiba mais sobre o faturamento
        </a>
      </div>
    </div>
  );
};

export default VeoApiKeyModal;
