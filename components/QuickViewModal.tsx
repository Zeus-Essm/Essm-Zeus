import React from 'react';
import type { Item } from '../types';
import GradientButton from './GradientButton';
import { ShoppingBagIcon } from './IconComponents';

interface QuickViewModalProps {
  item: Item;
  onClose: () => void;
  onBuy: (item: Item) => void;
  onAddToCart: (item: Item) => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const QuickViewModal: React.FC<QuickViewModalProps> = ({ item, onClose, onBuy, onAddToCart }) => {
  // This effect handles the Escape key press to close the modal.
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

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-modalFadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      <div
        className="bg-gray-900 rounded-2xl w-11/12 max-w-sm p-6 text-white animate-modalZoomIn relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors z-10"
          aria-label="Fechar"
        >
          <XIcon className="w-5 h-5" />
        </button>
        
        <div className="flex-shrink-0 mb-4">
            <img src={item.image} alt={item.name} className="w-full h-64 object-cover rounded-lg" />
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2">
            <h2 id="quick-view-title" className="text-2xl font-bold mb-2">{item.name}</h2>
            <p className="text-gray-400 mb-4">{item.description}</p>
        </div>

        <div className="flex-shrink-0 mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Preço</span>
                <span className="text-xl font-bold text-blue-400">
                    {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
            </div>
            <div className="flex gap-3">
                 <button
                    onClick={() => onAddToCart(item)}
                    className="flex-1 flex items-center justify-center text-white font-bold py-3 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                   <ShoppingBagIcon className="w-5 h-5 mr-2" />
                    Carrinho
                </button>
                <GradientButton onClick={() => onBuy(item)} className="flex-1 py-3">
                    Comprar Agora
                </GradientButton>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;