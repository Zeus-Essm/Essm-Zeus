
import React, { useState, useMemo, useRef } from 'react';
import type { BusinessProfile, Item, Post, MarketplaceType } from '../types';
import { MenuIcon, CameraIcon, PencilIcon, PlusIcon, StarIcon, XCircleIcon, BellIcon, CheckCircleIconFilled, ArrowLeftIcon, UploadIcon } from './IconComponents';
import BioEditModal from './BioEditModal';
import GradientButton from './GradientButton';
import { 
    MALE_CLOTHING_SUBCATEGORIES, 
    FEMALE_CLOTHING_SUBCATEGORIES, 
    KID_CLOTHING_SUBCATEGORIES,
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
  onStartCreate?: () => void;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ businessProfile, onOpenMenu, unreadNotificationCount, onOpenNotificationsPanel, onOpenPromotionModal, followersCount, followingCount, onStartCreate }) => {
    const [activeTab, setActiveTab] = useState<'shop' | 'posts'>('shop');
    const [activeGenderTab, setActiveGenderTab] = useState<'male' | 'female' | 'kid'>('male');
    const [activeShopCategory, setActiveShopCategory] = useState<{ id: string; name: string } | null>(null);
    const [isEditingBio, setIsEditingBio] = useState(false);
    
    const [localProfile, setLocalProfile] = useState(businessProfile);
    const [vendorItems, setVendorItems] = useState<Item[]>(INITIAL_VENDOR_ITEMS);
    const [highlightedItems, setHighlightedItems] = useState<Item[]>([]);
    
    // Estados para criação dinâmica de pastas
    const [customFolders, setCustomFolders] = useState<{ id: string; name: string; image: string }[]>([]);
    const [isNamingFolder, setIsNamingFolder] = useState(false);
    const [tempFolderName, setTempFolderName] = useState('');
    
    // Estados para criação de itens
    const [isCreatingItem, setIsCreatingItem] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemDescription, setNewItemDescription] = useState('');
    const [newItemImage, setNewItemImage] = useState<string | null>(null);

    const itemFileInputRef = useRef<HTMLInputElement>(null);
    const folderCoverInputRef = useRef<HTMLInputElement>(null);

    const handleStartCreateItem = () => {
        setIsCreatingItem(true);
        setNewItemName('');
        setNewItemPrice('');
        setNewItemDescription('');
        setNewItemImage(null);
    };

    const handleStartCreateFolder = () => {
        setIsNamingFolder(true);
        setTempFolderName('');
    };

    const handleConfirmFolderName = () => {
        if (!tempFolderName.trim()) {
            alert("Por favor, digite um nome para a pasta.");
            return;
        }
        folderCoverInputRef.current?.click();
    };

    const handleFolderCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && tempFolderName) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const coverImage = reader.result as string;
                const newFolder = {
                    id: `folder-${Date.now()}`,
                    name: tempFolderName.trim(),
                    image: coverImage
                };
                setCustomFolders(prev => [...prev, newFolder]);
                setIsNamingFolder(false);
                setTempFolderName('');
                setActiveShopCategory({ id: newFolder.id, name: newFolder.name });
            };
            reader.readAsDataURL(file);
        }
        event.target.value = '';
    };

    const handleItemImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewItemImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveItem = () => {
        if (!newItemName || !newItemPrice || !newItemImage || !activeShopCategory) {
            alert("Por favor, preencha o nome, preço e carregue uma imagem.");
            return;
        }

        const newItem: Item = {
            id: `vendor-item-${Date.now()}`,
            name: newItemName,
            description: newItemDescription || "Sem descrição",
            category: 'vendor-items',
            image: newItemImage,
            price: parseFloat(newItemPrice),
            gender: businessProfile.business_category === 'fashion' ? activeGenderTab : 'unisex',
            vendorSubCategory: activeShopCategory.id,
        };

        setVendorItems(prevItems => [newItem, ...prevItems]);
        setIsCreatingItem(false);
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

    const handleBackToPrimaryCategories = () => {
        setActiveShopCategory(null);
        setIsNamingFolder(false);
        setIsCreatingItem(false);
    };
    
    const filteredItems = useMemo(() => {
        if (!activeShopCategory) return [];
        return vendorItems.filter(item => item.vendorSubCategory === activeShopCategory.id);
    }, [activeShopCategory, vendorItems]);

    const renderShopInterface = () => {
        const isFashion = businessProfile.business_category === 'fashion';

        if (activeShopCategory) {
            return (
                <div className="animate-fadeIn">
                    <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/50">
                        <button onClick={handleBackToPrimaryCategories} className="text-[var(--text-secondary)] hover:underline flex items-center gap-1">
                            <ArrowLeftIcon className="w-3 h-3" />
                            {isFashion ? "Moda" : "Lojas"}
                        </button>
                        <span className="text-[var(--text-secondary)]">/</span>
                        <span className="font-bold text-[var(--accent-primary)] uppercase tracking-tight">{activeShopCategory.name}</span>
                    </div>

                    {isCreatingItem ? (
                        <div className="p-4 space-y-4 bg-[var(--bg-secondary)] rounded-xl m-2 border border-[var(--border-primary)] animate-slideUp shadow-sm">
                            <h3 className="text-sm font-black text-[var(--accent-primary)] uppercase tracking-wider">Novo Produto</h3>
                            
                            <div className="space-y-4">
                                {/* Upload de Imagem */}
                                <div 
                                    onClick={() => itemFileInputRef.current?.click()}
                                    className="w-full h-48 border-2 border-dashed border-[var(--border-primary)] rounded-xl flex flex-col items-center justify-center bg-[var(--bg-tertiary)] cursor-pointer overflow-hidden group"
                                >
                                    {newItemImage ? (
                                        <img src={newItemImage} alt="Produto" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <>
                                            <UploadIcon className="w-8 h-8 text-[var(--text-tertiary)] group-hover:text-[var(--accent-primary)] transition-colors" />
                                            <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Foto do Produto</span>
                                        </>
                                    )}
                                </div>
                                <input type="file" ref={itemFileInputRef} onChange={handleItemImageSelect} accept="image/*" className="hidden" />

                                <input 
                                    type="text" 
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    placeholder="Nome do Produto"
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-primary)] rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                                />

                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">AOA</span>
                                    <input 
                                        type="number" 
                                        value={newItemPrice}
                                        onChange={(e) => setNewItemPrice(e.target.value)}
                                        placeholder="0,00"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-primary)] rounded-lg p-3 pl-12 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>

                                <textarea 
                                    value={newItemDescription}
                                    onChange={(e) => setNewItemDescription(e.target.value)}
                                    placeholder="Descrição (Opcional)"
                                    rows={3}
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-primary)] rounded-lg p-3 text-sm focus:outline-none resize-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                                />

                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => setIsCreatingItem(false)} className="flex-1 py-3 text-xs font-bold text-zinc-400 uppercase">Cancelar</button>
                                    <button 
                                        onClick={handleSaveItem}
                                        className="flex-1 py-3 bg-[var(--accent-primary)] text-[var(--accent-primary-text)] rounded-lg text-xs font-black uppercase shadow-lg active:scale-95 transition-transform"
                                    >
                                        Salvar Produto
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 p-3">
                            <button
                                onClick={handleStartCreateItem}
                                className="aspect-[4/5] rounded-2xl border-2 border-dashed border-[var(--accent-primary)]/40 text-[var(--accent-primary)] flex flex-col items-center justify-center hover:bg-[var(--accent-primary)]/5 transition-all active:scale-95 shadow-sm"
                            >
                                <PlusIcon className="w-8 h-8 mb-2" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Adicionar Item</span>
                            </button>
                            {filteredItems.map(item => (
                                <div key={item.id} className="relative flex flex-col bg-[var(--bg-secondary)] rounded-2xl group cursor-pointer overflow-hidden border border-[var(--border-secondary)] shadow-sm hover:border-[var(--accent-primary)]/50 transition-all duration-300">
                                    {/* Product Image Area */}
                                    <div className="relative aspect-square overflow-hidden bg-white">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                                        
                                        {/* Quick Action Overlay (Highlights) */}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleAddToHighlights(item); }}
                                                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] rounded-full text-[var(--accent-primary-text)] transition-transform hover:scale-105 active:scale-90 text-[10px] font-black uppercase shadow-xl"
                                            >
                                                <StarIcon className="w-3.5 h-3.5" />
                                                Destaque
                                            </button>
                                        </div>
                                    </div>

                                    {/* Structured Info Section */}
                                    <div className="p-3 space-y-1 border-t border-[var(--border-secondary)]">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight line-clamp-1 flex-grow">
                                                {item.name}
                                            </h4>
                                            <span className="text-[10px] font-bold text-[var(--accent-primary)] whitespace-nowrap bg-[var(--accent-primary)]/10 px-1.5 py-0.5 rounded border border-[var(--accent-primary)]/20">
                                                {item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                                            </span>
                                        </div>
                                        <p className="text-[9px] text-[var(--text-tertiary)] line-clamp-2 leading-tight italic font-medium">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 gap-4 p-4 animate-fadeIn">
                {!isFashion && (
                    <div className="contents">
                        {isNamingFolder ? (
                            <div className="col-span-2 bg-[var(--bg-secondary)] border-2 border-[var(--accent-primary)] rounded-2xl p-4 space-y-3 animate-slideUp shadow-lg">
                                <h4 className="text-xs font-black text-[var(--accent-primary)] uppercase tracking-wider">Nova Pasta</h4>
                                <input 
                                    type="text" 
                                    value={tempFolderName}
                                    onChange={(e) => setTempFolderName(e.target.value)}
                                    placeholder="Nome (Ex: Sofás, Promoções...)"
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-primary)] rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => setIsNamingFolder(false)} className="flex-1 py-2.5 text-xs font-bold text-zinc-400 uppercase">Cancelar</button>
                                    <button 
                                        onClick={handleConfirmFolderName}
                                        className="flex-1 py-2.5 bg-[var(--accent-primary)] text-[var(--accent-primary-text)] rounded-lg text-xs font-black uppercase shadow-lg active:scale-95"
                                    >
                                        Escolher Capa
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleStartCreateFolder}
                                className="w-full h-48 rounded-2xl border-2 border-dashed border-[var(--accent-primary)]/40 flex flex-col items-center justify-center hover:bg-[var(--accent-primary)]/5 transition-all active:scale-95 bg-[var(--bg-secondary)] group"
                            >
                                <div className="p-3 rounded-full bg-[var(--accent-primary)]/10 group-hover:bg-[var(--accent-primary)]/20 mb-2">
                                    <PlusIcon className="w-8 h-8 text-[var(--accent-primary)]" />
                                </div>
                                <span className="text-sm font-black uppercase tracking-tight text-[var(--accent-primary)]">Criar Pasta</span>
                            </button>
                        )}
                    </div>
                )}

                {(isFashion ? { male: MALE_CLOTHING_SUBCATEGORIES, female: FEMALE_CLOTHING_SUBCATEGORIES, kid: KID_CLOTHING_SUBCATEGORIES }[activeGenderTab] : customFolders).map(cat => (
                     <div
                        key={cat.id}
                        onClick={() => setActiveShopCategory({id: cat.id, name: cat.name})}
                        className="relative w-full h-48 rounded-2xl overflow-hidden cursor-pointer group transform hover:scale-[1.02] transition-all duration-300 shadow-sm border border-[var(--border-secondary)]"
                      >
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                          <h2 className="text-xl font-black tracking-tighter uppercase text-white leading-tight">{cat.name}</h2>
                        </div>
                      </div>
                ))}
            </div>
        );
    };

    const genderTabs = [
        { id: 'male', label: 'Masculino' },
        { id: 'female', label: 'Feminino' },
        { id: 'kid', label: 'Criança' },
    ];
    
    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
            <input type="file" ref={folderCoverInputRef} onChange={handleFolderCoverChange} accept="image/*" className="hidden" />
            
            <header className="px-4 pt-4 flex flex-col flex-shrink-0">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-extrabold">{localProfile.business_name}</h1>
                    <div className="flex items-center gap-5 relative">
                        <button onClick={onOpenNotificationsPanel} className="relative">
                            <BellIcon className="w-7 h-7 text-[var(--text-primary)]" />
                            {unreadNotificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-[var(--bg-main)]">
                                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                                </span>
                            )}
                        </button>
                        <button onClick={onOpenMenu}><MenuIcon className="w-7 h-7 text-[var(--text-primary)]" /></button>
                    </div>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto pt-4 pb-20">
                <div className="px-4 flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                        <div className="w-24 h-24 rounded-full p-0.5 bg-gradient-to-tr from-yellow-300 via-amber-500 to-orange-500 shadow-md">
                            <img src={localProfile.logo_url} alt="Logo" className="w-full h-full object-cover rounded-full border-2 border-[var(--bg-main)]" />
                        </div>
                        <button className="absolute bottom-0 -right-1 p-1.5 bg-[var(--accent-primary)] rounded-full border-2 border-[var(--bg-main)] hover:brightness-110 transition-colors shadow-sm" aria-label="Alterar logo">
                            <CameraIcon className="w-4 h-4 text-[var(--accent-primary-text)]" />
                        </button>
                    </div>
                    <div className="flex-grow pt-2">
                         <div className="flex justify-between items-start gap-2">
                             <div className="flex-grow">
                                <p className="font-bold text-sm">{localProfile.business_name}</p>
                                <p className="text-xs text-[var(--text-tertiary)] whitespace-pre-line leading-relaxed line-clamp-3">{localProfile.description}</p>
                            </div>
                            <button onClick={() => setIsEditingBio(true)} className="p-2 -mr-2 -mt-1 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors flex-shrink-0" aria-label="Editar descrição">
                                <PencilIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 py-4 flex justify-around text-center border-y border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                    <div className="flex flex-col"><span className="text-xl font-black text-[var(--accent-primary)]">{vendorItems.length}</span><p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Produtos</p></div>
                    <div className="flex flex-col"><span className="text-xl font-black text-[var(--accent-primary)]">{followersCount}</span><p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Seguidores</p></div>
                    <div className="flex flex-col"><span className="text-xl font-black text-[var(--accent-primary)]">{followingCount}</span><p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Seguindo</p></div>
                </div>

                 <div className="px-4 mt-6">
                    <GradientButton onClick={onOpenPromotionModal} className="!py-3 text-xs font-black shadow-sm">
                        Impulsionar Loja
                    </GradientButton>
                </div>

                <div className="px-4 pt-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3">Destaques da Loja</h3>
                     <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 [&::-webkit-scrollbar]:hidden">
                        {highlightedItems.length > 0 ? highlightedItems.map(item => (
                            <div key={item.id} className="flex-shrink-0 w-24 h-24 bg-white rounded-xl cursor-pointer overflow-hidden relative group border border-[var(--border-secondary)] shadow-sm">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                                <button 
                                    onClick={() => handleRemoveFromHighlights(item.id)}
                                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <XCircleIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )) : (
                            <div className="flex-grow py-8 flex flex-col items-center justify-center bg-[var(--bg-secondary)] rounded-2xl border-2 border-dashed border-[var(--border-primary)] text-center">
                                <StarIcon className="w-6 h-6 text-zinc-300 mb-2" />
                                <p className="text-[10px] font-bold text-zinc-400 uppercase">Sem destaques ainda</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex mt-6 px-4 gap-4 border-b border-[var(--border-primary)]">
                    <button onClick={() => setActiveTab('shop')} className={`pb-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'shop' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)] scale-105' : 'text-[var(--text-secondary)] opacity-50'}`}>Estoque</button>
                    <button onClick={() => setActiveTab('posts')} className={`pb-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'posts' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)] scale-105' : 'text-[var(--text-secondary)] opacity-50'}`}>Vitrine</button>
                </div>

                <div className="min-h-[300px]">
                    {activeTab === 'shop' ? (
                        <div>
                            {businessProfile.business_category === 'fashion' && !activeShopCategory && (
                                <div className="px-4 py-3 flex justify-around border-b border-[var(--border-primary)]/20 bg-[var(--bg-secondary)]">
                                    {genderTabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveGenderTab(tab.id as any)}
                                            className={`py-1.5 px-4 text-[10px] font-black uppercase rounded-full transition-all ${
                                                activeGenderTab === tab.id
                                                    ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-md'
                                                    : 'text-zinc-400'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {renderShopInterface()}
                        </div>
                    ) : (
                        <div className="animate-fadeIn">
                             {VENDOR_POSTS.length > 0 ? (
                                <div className="grid grid-cols-3 gap-0.5 p-0.5">
                                    {VENDOR_POSTS.map((post) => (
                                        <div key={post.id} className="aspect-square bg-zinc-100 cursor-pointer overflow-hidden border border-black/5">
                                            <img src={post.image} alt="Post" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"/>
                                        </div>
                                    ))}
                                </div>
                             ) : (
                                <div className="py-16 text-center flex flex-col items-center animate-slideUp">
                                    <button 
                                        onClick={onStartCreate}
                                        className="w-20 h-20 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-[var(--accent-primary)]/50 hover:bg-[var(--accent-primary)]/10 hover:border-[var(--accent-primary)] transition-all active:scale-95 shadow-lg group"
                                    >
                                        <PlusIcon className="w-10 h-10 text-[var(--accent-primary)] group-hover:scale-110 transition-transform" />
                                    </button>
                                    <p className="text-[var(--text-primary)] font-bold text-lg">Nenhuma publicação ainda.</p>
                                    <p className="text-sm text-[var(--text-secondary)] opacity-70 mt-1 max-w-[200px]">Adicione conteúdos à sua vitrine para atrair mais clientes!</p>
                                </div>
                             )}
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
