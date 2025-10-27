import React, { useState, useEffect } from 'react';
import GradientButton from './GradientButton';
import { PaperAirplaneIcon } from './IconComponents';

interface CaptionModalProps {
  image: string;
  onClose: () => void;
  onPublish: (caption: string) => void;
  isPublishing?: boolean; // Optional state for loading indicator
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CaptionModal: React.FC<CaptionModalProps> = ({ image, onClose, onPublish, isPublishing }) => {
  const [caption, setCaption] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPublish(caption);
  };

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="caption-title"
    >
      <div
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl w-full max-w-sm text-[var(--text-primary)] animate-modalZoomIn flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-shrink-0 p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
            <h2 id="caption-title" className="text-xl font-bold text-[var(--accent-primary)] text-glow">Nova Publicação</h2>
            <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors">
                <XIcon className="w-6 h-6" />
            </button>
        </header>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="flex gap-4">
                <img src={image} alt="Pré-visualização da publicação" className="w-24 h-32 object-cover rounded-lg flex-shrink-0"/>
                <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Escreva uma legenda..."
                    className="w-full h-32 p-3 bg-[var(--bg-tertiary)] rounded-lg border-2 border-[var(--border-secondary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors resize-none"
                    autoFocus
                />
            </div>
            <GradientButton type="submit" disabled={isPublishing}>
                <div className="flex items-center justify-center gap-2">
                    <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                    {isPublishing ? 'Publicando...' : 'Publicar no Feed'}
                </div>
            </GradientButton>
        </form>
      </div>
    </div>
  );
};

export default CaptionModal;
