
import React, { useEffect } from 'react';
import type { Category } from '../types';

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
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
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal Window */}
            <div
                className="relative w-full max-w-lg h-[80vh] bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-zinc-100"
                style={{ 
                    animation: 'modalZoomIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' 
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 border-b border-zinc-50 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 tracking-tighter uppercase italic">Todas as Lojas</h2>
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">Explore as marcas em destaque</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-2xl bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-all active:scale-90"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </header>
                
                <main className="flex-grow overflow-y-auto p-4 scrollbar-hide">
                    {categories.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 pb-8">
                            {categories.map(category => (
                                <div
                                    key={category.id}
                                    onClick={() => {
                                        onSelectCategory(category);
                                        onClose();
                                    }}
                                    className="relative aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer group shadow-sm active:scale-95 transition-all border border-zinc-100 bg-zinc-900"
                                >
                                    {category.video ? (
                                        <video 
                                            src={category.video} 
                                            autoPlay 
                                            loop 
                                            muted 
                                            playsInline 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        />
                                    ) : (
                                        <img 
                                            src={category.image} 
                                            alt={category.name} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
                                        <h3 className="text-sm font-black tracking-tighter uppercase italic text-white leading-tight drop-shadow-md">
                                            {category.name}
                                        </h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
                            <div className="w-16 h-16 rounded-[2rem] bg-zinc-50 flex items-center justify-center mb-4">
                                <XIcon className="w-8 h-8 text-zinc-300" strokeWidth={1} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nenhuma loja disponível</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AllHighlightsModal;
