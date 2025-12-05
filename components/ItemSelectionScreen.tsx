
import React, { useMemo, useState, useRef } from 'react';
import type { Item, MarketplaceType } from '../types';
import { ITEMS } from '../constants';
import Header from './Header';
import { ShoppingBagIcon, PlayIcon, ArchiveIcon, VideoCameraIcon } from './IconComponents';
import QuickViewModal from './QuickViewModal';

interface ItemSelectionScreenProps {
  userImage: string;
  collectionId: string;
  collectionName: string;
  collectionType: MarketplaceType;
  onItemSelect: (item: Item) => void;
  onOpenSplitCamera: (item: Item) => void; // Nova prop
  onBack: () => void;
  onBuy: (item: Item) => void;
  onAddToCart: (item: Item) => void;
}

// Internal Option Modal Component
const OptionSelectionModal: React.FC<{
    onClose: () => void;
    onNormal: () => void;
    onVideo: () => void;
}> = ({ onClose, onNormal, onVideo }) => (
    <div 
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
        onClick={onClose}
    >
        <div 
            className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl w-full max-w-xs p-6 flex flex-col gap-4 shadow-2xl animate-modalZoomIn relative overflow-hidden"
            onClick={e => e.stopPropagation()}
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-primary)] to-yellow-200"></div>
            <h3 className="text-xl font-bold text-center text-[var(--text-primary)] mb-2">Como deseja visualizar?</h3>
            
            <button 
                onClick={onNormal} 
                className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--accent-primary)]/10 border-2 border-transparent hover:border-[var(--accent-primary)] transition-all group"
            >
                <div className="p-3 rounded-full bg-[var(--bg-main)] group-hover:bg-[var(--accent-primary)] transition-colors shadow-sm">
                    <ArchiveIcon className="w-6 h-6 text-[var(--text-primary)] group-hover:text-[var(--accent-primary-text)]" />
                </div>
                <div className="text-left">
                    <p className="font-bold text-[var(--text-primary)]">Versão Normal</p>
                    <p className="text-xs text-[var(--text-secondary)]">Apenas a imagem do produto</p>
                </div>
            </button>

            <button 
                onClick={onVideo} 
                className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--accent-primary)]/10 border-2 border-transparent hover:border-[var(--accent-primary)] transition-all group"
            >
                <div className="p-3 rounded-full bg-[var(--bg-main)] group-hover:bg-[var(--accent-primary)] transition-colors shadow-sm">
                    <PlayIcon className="w-6 h-6 text-[var(--text-primary)] group-hover:text-[var(--accent-primary-text)]" />
                </div>
                <div className="text-left">
                    <p className="font-bold text-[var(--text-primary)]">Com Vídeo Review</p>
                    <p className="text-xs text-[var(--text-secondary)]">Ver recomendação em vídeo</p>
                </div>
            </button>

            <button onClick={onClose} className="mt-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Cancelar</button>
        </div>
    </div>
);

const ItemSelectionScreen: React.FC<ItemSelectionScreenProps> = ({ userImage, collectionId, collectionName, collectionType, onItemSelect, onOpenSplitCamera, onBack, onBuy, onAddToCart }) => {
  const categoryItems = useMemo(() => ITEMS.filter(item => item.category === collectionId), [collectionId]);
  
  const [quickViewItem, setQuickViewItem] = useState<Item | null>(null);
  const [itemForOptions, setItemForOptions] = useState<Item | null>(null);
  
  const [pressedItemId, setPressedItemId] = useState<string | null>(null);
  const [animatingCartItemId, setAnimatingCartItemId] = useState<string | null>(null);
  const pressTimer = useRef<number | null>(null);

  const handlePressStart = (item: Item) => {
    setPressedItemId(item.id);
    pressTimer.current = window.setTimeout(() => {
      setQuickViewItem(item);
      setPressedItemId(null);
    }, 500);
  };

  const handlePressEnd = () => {
    setPressedItemId(null);
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
      setTimeout(() => setAnimatingCartItemId(null), 1000);
  };

  const handleMainActionClick = (item: Item, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (item.recommendationVideo) {
          setItemForOptions(item);
      } else {
          onItemSelect(item);
      }
  };

  const handleOptionNormal = () => {
      if (itemForOptions) {
          const itemWithoutVideo = { ...itemForOptions, recommendationVideo: undefined };
          onItemSelect(itemWithoutVideo);
          setItemForOptions(null);
      }
  };

  const handleOptionVideo = () => {
      if (itemForOptions) {
          onItemSelect(itemForOptions);
          setItemForOptions(null);
      }
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
                      
                      {item.recommendationVideo && (
                          <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1 backdrop-blur-sm">
                              <PlayIcon className="w-3 h-3 text-white" />
                          </div>
                      )}
                  </div>
                  <div className='flex flex-col flex-grow p-1'>
                    <h3 className="text-sm font-semibold flex-grow pointer-events-none truncate">{item.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="flex-grow flex gap-2">
                            <button
                                onClick={(e) => handleMainActionClick(item, e)}
                                className="flex-1 text-[10px] text-center font-bold uppercase tracking-wider py-2 px-1 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-text)] transition-all transform active:scale-90"
                            >
                                {collectionType === 'decoration' ? 'USAR' : (collectionType === 'fashion' || item.isTryOn ? 'PROVAR' : 'REPOSTAR')}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onOpenSplitCamera(item); }}
                                className="flex-1 flex items-center justify-center gap-1 text-[10px] text-center font-bold uppercase tracking-wider py-2 px-1 rounded-full bg-white text-black border border-zinc-300 transition-all transform active:scale-90"
                            >
                                <VideoCameraIcon className="w-3 h-3" />
                                CRIAR
                            </button>
                        </div>
                        
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
            collectionType={collectionType} // Passar o tipo para o modal saber se mostra CRIAR
            onClose={handleCloseModal}
            onBuy={(item) => {
                handleCloseModal();
                onBuy(item);
            }}
            onAddToCart={(item) => {
                handleCloseModal();
                onAddToCart(item);
            }}
            onItemAction={(item) => {
                handleCloseModal();
                handleMainActionClick(item);
            }}
            onOpenSplitCamera={(item) => {
                handleCloseModal();
                onOpenSplitCamera(item);
            }}
        />
      )}

      {itemForOptions && (
          <OptionSelectionModal 
              onClose={() => setItemForOptions(null)}
              onNormal={handleOptionNormal}
              onVideo={handleOptionVideo}
          />
      )}
    </>
  );
};

export default ItemSelectionScreen;
