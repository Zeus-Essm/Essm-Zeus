import React, { useState, useMemo } from 'react';
import type { Post, Item } from '../types';
import GradientButton from './GradientButton';
import { ShoppingBagIcon } from './IconComponents';

interface ShopTheLookModalProps {
  post: Post;
  onClose: () => void;
  onAddToCart: (items: Item[]) => void;
  onBuyNow: (items: Item[]) => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ShopTheLookModal: React.FC<ShopTheLookModalProps> = ({ post, onClose, onAddToCart, onBuyNow }) => {
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(() => post.items.map(i => i.id));

  const selectedItems = useMemo(() => {
    return post.items.filter(item => selectedItemIds.includes(item.id));
  }, [selectedItemIds, post.items]);

  const totalPrice = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price, 0);
  }, [selectedItems]);

  const handleToggleItem = (itemId: string) => {
    setSelectedItemIds(prevIds =>
      prevIds.includes(itemId)
        ? prevIds.filter(id => id !== itemId)
        : [...prevIds, itemId]
    );
  };

  const handleSelectAllToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedItemIds(post.items.map(i => i.id));
    } else {
      setSelectedItemIds([]);
    }
  };

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
      aria-labelledby="shop-the-look-title"
    >
      <div
        className="bg-gray-900 rounded-2xl w-11/12 max-w-md p-5 text-white animate-modalZoomIn relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors z-10"
          aria-label="Fechar"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <div className="flex-shrink-0 mb-4 h-48 w-full">
            <img src={post.image} alt="Look" className="w-full h-full object-cover rounded-lg" />
        </div>
        
        <h2 id="shop-the-look-title" className="text-xl font-bold mb-3 text-center">Compre o Look</h2>

        <div className="flex-grow overflow-y-auto pr-2 space-y-2 border-t border-b border-gray-700 py-3 my-2">
            <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-800 cursor-pointer">
                <input
                    type="checkbox"
                    checked={selectedItemIds.length === post.items.length && post.items.length > 0}
                    onChange={handleSelectAllToggle}
                    className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                <span className="font-semibold text-gray-200">Selecionar Todos os Itens</span>
            </label>
            {post.items.map(item => (
                <label key={item.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-800 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selectedItemIds.includes(item.id)}
                        onChange={() => handleToggleItem(item.id)}
                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                    />
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md flex-shrink-0"/>
                    <div className="flex-grow overflow-hidden">
                         <p className="text-sm font-medium text-white truncate">{item.name}</p>
                         <p className="text-xs text-gray-400">{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </label>
            ))}
        </div>

        <div className="flex-shrink-0 mt-2">
            <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Total ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'})</span>
                <span className="text-xl font-bold text-blue-400">
                    {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
            </div>
            <div className="flex gap-3">
                 <button
                    onClick={() => onAddToCart(selectedItems)}
                    disabled={selectedItems.length === 0}
                    className="flex-1 flex items-center justify-center text-white font-bold py-3 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   <ShoppingBagIcon className="w-5 h-5 mr-2" />
                    Adicionar
                </button>
                <GradientButton 
                    onClick={() => onBuyNow(selectedItems)} 
                    disabled={selectedItems.length === 0}
                    className="flex-1 py-3 disabled:bg-blue-800/50 disabled:hover:bg-blue-800/50 disabled:scale-100"
                >
                    Comprar Agora
                </GradientButton>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ShopTheLookModal;