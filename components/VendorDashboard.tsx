
import React, { useState, useMemo } from 'react';
import type { BusinessProfile, Item, Post, Profile, Folder } from '../types';
import { 
    MenuIcon, CameraIcon, PencilIcon, PlusIcon, StarIcon, 
    BellIcon, UserIcon, ChevronDownIcon, ArchiveIcon, ShoppingBagIcon
} from './IconComponents';
import BioEditModal from './BioEditModal';
import { VENDOR_POSTS, INITIAL_VENDOR_ITEMS } from '../constants';

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
  onCreateFolder: (name: string) => void;
  onCreateProductInFolder: (product: Partial<Item>, folderId: string) => void;
  onNavigateToProducts: () => void;
}

const FolderCard: React.FC<{ folder: Folder; onClick: () => void }> = ({ folder, onClick }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center gap-3 p-4 bg-zinc-50 rounded-[2rem] border border-zinc-100 group active:scale-95 transition-all w-full"
    >
        <div className="w-full aspect-square rounded-[1.5rem] bg-white border border-zinc-200 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-amber-500 transition-colors">
            {folder.cover_image ? (
                <img src={folder.cover_image} alt="" className="w-full h-full object-cover" />
            ) : (
                <ArchiveIcon className="w-10 h-10 text-zinc-300 group-hover:text-amber-500 transition-colors" />
            )}
        </div>
        <div className="text-center">
            <p className="text-[11px] font-black uppercase tracking-tight text-zinc-800 truncate max-w-[100px]">{folder.name}</p>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{folder.item_count} itens</p>
        </div>
    </button>
);

const AddButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-3 p-4 border-2 border-dashed border-zinc-200 rounded-[2rem] group active:scale-95 transition-all w-full min-h-[160px] hover:border-amber-500 hover:bg-amber-50/30"
    >
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
            <PlusIcon className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
        </div>
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-amber-600 transition-colors">{label}</p>
    </button>
);

const VendorDashboard: React.FC<VendorDashboardProps> = ({ 
    businessProfile, 
    profile,
    onOpenMenu, 
    unreadNotificationCount, 
    onOpenNotificationsPanel, 
    onOpenPromotionModal, 
    followersCount, 
    followingCount,
    folders,
    products,
    onCreateFolder,
    onCreateProductInFolder,
    onNavigateToProducts
}) => {
    const [activeTab, setActiveTab] = useState<'shop' | 'posts'>('shop');
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [isEditingBio, setIsEditingBio] = useState(false);

    const folderProducts = useMemo(() => {
        if (!selectedFolderId) return [];
        return products.filter(p => p.folder_id === selectedFolderId);
    }, [products, selectedFolderId]);

    const handleCreateFolderClick = () => {
        const name = prompt("Nome da Nova Coleção/Pasta:");
        if (name) onCreateFolder(name);
    };

    const handleCreateItemClick = () => {
        if (!selectedFolderId) return;
        const name = prompt("Nome do Produto:");
        const price = prompt("Preço (AOA):");
        if (name && price) {
            onCreateProductInFolder({
                name,
                price: parseFloat(price),
                image: 'https://i.postimg.cc/XJf6gckX/Pump_STARTAP.png',
                category: 'vendor',
                description: 'Novo item na coleção.'
            }, selectedFolderId);
        }
    };

    const currentFolder = folders.find(f => f.id === selectedFolderId);

    return (
        <div className="w-full h-full flex flex-col bg-white text-zinc-900 relative overflow-hidden">
            <header className="px-5 pt-6 flex items-center justify-between flex-shrink-0 bg-white z-10 sticky top-0">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black uppercase tracking-tighter italic">
                        {profile.full_name || profile.username}
                    </h1>
                    <ChevronDownIcon className="w-3 h-3 text-zinc-300" />
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={onOpenNotificationsPanel} className="relative active:scale-90 transition-transform">
                        <BellIcon className="w-7 h-7" />
                        {unreadNotificationCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white border border-white">1</span>}
                    </button>
                    <button onClick={onOpenMenu} className="active:scale-90 transition-transform">
                        <MenuIcon className="w-7 h-7" />
                    </button>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto pb-32 pt-6">
                {/* Perfil Header */}
                <div className="px-5 flex flex-col items-center gap-4 text-center">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-[2.2rem] p-0.5 bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center overflow-hidden shadow-xl shadow-amber-500/5">
                            <div className="w-full h-full rounded-[2rem] bg-white p-0.5 overflow-hidden">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-[1.9rem]" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-100 flex items-center justify-center"><UserIcon className="w-10 h-10 text-zinc-300" /></div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <h2 className="font-black text-base uppercase tracking-widest">{profile.full_name || profile.username}</h2>
                        <span className="text-[9px] text-amber-500 uppercase font-black tracking-[0.25em] mt-0.5">{businessProfile.business_category}</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-8 px-10 py-6 grid grid-cols-3 gap-4 text-center border-y border-zinc-50 bg-zinc-50/30">
                    <div className="flex flex-col items-center">
                        <span className="text-base font-black">{products.length}</span>
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1">Produtos</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-base font-black">{folders.length}</span>
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1">Pastas</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-base font-black">{followersCount}</span>
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1">Seguidores</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-zinc-50 flex mt-10 px-5">
                    <button onClick={() => { setActiveTab('shop'); setSelectedFolderId(null); }} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${activeTab === 'shop' && !selectedFolderId ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-300'}`}>Catálogo</button>
                    <button onClick={() => setActiveTab('posts')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${activeTab === 'posts' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-300'}`}>Vitrine</button>
                </div>

                <div className="p-5 min-h-[400px]">
                    {activeTab === 'shop' ? (
                        <>
                            {selectedFolderId ? (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="flex items-center justify-between mb-4">
                                        <button onClick={() => setSelectedFolderId(null)} className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-full">← Voltar</button>
                                        <h3 className="text-xs font-black uppercase tracking-tighter">{currentFolder?.name}</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {folderProducts.map(item => (
                                            <div key={item.id} className="bg-zinc-50 p-2 rounded-2xl border border-zinc-100 relative group">
                                                <img src={item.image} alt="" className="w-full aspect-[3/4] object-cover rounded-xl mb-2" />
                                                <p className="text-[10px] font-bold uppercase truncate">{item.name}</p>
                                                <p className="text-[9px] font-black text-amber-500 mt-0.5">{item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
                                            </div>
                                        ))}
                                        <AddButton label="Novo Item" onClick={handleCreateItemClick} />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                                    {folders.map(folder => (
                                        <FolderCard key={folder.id} folder={folder} onClick={() => setSelectedFolderId(folder.id)} />
                                    ))}
                                    <AddButton label="Criar Pasta" onClick={handleCreateFolderClick} />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-20 text-center flex flex-col items-center opacity-40">
                             <ShoppingBagIcon className="w-8 h-8 text-zinc-300 mb-3" />
                             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Sua vitrine está vazia</p>
                        </div>
                    )}
                </div>
            </main>

            <div className="absolute bottom-28 right-6 z-20">
                <button onClick={onOpenPromotionModal} className="w-14 h-14 bg-amber-500 rounded-[1.2rem] flex items-center justify-center shadow-xl shadow-amber-500/20 active:scale-90 transition-all">
                    <StarIcon className="w-6 h-6 text-white" />
                </button>
            </div>

            {isEditingBio && (
                <BioEditModal 
                    initialUsername={profile.full_name || profile.username} 
                    initialBio={profile.bio || ''} 
                    onClose={() => setIsEditingBio(false)} 
                    onSave={() => setIsEditingBio(false)} 
                />
            )}
        </div>
    );
};

export default VendorDashboard;
