
import React, { useState, useMemo, useRef } from 'react';
import type { BusinessProfile, Item, Post, Profile, Folder } from '../types';
import { 
    MenuIcon, CameraIcon, PencilIcon, PlusIcon, StarIcon, 
    BellIcon, UserIcon, ChevronDownIcon, ArchiveIcon, ShoppingBagIcon
} from './IconComponents';
import BioEditModal from './BioEditModal';

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
  onUpdateProfile: (updates: { username?: string, bio?: string, name?: string }) => void;
  onUpdateProfileImage: (dataUrl: string) => void;
  onUpdateCoverImage: (dataUrl: string) => void;
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
    onUpdateProfile,
    onUpdateProfileImage,
    onUpdateCoverImage,
    onNavigateToProducts
}) => {
    const [activeTab, setActiveTab] = useState<'shop' | 'posts'>('shop');
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [isEditingBio, setIsEditingBio] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const folderProducts = useMemo(() => {
        if (!selectedFolderId) return [];
        return products.filter(p => p.folder_id === selectedFolderId);
    }, [products, selectedFolderId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'avatar') onUpdateProfileImage(reader.result as string);
                else onUpdateCoverImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

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
            {/* Header Flutuante */}
            <header className="px-5 pt-6 absolute top-0 left-0 right-0 flex items-center justify-between z-30 pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                    <button onClick={onOpenNotificationsPanel} className="p-2.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 text-white active:scale-90 transition-transform">
                        <BellIcon className="w-5 h-5" />
                        {unreadNotificationCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white border border-white">1</span>}
                    </button>
                </div>
                <div className="flex items-center gap-4 pointer-events-auto">
                    <button onClick={onOpenMenu} className="p-2.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 text-white active:scale-90 transition-transform">
                        <MenuIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto pb-32">
                {/* Foto de Capa */}
                <div className="relative w-full h-48 bg-zinc-900 overflow-hidden group">
                    {profile.cover_image_url ? (
                        <img src={profile.cover_image_url} alt="Capa" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                            <span className="text-zinc-600 font-black uppercase text-[10px] tracking-[0.4em]">Banner da Loja</span>
                        </div>
                    )}
                    <button 
                        onClick={() => coverInputRef.current?.click()}
                        className="absolute bottom-4 right-4 p-2.5 bg-black/50 backdrop-blur-md border border-white/20 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                    >
                        <CameraIcon className="w-5 h-5" />
                    </button>
                    <input type="file" accept="image/*" ref={coverInputRef} onChange={(e) => handleFileChange(e, 'cover')} className="hidden" />
                </div>

                {/* Perfil Minimalista */}
                <div className="relative px-6 -mt-12 flex flex-col">
                    <div className="flex items-center justify-between w-full">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-24 h-24 rounded-full p-1 bg-white shadow-lg overflow-hidden border border-zinc-100">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-50 flex items-center justify-center rounded-full">
                                        <UserIcon className="w-10 h-10 text-zinc-300" />
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-1.5 bg-amber-500 text-white rounded-full border-2 border-white shadow-md active:scale-90"
                            >
                                <CameraIcon className="w-3 h-3" />
                            </button>
                            <input type="file" accept="image/*" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" />
                        </div>

                        {/* Estatísticas (Estilo Instagram) */}
                        <div className="flex-1 flex justify-around pl-4">
                            <div className="text-center">
                                <span className="block text-sm font-black text-zinc-900 leading-none">{products.length}</span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Produtos</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-sm font-black text-zinc-900 leading-none">{followersCount}</span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Seguidores</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-sm font-black text-zinc-900 leading-none">{followingCount}</span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Seguindo</span>
                            </div>
                        </div>
                    </div>

                    {/* Botão Editar Perfil Largo */}
                    <button 
                        onClick={() => setIsEditingBio(true)}
                        className="mt-6 w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-zinc-800 transition-colors active:scale-[0.99]"
                    >
                        Editar Perfil
                    </button>

                    {/* Nome e Bio (Zonas Vermelha, Verde e Azul) */}
                    <div className="mt-5 flex flex-col items-start relative group">
                        {/* Nome do Usuário (Sinalizado em Vermelho) + Ícone Edição (Sinalizado em Azul) */}
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="font-black text-xl uppercase tracking-tighter italic text-zinc-900 leading-none">
                                {profile.full_name || profile.username}
                            </h2>
                            <button 
                                onClick={() => setIsEditingBio(true)}
                                className="p-1.5 text-zinc-300 hover:text-amber-500 transition-colors active:scale-90"
                                aria-label="Editar Nome e Bio"
                            >
                                <PencilIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        
                        <p className="text-[11px] font-bold text-zinc-400 tracking-tight mb-3">@{profile.username}</p>
                        
                        {/* Caixa de Bio (Sinalizado em Verde) */}
                        <div className="w-full">
                            {profile.bio ? (
                                <p className="text-xs text-zinc-600 font-medium leading-relaxed italic pr-4">
                                    "{profile.bio}"
                                </p>
                            ) : (
                                <button 
                                    onClick={() => setIsEditingBio(true)}
                                    className="text-[10px] font-bold text-zinc-300 italic uppercase tracking-widest hover:text-amber-500 transition-colors"
                                >
                                    Toque para adicionar uma biografia...
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Zona Vermelha Excluída (Os cards de estatísticas inferiores não existem mais aqui) */}

                {/* Navegação de Conteúdo */}
                <div className="flex mt-8 px-6 border-b border-zinc-100">
                    <button onClick={() => { setActiveTab('shop'); setSelectedFolderId(null); }} className={`flex-1 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'shop' && !selectedFolderId ? 'text-zinc-900' : 'text-zinc-300'}`}>
                        Catálogo
                        {activeTab === 'shop' && !selectedFolderId && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-amber-500 rounded-t-full"></div>}
                    </button>
                    <button onClick={() => setActiveTab('posts')} className={`flex-1 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'posts' ? 'text-zinc-900' : 'text-zinc-300'}`}>
                        Vitrine
                        {activeTab === 'posts' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-amber-500 rounded-t-full"></div>}
                    </button>
                </div>

                <div className="p-6 min-h-[400px]">
                    {activeTab === 'shop' ? (
                        <>
                            {selectedFolderId ? (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="flex items-center justify-between mb-4">
                                        <button onClick={() => setSelectedFolderId(null)} className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 hover:bg-zinc-100 px-4 py-2 rounded-full transition-colors">
                                            <ChevronDownIcon className="w-3 h-3 rotate-90" />
                                            Voltar
                                        </button>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-amber-600">{currentFolder?.name}</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {folderProducts.map(item => (
                                            <div key={item.id} className="bg-zinc-50 p-3 rounded-[2rem] border border-zinc-100 relative group active:scale-95 transition-all">
                                                <img src={item.image} alt="" className="w-full aspect-[4/5] object-cover rounded-[1.5rem] mb-3 shadow-sm" />
                                                <p className="text-[11px] font-bold uppercase truncate px-1">{item.name}</p>
                                                <p className="text-[10px] font-black text-amber-500 mt-0.5 px-1">{item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
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
                        <div className="py-24 text-center flex flex-col items-center opacity-30 grayscale">
                             <ShoppingBagIcon className="w-10 h-10 text-zinc-400 mb-4" />
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Sua vitrine está vazia</p>
                             <p className="text-[9px] font-bold text-zinc-400 mt-2 uppercase">Publique looks no feed para destacar aqui</p>
                        </div>
                    )}
                </div>
            </main>

            {/* CTA de Promoção Flutuante */}
            <div className="absolute bottom-28 right-6 z-20">
                <button onClick={onOpenPromotionModal} className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-400 rounded-3xl flex items-center justify-center shadow-[0_15px_30px_rgba(245,158,11,0.3)] active:scale-90 transition-all group">
                    <StarIcon className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
                </button>
            </div>

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
        </div>
    );
};

export default VendorDashboard;
