

import React from 'react';
import type { Item } from '../types';
import GradientButton from './GradientButton';
import Header from './Header';
import { ShoppingBagIcon, PlusIcon, UndoIcon, ShareIcon, BookmarkIcon, DownloadIcon, VideoCameraIcon } from './IconComponents';

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
  onAddMoreItems: () => void;
  onGenerateVideo: () => void;
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
    onItemSelect,
    onAddMoreItems,
    onGenerateVideo
}) => {
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  
  const wornItemIds = new Set(items.map(i => i.id));
  const suggestedItems = categoryItems.filter(i => !wornItemIds.has(i.id));

  return (
    <div className="w-full h-full flex flex-col text-[var(--text-primary)] animate-fadeIn bg-[var(--bg-main)]">
      <Header title="Seu Look" />
      <div className="flex-grow pt-16 flex flex-col items-center p-4 overflow-y-auto">
        <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl shadow-black/30 mb-6 bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex-shrink-0">
            <img src={generatedImage} alt={`Você vestindo ${items[items.length - 1]?.name}`} className="w-full h-auto animate-imageAppear" />
        </div>
        
        <div className="w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4 mb-4">
            <h2 className="text-xl font-bold mb-3 text-[var(--accent-primary)] opacity-90">Itens no seu look:</h2>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                        <span className="flex-1 pr-2">{item.name}</span>
                        <span className="font-semibold text-[var(--text-tertiary)]">
                            {item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                        </span>
                    </div>
                ))}
            </div>
            <div className="border-t border-[var(--border-primary)] my-3"></div>
            <div className="flex justify-between items-center font-bold text-lg">
                <span className="uppercase">TOTAL:</span>
                <span className="text-[var(--accent-primary)] text-glow">
                    {totalPrice.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </span>
            </div>
        </div>

        {/* Carrossel de Itens Sugeridos */}
        {suggestedItems.length > 0 && (
          <div className="w-full max-w-sm mt-2">
            <h3 className="text-lg font-bold mb-3 text-[var(--text-primary)] opacity-90">Experimente também:</h3>
            <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {suggestedItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => onItemSelect(item)} 
                  className="flex-shrink-0 w-32 bg-[var(--bg-secondary)] border border-[var(--border-secondary)] rounded-lg overflow-hidden cursor-pointer group transform hover:scale-105 transition-transform hover:border-[var(--accent-primary)]/40"
                >
                   <img src={item.image} alt={item.name} className="w-full h-32 object-cover"/>
                   <div className="p-2">
                    <h4 className="text-xs font-semibold truncate group-hover:text-[var(--accent-primary)] transition-colors">{item.name}</h4>
                    <p className="text-xs text-[var(--text-secondary)]">Provar</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      <div className="p-4 flex-shrink-0 space-y-2 bg-[var(--bg-main)] border-t border-[var(--border-primary)]">
        <GradientButton onClick={() => onBuy(items)} className="w-full !py-3">
            <div className="flex items-center justify-center gap-2">
                 <ShoppingBagIcon className="w-5 h-5" />
                Comprar Look
            </div>
        </GradientButton>
        <div className="flex gap-1.5">
             <button
                onClick={onUndo}
                className="flex-1 flex flex-col items-center justify-center text-[var(--text-primary)] font-semibold py-2 px-1 rounded-lg bg-[var(--bg-tertiary)] hover:brightness-95 transition-colors"
                aria-label="Desfazer última peça"
            >
               <UndoIcon className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] tracking-wider uppercase">Desfazer</span>
            </button>
            <button
                onClick={onAddMoreItems}
                className="flex-1 flex flex-col items-center justify-center text-[var(--accent-primary)] font-semibold py-2 px-1 rounded-lg bg-[var(--bg-tertiary)] hover:brightness-95 transition-colors"
                aria-label="Adicionar mais peças"
            >
               <PlusIcon className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] tracking-wider uppercase">Adicionar</span>
            </button>
            <button
                onClick={onGenerateVideo}
                className="flex-1 flex flex-col items-center justify-center text-[var(--text-primary)] font-semibold py-2 px-1 rounded-lg bg-[var(--bg-tertiary)] hover:brightness-95 transition-colors"
                aria-label="Criar Vídeo do Look"
            >
                <VideoCameraIcon className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] tracking-wider uppercase">Vídeo</span>
            </button>
            <button
                onClick={onSaveLook}
                className="flex-1 flex flex-col items-center justify-center text-[var(--text-primary)] font-semibold py-2 px-1 rounded-lg bg-[var(--bg-tertiary)] hover:brightness-95 transition-colors"
            >
               <BookmarkIcon className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] tracking-wider uppercase">Salvar</span>
            </button>
            <button
                onClick={onSaveImage}
                className="flex-1 flex flex-col items-center justify-center text-[var(--text-primary)] font-semibold py-2 px-1 rounded-lg bg-[var(--bg-tertiary)] hover:brightness-95 transition-colors"
            >
               <DownloadIcon className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] tracking-wider uppercase">Salvar</span>
            </button>
         </div>
      </div>
    </div>
  );
};

export default ResultScreen;