
import React, { useState, useMemo, useRef } from 'react';
import type { BusinessProfile, Item, Profile, Folder, ShowcaseItem } from '../types';
import { 
    MenuIcon, CameraIcon, PencilIcon, PlusIcon, StarIcon, 
    BellIcon, UserIcon, ChevronDownIcon, ArchiveIcon, ShoppingBagIcon, RepositionIcon
} from './IconComponents';
import BioEditModal from './BioEditModal';
import GradientButton from './GradientButton';

interface VendorDashboardProps {
  businessProfile: BusinessProfile;
  profile: Profile;
  onOpenMenu: () => void;
  unreadNotificationCount: number;
  onOpenNotificationsPanel: () => void;
  onOpenPromotionModal: () => void;
  followersCount: number;
  followingCount: number;
  folders: Folder[];
  products: Item[];
  showcase: ShowcaseItem[];
  onCreateFolder: (title: string) => void;
  onCreateProductInFolder: (folderId: string, details: { title: string, description: string, price: number, file: Blob }) => Promise<any>;
  onMoveProductToFolder: (productId: string, folderId: string | null) => Promise<void>;
  onUpdateProfile: (updates: { username?: string, bio?: string, name?: string }) => void;
  onUpdateProfileImage: (dataUrl: string) => void;
  onNavigateToProducts: () => void;
  onAddToShowcase: (title: string, file: Blob) => Promise<void>;
}

const FolderCard: React.FC<{ folder: Folder; onClick: () => void }> = ({ folder, onClick }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center gap-4 p-5 bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-primary)] group active:scale-95 transition-all w-full shadow-lg shadow-black/5"
    >
        <div className="w-full aspect-square rounded-[2rem] bg-[var(--bg-tertiary)] border border-[var(--border-primary)] flex items-center justify-center overflow-hidden shadow-inner group-hover:border-amber-500 transition-all duration-300">
            {folder.cover_image ? (
                <img src={folder.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
                <ArchiveIcon className="w-12 h-12 text-zinc-300 group-hover:text-amber-500 transition-colors" strokeWidth={1} />
            )}
        </div>
        <div className="text-center">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)] truncate max-w-[120px] mb-1">{folder.title}</p>
            <div className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">{(folder.item_count || 0)} itens</p>
            </div>
        </div>
    </button>
);

const VendorDashboard: React.FC<VendorDashboardProps> = ({ 
    profile,
    onOpenMenu, 
    onOpenNotificationsPanel, 
    onOpenPromotionModal, 
    followersCount, 
    followingCount,
    folders,
    products,
    showcase,
    onCreateFolder,
    onCreateProductInFolder,
    onMoveProductToFolder,
    onUpdateProfile,
    onUpdateProfileImage,
}) => {
    const [activeTab, setActiveTab] = useState<'shop' | 'posts'>('shop');
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [movingProduct, setMovingProduct] = useState<Item | null>(null);
    
    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemDesc, setNewItemDesc] = useState('');
    const [newItemFile, setNewItemFile] = useState<Blob | null>(null);
    const [newItemPreview, setNewItemPreview] = useState<string | null>(null);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const itemFileInputRef = useRef<HTMLInputElement>(null);

    const currentFolder = folders.find(f => f.id === selectedFolderId);
    
    const folderProducts = useMemo(() => {
        if (!selectedFolderId) return [];
        return products.filter(p => p.folder_id === selectedFolderId);
    }, [products, selectedFolderId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'item') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'avatar') onUpdateProfileImage(reader.result as string);
                else if (type === 'item') {
                    setNewItemFile(file);
                    setNewItemPreview(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateFolderClick = () => {
        const title = prompt("Nome da Nova Coleção:");
        if (title) onCreateFolder(title);
    };

    const handleSaveItem = async (keepAdding: boolean = false) => {
        if (!selectedFolderId || !newItemTitle || !newItemPrice || !newItemFile) {
            alert("Campos obrigatórios: Nome, Preço e Foto.");
            return;
        }
        
        await onCreateProductInFolder(selectedFolderId, {
            title: newItemTitle,
            description: newItemDesc,
            price: parseFloat(newItemPrice),
            file: newItemFile
        });
        
        setNewItemTitle('');
        setNewItemPrice('');
        setNewItemDesc('');
        setNewItemFile(null);
        setNewItemPreview(null);
        
        if (!keepAdding) setIsAddingItem(false);
    };

    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] relative overflow-hidden font-sans">
            <header className="px-6 pt-6 absolute top-0 left-0 right-0 flex items-center justify-between z-40 pointer-events-none">
                <button onClick={onOpenNotificationsPanel} className="p-3 bg-[var(--bg-tertiary)] glass rounded-2xl text-[var(--text-primary)] pointer-events-auto active:scale-90 transition-all border border-[var(--border-primary)] shadow-lg">
                    <BellIcon className="w-6 h-6" />
                </button>
                <button onClick={onOpenMenu} className="p-3 bg-[var(--bg-tertiary)] glass rounded-2xl text-[var(--text-primary)] pointer-events-auto active:scale-90 transition-all border border-[var(--border-primary)] shadow-lg">
                    <MenuIcon className="w-6 h-6" strokeWidth={2.5} />
                </button>
            </header>

            <main className="flex-grow overflow-y-auto pb-32">
                {/* Profile Section */}
                <div className="relative px-6 pt-24 flex flex-col z-10">
                    <div className="flex items-end justify-between w-full">
                        <div className="relative shrink-0">
                            <div className="w-32 h-32 rounded-[3.5rem] p-1 bg-white dark:bg-zinc-800 shadow-2xl overflow-hidden border border-zinc-100 dark:border-white/10">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Logo" className="w-full h-full object-cover rounded-[3.3rem]" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center rounded-[3.3rem]">
                                        <UserIcon className="w-12 h-12 text-zinc-300" />
                                    </div>
                                )}
                            </div>
                            <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 p-2.5 bg-amber-500 text-white rounded-2xl border-4 border-[var(--bg-main)] shadow-xl active:scale-90 transition-transform">
                                <CameraIcon className="w-4 h-4" />
                            </button>
                            <input type="file" accept="image/*" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" />
                        </div>

                        {/* Stats Summary */}
                        <div className="flex-1 flex justify-around pl-4 pb-2">
                            <div className="text-center">
                                <span className="block text-xl font-black text-[var(--text-primary)] leading-none italic">{products.length || 0}</span>
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-2">Itens</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xl font-black text-[var(--text-primary)] leading-none italic">{followersCount || 0}</span>
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-2">Fãs</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xl font-black text-[var(--text-primary)] leading-none italic">{followingCount || 0}</span>
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-2">Ícones</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-start relative animate-fadeIn">
                        <div className="flex items-center gap-3 mb-6">
                          <h2 className="font-black text-2xl uppercase tracking-tighter italic text-[var(--text-primary)] leading-none">
                              {profile.full_name || profile.username}
                          </h2>
                        </div>
                        
                        <div className="w-full bg-[var(--bg-secondary)]/50 p-5 rounded-[2.5rem] border border-[var(--border-primary)] relative group">
                            {profile.bio ? (
                              <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed italic pr-6">"{profile.bio}"</p>
                            ) : (
                              <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest italic">Apresente sua visão de moda aqui...</p>
                            )}
                            <button onClick={() => setIsEditingBio(true)} className="absolute top-4 right-4 p-2 text-zinc-300 hover:text-amber-500 transition-all opacity-0 group-hover:opacity-100">
                                <PencilIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <button onClick={() => setIsEditingBio(true)} className="py-4 bg-[var(--bg-tertiary)] hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] transition-all active:scale-[0.98] border border-[var(--border-primary)] shadow-sm">
                          Editar Perfil
                      </button>
                      <button onClick={onOpenPromotionModal} className="py-4 bg-zinc-900 dark:bg-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white dark:text-zinc-900 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2">
                          <StarIcon className="w-4 h-4" />
                          Promover Loja
                      </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex mt-12 px-6 border-b border-[var(--border-primary)] bg-[var(--bg-main)] sticky top-0 z-20">
                    <button onClick={() => { setActiveTab('shop'); setSelectedFolderId(null); }} className={`flex-1 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'shop' && !selectedFolderId ? 'text-[var(--text-primary)]' : 'text-zinc-300'}`}>
                        Coleções
                        {activeTab === 'shop' && !selectedFolderId && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-amber-500 rounded-t-full"></div>}
                    </button>
                    <button onClick={() => setActiveTab('posts')} className={`flex-1 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'posts' ? 'text-[var(--text-primary)]' : 'text-zinc-300'}`}>
                        Vitrine
                        {activeTab === 'posts' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-amber-500 rounded-t-full"></div>}
                    </button>
                </div>

                {/* Grid Content */}
                <div className="p-6 min-h-[500px] bg-[var(--bg-main)]">
                    {activeTab === 'shop' ? (
                        <>
                            {selectedFolderId ? (
                                <div className="space-y-8 animate-fadeIn">
                                    <div className="flex items-center justify-between">
                                        <button onClick={() => setSelectedFolderId(null)} className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-[var(--bg-tertiary)] hover:bg-zinc-200 px-5 py-2.5 rounded-2xl transition-all border border-[var(--border-primary)]">
                                            <ChevronDownIcon className="w-3.5 h-3.5 rotate-90" />
                                            Voltar
                                        </button>
                                        <div className="text-right">
                                          <h3 className="text-xs font-black uppercase tracking-widest text-amber-600 italic leading-none">{currentFolder?.title}</h3>
                                          <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">{folderProducts.length} Itens</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {folderProducts.map(item => (
                                            <div key={item.id} className="bg-[var(--bg-secondary)] p-3 rounded-[2.5rem] border border-[var(--border-primary)] relative group active:scale-95 transition-all shadow-lg shadow-black/5">
                                                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-4 shadow-sm border border-[var(--border-primary)]">
                                                  <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                </div>
                                                <div className="px-2 pb-1">
                                                  <p className="text-[11px] font-black uppercase truncate tracking-tighter italic">{item.name}</p>
                                                  <p className="text-[10px] font-black text-amber-500 mt-1 uppercase tracking-widest">{item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
                                                </div>
                                                <button 
                                                    onClick={() => setMovingProduct(item)}
                                                    className="absolute top-5 right-5 p-2.5 bg-black/40 glass rounded-2xl text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                                                >
                                                    <RepositionIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        
                                        <button onClick={() => setIsAddingItem(true)} className="flex flex-col items-center justify-center gap-4 p-5 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] group active:scale-95 transition-all w-full min-h-[200px] hover:border-amber-500 hover:bg-amber-50/20 shadow-inner">
                                            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center group-hover:bg-amber-500 transition-all duration-300 shadow-md">
                                                <PlusIcon className="w-7 h-7 text-zinc-400 group-hover:text-white transition-colors" strokeWidth={3} />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-amber-600 transition-colors">Novo Item</p>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-5 animate-fadeIn">
                                    {folders.map(folder => (
                                        <FolderCard key={folder.id} folder={folder} onClick={() => setSelectedFolderId(folder.id)} />
                                    ))}
                                    <button 
                                        onClick={handleCreateFolderClick}
                                        className="flex flex-col items-center justify-center gap-4 p-5 border-2 border-dashed border-amber-500/20 rounded-[2.5rem] bg-amber-50/10 group active:scale-95 transition-all w-full min-h-[220px] hover:border-amber-500 hover:bg-amber-50/20 shadow-inner"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:bg-amber-500 transition-all duration-300 shadow-lg">
                                            <PlusIcon className="w-7 h-7 text-amber-600 group-hover:text-white transition-colors" strokeWidth={3} />
                                        </div>
                                        <div className="text-center">
                                          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-600">Coleção</p>
                                          <p className="text-[9px] font-bold text-amber-400/60 uppercase tracking-widest mt-1">Organizar Catálogo</p>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="animate-fadeIn">
                            {showcase.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {showcase.map(item => (
                                        <div key={item.id} className="bg-[var(--bg-secondary)] p-3 rounded-[2.5rem] border border-[var(--border-primary)] relative group active:scale-95 transition-all overflow-hidden shadow-xl shadow-black/5">
                                            <div className="aspect-square rounded-[2rem] overflow-hidden mb-3 border border-[var(--border-primary)]">
                                              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            </div>
                                            <p className="text-[11px] font-black uppercase truncate px-2 text-center italic tracking-tighter">{item.title}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-32 text-center flex flex-col items-center opacity-20 grayscale">
                                     <ShoppingBagIcon className="w-16 h-16 text-zinc-400 mb-6" strokeWidth={1} />
                                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Sua vitrine espera por você</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Custom Action Button Floating */}
            <div className="fixed bottom-28 right-6 z-40">
                <button onClick={onOpenPromotionModal} className="w-16 h-16 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-[1.8rem] flex items-center justify-center shadow-[0_12px_24px_rgba(245,158,11,0.4)] active:scale-90 transition-all group border-2 border-white/20">
                    <StarIcon className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
                </button>
            </div>

            {/* Editing bio modal handled by original component */}
            {isEditingBio && (
                <BioEditModal 
                    profile={profile}
                    onClose={() => setIsEditingBio(false)} 
                    onSave={(name, bio) => {
                        onUpdateProfile({ name: name, bio: bio });
                        setIsEditingBio(false);
                    }} 
                />
            )}
            
            {/* Adding item modal remains functional as before */}
            {isAddingItem && (
                <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-end animate-fadeIn" onClick={() => setIsAddingItem(false)}>
                    <div className="w-full max-h-[95vh] bg-[var(--bg-main)] rounded-t-[3.5rem] p-8 flex flex-col gap-6 animate-slideUp overflow-y-auto shadow-[0_-12px_48px_rgba(0,0,0,0.3)] border-t border-white/10" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex flex-col">
                                <h2 className="text-3xl font-black uppercase italic text-[var(--text-primary)] tracking-tighter leading-none">Novo Item</h2>
                                <span className="text-[11px] font-black text-amber-500 uppercase tracking-[0.2em] mt-2 italic">Na coleção: {currentFolder?.title}</span>
                            </div>
                            <button onClick={() => setIsAddingItem(false)} className="p-3 bg-[var(--bg-tertiary)] rounded-2xl text-zinc-400 hover:text-[var(--text-primary)] transition-all">
                                <ChevronDownIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div 
                                onClick={() => itemFileInputRef.current?.click()} 
                                className="w-full aspect-[4/5] bg-[var(--bg-tertiary)] border-4 border-dashed border-[var(--border-primary)] rounded-[3rem] flex flex-col items-center justify-center overflow-hidden transition-all hover:border-amber-400/50 group relative shadow-inner"
                            >
                                {newItemPreview ? (
                                    <>
                                        <img src={newItemPreview} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity glass">
                                            <CameraIcon className="w-10 h-10 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 rounded-3xl bg-[var(--bg-main)] flex items-center justify-center shadow-lg mb-4 rotate-3 group-hover:rotate-0 transition-transform">
                                            <CameraIcon className="w-10 h-10 text-zinc-300" />
                                        </div>
                                        <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">Capturar Estilo</p>
                                    </>
                                )}
                            </div>
                            <input type="file" ref={itemFileInputRef} accept="image/*" onChange={e => handleFileChange(e, 'item')} className="hidden" />

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-5 tracking-[0.3em] italic">Designação</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Blazer Minimalist Noir" 
                                    value={newItemTitle} 
                                    onChange={e => setNewItemTitle(e.target.value)} 
                                    className="w-full p-5 bg-[var(--bg-tertiary)] rounded-[1.8rem] border border-[var(--border-primary)] font-black text-sm uppercase italic focus:outline-none focus:border-amber-500/50 transition-all shadow-sm" 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-5 tracking-[0.3em] italic">Preço de Venda (AOA)</label>
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    value={newItemPrice} 
                                    onChange={e => setNewItemPrice(e.target.value)} 
                                    className="w-full p-5 bg-[var(--bg-tertiary)] rounded-[1.8rem] border border-[var(--border-primary)] font-black text-sm italic focus:outline-none focus:border-amber-500/50 transition-all shadow-sm" 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-5 tracking-[0.3em] italic">Especificações</label>
                                <textarea 
                                    placeholder="Detalhes que apaixonam..." 
                                    value={newItemDesc} 
                                    onChange={e => setNewItemDesc(e.target.value)} 
                                    className="w-full p-6 bg-[var(--bg-tertiary)] rounded-[1.8rem] border border-[var(--border-primary)] font-medium text-sm h-32 resize-none focus:outline-none focus:border-amber-500/50 transition-all shadow-sm" 
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 pt-4 pb-8">
                             <button 
                                onClick={() => handleSaveItem(true)} 
                                disabled={!newItemTitle || !newItemPrice || !newItemFile}
                                className="w-full py-5 bg-transparent text-amber-500 border-2 border-amber-500 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] italic transition-all hover:bg-amber-50 dark:hover:bg-amber-500/10 active:scale-[0.98] disabled:opacity-50"
                            >
                                Salvar e Continuar
                            </button>
                            <GradientButton 
                                onClick={() => handleSaveItem(false)} 
                                disabled={!newItemTitle || !newItemPrice || !newItemFile}
                                className="!py-5 !rounded-[2rem] !text-sm"
                            >
                                CONCLUIR CADASTRO
                            </GradientButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Move product modal remains same functionality */}
            {movingProduct && (
                <div className="fixed inset-0 z-[210] bg-black/70 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn" onClick={() => setMovingProduct(null)}>
                    <div className="bg-[var(--bg-main)] rounded-[3.5rem] w-full max-w-sm p-10 flex flex-col gap-8 animate-modalZoomIn shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                          <h2 className="text-2xl font-black uppercase tracking-tighter italic leading-none mb-2">Relocar Item</h2>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Escolha o novo destino</p>
                        </div>
                        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-2 scrollbar-hide">
                            <button 
                                onClick={() => { onMoveProductToFolder(movingProduct.id, null); setMovingProduct(null); }}
                                className={`w-full p-5 rounded-[1.8rem] border font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-between ${!movingProduct.folder_id ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-[var(--border-primary)] hover:border-amber-500'}`}
                            >
                                <span>Geral / Vitrine</span>
                                {!movingProduct.folder_id && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                            </button>
                            {folders.map(folder => (
                                <button 
                                    key={folder.id}
                                    onClick={() => { onMoveProductToFolder(movingProduct.id, folder.id); setMovingProduct(null); }}
                                    className={`w-full p-5 rounded-[1.8rem] border font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-between ${movingProduct.folder_id === folder.id ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-[var(--border-primary)] hover:border-amber-500'}`}
                                >
                                    <span className="truncate pr-4">{folder.title}</span>
                                    {movingProduct.folder_id === folder.id && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setMovingProduct(null)} className="text-[11px] font-black uppercase text-zinc-400 tracking-[0.3em] hover:text-[var(--text-primary)] transition-colors">Fechar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;
