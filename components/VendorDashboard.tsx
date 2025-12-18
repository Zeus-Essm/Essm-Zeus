
import React, { useState, useMemo, useRef } from 'react';
import type { BusinessProfile, Item, Post, MarketplaceType } from '../types';
import { MenuIcon, CameraIcon, PencilIcon, PlusIcon, StarIcon, XCircleIcon, BellIcon, UserIcon, StorefrontIcon } from './IconComponents';
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
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ businessProfile, onOpenMenu, unreadNotificationCount, onOpenNotificationsPanel, onOpenPromotionModal }) => {
    const [activeTab, setActiveTab] = useState<'shop' | 'posts'>('shop');
    const [activeGenderTab, setActiveGenderTab] = useState<'male' | 'female' | 'kid'>('male');
    const [activeShopCategory, setActiveShopCategory] = useState<{ id: string; name: string } | null>(null);
    const [isEditingBio, setIsEditingBio] = useState(false);
    
    const [localProfile, setLocalProfile] = useState(businessProfile);
    const [vendorItems, setVendorItems] = useState<Item[]>(INITIAL_VENDOR_ITEMS);
    const [highlightedItems, setHighlightedItems] = useState<Item[]>([]);
    
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
                    category: 'vendor-items',
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
            if (prev.some(item => item.id === itemToAdd.id)) return prev;
            if (prev.length >= 8) return prev;
            return [itemToAdd, ...prev];
        });
    };

    const handleRemoveFromHighlights = (itemIdToRemove: string) => {
        setHighlightedItems(prev => prev.filter(item => item.id !== itemIdToRemove));
    };

    const filteredItems = useMemo(() => {
        if (!activeShopCategory) return [];
        return vendorItems.filter(item => item.vendorSubCategory === activeShopCategory.id);
    }, [activeShopCategory, vendorItems]);

    const renderShopInterface = () => {
        const categoryType = businessProfile.business_category as MarketplaceType | 'fashion';
        const shopCategoryMap = {
            restaurant: RESTAURANT_SHOP_CATEGORIES,
            supermarket: SUPERMARKET_SHOP_CATEGORIES,
            beauty: BEAUTY_SHOP_CATEGORIES,
            technology: TECHNOLOGY_SHOP_CATEGORIES,
            decoration: DECORATION_SHOP_CATEGORIES,
        };
        
        const renderItemGrid = (buttonText: string) => (
            <div>
                <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-[var(--border-primary)]">
                    <button onClick={() => setActiveShopCategory(null)} className="text-[var(--text-secondary)] hover:underline">{businessProfile.business_name}</button>
                    <span className="text-[var(--text-secondary)]">/</span>
                    <span className="font-semibold text-[var(--text-primary)]">{activeShopCategory!.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2">
                    <button onClick={handleAddItemClick} className="aspect-w-1 aspect-h-1 rounded-md border-2 border-dashed border-zinc-800 text-zinc-600 flex flex-col items-center justify-center hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors">
                        <PlusIcon className="w-8 h-8 mb-2" />
                        <span className="text-xs font-semibold">{buttonText}</span>
                    </button>
                    {filteredItems.map(item => (
                        <div key={item.id} className="relative aspect-w-1 aspect-h-1 bg-zinc-900 rounded-md group">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md"/>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => handleAddToHighlights(item)} className="px-3 py-1.5 bg-black/70 rounded-full text-white text-xs font-bold"><StarIcon className="w-4 h-4 inline mr-1" />Destaque</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
        
        const renderCategoryGrid = (categories: {id: string; name: string; image: string;}[]) => (
             <div className="grid grid-cols-2 gap-4 p-4">
                {categories.map(cat => (
                     <div key={cat.id} onClick={() => setActiveShopCategory({id: cat.id, name: cat.name})} className="relative w-full h-48 rounded-2xl overflow-hidden cursor-pointer shadow-md">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                          <h2 className="text-2xl font-black tracking-tighter uppercase text-white">{cat.name}</h2>
                        </div>
                      </div>
                ))}
            </div>
        );

        if (categoryType === 'fashion') {
            return (
                <div>
                    <div className="px-4 py-2 border-b border-[var(--border-primary)] flex justify-around">
                        {['male', 'female', 'kid'].map(tab => (
                            <button key={tab} onClick={() => setActiveGenderTab(tab as any)} className={`py-2 px-3 text-sm font-semibold rounded-md ${activeGenderTab === tab ? 'bg-[var(--accent-primary)] text-black' : 'text-zinc-500'}`}>{tab.toUpperCase()}</button>
                        ))}
                    </div>
                    {activeShopCategory ? renderItemGrid("Adicionar Peça") : renderCategoryGrid(categoryType === 'fashion' ? MALE_CLOTHING_SUBCATEGORIES : [])}
                </div>
            );
        } else {
             return activeShopCategory ? renderItemGrid("Adicionar Item") : renderCategoryGrid(shopCategoryMap[categoryType as keyof typeof shopCategoryMap] || []);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <header className="px-4 pt-4 flex items-center justify-between flex-shrink-0">
                <h1 className="text-lg font-extrabold">{localProfile.business_name}</h1>
                <div className="flex items-center gap-5">
                    <button onClick={onOpenNotificationsPanel} className="relative">
                        <BellIcon className="w-7 h-7" />
                        {unreadNotificationCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{unreadNotificationCount}</span>}
                    </button>
                    <button onClick={onOpenMenu}><MenuIcon className="w-7 h-7" /></button>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto pt-4 pb-20">
                <div className="px-4 flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                        <div className="w-24 h-24 rounded-full p-0.5 bg-zinc-800">
                             {localProfile.logo_url ? (
                                <img src={localProfile.logo_url} alt="Logo" className="w-full h-full object-cover rounded-full border-2 border-[var(--bg-main)]" />
                             ) : (
                                <div className="w-full h-full rounded-full bg-zinc-700 flex items-center justify-center border-2 border-[var(--bg-main)]">
                                    <StorefrontIcon className="w-10 h-10 text-zinc-500" />
                                </div>
                             )}
                        </div>
                    </div>
                    <div className="flex-grow pt-2">
                        <p className="font-semibold text-sm">{localProfile.business_name}</p>
                        <p className="text-sm text-[var(--text-tertiary)]">{localProfile.description}</p>
                        <button onClick={() => setIsEditingBio(true)} className="mt-1 text-xs text-[var(--accent-primary)] font-bold">Editar Descrição</button>
                    </div>
                </div>
                
                <div className="mt-4 py-3 flex justify-around text-center border-y border-zinc-900">
                    <div><span className="text-lg font-bold">{vendorItems.length}</span><p className="text-sm text-zinc-500">produtos</p></div>
                    <div><span className="text-lg font-bold">0</span><p className="text-sm text-zinc-500">seguidores</p></div>
                    <div><span className="text-lg font-bold">0</span><p className="text-sm text-zinc-500">seguindo</p></div>
                </div>

                <div className="px-4 pt-4">
                    <h3 className="text-md font-bold mb-2">Destaques da Loja</h3>
                     <div className="flex overflow-x-auto gap-3 pb-2 [&::-webkit-scrollbar]:hidden">
                        {highlightedItems.map(item => (
                            <div key={item.id} className="flex-shrink-0 w-24 h-24 bg-zinc-900 rounded-lg relative overflow-hidden group">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                                <button onClick={() => handleRemoveFromHighlights(item.id)} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100"><XCircleIcon className="w-4 h-4" /></button>
                            </div>
                        ))}
                        {highlightedItems.length === 0 && <div className="py-8 text-center w-full text-zinc-600 text-xs border-2 border-dashed border-zinc-900 rounded-lg">Seus itens em destaque aparecerão aqui.</div>}
                    </div>
                </div>

                <div className="border-b border-zinc-900 flex mt-4">
                    <button onClick={() => setActiveTab('shop')} className={`flex-1 py-3 text-sm font-bold uppercase ${activeTab === 'shop' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-zinc-600'}`}>Loja</button>
                    <button onClick={() => setActiveTab('posts')} className={`flex-1 py-3 text-sm font-bold uppercase ${activeTab === 'posts' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-zinc-600'}`}>Posts</button>
                </div>

                <div className="pb-4">
                    {activeTab === 'shop' ? renderShopInterface() : (
                        <div className="grid grid-cols-3 gap-1 p-1">
                             {VENDOR_POSTS.map((post) => (
                                <div key={post.id} className="aspect-w-1 aspect-h-1 bg-zinc-900 rounded-sm">
                                    <img src={post.image} alt="Post" className="w-full h-full object-cover"/>
                                </div>
                            ))}
                             {VENDOR_POSTS.length === 0 && <div className="col-span-3 py-20 text-center text-zinc-600">Nenhum post disponível.</div>}
                        </div>
                    )}
                </div>
            </main>

            {isEditingBio && <BioEditModal initialBio={localProfile.description || ''} onClose={() => setIsEditingBio(false)} onSave={(newBio) => { setLocalProfile(prev => ({ ...prev, description: newBio })); setIsEditingBio(false); }} />}
        </div>
    );
};

export default VendorDashboard;
