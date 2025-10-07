

import React, { useState, useEffect } from 'react';
import GradientButton from './GradientButton';

interface BioEditModalProps {
  initialBio: string;
  onClose: () => void;
  onSave: (newBio: string) => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MAX_BIO_LENGTH = 150;

const BioEditModal: React.FC<BioEditModalProps> = ({ initialBio, onClose, onSave }) => {
  const [bioText, setBioText] = useState(initialBio);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSave = () => {
    onSave(bioText);
  };
  
  const charactersLeft = MAX_BIO_LENGTH - bioText.length;

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-sm flex items-center justify-center z-50 animate-modalFadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-bio-title"
    >
      <div
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl w-11/12 max-w-sm p-6 text-[var(--text-primary)] animate-modalZoomIn relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
            <h2 id="edit-bio-title" className="text-xl font-bold text-[var(--accent-primary)] text-glow">Editar Biografia</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors"
              aria-label="Fechar"
            >
              <XIcon className="w-6 h-6" />
            </button>
        </div>
        
        <textarea
          value={bioText}
          onChange={(e) => setBioText(e.target.value)}
          maxLength={MAX_BIO_LENGTH}
          className="w-full h-32 p-3 bg-[var(--bg-tertiary)] rounded-lg border-2 border-[var(--border-secondary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors resize-none"
          placeholder="Conte um pouco sobre você..."
          aria-describedby="char-count"
        />
        <p id="char-count" className={`text-right text-sm mt-1 ${charactersLeft < 10 ? 'text-red-400' : 'text-[var(--text-secondary)]'}`}>
          {charactersLeft}
        </p>

        <GradientButton onClick={handleSave} className="mt-4">
          Salvar
        </GradientButton>
      </div>
    </div>
  );
};

export default BioEditModal;