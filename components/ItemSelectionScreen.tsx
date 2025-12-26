import React, { useMemo, useState, useRef } from 'react';
import type { Item, MarketplaceType } from '../types';
import Header from './Header';
import { ShoppingBagIcon, PlayIcon, ArchiveIcon, VideoCameraIcon } from './IconComponents';
import QuickViewModal from './QuickViewModal';

interface ItemSelectionScreenProps {
  userImage: string;
  collectionId: string;
  collectionName: string;
  collectionType: MarketplaceType;
  itemsFromDb?: Item[]; // Nova prop para itens reais
  onItemSelect: (item: Item) => void;
  onOpenSplitCamera: (item: Item) => void;
  onBack: () => void;
  onBuy: (item: Item) => void;
  onAddToCart: (item: Item) => void;
}

const ItemSelectionScreen: React.FC<ItemSelectionScreenProps> = ({ 
    userImage, collectionId, collectionName, collectionType, itemsFromDb = [],
    onItemSelect, onOpenSplitCamera, onBack, onBuy, onAddToCart 
}) => {
  // Filtra os itens que pertencem a esta coleção (pode ser o owner_id ou folder_id)
  const categoryItems = useMemo(() => 
    itemsFromDb.filter(item => item.category === collectionId), 
    [collectionId, itemsFromDb]
  );
  
  const [quickViewItem, setQuickViewItem] = useState<Item | null>(null);
  const [animatingCartItemId, setAnimatingCartItemId] = useState<string | null>(null);

  const handleAddToCartClick = (e: React.MouseEvent, item: Item) => {
      e.stopPropagation();
      setAnimatingCartItemId(item.id);
      onAddToCart(item);
      setTimeout(() => setAnimatingCartItemId(null), 1000);
  };

  return (
    <>
      <div className="w-full h-full flex flex-col text-[var(--text-primary)] animate-fadeIn bg-[var(--bg-main)]">
        <Header title={collectionName} onBack={onBack} />
        
        <div className="flex-grow overflow-y-auto px-3 pt-20 pb-4 scrollbar-hide">
          <div className="mb-5 px-1">
            <h2 className="text-xl font-black text-zinc-900 uppercase italic tracking-tighter leading-none">Loja</h2>
            <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-1">Coleção Disponível</p>
          </div>

          {categoryItems.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 pb-24">
              {categoryItems.map(item => (
                <div 
                    key={item.id}
                    className="bg-white border border-zinc-100 rounded-2xl p-1 flex flex-col hover:shadow-lg transition-all duration-300 group active:scale-[0.98] shadow-sm"
                    onClick={() => setQuickViewItem(item)}
                >
                  <div className="relative overflow-hidden rounded-xl mb-1.5 aspect-[3/4]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      {item.isTryOn && (
                          <div className="absolute top-1 left-1 bg-amber-500/90 backdrop-blur-sm text-white text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                              IA
                          </div>
                      )}
                  </div>
                  <div className='flex flex-col flex-grow p-1'>
                    <h3 className="text-[9px] font-black text-zinc-800 uppercase italic truncate mb-0.5">{item.name}</h3>
                    <p className="text-amber-600 font-black text-[10px] mb-2 tracking-tighter">
                        {item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 })}
                    </p>
                    
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); onItemSelect(item); }}
                            className="flex-1 text-[7px] text-center font-black uppercase tracking-widest py-2 rounded-lg bg-zinc-900 text-white transition-all active:scale-90"
                        >
                            PROVAR
                        </button>
                        
                        <button
                            onClick={(e) => handleAddToCartClick(e, item)}
                            className={`p-1.5 rounded-lg transition-all transform duration-300 ${animatingCartItemId === item.id ? 'bg-green-500 scale-110' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100 active:scale-90 border border-zinc-50'}`}
                            disabled={animatingCartItemId === item.id}
                        >
                            {animatingCartItemId === item.id ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={5} stroke="white" className="w-2.5 h-2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            ) : (
                                <ShoppingBagIcon className="w-2.5 h-2.5" />
                            )}
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
              <ArchiveIcon className="w-16 h-16 text-zinc-300 mb-4" strokeWidth={1} />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Vazio</p>
            </div>
          )}
        </div>
      </div>

      {quickViewItem && (
        <QuickViewModal 
            item={quickViewItem} 
            collectionType={collectionType}
            onClose={() => setQuickViewItem(null)}
            onBuy={(item) => { onBuy(item); setQuickViewItem(null); }}
            onAddToCart={(item) => { onAddToCart(item); setQuickViewItem(null); }}
            onItemAction={(item) => { onItemSelect(item); setQuickViewItem(null); }}
            onOpenSplitCamera={(item) => { onOpenSplitCamera(item); setQuickViewItem(null); }}
        />
      )}
    </>
  );
};

export default ItemSelectionScreen;