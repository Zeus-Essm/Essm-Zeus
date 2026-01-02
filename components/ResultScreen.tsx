
import React from 'react';
import type { Item } from '../types';
import GradientButton from './GradientButton';
import { 
    ShoppingBagIcon, 
    PlusIcon, 
    UndoIcon, 
    UploadIcon, 
    DownloadIcon, 
    VideoCameraIcon,
    ArrowLeftIcon,
    StarIcon
} from './IconComponents';

interface ResultScreenProps {
  generatedImage: string;
  items: Item[];
  styleTip?: string;
  isGeneratingVideo?: boolean;
  onBuy: (items: Item[]) => void;
  onUndo: () => void;
  onStartPublishing: () => void;
  onSaveImage: () => void;
  onAddMoreItems: () => void;
  onGenerateVideo: () => void;
}

const ActionButton: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    onClick: () => void; 
    highlight?: boolean;
    isLoading?: boolean;
}> = ({ icon, label, onClick, highlight, isLoading }) => (
    <button 
        onClick={onClick}
        disabled={isLoading}
        className={`flex flex-col items-center justify-center gap-1.5 flex-1 transition-all active:scale-90 group ${isLoading ? 'opacity-50' : ''}`}
    >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${highlight ? 'bg-amber-500 text-white shadow-[0_8px_16px_rgba(245,158,11,0.2)]' : 'bg-zinc-50 text-zinc-400 group-hover:bg-zinc-100 group-hover:text-zinc-900'}`}>
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
                React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6", strokeWidth: 2.5 })
            )}
        </div>
        <span className={`text-[9px] font-black uppercase tracking-widest ${highlight ? 'text-amber-600' : 'text-zinc-400'}`}>
            {isLoading ? '...' : label}
        </span>
    </button>
);

const ResultScreen: React.FC<ResultScreenProps> = ({ 
    generatedImage, 
    items, 
    styleTip,
    isGeneratingVideo,
    onBuy, 
    onUndo, 
    onStartPublishing, 
    onSaveImage,
    onAddMoreItems,
    onGenerateVideo
}) => {
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  
  return (
    <div className="w-full h-full flex flex-col bg-white text-zinc-900 animate-fadeIn font-sans overflow-hidden">
      <header className="px-4 pt-4 pb-2 flex items-center justify-between shrink-0 z-10 border-b border-zinc-50">
        <div className="flex items-center gap-3">
            <button onClick={onUndo} className="p-2 -ml-2 rounded-xl bg-zinc-50 text-zinc-400 active:scale-90 transition-all">
                <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-black tracking-tight text-zinc-900 uppercase italic">
                SEU LOOK
            </h1>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto px-5 pt-6 pb-32 scrollbar-hide">
        {/* Resultado Principal */}
        <div className="relative w-full aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/10 border border-zinc-100 bg-zinc-50 mb-6">
            <img 
                src={generatedImage} 
                alt="Resultado da IA" 
                className="w-full h-full object-cover animate-imageAppear" 
            />
            <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/20">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">PUMP AI VISION</span>
            </div>
        </div>

        {/* Style Tip Card */}
        {styleTip && (
            <div className="mb-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/50 rounded-[2rem] p-6 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                        <StarIcon className="w-24 h-24" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-white">
                            <StarIcon className="w-3.5 h-3.5" strokeWidth={3} />
                        </div>
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Dica do Stylist IA</span>
                    </div>
                    <p className="text-sm font-bold text-zinc-800 italic leading-relaxed">
                        "{styleTip}"
                    </p>
                </div>
            </div>
        )}
        
        {/* Lista de Itens */}
        <div className="bg-white rounded-[2rem] border border-zinc-100 p-6 shadow-sm mb-6 animate-slideUp" style={{ animationDelay: '0.4s' }}>
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-xl font-black text-zinc-900 uppercase italic tracking-tighter leading-none">Checkout</h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Items detectados pela IA</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Total</p>
                    <p className="text-xl font-black text-zinc-900 tracking-tighter">
                        {totalPrice.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 py-3 border-b border-zinc-50 last:border-0 group">
                        <div className="w-12 h-14 bg-zinc-100 rounded-xl overflow-hidden shadow-sm">
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="text-xs font-black text-zinc-800 uppercase italic truncate">{item.name}</p>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.category}</p>
                        </div>
                        <p className="text-sm font-black text-zinc-900 tracking-tighter">
                            {item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-zinc-100 z-50">
        <div className="max-w-md mx-auto space-y-6">
            <GradientButton 
                onClick={() => onBuy(items)} 
                className="w-full !py-5 !rounded-3xl !text-[11px] shadow-2xl flex items-center justify-center gap-3 group"
            >
                <ShoppingBagIcon className="w-5 h-5 transition-transform group-active:scale-110" />
                ADICIONAR TUDO AO CARRINHO
            </GradientButton>

            <div className="flex justify-between items-center px-2">
                <ActionButton icon={<UndoIcon />} label="Voltar" onClick={onUndo} />
                <ActionButton icon={<PlusIcon />} label="Explorar" onClick={onAddMoreItems} highlight={true} />
                <ActionButton 
                    icon={<VideoCameraIcon />} 
                    label="Vídeo" 
                    onClick={onGenerateVideo} 
                    isLoading={isGeneratingVideo}
                />
                <ActionButton icon={<UploadIcon />} label="Publicar" onClick={onStartPublishing} />
                <ActionButton icon={<DownloadIcon />} label="Salvar" onClick={onSaveImage} />
            </div>
        </div>
      </footer>

      <style>{`
        @keyframes imageAppear {
            from { opacity: 0; transform: scale(1.05); filter: blur(10px); }
            to { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-imageAppear { animation: imageAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default ResultScreen;
