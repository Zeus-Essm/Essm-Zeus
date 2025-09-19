
import React from 'react';
import type { Item } from '../types';
import GradientButton from './GradientButton';
import Header from './Header';
import { ShoppingBagIcon, PlusIcon, UndoIcon, ShareIcon, BookmarkIcon, DownloadIcon } from './IconComponents';

interface ResultScreenProps {
  generatedImage: string;
  items: Item[]; // Agora recebe uma lista de itens
  onPostToFeed: () => void; // Renomeado de onSave
  onBuy: (items: Item[]) => void;
  onBack: () => void;
  onSaveLook: () => void;
  onSaveImage: () => void;
  onContinueStyling: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ generatedImage, items, onPostToFeed, onBuy, onBack, onSaveLook, onSaveImage, onContinueStyling }) => {
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const lastItem = items[items.length - 1];

  return (
    <div className="w-full h-full flex flex-col text-white animate-fadeIn bg-black">
      <Header title="Seu Look" />
      <div className="flex-grow pt-20 flex flex-col items-center p-4 overflow-y-auto">
        <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl shadow-black/30 mb-6 bg-gray-900 flex-shrink-0">
            <img src={generatedImage} alt={`Você vestindo ${lastItem.name}`} className="w-full h-auto animate-imageAppear" />
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
      </div>
      <div className="p-4 flex-shrink-0 space-y-2 bg-black border-t border-gray-800">
        <div className="flex gap-2">
            <button
                onClick={onContinueStyling}
                className="flex-1 flex items-center justify-center text-white font-bold py-3 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
            >
               <PlusIcon className="w-4 h-4 mr-2" />
                Adicionar Peças
            </button>
            <GradientButton onClick={() => onBuy(items)} className="flex-1 !py-3">
                <div className="flex items-center justify-center">
                     <ShoppingBagIcon className="w-4 h-4 mr-2" />
                    Comprar Look
                </div>
            </GradientButton>
        </div>
        <div className="flex gap-1.5">
             <button
                onClick={onBack}
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
