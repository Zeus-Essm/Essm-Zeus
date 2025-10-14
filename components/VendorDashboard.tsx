import React, { useState, useMemo, useRef } from 'react';
import type { BusinessProfile, Item, Post } from '../types';
import { MenuIcon, CameraIcon, PencilIcon, PlusIcon, StarIcon, XCircleIcon } from './IconComponents';
import BioEditModal from './BioEditModal';
import { MALE_CLOTHING_SUBCATEGORIES, FEMALE_CLOTHING_SUBCATEGORIES, KID_CLOTHING_SUBCATEGORIES } from '../constants';


// Dummy Data - In a real app, this would be fetched
const INITIAL_VENDOR_ITEMS: Item[] = [
    { id: 'vendor-item-1', name: 'T-shirt Gráfica Exclusiva', description: '...', category: '...', image: 'https://i.postimg.cc/TPR4dpBg/louis-vuitton-camiseta-de-algodao-bordada-HTY18-WNPG651-PM2-Front-view.webp', price: 350, gender: 'male', vendorSubCategory: 'tshirt' },
    { id: 'vendor-item-2', name: 'Calça Cargo Techwear', description: '...', category: '...', image: 'https://i.postimg.cc/W1tdQn1k/dddd.webp', price: 890, gender: 'male', vendorSubCategory: 'calca' },
    { id: 'vendor-item-3', name: 'Ténis Urbano V2', description: '...', category: '...', image: 'https://i.postimg.cc/VvTx5mX1/louis-vuitton-sneaker-lv-skate-BO9-U3-PMI31-PM2-Front-view.webp', price: 1250, gender: 'unisex', vendorSubCategory: 'tenis' },
    { id: 'vendor-item-4', name: 'Jaqueta Corta-vento', description: '...', category: '...', image: 'https://i.postimg.cc/W1cyy9n9/louis-vuitton-paleto-pont-neuf-de-la-HRFJ8-EDLG60-D-PM2-Front-view.png', price: 990, gender: 'male', vendorSubCategory: 'jaqueta' },
    { id: 'vendor-item-5', name: 'Vestido de Gala LV', description: 'Vestido longo de seda para ocasiões especiais.', category: '...', image: 'https://i.postimg.cc/k47jSjPj/vestido-lv-fem-1.jpg', price: 15000, gender: 'female', vendorSubCategory: 'vestido' },
    { id: 'vendor-item-6', name: 'Vestido Casual Monograma', description: 'Vestido confortável para o dia a dia, com padrão monograma.', category: '...', image: 'https://i.postimg.cc/C1QZ8L1k/vestido-lv-fem-2.jpg', price: 7500, gender: 'female', vendorSubCategory: 'vestido' },
    { id: 'vendor-item-7', name: 'Conjunto Infantil', description: 'Conjunto confortável para crianças.', category: '...', image: 'https://i.postimg.cc/DyL1wFVc/pequeno.jpg', price: 450, gender: 'kid', vendorSubCategory: 'fato' },
    { id: 'vendor-item-8', name: 'Saia Jeans New Feeling', description: 'Saia jeans moderna e despojada.', category: '...', image: 'https://i.postimg.cc/8z7xQ9WY/saia-nf-fem-1.jpg', price: 250, gender: 'female', vendorSubCategory: 'saia' },
];

const VENDOR_POSTS: Post[] = [
    {
        id: 'vpost1',
        user: { id: 'vendor1', name: 'Minha Loja', avatar: 'https://i.pravatar.cc/150?u=vendor' },
        image: 'https://i.postimg.cc/bJYnRnS3/meu-estilo-look-6.png',
        items: [INITIAL_VENDOR_ITEMS[2]],
        likes: 1200, isLiked: false, comments: [], commentCount: 15
    },
    {
        id: 'vpost2',
        user: { id: 'vendor1', name: 'Minha Loja', avatar: 'https://i.pravatar.cc/150?u=vendor' },
        image: 'https://i.postimg.cc/vTc6Jdzn/meu-estilo-look.png',
        items: [INITIAL_VENDOR_ITEMS[0], INITIAL_VENDOR_ITEMS[1]],
        likes: 2500, isLiked: true, comments: [], commentCount: 32
    },
];


interface VendorDashboardProps {
  businessProfile: BusinessProfile;
  onOpenMenu: () => void;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ businessProfile, onOpenMenu }) => {
    const [activeTab, setActiveTab] = useState<'shop' | 'posts'>('shop');
    const [activeGenderTab, setActiveGenderTab] = useState<'male' | 'female' | 'kid'>('male');
    const [activeSubCategory, setActiveSubCategory] = useState<{ id: string; name: string } | null>(null);
    const [isEditingBio, setIsEditingBio] = useState(false);
    
    const [localProfile, setLocalProfile] = useState(businessProfile);
    const [vendorItems, setVendorItems] = useState<Item[]>(INITIAL_VENDOR_ITEMS);
    const [highlightedItems, setHighlightedItems] = useState<Item[]>(() => INITIAL_VENDOR_ITEMS.slice(0, 4));
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddPieceClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && activeSubCategory) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImage = reader.result as string;
                const newItem: Item = {
                    id: `vendor-item-${Date.now()}`,
                    name: "Nova Peça",
                    description: "Adicione uma descrição",
                    category: 'vendor-items', // Placeholder
                    image: newImage,
                    price: 0,
                    gender: activeGenderTab,
                    vendorSubCategory: activeSubCategory.id,
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

    const genderTabs = [
        { id: 'male', label: 'Masculino' },
        { id: 'female', label: 'Feminino' },
        { id: 'kid', label: 'Criança' },
    ];
    
    const subCategoryMap = {
        male: MALE_CLOTHING_SUBCATEGORIES,
        female: FEMALE_CLOTHING_SUBCATEGORIES,
        kid: KID_CLOTHING_SUBCATEGORIES,
    };

    const filteredItems = useMemo(() => {
        if (!activeSubCategory) return [];
        return vendorItems.filter(item => {
            const genderMatch = (activeGenderTab === 'male' && (item.gender === 'male' || item.gender === 'unisex')) ||
                                (activeGenderTab === 'female' && (item.gender === 'female' || item.gender === 'unisex')) ||
                                (activeGenderTab === 'kid' && (item.gender === 'kid' || item.gender === 'unisex'));
            const subCategoryMatch = item.vendorSubCategory === activeSubCategory.id;
            return genderMatch && subCategoryMatch;
        });
    }, [activeGenderTab, activeSubCategory, vendorItems]);

    const handleGenderTabClick = (gender: 'male' | 'female' | 'kid') => {
        setActiveGenderTab(gender);
        setActiveSubCategory(null); // Reset sub-category when changing gender
    };
    
    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
            {/* Hidden file input for uploading new pieces */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            
            <header className="px-4 pt-4 flex items-center justify-between flex-shrink-0">
                <h1 className="text-lg font-extrabold">{localProfile.business_name}</h1>
                <div className="flex items-center gap-5 relative">
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
                    <div><span className="text-lg font-bold">12,8K</span><p className="text-sm text-[var(--text-secondary)]">seguidores</p></div>
                    <div><span className="text-lg font-bold">6.989</span><p className="text-sm text-[var(--text-secondary)]">seguindo</p></div>
                </div>

                <div className="px-4 pt-4">
                    <h3 className="text-md font-bold mb-2">Destaques</h3>
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
                            
                            {!activeSubCategory ? (
                                <div className="grid grid-cols-2 gap-4 p-4">
                                    {subCategoryMap[activeGenderTab].map(subCat => (
                                         <div
                                            key={subCat.id}
                                            onClick={() => setActiveSubCategory({id: subCat.id, name: subCat.name})}
                                            className="relative w-full h-48 rounded-2xl overflow-hidden cursor-pointer group transform hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-[var(--accent-primary)]/20"
                                          >
                                            <img src={subCat.image} alt={subCat.name} className="w-full h-full object-cover group-hover:blur-sm transition-all duration-300" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                              <h2 className="text-2xl font-black tracking-tighter uppercase text-white">{subCat.name}</h2>
                                            </div>
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <span className="text-xl font-bold text-[var(--accent-primary)]">Ver Itens</span>
                                            </div>
                                          </div>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-[var(--border-primary)]">
                                        <button onClick={() => setActiveSubCategory(null)} className="text-[var(--text-secondary)] hover:underline">
                                            {genderTabs.find(g => g.id === activeGenderTab)?.label}
                                        </button>
                                        <span className="text-[var(--text-secondary)]">/</span>
                                        <span className="font-semibold text-[var(--text-primary)]">{activeSubCategory.name}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 p-2">
                                        <button
                                            onClick={handleAddPieceClick}
                                            className="aspect-w-1 aspect-h-1 rounded-md border-2 border-dashed border-[var(--border-primary)] text-[var(--text-secondary)] flex flex-col items-center justify-center hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors"
                                        >
                                            <PlusIcon className="w-8 h-8 mb-2" />
                                            <span className="text-xs font-semibold">Adicionar Peça</span>
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
                            )}

                        </div>
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
                    initialBio={localProfile.description || ''}
                    onClose={() => setIsEditingBio(false)}
                    onSave={(newBio) => {
                        setLocalProfile(prev => ({ ...prev, description: newBio }));
                        setIsEditingBio(false);
                    }}
                />
            )}
        </div>
    );
};

export default VendorDashboard;