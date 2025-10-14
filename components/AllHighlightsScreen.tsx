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
    <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] animate-fadeIn">
      <Header title="Todas as Lojas" onBack={onBack} />
      <main className="flex-grow overflow-y-auto pt-16 p-4">
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 pb-4">
            {categories.map(category => (
              <div
                key={category.id}
                onClick={() => onSelectCategory(category)}
                className="relative w-full h-56 rounded-2xl overflow-hidden cursor-pointer group transform hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-[var(--accent-primary)]/20"
              >
                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-white">{category.name}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[var(--text-secondary)]">Nenhuma loja em destaque.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AllHighlightsScreen;
