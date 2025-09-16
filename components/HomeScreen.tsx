import React, { useRef } from 'react';
import type { Category } from '../types';
import { CATEGORIES } from '../constants';
import { CompassIcon, LooksIcon, ShoppingBagIcon, ChangeUserIcon, UserIcon } from './IconComponents';

interface HomeScreenProps {
  userImage: string | null;
  onImageUpload: (imageDataUrl: string) => void;
  onSelectCategory: (category: Category) => void;
  onNavigateToFeed: () => void;
  onNavigateToMyLooks: () => void;
  onNavigateToCart: () => void;
}

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-900 rounded-2xl hover:bg-gray-800 transition-colors flex-1 text-center">
        <div className="w-8 h-8 text-gray-300">{icon}</div>
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </button>
);


const HomeScreen: React.FC<HomeScreenProps> = ({ 
    userImage, 
    onImageUpload, 
    onSelectCategory, 
    onNavigateToFeed,
    onNavigateToMyLooks,
    onNavigateToCart,
}) => {
    
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };
  
  const featuredCategory = CATEGORIES[0];
  const otherCategories = CATEGORIES.slice(1);

  return (
    <div className="w-full h-full flex flex-col text-white animate-fadeIn p-4 pt-10 bg-black">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <header className="flex-shrink-0 mb-6 flex items-center gap-4 px-2">
        <div 
            className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center border-2 border-gray-700 shadow-lg"
        >
            {userImage ? (
                <img src={userImage} alt="Você" className="w-full h-full rounded-full object-cover" />
            ) : (
                <UserIcon className="w-10 h-10 text-gray-500" />
            )}
        </div>
        <div>
            <h1 className="text-3xl font-bold">Olá!</h1>
            <p className="text-gray-400">Bem-vindo(a) de volta.</p>
        </div>
      </header>
      
      <div className="flex items-stretch justify-around gap-3 mb-6 px-2">
          <ActionButton icon={<LooksIcon />} label="Meus Looks" onClick={onNavigateToMyLooks} />
          <ActionButton icon={<ShoppingBagIcon />} label="Carrinho" onClick={onNavigateToCart} />
          <ActionButton icon={<CompassIcon />} label="Feed" onClick={onNavigateToFeed} />
          <ActionButton icon={<ChangeUserIcon />} label="VESTIR" onClick={openFilePicker} />
      </div>

      {/* Card de Destaque */}
      <div 
        onClick={openFilePicker}
        className="mx-2 mb-6 relative h-48 rounded-2xl overflow-hidden cursor-pointer group transform hover:scale-[1.02] transition-transform duration-300 shadow-2xl shadow-black/50"
      >
        {featuredCategory.video ? (
            <video
              src={featuredCategory.video}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
        ) : (
            <img 
              src={featuredCategory.image} 
              alt="Look em Destaque" 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300">Look em Destaque</h3>
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase mt-1">{featuredCategory.name}</h2>
        </div>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xl font-bold border-2 border-white rounded-full px-6 py-2">Vestir Agora</span>
        </div>
      </div>

      <main className="flex-grow overflow-y-auto space-y-4">
        {otherCategories.length > 0 && (
            <h2 className="text-xl font-bold px-2 text-gray-300">Outras Coleções</h2>
        )}
        {otherCategories.map((category) => (
          <div
            key={category.id}
            onClick={openFilePicker}
            className="relative w-full h-40 rounded-2xl overflow-hidden cursor-pointer group transform hover:scale-105 transition-transform duration-300"
          >
            <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:blur-sm transition-all duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
              <h2 className="text-2xl font-black tracking-tighter uppercase">{category.name}</h2>
            </div>
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xl font-bold">Vestir Agora</span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default HomeScreen;