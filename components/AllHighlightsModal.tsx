import React, { useEffect } from 'react';
import type { Category } from '../types';

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface AllHighlightsModalProps {
  categories: Category[];
  onClose: () => void;
  onSelectCategory: (category: Category) => void;
}

const AllHighlightsModal: React.FC<AllHighlightsModalProps> = ({ categories, onClose, onSelectCategory }) => {
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

    return (
        <div
            className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-modalFadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="highlights-title"
        >
            <div
                className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl w-full max-w-md h-full max-h-[90vh] text-[var(--text-primary)] animate-modalZoomIn flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
                    <h2 id="highlights-title" className="text-xl font-bold text-[var(--accent-primary)] text-glow">
                        Todas as Lojas
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors"
                        aria-label="Fechar"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <main className="flex-grow overflow-y-auto p-4">
                    {categories.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {categories.map(category => (
                                <div
                                    key={category.id}
                                    onClick={() => onSelectCategory(category)}
                                    className="relative w-full h-56 rounded-2xl overflow-hidden cursor-pointer group transform hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-[var(--accent-primary)]/20"
                                >
                                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                        <h3 className="text-2xl font-black tracking-tighter uppercase text-white">{category.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-[var(--text-secondary)]">Nenhuma loja em destaque.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AllHighlightsModal;