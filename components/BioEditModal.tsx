
import React, { useState, useEffect } from 'react';
import GradientButton from './GradientButton';

interface BioEditModalProps {
  initialUsername: string;
  initialBio: string;
  onClose: () => void;
  onSave: (username: string, bio: string) => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MAX_BIO_LENGTH = 150;
const MAX_USERNAME_LENGTH = 30;

const BioEditModal: React.FC<BioEditModalProps> = ({ initialUsername, initialBio, onClose, onSave }) => {
  const [username, setUsername] = useState(initialUsername);
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
    if (!username.trim()) {
        alert("O nome não pode estar vazio.");
        return;
    }
    onSave(username, bioText);
  };
  
  const charactersLeft = MAX_BIO_LENGTH - bioText.length;

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-sm flex items-center justify-center z-50 animate-modalFadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl w-11/12 max-w-sm p-6 text-[var(--text-primary)] animate-modalZoomIn relative flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 id="edit-profile-title" className="text-xl font-bold text-[var(--accent-primary)] text-glow">Editar Perfil</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors"
              aria-label="Fechar"
            >
              <XIcon className="w-6 h-6" />
            </button>
        </div>
        
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Nome de Exibição</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.slice(0, MAX_USERNAME_LENGTH))}
                    placeholder="Seu nome..."
                    className="w-full p-3 bg-[var(--bg-tertiary)] rounded-lg border-2 border-[var(--border-secondary)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Biografia</label>
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  maxLength={MAX_BIO_LENGTH}
                  className="w-full h-32 p-3 bg-[var(--bg-tertiary)] rounded-lg border-2 border-[var(--border-secondary)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors resize-none"
                  placeholder="Conte um pouco sobre você..."
                />
                <p className={`text-right text-xs mt-1 ${charactersLeft < 10 ? 'text-red-400' : 'text-[var(--text-secondary)]'}`}>
                  {charactersLeft} caracteres restantes
                </p>
            </div>
        </div>

        <GradientButton onClick={handleSave} className="mt-6">
          Salvar Alterações
        </GradientButton>
      </div>
    </div>
  );
};

export default BioEditModal;
