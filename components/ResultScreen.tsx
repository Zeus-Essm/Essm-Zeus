

import React from 'react';
import type { Item } from '../types';
import GradientButton from './GradientButton';
import Header from './Header';
import { ShoppingBagIcon, PlusIcon, UndoIcon, ShareIcon, BookmarkIcon, DownloadIcon } from './IconComponents';

interface ResultScreenProps {
  generatedImage: string;
  items: Item[]; // A lista de itens vestidos
  categoryItems: Item[]; // A lista de todos os itens na categoria atual
  onPostToFeed: () => void;
  onBuy: (items: Item[]) => void;
  onUndo: () => void;
  onSaveLook: () => void;
  onSaveImage: () => void;
  onItemSelect: (item: Item) => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ 
    generatedImage, 
    items, 
    categoryItems, 
    onPostToFeed, 
    onBuy, 
    onUndo, 
    onSaveLook, 
    onSaveImage,
    onItemSelect 
}) => {
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  
  const wornItemIds = new Set(items.map(i => i.id));
  const suggestedItems = categoryItems.filter(i => !wornItemIds.has(i.id));

  return (
    <div className="w-full h-full flex flex-col text-white animate-fadeIn bg-black">
      <Header title="Seu Look" />
      <div className="flex-grow pt-20 flex flex-col items-center p-4 overflow-y-auto">
        <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl shadow-black/30 mb-6 bg-gray-900 flex-shrink-0">
            <img src={generatedImage} alt={`Você vestindo ${items[items.length - 1]?.name}`} className="w-full h-auto animate-imageAppear" />
        </div>
        
        <div className="w-full max-w-sm bg-gray-900 rounded-xl p-4 mb-4">
            <h2 className="text-xl font-bold mb-3">Itens no seu look:</h2>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                        <span className="flex-1 pr-2">{item.name}</span>
                        <span className="font-semibold text-gray-300">
                            {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                ))}
            </div>
            <div className="border-t border-gray-700 my-3"></div>
            <div className="flex justify-between items-center font-bold text-lg">
                <span>TOTAL:</span>
                <span className="text-blue-400">
                    {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
            </div>
        </div>

        {/* Carrossel de Itens Sugeridos */}
        {suggestedItems.length > 0 && (
          <div className="w-full max-w-sm mt-2">
            <h3 className="text-lg font-bold mb-3 text-gray-200">Experimente também:</h3>
            <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {suggestedItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => onItemSelect(item)} 
                  className="flex-shrink-0 w-32 bg-gray-900 rounded-lg overflow-hidden cursor-pointer group transform hover:scale-105 transition-transform"
                >
                   <img src={item.image} alt={item.name} className="w-full h-32 object-cover"/>
                   <div className="p-2">
                    <h4 className="text-xs font-semibold truncate group-hover:text-blue-400 transition-colors">{item.name}</h4>
                    <p className="text-xs text-gray-400">Provar</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      <div className="p-4 flex-shrink-0 space-y-2 bg-black border-t border-gray-800">
        <GradientButton onClick={() => onBuy(items)} className="w-full !py-3">
            <div className="flex items-center justify-center">
                 <ShoppingBagIcon className="w-4 h-4 mr-2" />
                Comprar Look
            </div>
        </GradientButton>
        <div className="flex gap-1.5">
             <button
                onClick={onUndo}
                className="flex-1 flex flex-col items-center justify-center text-white font-semibold py-1 px-1 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                aria-label="Desfazer última peça"
            >
               <UndoIcon className="w-2 h-2 mb-0.5" />
                <span className="text-[9px] tracking-wide">DESFAZER</span>
            </button>
            <button
                onClick={onSaveLook}
                className="flex-1 flex flex-col items-center justify-center text-white font-semibold py-1 px-1 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
               <BookmarkIcon className="w-2 h-2 mb-0.5" />
                <span className="text-[9px] tracking-wide">SALVAR</span>
            </button>
             <button
                onClick={onPostToFeed}
                className="flex-1 flex flex-col items-center justify-center text-white font-semibold py-1 px-1 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
               <ShareIcon className="w-2 h-2 mb-0.5" />
                <span className="text-[9px] tracking-wide">POSTAR</span>
            </button>
            <button
                onClick={onSaveImage}
                className="flex-1 flex flex-col items-center justify-center text-white font-semibold py-1 px-1 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
               <DownloadIcon className="w-2 h-2 mb-0.5" />
                <span className="text-[9px] tracking-wide">SALVAR FOTO</span>
            </button>
         </div>
      </div>
    </div>
  );
};

export default ResultScreen;