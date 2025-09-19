
import React, { useMemo, useState, useRef } from 'react';
import type { Item } from '../types';
import { ITEMS } from '../constants';
import Header from './Header';
import { ShoppingBagIcon } from './IconComponents';
import QuickViewModal from './QuickViewModal';

interface ItemSelectionScreenProps {
  userImage: string;
  collectionId: string;
  collectionName: string;
  onItemSelect: (item: Item) => void;
  onBack: () => void;
  onBuy: (item: Item) => void;
  onAddToCart: (item: Item) => void;
}

const ItemSelectionScreen: React.FC<ItemSelectionScreenProps> = ({ userImage, collectionId, collectionName, onItemSelect, onBack, onBuy, onAddToCart }) => {
  const categoryItems = useMemo(() => ITEMS.filter(item => item.category === collectionId), [collectionId]);
  
  const [quickViewItem, setQuickViewItem] = useState<Item | null>(null);
  const [pressedItemId, setPressedItemId] = useState<string | null>(null); // State to track pressed item for animation
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


  return (
    <>
      <div className="w-full h-full flex flex-col text-white animate-fadeIn bg-black">
        <Header title={`Escolha em ${collectionName}`} onBack={onBack} />
        <div className="pt-20 px-4 flex-shrink-0">
           <div className="relative w-32 h-48 mx-auto rounded-lg overflow-hidden shadow-lg shadow-black/20 mb-6">
              <img src={userImage} alt="Sua foto" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
        </div>
       
        <div className="flex-grow overflow-y-auto px-4 pb-4">
          <h2 className="text-2xl font-bold mb-4">Itens disponíveis</h2>
          {categoryItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {categoryItems.map(item => (
                <div 
                    key={item.id}
                    className={`bg-gray-900 rounded-xl p-2 flex flex-col hover:bg-gray-800 cursor-pointer transition-all duration-200 ease-out ${pressedItemId === item.id ? 'transform scale-105 shadow-lg shadow-blue-500/20' : ''}`}
                    onMouseDown={() => handlePressStart(item)}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onTouchStart={() => handlePressStart(item)}
                    onTouchEnd={handlePressEnd}
                    onContextMenu={(e) => e.preventDefault()}
                >
                  <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded-lg mb-2 pointer-events-none" />
                  <div className='flex flex-col flex-grow p-1'>
                    <h3 className="text-sm font-semibold flex-grow pointer-events-none">{item.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                        <button
                            onClick={() => onItemSelect(item)}
                            className="flex-grow text-xs text-center font-bold py-2 px-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors transform hover:scale-105"
                        >
                            PROVAR
                        </button>
                        <button
                            onClick={() => onBuy(item)}
                            className="text-xs font-bold py-2 px-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                            aria-label="Comprar agora"
                        >
                            Comprar
                        </button>
                        <button
                            onClick={() => onAddToCart(item)}
                            className="p-2.5 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                            aria-label="Adicionar ao carrinho"
                        >
                            <ShoppingBagIcon className="w-4 h-4 text-white" />
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400">Nenhum item encontrado nesta categoria.</p>
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
