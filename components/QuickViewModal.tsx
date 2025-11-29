import React from 'react';
import type { Item, MarketplaceType } from '../types';
import GradientButton from './GradientButton';
import { ShoppingBagIcon, PlayIcon, VideoCameraIcon } from './IconComponents';

interface QuickViewModalProps {
  item: Item;
  collectionType?: MarketplaceType; // New prop to determine button layout
  onClose: () => void;
  onBuy: (item: Item) => void;
  onAddToCart: (item: Item) => void;
  onItemAction?: (item: Item) => void;
  onOpenSplitCamera?: (item: Item) => void; // New action
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const QuickViewModal: React.FC<QuickViewModalProps> = ({ item, collectionType, onClose, onBuy, onAddToCart, onItemAction, onOpenSplitCamera }) => {
  React.useEffect(() => {
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

  const isFashionOrTryOn = collectionType === 'fashion' || item.isTryOn;

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-sm flex items-center justify-center z-50 animate-modalFadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      <div
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl w-11/12 max-w-sm p-6 text-[var(--text-primary)] animate-modalZoomIn relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-[var(--bg-tertiary)] hover:brightness-95 transition-colors z-10"
          aria-label="Fechar"
        >
          <XIcon className="w-5 h-5" />
        </button>
        
        <div className="flex-shrink-0 mb-4 relative">
            <img src={item.image} alt={item.name} className="w-full h-64 object-cover rounded-lg" />
            {item.recommendationVideo && (
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
                    <PlayIcon className="w-3 h-3 text-white" />
                    <span className="text-xs text-white font-bold">Vídeo</span>
                </div>
            )}
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2">
            <h2 id="quick-view-title" className="text-2xl font-bold mb-2 text-[var(--accent-primary)] opacity-90 text-glow">{item.name}</h2>
            <p className="text-[var(--text-secondary)] mb-4">{item.description}</p>
        </div>

        <div className="flex-shrink-0 mt-4 pt-4 border-t border-[var(--border-primary)]">
            <div className="flex justify-between items-center mb-4">
                <span className="text-[var(--text-secondary)]">Preço</span>
                <span className="text-xl font-bold text-[var(--accent-primary)] text-glow">
                    {item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </span>
            </div>
            
            {/* Conditional Action Buttons */}
            {isFashionOrTryOn ? (
                onItemAction && (
                    <button
                        onClick={() => onItemAction(item)}
                        className="w-full mb-3 flex items-center justify-center font-bold py-3 px-4 rounded-lg transition-colors bg-[var(--accent-primary)] text-[var(--accent-primary-text)] hover:brightness-110 shadow-lg"
                    >
                        {item.recommendationVideo ? (
                            <>
                                <PlayIcon className="w-4 h-4 mr-2" />
                                Ver Review / Provar
                            </>
                        ) : (
                            "Provar Agora"
                        )}
                    </button>
                )
            ) : (
                <div className="flex gap-2 mb-3">
                    {onItemAction && (
                        <button
                            onClick={() => onItemAction(item)}
                            className="flex-1 flex items-center justify-center font-bold py-3 px-2 rounded-lg transition-colors bg-[var(--accent-primary)] text-[var(--accent-primary-text)] hover:brightness-110 shadow-lg text-sm"
                        >
                            REPOSTAR
                        </button>
                    )}
                    {onOpenSplitCamera && (
                        <button
                            onClick={() => onOpenSplitCamera(item)}
                            className="flex-1 flex items-center justify-center gap-1 font-bold py-3 px-2 rounded-lg transition-colors bg-white text-black border border-zinc-300 hover:bg-gray-100 shadow-lg text-sm"
                        >
                            <VideoCameraIcon className="w-4 h-4" />
                            CRIAR
                        </button>
                    )}
                </div>
            )}

            <div className="flex gap-3">
                 <button
                    onClick={() => onAddToCart(item)}
                    className="flex-1 flex items-center justify-center text-[var(--text-primary)] font-bold py-3 px-4 rounded-lg bg-[var(--bg-tertiary)] hover:brightness-95 transition-colors"
                >
                   <ShoppingBagIcon className="w-5 h-5 mr-2" />
                    Carrinho
                </button>
                <GradientButton onClick={() => onBuy(item)} className="flex-1 !py-3 !text-[var(--accent-primary-text)] !bg-[var(--accent-primary)] !border-[var(--accent-primary)] hover:!brightness-125">
                    Comprar
                </GradientButton>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;