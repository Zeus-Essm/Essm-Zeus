
import React from 'react';
import type { Item } from '../types';
import GradientButton from './GradientButton';
import { ShoppingBagIcon } from './IconComponents';

interface RecommendationModalProps {
  item: Item;
  onClose: () => void;
  onAddToCart: (item: Item) => void;
  onStartTryOn: (item: Item) => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const RecommendationModal: React.FC<RecommendationModalProps> = ({ item, onClose, onAddToCart, onStartTryOn }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-fadeIn">
      {/* Backdrop Close Area */}
      <div className="absolute inset-0" onClick={onClose} />

      <div 
        className="relative bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden animate-modalZoomIn shadow-2xl border border-zinc-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2.5 rounded-2xl bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-all active:scale-90 shadow-sm"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <div className="p-8 pt-10 flex flex-col items-center text-center">
             <div className="relative w-full aspect-square mb-6 rounded-[2rem] overflow-hidden bg-zinc-50 border border-zinc-100 p-4">
                <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-contain drop-shadow-xl"
                />
             </div>

             <div className="w-full space-y-2">
                <h2 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tighter leading-none">
                    {item.name}
                </h2>
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] italic">
                    Referência Premium
                </p>
                
                <p className="text-sm text-zinc-500 font-medium leading-relaxed px-2 mt-4 line-clamp-3">
                    {item.description || "Este item faz parte da coleção exclusiva PUMP. Design minimalista com acabamento de alta qualidade."}
                </p>

                <div className="pt-4 pb-6">
                    <p className="text-3xl font-black text-zinc-900 tracking-tighter">
                        {item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                    </p>
                </div>
                
                <div className="flex flex-col w-full gap-3 mt-4">
                    <GradientButton 
                        onClick={() => {
                            onStartTryOn(item);
                            onClose(); // Fecha o modal após iniciar o provador
                        }}
                        className="!py-5 !rounded-[1.5rem] !text-[11px] shadow-xl"
                    >
                        PROVAR AGORA
                    </GradientButton>
                    <button
                        onClick={() => onAddToCart(item)}
                        className="w-full flex items-center justify-center py-4 bg-zinc-50 text-zinc-400 font-black uppercase text-[10px] tracking-widest rounded-[1.5rem] border border-zinc-100 hover:bg-zinc-100 hover:text-zinc-900 transition-all active:scale-95"
                    >
                        <ShoppingBagIcon className="w-4 h-4 mr-2" />
                        ADICIONAR AO CARRINHO
                    </button>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationModal;
