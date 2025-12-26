import React, { useMemo, useState } from 'react';
import type { Item, MarketplaceType } from '../types';
import Header from './Header';
import { ShoppingBagIcon, ArchiveIcon } from './IconComponents';
import QuickViewModal from './QuickViewModal';

interface ItemSelectionScreenProps {
  userImage: string;
  collectionId: string;
  collectionName: string;
  collectionType: MarketplaceType;
  itemsFromDb?: Item[];
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
        
        <div className="flex-grow overflow-y-auto px-5 pt-20 pb-4 scrollbar-hide">
          <div className="mb-8 px-1">
            <h2 className="text-3xl font-black text-zinc-900 uppercase italic tracking-tighter leading-none">Coleção</h2>
            <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest mt-2">Escolha seu look</p>
          </div>

          {categoryItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 pb-24">
              {categoryItems.map(item => (
                <div 
                    key={item.id}
                    className="bg-white border border-zinc-100 rounded-[2.8rem] p-2.5 flex flex-col hover:shadow-2xl transition-all duration-300 group active:scale-[0.98] shadow-lg h-full"
                    onClick={() => setQuickViewItem(item)}
                >
                  <div className="relative overflow-hidden rounded-[2.4rem] aspect-[2/3.5] shrink-0 bg-zinc-50 shadow-inner">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      {item.isTryOn && (
                          <div className="absolute top-4 left-4 bg-amber-500/90 backdrop-blur-sm text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                              PUMP IA
                          </div>
                      )}
                  </div>
                  
                  <div className='flex flex-col flex-grow p-4'>
                    <h3 className="text-sm font-black text-zinc-800 uppercase italic truncate mb-1">{item.name}</h3>
                    <p className="text-amber-600 font-black text-lg mb-5 tracking-tighter">
                        {item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 })}
                    </p>
                    
                    <div className="mt-auto flex items-center gap-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); onItemSelect(item); }}
                            className="flex-1 text-[10px] text-center font-black uppercase tracking-widest py-4 rounded-2xl bg-zinc-900 text-white transition-all active:scale-90 shadow-xl"
                        >
                            PROVAR
                        </button>
                        
                        <button
                            onClick={(e) => handleAddToCartClick(e, item)}
                            className={`p-4 rounded-2xl transition-all transform duration-300 ${animatingCartItemId === item.id ? 'bg-green-500 text-white' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100 active:scale-90 border border-zinc-100 shadow-md'}`}
                            disabled={animatingCartItemId === item.id}
                        >
                            {animatingCartItemId === item.id ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            ) : (
                                <ShoppingBagIcon className="w-5 h-5" />
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
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nada encontrado</p>
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