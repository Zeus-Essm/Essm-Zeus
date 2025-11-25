
import React, { useMemo, useState, useRef } from 'react';
import type { Item, MarketplaceType } from '../types';
import { ITEMS } from '../constants';
import Header from './Header';
import { ShoppingBagIcon } from './IconComponents';
import QuickViewModal from './QuickViewModal';

interface ItemSelectionScreenProps {
  userImage: string;
  collectionId: string;
  collectionName: string;
  collectionType: MarketplaceType;
  onItemSelect: (item: Item) => void;
  onBack: () => void;
  onBuy: (item: Item) => void;
  onAddToCart: (item: Item) => void;
}

const ItemSelectionScreen: React.FC<ItemSelectionScreenProps> = ({ userImage, collectionId, collectionName, collectionType, onItemSelect, onBack, onBuy, onAddToCart }) => {
  const categoryItems = useMemo(() => ITEMS.filter(item => item.category === collectionId), [collectionId]);
  
  const [quickViewItem, setQuickViewItem] = useState<Item | null>(null);
  const [pressedItemId, setPressedItemId] = useState<string | null>(null); // State to track pressed item for animation
  const [animatingCartItemId, setAnimatingCartItemId] = useState<string | null>(null); // State to track item being added to cart
  const pressTimer = useRef<number | null>(null);

  const handlePressStart = (item: Item) => {
    setPressedItemId(item.id); // Start animation
    pressTimer.current = window.setTimeout(() => {
      setQuickViewItem(item);
      setPressedItemId(null); // Stop animation when modal opens
    }, 500); // Long press duration
  };

  const handlePressEnd = () => {
    setPressedItemId(null); // Stop animation
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  const handleCloseModal = () => {
    setQuickViewItem(null);
  };

  const handleAddToCartClick = (e: React.MouseEvent, item: Item) => {
      e.stopPropagation();
      setAnimatingCartItemId(item.id);
      onAddToCart(item);
      setTimeout(() => setAnimatingCartItemId(null), 1000); // Animation duration
  };

  return (
    <>
      <div className="w-full h-full flex flex-col text-[var(--text-primary)] animate-fadeIn bg-[var(--bg-main)]">
        <Header title={collectionName} onBack={onBack} />
        <div className="pt-16 px-4 flex-shrink-0">
           <div className="relative w-32 h-48 mx-auto rounded-lg overflow-hidden shadow-lg shadow-black/20 mb-6 border-2 border-[var(--border-primary)]">
              <img src={userImage} alt="Sua foto" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
        </div>
       
        <div className="flex-grow overflow-y-auto px-4 pb-4">
          <h2 className="text-2xl font-bold mb-4 text-[var(--accent-primary)] opacity-90 text-glow">Itens disponíveis</h2>
          {categoryItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {categoryItems.map(item => (
                <div 
                    key={item.id}
                    className={`bg-[var(--bg-secondary)] border border-[var(--border-secondary)] rounded-xl p-2 flex flex-col hover:bg-[var(--accent-primary)]/5 cursor-pointer transition-all duration-200 ease-out ${pressedItemId === item.id ? 'transform scale-95 shadow-inner' : 'hover:scale-[1.02] shadow-sm'}`}
                    onMouseDown={() => handlePressStart(item)}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onTouchStart={() => handlePressStart(item)}
                    onTouchEnd={handlePressEnd}
                    onContextMenu={(e) => e.preventDefault()}
                >
                  <div className="relative overflow-hidden rounded-lg mb-2">
                      <img src={item.image} alt={item.name} className="w-full h-40 object-cover pointer-events-none transition-transform duration-500 hover:scale-110" />
                  </div>
                  <div className='flex flex-col flex-grow p-1'>
                    <h3 className="text-sm font-semibold flex-grow pointer-events-none truncate">{item.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onItemSelect(item); }}
                            className="flex-grow text-xs text-center font-bold uppercase tracking-wider py-2 px-2 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-text)] transition-all transform active:scale-90 hover:shadow-[0_0_10px_var(--accent-primary-glow)]"
                        >
                            {collectionType === 'fashion' || item.isTryOn ? 'PROVAR' : 'REPOSTAR'}
                        </button>
                        <button
                            onClick={(e) => handleAddToCartClick(e, item)}
                            className={`p-2.5 rounded-full transition-all transform duration-300 ${animatingCartItemId === item.id ? 'bg-green-500 scale-110 rotate-12' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--text-secondary)]/20 active:scale-90'}`}
                            aria-label="Adicionar ao carrinho"
                            disabled={animatingCartItemId === item.id}
                        >
                            {animatingCartItemId === item.id ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            ) : (
                                <ShoppingBagIcon className="w-4 h-4 text-[var(--accent-primary)]" />
                            )}
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-[var(--text-secondary)]">Nenhum item encontrado nesta categoria.</p>
            </div>
          )}
        </div>
      </div>
      {quickViewItem && (
        <QuickViewModal 
            item={quickViewItem} 
            onClose={handleCloseModal}
            onBuy={(item) => {
                handleCloseModal();
                onBuy(item);
            }}
            onAddToCart={(item) => {
                handleCloseModal();
                onAddToCart(item);
            }}
        />
      )}
    </>
  );
};

export default ItemSelectionScreen;
