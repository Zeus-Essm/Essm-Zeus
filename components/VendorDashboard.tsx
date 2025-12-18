
import React, { useState, useMemo, useRef } from 'react';
import type { BusinessProfile, Item, Post, MarketplaceType } from '../types';
import { MenuIcon, CameraIcon, PencilIcon, PlusIcon, StarIcon, XCircleIcon, BellIcon, ArrowLeftIcon, UploadIcon } from './IconComponents';
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
    const [vendorItems, setVendorItems] = useState<Item[]>([]); // Zerado para usuário real
    const [highlightedItems, setHighlightedItems] = useState<Item[]>([]);
    
    const [customFolders, setCustomFolders] = useState<{ id: string; name: string; image: string }[]>([]);
    const [isNamingFolder, setIsNamingFolder] = useState(false);
    const [tempFolderName, setTempFolderName] = useState('');
    
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
                    <div className="px-4 py-2 flex items-center gap-2 text-xs border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <button onClick={handleBackToPrimaryCategories} className="text-zinc-400 hover:text-zinc-600 flex items-center gap-1 font-black uppercase">
                            <ArrowLeftIcon className="w-3 h-3" />
                            {isFashion ? "Setores" : "Pastas"}
                        </button>
                        <span className="text-zinc-300">/</span>
                        <span className="font-black text-[var(--accent-primary)] uppercase tracking-tight">{activeShopCategory.name}</span>
                    </div>

                    {isCreatingItem ? (
                        <div className="p-4 space-y-4 bg-white dark:bg-zinc-900 rounded-2xl m-4 border border-zinc-100 dark:border-zinc-800 animate-slideUp shadow-sm">
                            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Novo Produto</h3>
                            <div className="space-y-4">
                                <div onClick={() => itemFileInputRef.current?.click()} className="w-full h-48 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 cursor-pointer overflow-hidden group">
                                    {newItemImage ? <img src={newItemImage} alt="Produto" className="w-full h-full object-contain p-2" /> : <><UploadIcon className="w-8 h-8 text-zinc-300 group-hover:text-[var(--accent-primary)] transition-colors" /><span className="text-[10px] font-black text-zinc-300 uppercase mt-2">Foto do Produto</span></>}
                                </div>
                                <input type="file" ref={itemFileInputRef} onChange={handleItemImageSelect} accept="image/*" className="hidden" />
                                <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Nome do Produto" className="w-full p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 focus:outline-none text-sm font-semibold shadow-inner" />
                                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-xs">AOA</span><input type="number" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="0,00" className="w-full p-4 pl-14 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 focus:outline-none text-sm font-semibold shadow-inner" /></div>
                                <textarea value={newItemDescription} onChange={(e) => setNewItemDescription(e.target.value)} placeholder="Descrição (Opcional)" rows={3} className="w-full p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 focus:outline-none text-sm font-semibold resize-none shadow-inner" />
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setIsCreatingItem(false)} className="flex-1 py-4 text-xs font-black text-zinc-400 uppercase">Cancelar</button>
                                    <button onClick={handleSaveItem} className="flex-1 py-4 bg-[var(--accent-primary)] text-black rounded-2xl text-xs font-black uppercase shadow-lg shadow-amber-500/20 active:scale-95 transition-transform">Salvar</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 p-4 pb-24">
                            <button onClick={handleStartCreateItem} className="aspect-[4/5] rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center hover:bg-[var(--accent-primary)]/5 transition-all active:scale-95 bg-zinc-50/30">
                                <PlusIcon className="w-8 h-8 text-zinc-300 mb-2" /><span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Adicionar Item</span>
                            </button>
                            {filteredItems.map(item => (
                                <div key={item.id} className="relative flex flex-col bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all duration-300 group">
                                    <div className="relative aspect-square overflow-hidden bg-zinc-50">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button onClick={(e) => { e.stopPropagation(); handleAddToHighlights(item); }} className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] rounded-full text-black transition-transform hover:scale-105 active:scale-90 text-[10px] font-black uppercase shadow-xl"><StarIcon className="w-3.5 h-3.5" />Destaque</button>
                                        </div>
                                    </div>
                                    <div className="p-3 space-y-1">
                                        <h4 className="text-[11px] font-black text-zinc-800 dark:text-zinc-100 uppercase truncate">{item.name}</h4>
                                        <span className="text-[10px] font-black text-[var(--accent-primary)]">{item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        return (
            <div className="grid grid-cols-2 gap-4 p-4 animate-fadeIn pb-24">
                {!isFashion && (
                    <div className="contents">
                        {isNamingFolder ? (
                            <div className="col-span-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 space-y-4 animate-slideUp shadow-xl">
                                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Nova Pasta</h4>
                                <input type="text" value={tempFolderName} onChange={(e) => setTempFolderName(e.target.value)} placeholder="Nome (Ex: Sofás, Promoções...)" className="w-full p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 focus:outline-none text-sm font-semibold shadow-inner" autoFocus />
                                <div className="flex gap-3">
                                    <button onClick={() => setIsNamingFolder(false)} className="flex-1 py-3 text-xs font-black text-zinc-400 uppercase">Cancelar</button>
                                    <button onClick={handleConfirmFolderName} className="flex-1 py-3 bg-[var(--accent-primary)] text-black rounded-2xl text-xs font-black uppercase shadow-lg shadow-amber-500/20 active:scale-95">Escolher Capa</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={handleStartCreateFolder} className="w-full h-48 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all active:scale-95 group">
                                <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-amber transition-colors mb-2"><PlusIcon className="w-8 h-8 text-zinc-400 group-hover:text-[var(--accent-primary)]" /></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Criar Pasta</span>
                            </button>
                        )}
                    </div>
                )}
                {(isFashion ? { male: MALE_CLOTHING_SUBCATEGORIES, female: FEMALE_CLOTHING_SUBCATEGORIES, kid: KID_CLOTHING_SUBCATEGORIES }[activeGenderTab] : customFolders).map(cat => (
                     <div key={cat.id} onClick={() => setActiveShopCategory({id: cat.id, name: cat.name})} className="relative w-full h-48 rounded-2xl overflow-hidden cursor-pointer group transform hover:scale-[1.02] transition-all duration-300 shadow-sm border border-zinc-100 dark:border-zinc-800">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4"><h2 className="text-xl font-black tracking-tighter uppercase text-white leading-tight">{cat.name}</h2></div>
                      </div>
                ))}
            </div>
        );
    };

    const genderTabs = [ { id: 'male', label: 'Masculino' }, { id: 'female', label: 'Feminino' }, { id: 'kid', label: 'Criança' } ];
    
    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] relative">
            {/* Background elements (PUMP Identity) */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl"></div>

            <input type="file" ref={folderCoverInputRef} onChange={handleFolderCoverChange} accept="image/*" className="hidden" />
            
            <header className="px-6 pt-10 flex flex-col items-center z-10">
                <div className="w-16 h-16 p-1 bg-white rounded-2xl shadow-2xl shadow-amber-500/15 border border-zinc-100 flex items-center justify-center animate-logo-pulse mb-8">
                    <img src="https://i.postimg.cc/XJf6gckX/Pump_STARTAP.png" alt="PUMP Logo" className="w-12 h-auto" />
                </div>
                <h1 className="text-2xl font-black text-glow text-zinc-800 dark:text-white uppercase tracking-tighter mb-1">{localProfile.business_name}</h1>
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.25em] mb-8">Painel Administrativo</p>
                
                <div className="absolute top-8 right-6 flex items-center gap-4">
                    <button onClick={onOpenNotificationsPanel} className="relative p-2"><BellIcon className="w-7 h-7 text-zinc-800 dark:text-white" />{unreadNotificationCount > 0 && <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white border-2 border-white">{unreadNotificationCount}</span>}</button>
                    <button onClick={onOpenMenu} className="p-2"><MenuIcon className="w-7 h-7 text-zinc-800 dark:text-white" /></button>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto z-10 scroll-smooth">
                <div className="px-6 flex items-center justify-center gap-6 mt-2">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl p-0.5 bg-gradient-to-tr from-amber-100 to-amber-500 shadow-2xl overflow-hidden border border-white/50"><img src={localProfile.logo_url} alt="Logo" className="w-full h-full object-cover rounded-[14px]" /></div>
                        <button className="absolute -bottom-2 -right-2 p-2 bg-[var(--accent-primary)] rounded-xl border-4 border-white shadow-xl" aria-label="Alterar logo"><CameraIcon className="w-4 h-4 text-black" /></button>
                    </div>
                </div>

                <div className="px-8 text-center mt-6">
                    <div className="flex justify-center items-center gap-2 mb-1">
                        <p className="text-sm font-black uppercase text-zinc-800 dark:text-white">{localProfile.business_name}</p>
                        <button onClick={() => setIsEditingBio(true)} className="p-1 text-zinc-300 hover:text-amber-500 transition-colors"><PencilIcon className="w-3.5 h-3.5" /></button>
                    </div>
                    <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-xs mx-auto line-clamp-2 italic">"{localProfile.description || "Sem descrição definida."}"</p>
                </div>
                
                {/* Stats Bar (PUMP Tab-Switcher Style) */}
                <div className="mx-6 mt-10 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex shadow-inner">
                    <div className="flex-1 py-4 text-center flex flex-col items-center">
                        <span className="text-lg font-black text-zinc-800 dark:text-white">0</span>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">produto</p>
                    </div>
                    <div className="w-px h-10 self-center bg-zinc-200 dark:bg-zinc-800/50"></div>
                    <div className="flex-1 py-4 text-center flex flex-col items-center">
                        <span className="text-lg font-black text-zinc-800 dark:text-white">0</span>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">seguidores</p>
                    </div>
                    <div className="w-px h-10 self-center bg-zinc-200 dark:bg-zinc-800/50"></div>
                    <div className="flex-1 py-4 text-center flex flex-col items-center">
                        <span className="text-lg font-black text-zinc-800 dark:text-white">0</span>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">seguindo</p>
                    </div>
                </div>

                <div className="mt-8 px-6">
                    <button 
                        onClick={onOpenPromotionModal} 
                        className="w-full bg-[var(--accent-primary)] text-black py-4 rounded-2xl font-black text-xs tracking-[0.2em] uppercase shadow-2xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <StarIcon className="w-4 h-4 fill-current" />
                        Impulsionar Agora
                    </button>
                </div>

                <div className="px-6 pt-12">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-400 mb-6 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                        Destaques da Vitrine
                    </h3>
                     <div className="flex overflow-x-auto gap-4 pb-2 -mx-6 px-6 [&::-webkit-scrollbar]:hidden">
                        {highlightedItems.length > 0 ? highlightedItems.map(item => (
                            <div key={item.id} className="flex-shrink-0 w-32 h-32 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-md relative group overflow-hidden">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                                <button onClick={() => handleRemoveFromHighlights(item.id)} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity"><XCircleIcon className="w-4 h-4" /></button>
                            </div>
                        )) : (
                            <div className="flex-grow py-14 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center mx-auto w-full">
                                <StarIcon className="w-10 h-10 text-zinc-200 mb-4" />
                                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Nenhum Destaque</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sub-Tabs Switcher (PUMP Identity) */}
                <div className="flex p-1 bg-zinc-50 dark:bg-zinc-950 rounded-2xl mx-6 mt-12 border border-zinc-100 dark:border-zinc-900">
                    <button 
                        onClick={() => setActiveTab('shop')} 
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'shop' ? 'bg-white dark:bg-zinc-800 text-black dark:white shadow-md' : 'text-zinc-400'}`}
                    >
                        Estoque
                    </button>
                    <button 
                        onClick={() => setActiveTab('posts')} 
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'posts' ? 'bg-white dark:bg-zinc-800 text-black dark:white shadow-md' : 'text-zinc-400'}`}
                    >
                        Vitrine
                    </button>
                </div>

                <div className="min-h-[400px] mt-2">
                    {activeTab === 'shop' ? (
                        <div>
                            {businessProfile.business_category === 'fashion' && !activeShopCategory && (
                                <div className="px-6 py-5 flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden border-b border-zinc-50 dark:border-zinc-900">
                                    {genderTabs.map(tab => (
                                        <button key={tab.id} onClick={() => setActiveGenderTab(tab.id as any)} className={`flex-shrink-0 py-2 px-6 text-[9px] font-black uppercase rounded-2xl transition-all border ${activeGenderTab === tab.id ? 'bg-zinc-800 text-white dark:bg-white dark:text-black border-transparent shadow-lg' : 'bg-transparent border-zinc-200 text-zinc-400'}`}>{tab.label}</button>
                                    ))}
                                </div>
                            )}
                            {renderShopInterface()}
                        </div>
                    ) : (
                        <div className="animate-fadeIn">
                             {VENDOR_POSTS.length > 0 ? (
                                <div className="grid grid-cols-3 gap-1 p-4">
                                    {VENDOR_POSTS.map((post) => (
                                        <div key={post.id} className="aspect-square bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-50 shadow-sm"><img src={post.image} alt="Post" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"/></div>
                                    ))}
                                </div>
                             ) : (
                                <div className="py-24 text-center flex flex-col items-center animate-slideUp px-10">
                                    <button onClick={onStartCreate} className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-amber-500/5 group active:scale-95 transition-all">
                                        <PlusIcon className="w-10 h-10 text-zinc-200 group-hover:text-amber-500 transition-colors" />
                                    </button>
                                    <p className="text-zinc-800 dark:text-white font-black uppercase text-xs tracking-widest mb-2">Vazio</p>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-loose">Publique novos conteúdos para ganhar visibilidade no Feed Global.</p>
                                </div>
                             )}
                        </div>
                    )}
                </div>
            </main>
            {isEditingBio && (
                <BioEditModal initialUsername={localProfile.business_name} initialBio={localProfile.description || ''} onClose={() => setIsEditingBio(false)} onSave={(newBusinessName, newDescription) => { setLocalProfile(prev => ({ ...prev, business_name: newBusinessName, description: newDescription })); setIsEditingBio(false); }} />
            )}
        </div>
    );
};

export default VendorDashboard;
