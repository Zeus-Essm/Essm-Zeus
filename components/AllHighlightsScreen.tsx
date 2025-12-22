
import React from 'react';
import type { Category } from '../types';
import Header from './Header';

interface AllHighlightsScreenProps {
  categories: Category[];
  onBack: () => void;
  onSelectCategory: (category: Category) => void;
}

const AllHighlightsScreen: React.FC<AllHighlightsScreenProps> = ({ categories, onBack, onSelectCategory }) => {
  return (
    <div className="w-full h-full flex flex-col bg-white text-zinc-900 animate-fadeIn overflow-hidden">
      <Header title="Todas as Lojas" onBack={onBack} />
      <main className="flex-grow overflow-y-auto pt-20 p-4 scrollbar-hide">
        <div className="px-1 mb-6">
            <h2 className="text-xl font-black text-zinc-900 tracking-tighter uppercase italic">Explore o Mercado</h2>
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">As melhores marcas de Angola em um só lugar</p>
        </div>
        
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 pb-24">
            {categories.map(category => (
              <div
                key={category.id}
                onClick={() => onSelectCategory(category)}
                className="relative aspect-[3/4] rounded-[2rem] overflow-hidden cursor-pointer group shadow-lg border border-zinc-100 bg-zinc-900 active:scale-95 transition-all"
              >
                {category.video ? (
                    <video 
                        src={category.video} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                ) : (
                    <img 
                        src={category.image} 
                        alt={category.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
                  <h3 className="text-sm font-black tracking-tighter uppercase italic text-white leading-tight drop-shadow-md">
                      {category.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center opacity-30">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Nenhuma loja disponível no momento.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AllHighlightsScreen;
