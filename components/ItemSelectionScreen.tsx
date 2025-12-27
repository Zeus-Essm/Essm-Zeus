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
          <div className="mb-6 px-1">
            <h2 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tighter leading-none">Coleção</h2>
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">Sugeridos para você</p>
          </div>

          {categoryItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 pb-24">
              {categoryItems.map(item => (
                <div 
                    key={item.id}
                    className="bg-white border border-zinc-100 rounded-[2rem] p-2 flex flex-col hover:shadow-xl transition-all duration-300 group active:scale-[0.98] shadow-md h-full"
                    onClick={() => setQuickViewItem(item)}
                >
                  <div className="relative overflow-hidden rounded-[1.8rem] aspect-[3/4] shrink-0 bg-zinc-50 shadow-inner">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      {item.isTryOn && (
                          <div className="absolute top-3 left-3 bg-amber-500/90 backdrop-blur-sm text-white text-[7px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">
                              PUMP IA
                          </div>
                      )}
                  </div>
                  
                  <div className='flex flex-col flex-grow p-3'>
                    <h3 className="text-xs font-black text-zinc-800 uppercase italic truncate mb-0.5">{item.name}</h3>
                    <p className="text-amber-600 font-black text-sm mb-3 tracking-tighter">
                        {item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 })}
                    </p>
                    
                    <div className="mt-auto flex items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onItemSelect(item); }}
                            className="flex-1 text-[9px] text-center font-black uppercase tracking-widest py-3 rounded-xl bg-zinc-900 text-white transition-all active:scale-90 shadow-lg"
                        >
                            PROVAR
                        </button>
                        
                        <button
                            onClick={(e) => handleAddToCartClick(e, item)}
                            className={`p-3 rounded-xl transition-all transform duration-300 ${animatingCartItemId === item.id ? 'bg-green-500 text-white' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100 active:scale-90 border border-zinc-100 shadow-sm'}`}
                            disabled={animatingCartItemId === item.id}
                        >
                            {animatingCartItemId === item.id ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            ) : (
                                <ShoppingBagIcon className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
              <ArchiveIcon className="w-12 h-12 text-zinc-300 mb-4" strokeWidth={1} />
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