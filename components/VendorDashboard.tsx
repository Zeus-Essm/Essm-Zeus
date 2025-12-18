
import React, { useState, useMemo, useRef } from 'react';
import type { BusinessProfile, Item, Post, MarketplaceType } from '../types';
import { MenuIcon, CameraIcon, PencilIcon, PlusIcon, StarIcon, XCircleIcon, BellIcon } from './IconComponents';
import BioEditModal from './BioEditModal';
import GradientButton from './GradientButton';
import { 
    MALE_CLOTHING_SUBCATEGORIES, 
    FEMALE_CLOTHING_SUBCATEGORIES, 
    KID_CLOTHING_SUBCATEGORIES,
    RESTAURANT_SHOP_CATEGORIES,
    SUPERMARKET_SHOP_CATEGORIES,
    BEAUTY_SHOP_CATEGORIES,
    TECHNOLOGY_SHOP_CATEGORIES,
    DECORATION_SHOP_CATEGORIES,
    INITIAL_VENDOR_ITEMS,
    VENDOR_POSTS
} from '../constants';

interface VendorDashboardProps {
  businessProfile: BusinessProfile;
  onOpenMenu: () => void;
  unreadNotificationCount: number;
  onOpenNotificationsPanel: () => void;
  onOpenPromotionModal: () => void;
  followersCount: number;
  followingCount: number;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ businessProfile, onOpenMenu, unreadNotificationCount, onOpenNotificationsPanel, onOpenPromotionModal, followersCount, followingCount }) => {
    const [activeTab, setActiveTab] = useState<'shop' | 'posts'>('shop');
    const [activeGenderTab, setActiveGenderTab] = useState<'male' | 'female' | 'kid'>('male');
    const [activeShopCategory, setActiveShopCategory] = useState<{ id: string; name: string } | null>(null);
    const [isEditingBio, setIsEditingBio] = useState(false);
    
    const [localProfile, setLocalProfile] = useState(businessProfile);
    const [vendorItems, setVendorItems] = useState<Item[]>(INITIAL_VENDOR_ITEMS);
    const [highlightedItems, setHighlightedItems] = useState<Item[]>(() => INITIAL_VENDOR_ITEMS.slice(0, 4));
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddItemClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && activeShopCategory) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImage = reader.result as string;
                const newItem: Item = {
                    id: `vendor-item-${Date.now()}`,
                    name: "Novo Item",
                    description: "Adicione uma descrição",
                    category: 'vendor-items', // Placeholder
                    image: newImage,
                    price: 0,
                    gender: businessProfile.business_category === 'fashion' ? activeGenderTab : 'unisex',
                    vendorSubCategory: activeShopCategory.id,
                };
                setVendorItems(prevItems => [newItem, ...prevItems]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddToHighlights = (itemToAdd: Item) => {
        setHighlightedItems(prev => {
            if (prev.some(item => item.id === itemToAdd.id)) {
                alert("Este item já está nos destaques.");
                return prev;
            }
            if (prev.length >= 8) {
                alert("O limite de 8 destaques foi atingido. Remova um para adicionar outro.");
                return prev;
            }
            const newHighlights = [itemToAdd, ...prev];
            return newHighlights;
        });
    };

    const handleRemoveFromHighlights = (itemIdToRemove: string) => {
        setHighlightedItems(prev => prev.filter(item => item.id !== itemIdToRemove));
    };

    const handleGenderTabClick = (gender: 'male' | 'female' | 'kid') => {
        setActiveGenderTab(gender);
        setActiveShopCategory(null); // Reset sub-category when changing gender
    };

    const handleBackToPrimaryCategories = () => {
        setActiveShopCategory(null);
    };
    
    const filteredItems = useMemo(() => {
        if (!activeShopCategory) return [];
        if (businessProfile.business_category === 'fashion') {
             return vendorItems.filter(item => {
                const genderMatch = (activeGenderTab === 'male' && (item.gender === 'male' || item.gender === 'unisex')) ||
                                    (activeGenderTab === 'female' && (item.gender === 'female' || item.gender === 'unisex')) ||
                                    (activeGenderTab === 'kid' && (item.gender === 'kid' || item.gender === 'unisex'));
                const subCategoryMatch = item.vendorSubCategory === activeShopCategory.id;
                return genderMatch && subCategoryMatch;
            });
        } else {
            return vendorItems.filter(item => item.vendorSubCategory === activeShopCategory.id);
        }
    }, [activeGenderTab, activeShopCategory, vendorItems, businessProfile.business_category]);

    const renderShopInterface = () => {
        const categoryType = businessProfile.business_category as MarketplaceType | 'fashion';

        const shopCategoryMap = {
            restaurant: RESTAURANT_SHOP_CATEGORIES,
            supermarket: SUPERMARKET_SHOP_CATEGORIES,
            beauty: BEAUTY_SHOP_CATEGORIES,
            technology: TECHNOLOGY_SHOP_CATEGORIES,
            decoration: DECORATION_SHOP_CATEGORIES,
        };
        
        const fashionSubCategoryMap = {
            male: MALE_CLOTHING_SUBCATEGORIES,
            female: FEMALE_CLOTHING_SUBCATEGORIES,
            kid: KID_CLOTHING_SUBCATEGORIES,
        };

        const renderItemGrid = (buttonText: string) => (
            <div>
                <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-[var(--border-primary)]">
                    <button onClick={handleBackToPrimaryCategories} className="text-[var(--text-secondary)] hover:underline">
                        {categoryType === 'fashion' ? genderTabs.find(g => g.id === activeGenderTab)?.label : businessProfile.business_name}
                    </button>
                    <span className="text-[var(--text-secondary)]">/</span>
                    <span className="font-semibold text-[var(--text-primary)]">{activeShopCategory!.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2">
                    <button
                        onClick={handleAddItemClick}
                        className="aspect-w-1 aspect-h-1 rounded-md border-2 border-dashed border-[var(--border-primary)] text-[var(--text-secondary)] flex flex-col items-center justify-center hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                        <PlusIcon className="w-8 h-8 mb-2" />
                        <span className="text-xs font-semibold">{buttonText}</span>
                    </button>
                    {filteredItems.map(item => (
                        <div key={item.id} className="relative aspect-w-1 aspect-h-1 bg-zinc-800 rounded-md group cursor-pointer">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md"/>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                <button 
                                    onClick={() => handleAddToHighlights(item)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-black/70 rounded-full text-white hover:bg-[var(--accent-primary)] hover:text-black transition-colors text-xs font-semibold backdrop-blur-sm"
                                    title="Adicionar aos Destaques"
                                >
                                    <StarIcon className="w-4 h-4" />
                                    Destaque
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
        
        const renderCategoryGrid = (categories: {id: string; name: string; image: string;}[]) => (
             <div className="grid grid-cols-2 gap-4 p-4">
                {categories.map(cat => (
                     <div
                        key={cat.id}
                        onClick={() => setActiveShopCategory({id: cat.id, name: cat.name})}
                        className="relative w-full h-48 rounded-2xl overflow-hidden cursor-pointer group transform hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-[var(--accent-primary)]/20"
                      >
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:blur-sm transition-all duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                          <h2 className="text-2xl font-black tracking-tighter uppercase text-white">{cat.name}</h2>
                        </div>
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-xl font-bold text-[var(--accent-primary)]">Ver Itens</span>
                        </div>
                      </div>
                ))}
            </div>
        );

        if (categoryType === 'fashion') {
            return (
                <div>
                    <div className="px-4 py-2 border-b border-[var(--border-primary)] flex justify-around">
                        {genderTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleGenderTabClick(tab.id as any)}
                                className={`py-2 px-3 text-sm font-semibold whitespace-nowrap rounded-md transition-colors ${
                                activeGenderTab === tab.id
                                    ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)]'
                                    : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--accent-primary)]/10'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    {activeShopCategory ? renderItemGrid("Adicionar Peça") : renderCategoryGrid(fashionSubCategoryMap[activeGenderTab])}
                </div>
            );
        } else {
             const currentShopCategories = shopCategoryMap[categoryType as keyof typeof shopCategoryMap] || [];
             return activeShopCategory ? renderItemGrid("Adicionar Item") : renderCategoryGrid(currentShopCategories);
        }
    };

    const genderTabs = [
        { id: 'male', label: 'Masculino' },
        { id: 'female', label: 'Feminino' },
        { id: 'kid', label: 'Criança' },
    ];
    
    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            
            <header className="px-4 pt-4 flex items-center justify-between flex-shrink-0">
                <h1 className="text-lg font-extrabold">{localProfile.business_name}</h1>
                <div className="flex items-center gap-5 relative">
                    <button onClick={onOpenNotificationsPanel} className="relative">
                        <BellIcon className="w-7 h-7" />
                        {unreadNotificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-[var(--bg-main)]">
                                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                            </span>
                        )}
                    </button>
                    <button onClick={() => alert("Criar novo post")}><PlusIcon className="w-7 h-7" /></button>
                    <button onClick={onOpenMenu}><MenuIcon className="w-7 h-7" /></button>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto pt-4 pb-20">
                <div className="px-4 flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                        <div className="w-24 h-24 rounded-full p-0.5 bg-gradient-to-tr from-yellow-300 via-amber-500 to-orange-500">
                            <img src={localProfile.logo_url} alt="Logo" className="w-full h-full object-cover rounded-full border-2 border-[var(--bg-main)]" />
                        </div>
                        <button className="absolute bottom-0 -right-1 p-1.5 bg-black/60 rounded-full border-2 border-[var(--bg-main)] hover:bg-black/80 transition-colors" aria-label="Alterar logo">
                            <CameraIcon className="w-5 h-5 text-white" />
                        </button>
                    </div>
                    <div className="flex-grow pt-2">
                         <div className="flex justify-between items-start gap-2">
                             <div className="flex-grow">
                                <p className="font-semibold text-sm">{localProfile.business_name}</p>
                                <p className="text-sm text-[var(--text-tertiary)] whitespace-pre-line">{localProfile.description}</p>
                            </div>
                            <button onClick={() => setIsEditingBio(true)} className="p-2 -mr-2 -mt-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0" aria-label="Editar descrição">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 py-3 flex justify-around text-center border-y border-[var(--border-primary)]">
                    <div><span className="text-lg font-bold">{vendorItems.length}</span><p className="text-sm text-[var(--text-secondary)]">produtos</p></div>
                    <div><span className="text-lg font-bold">{followersCount}</span><p className="text-sm text-[var(--text-secondary)]">seguidores</p></div>
                    <div><span className="text-lg font-bold">{followingCount}</span><p className="text-sm text-[var(--text-secondary)]">seguindo</p></div>
                </div>

                 <div className="px-4 mt-4">
                    <GradientButton onClick={onOpenPromotionModal} className="!py-2.5 text-sm">
                        Criar Promoção
                    </GradientButton>
                </div>

                <div className="px-4 pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-md font-bold">Destaques</h3>
                    </div>
                     <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {highlightedItems.map(item => (
                            <div key={item.id} className="flex-shrink-0 w-24 h-24 bg-zinc-800 rounded-lg cursor-pointer overflow-hidden relative group">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg"/>
                                <button 
                                    onClick={() => handleRemoveFromHighlights(item.id)}
                                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remover dos Destaques"
                                >
                                    <XCircleIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        {highlightedItems.length < 8 && (
                             <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center bg-zinc-900/50 rounded-lg border-2 border-dashed border-[var(--border-primary)]">
                                <p className="text-xs text-center text-[var(--text-secondary)] px-2">Adicione itens da sua loja aqui</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-b border-[var(--border-primary)] flex mt-4">
                    <button onClick={() => setActiveTab('shop')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'shop' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>Loja</button>
                    <button onClick={() => setActiveTab('posts')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'posts' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>Publicações</button>
                </div>

                <div>
                    {activeTab === 'shop' ? (
                        renderShopInterface()
                    ) : (
                        <div className="grid grid-cols-3 gap-1 p-1">
                             {VENDOR_POSTS.map((post) => (
                                <div key={post.id} className="aspect-w-1 aspect-h-1 bg-zinc-800 rounded-sm cursor-pointer">
                                    <img src={post.image} alt="Post" className="w-full h-full object-cover"/>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {isEditingBio && (
                <BioEditModal
                    initialUsername={localProfile.business_name}
                    initialBio={localProfile.description || ''}
                    onClose={() => setIsEditingBio(false)}
                    onSave={(newBusinessName, newDescription) => {
                        setLocalProfile(prev => ({ ...prev, business_name: newBusinessName, description: newDescription }));
                        setIsEditingBio(false);
                    }}
                />
            )}
        </div>
    );
};

export default VendorDashboard;
