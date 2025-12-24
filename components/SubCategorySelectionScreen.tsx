
import React from 'react';
import type { Category, SubCategory } from '../types';
import Header from './Header';
import { ChevronRightIcon } from './IconComponents';

interface SubCategorySelectionScreenProps {
  node: Category | SubCategory;
  onSelectSubCategory: (subCategory: SubCategory) => void;
  onBack: () => void;
}

const SubCategorySelectionScreen: React.FC<SubCategorySelectionScreenProps> = ({ node, onSelectSubCategory, onBack }) => {
  return (
    <div className="w-full h-full flex flex-col bg-white text-zinc-900 animate-fadeIn font-sans overflow-hidden">
      <Header title="EXPLORAR" onBack={onBack} />
      
      <main className="flex-grow overflow-y-auto pt-20 px-5 pb-24">
        <div className="mb-8">
            <h2 className="text-3xl font-black text-zinc-900 uppercase italic tracking-tighter leading-none">
                Escolha uma seção
            </h2>
            <p className="text-[11px] font-bold text-amber-500 uppercase tracking-[0.2em] mt-2">
                Conectando com catálogos reais
            </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {(node.subCategories || []).map((subCategory) => (
              <div
                key={subCategory.id}
                onClick={() => onSelectSubCategory(subCategory)}
                className="relative w-full h-32 rounded-[2rem] overflow-hidden cursor-pointer group active:scale-[0.98] transition-all border border-zinc-100 shadow-sm"
              >
                <img 
                    src={subCategory.image} 
                    alt={subCategory.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                
                {/* Overlay de gradiente para legibilidade */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent flex items-center p-8">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white drop-shadow-md">
                            {subCategory.name}
                        </h2>
                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Ver Coleção</span>
                    </div>
                </div>

                <div className="absolute right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRightIcon className="w-5 h-5" strokeWidth={3} />
                </div>
              </div>
            ))}
        </div>

        {/* Footer informativo sutil */}
        <div className="mt-12 text-center opacity-20">
            <p className="text-[9px] font-black uppercase tracking-[0.3em]">PUMP Marketplace Engine v2.0</p>
        </div>
      </main>
    </div>
  );
};

export default SubCategorySelectionScreen;
