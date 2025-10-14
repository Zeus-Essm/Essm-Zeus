

import React, { useState, useMemo } from 'react';
import type { Post, Item, MarketplaceType } from '../types';
import GradientButton from './GradientButton';
import { ShoppingBagIcon, CalendarIcon } from './IconComponents';

interface ShopTheLookModalProps {
  post: Post;
  postType: MarketplaceType;
  onClose: () => void;
  onAddToCart: (items: Item[]) => void;
  onBuyNow: (items: Item[]) => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ShopTheLookModal: React.FC<ShopTheLookModalProps> = ({ post, postType, onClose, onAddToCart, onBuyNow }) => {
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

  const { title, primaryActionText, secondaryActionText } = useMemo(() => {
    switch (postType) {
      case 'restaurant':
        return {
          title: 'Faça seu Pedido',
          primaryActionText: 'Encomendar Agora',
          secondaryActionText: 'Adicionar ao Pedido',
        };
      case 'supermarket':
        return {
          title: 'Compre os Itens',
          primaryActionText: 'Comprar Agora',
          secondaryActionText: 'Adicionar ao Carrinho',
        };
      default:
        return {
          title: 'Compre o Look',
          primaryActionText: 'Comprar Agora',
          secondaryActionText: 'Adicionar',
        };
    }
  }, [postType]);

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-sm flex items-center justify-center z-50 animate-modalFadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shop-the-look-title"
    >
      <div
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl w-11/12 max-w-md p-5 text-[var(--text-primary)] animate-modalZoomIn relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-[var(--bg-tertiary)] hover:brightness-95 transition-colors z-10"
          aria-label="Fechar"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <div className="flex-shrink-0 mb-4 h-48 w-full">
            <img src={post.image} alt="Look" className="w-full h-full object-cover rounded-lg" />
        </div>
        
        <h2 id="shop-the-look-title" className="text-xl font-bold mb-3 text-center text-[var(--accent-primary)] opacity-90 text-glow">{title}</h2>

        <div className="flex-grow overflow-y-auto pr-2 space-y-2 border-t border-b border-[var(--border-primary)] py-3 my-2">
            <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-zinc-800 cursor-pointer">
                <input
                    type="checkbox"
                    checked={selectedItemIds.length === post.items.length && post.items.length > 0}
                    onChange={handleSelectAllToggle}
                    className="h-5 w-5 rounded bg-zinc-700 border-zinc-600 text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                />
                <span className="font-semibold text-[var(--text-tertiary)]">Selecionar Todos os Itens</span>
            </label>
            {post.items.map(item => (
                <label key={item.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-zinc-800 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selectedItemIds.includes(item.id)}
                        onChange={() => handleToggleItem(item.id)}
                        className="h-5 w-5 rounded bg-zinc-700 border-zinc-600 text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                    />
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md flex-shrink-0"/>
                    <div className="flex-grow overflow-hidden">
                         <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                         <p className="text-xs text-[var(--text-secondary)]">{item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
                    </div>
                </label>
            ))}
        </div>

        <div className="flex-shrink-0 mt-2">
            <div className="flex justify-between items-center mb-4">
                <span className="text-[var(--text-secondary)]">Total ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'})</span>
                <span className="text-xl font-bold text-[var(--accent-primary)] text-glow">
                    {totalPrice.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </span>
            </div>
            {postType === 'restaurant' && (
                <button
                    // onClick={handleReserve} // Placeholder for reservation logic
                    className="w-full flex items-center justify-center text-[var(--text-primary)] font-bold py-3 px-4 rounded-lg bg-[var(--bg-tertiary)] hover:brightness-95 transition-colors mb-3"
                >
                   <CalendarIcon className="w-5 h-5 mr-2" />
                    Reservar Mesa
                </button>
            )}
            <div className="flex gap-3">
                 <button
                    onClick={() => onAddToCart(selectedItems)}
                    disabled={selectedItems.length === 0}
                    className="flex-1 flex items-center justify-center text-[var(--text-primary)] font-bold py-3 px-4 rounded-lg bg-[var(--bg-tertiary)] hover:brightness-95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   <ShoppingBagIcon className="w-5 h-5 mr-2" />
                    {secondaryActionText}
                </button>
                <GradientButton 
                    onClick={() => onBuyNow(selectedItems)} 
                    disabled={selectedItems.length === 0}
                    className="flex-1 !py-3 !bg-[var(--accent-primary)] !text-[var(--accent-primary-text)] hover:!brightness-125"
                >
                    {primaryActionText}
                </GradientButton>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ShopTheLookModal;