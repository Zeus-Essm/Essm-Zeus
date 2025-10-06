import React from 'react';
import type { Category, SubCategory } from '../types';
import Header from './Header';

interface SubCategorySelectionScreenProps {
  node: Category | SubCategory;
  onSelectSubCategory: (subCategory: SubCategory) => void;
  onBack: () => void;
}

const SubCategorySelectionScreen: React.FC<SubCategorySelectionScreenProps> = ({ node, onSelectSubCategory, onBack }) => {
  return (
    <div className="w-full h-full flex flex-col text-[var(--text-primary)] animate-fadeIn bg-[var(--bg-main)]">
      <Header title={node.name} onBack={onBack} />
      <main className="flex-grow overflow-y-auto pt-20 p-4">
        <h2 className="text-2xl font-bold mb-4 text-[var(--text-tertiary)]">Escolha uma coleção</h2>
        <div className="grid grid-cols-2 gap-4 pb-4">
            {(node.subCategories || []).map((subCategory) => (
              <div
                key={subCategory.id}
                onClick={() => onSelectSubCategory(subCategory)}
                className="relative w-full h-48 rounded-2xl overflow-hidden cursor-pointer group transform hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-yellow-400/20"
              >
                <img src={subCategory.image} alt={subCategory.name} className="w-full h-full object-cover group-hover:blur-sm transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <h2 className="text-2xl font-black tracking-tighter uppercase text-white">{subCategory.name}</h2>
                </div>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xl font-bold text-yellow-300">Ver Itens</span>
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default SubCategorySelectionScreen;