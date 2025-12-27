
import React, { useState, useRef } from 'react';
import type { BusinessProfile, Profile, Folder, Product, Post, Item } from '../types';
import { 
    MenuIcon, PlusIcon, StarIcon, 
    BellIcon, ChevronDownIcon, ArchiveIcon, 
    TrashIcon, PencilIcon, ArrowLeftIcon 
} from './IconComponents';
import ImageViewModal from './ImageViewModal';
import CommentsModal from './CommentsModal';
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
  products: Product[];
  posts: Post[];
  onCreateFolder: (title: string) => void;
  onDeleteFolder: (id: string) => void; 
  onCreateProductInFolder: (folderId: string | null, details: any) => Promise<any>;
  onDeleteProduct: (id: string) => void;
  onMoveProductToFolder: (productId: string, folderId: string | null) => Promise<void>;
  onUpdateProfile: (updates: { name: string, bio: string, username: string }) => void;
  onUpdateProfileImage: (dataUrl: string) => void;
  onNavigateToProducts: (folderId: string | null) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onItemClick: (item: Item) => void;
  onViewProfile: (profileId: string) => void;
  isVisitor?: boolean;
  onBack?: () => void;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ 
    businessProfile, profile, onOpenMenu, unreadNotificationCount, onOpenNotificationsPanel,
    onOpenPromotionModal, folders, products, posts, onCreateFolder, onDeleteFolder,
    onNavigateToProducts, onLikePost, onAddComment, onItemClick, onViewProfile,
    onUpdateProfile, onUpdateProfileImage, isVisitor = false, onBack
}) => {
    const [activeTab, setActiveTab] = useState<'shop' | 'posts'>('shop');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderTitle, setNewFolderTitle] = useState('');
    const [viewingPostIndex, setViewingPostIndex] = useState<number | null>(null);
    const [commentingPost, setCommentingPost] = useState<Post | null>(null);
    const [isEditingBio, setIsEditingBio] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoClick = () => {
        if (!isVisitor) fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => onUpdateProfileImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const userPosts = posts.filter(p => p.user.id === profile.user_id);

    return (
        <div className="w-full h-full flex flex-col bg-white text-zinc-900 overflow-hidden font-sans">
            <header className="px-4 pt-4 pb-2 flex items-center justify-between bg-white shrink-0 z-10 border-b border-zinc-50">
                <div className="flex items-center gap-3">
                    {isVisitor && onBack && (
                        <button onClick={onBack} className="p-2 -ml-2 rounded-xl bg-zinc-50 text-zinc-400">
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                    )}
                    <div className="flex items-center gap-1">
                        <h1 className="text-lg font-bold tracking-tight text-zinc-900 uppercase italic">
                            @{profile.username || "loja"}
                        </h1>
                        {!isVisitor && <ChevronDownIcon className="w-3.5 h-3.5 text-zinc-800" strokeWidth={3} />}
                    </div>
                </div>
                {!isVisitor && (
                    <div className="flex items-center gap-2">
                        <button onClick={onOpenPromotionModal} className="p-2 bg-amber-50 rounded-xl text-amber-600 active:scale-90 transition-transform">
                            <StarIcon className="w-5 h-5" />
                        </button>
                        <button onClick={onOpenNotificationsPanel} className="relative p-2 active:scale-90 transition-transform">
                            <BellIcon className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
                            {unreadNotificationCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white shadow-sm ring-2 ring-white">
                                    {unreadNotificationCount}
                                </span>
                            )}
                        </button>
                        <button onClick={onOpenMenu} className="p-2 active:scale-90 transition-transform">
                            <MenuIcon className="w-7 h-7 text-zinc-900" strokeWidth={2.5} />
                        </button>
                    </div>
                )}
            </header>

            <main className="flex-grow overflow-y-auto pb-24">
                <div className="px-5 pt-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative shrink-0" onClick={handleLogoClick}>
                            <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 to-amber-600 shadow-sm overflow-hidden cursor-pointer active:scale-95 transition-transform">
                                {businessProfile.logo_url ? (
                                    <img src={businessProfile.logo_url} className="w-full h-full rounded-full object-cover border-2 border-white" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-zinc-50 flex items-center justify-center border-2 border-white">
                                        <PlusIcon className="w-6 h-6 text-zinc-300" strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                            {!isVisitor && (
                                <div className="absolute bottom-0 right-0 bg-amber-500 rounded-full p-1 border-2 border-white">
                                    <PencilIcon className="w-3 h-3 text-white" />
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                        </div>
                        <div className="flex-grow min-w-0 relative">
                            {!isVisitor && (
                                <button 
                                    onClick={() => setIsEditingBio(true)}
                                    className="absolute right-0 top-0 p-2 bg-zinc-50 rounded-full text-zinc-400 hover:text-amber-500 active:scale-90 transition-all"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                            )}
                            <h2 className="font-bold text-md text-zinc-900 truncate uppercase tracking-tighter italic leading-none pr-8">
                                {businessProfile.business_name}
                            </h2>
                            
                            {/* Botão de Adicionar Logo Chamativo para Vendedores */}
                            {!businessProfile.logo_url && !isVisitor && (
                                <button 
                                    onClick={handleLogoClick}
                                    className="mt-1 px-4 py-1.5 bg-amber-500 text-white text-[9px] font-black uppercase rounded-xl tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
                                >
                                    ADICIONAR LOGO
                                </button>
                            )}

                            <div className="text-[11px] text-zinc-600 font-medium leading-tight line-clamp-2 mt-1">
                                {businessProfile.description || "Loja do ecossistema PUMP."}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex bg-white sticky top-0 z-10 shadow-sm border-b border-zinc-50">
                    <button onClick={() => setActiveTab('shop')} className={`flex-1 py-4 flex justify-center items-center relative transition-colors ${activeTab === 'shop' ? 'text-amber-600' : 'text-zinc-400'}`}>
                        <span className="text-xs font-bold uppercase tracking-widest">CATÁLOGO</span>
                        {activeTab === 'shop' && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-amber-600"></div>}
                    </button>
                    <button onClick={() => setActiveTab('posts')} className={`flex-1 py-4 flex justify-center items-center relative transition-colors ${activeTab === 'posts' ? 'text-amber-600' : 'text-zinc-400'}`}>
                        <span className="text-xs font-bold uppercase tracking-widest">PUBLICAÇÕES</span>
                        {activeTab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-amber-600"></div>}
                    </button>
                </div>

                <div className="min-h-[400px] bg-white p-5">
                    {activeTab === 'shop' ? (
                        <div className="animate-fadeIn">
                            <div className="grid grid-cols-2 gap-4">
                                {folders.map(folder => (
                                    <div key={folder.id} className="relative aspect-[4/3] rounded-[2rem] overflow-hidden group shadow-md active:scale-95 transition-all border border-zinc-100 cursor-pointer" onClick={() => onNavigateToProducts(folder.id)}>
                                        {!isVisitor && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
                                                className="absolute top-2 right-2 z-20 p-1.5 bg-black/40 backdrop-blur-md rounded-xl text-white hover:bg-red-500 transition-colors"
                                            >
                                                <TrashIcon className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {folder.cover_image ? (
                                            <img src={folder.cover_image} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-50 flex items-center justify-center">
                                                <ArchiveIcon className="w-10 h-10 text-zinc-200" strokeWidth={1} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                                            <h3 className="text-[13px] font-black text-white uppercase italic tracking-tighter leading-tight truncate">{folder.title}</h3>
                                            <p className="text-[8px] font-bold text-amber-400 uppercase tracking-widest mt-0.5">Explorar</p>
                                        </div>
                                    </div>
                                ))}
                                {!isVisitor && (
                                    <button onClick={() => setIsCreatingFolder(true)} className="aspect-[4/3] border-2 border-dashed border-zinc-100 rounded-[2rem] flex flex-col items-center justify-center gap-2 bg-zinc-50/30 transition-all hover:bg-zinc-50 active:scale-95">
                                        <div className="p-2 bg-white rounded-xl shadow-sm">
                                            <PlusIcon className="w-5 h-5 text-zinc-300" strokeWidth={3} />
                                        </div>
                                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Nova Pasta</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                            {userPosts.map((post, index) => (
                                <div key={post.id} onClick={() => setViewingPostIndex(index)} className="aspect-[4/3] bg-zinc-100 rounded-2xl overflow-hidden shadow-sm active:opacity-80 cursor-pointer border border-zinc-50">
                                    <img src={post.image} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {isCreatingFolder && (
                <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn" onClick={() => setIsCreatingFolder(false)}>
                    <div className="w-full max-sm bg-white rounded-[2.5rem] p-10 flex flex-col gap-8 animate-modalZoomIn shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-black uppercase italic text-zinc-900 tracking-tighter text-center">Nova Coleção</h2>
                        <input type="text" placeholder="Nome da Pasta" value={newFolderTitle} onChange={e => setNewFolderTitle(e.target.value)} className="w-full p-5 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 font-bold text-sm text-zinc-900 focus:outline-none focus:border-amber-500/40" autoFocus />
                        <div className="flex flex-col gap-3">
                            <button onClick={() => { onCreateFolder(newFolderTitle); setNewFolderTitle(''); setIsCreatingFolder(false); }} className="w-full py-4 bg-amber-500 rounded-2xl text-white font-bold tracking-tight shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-transform">CRIAR PASTA</button>
                            <button onClick={() => setIsCreatingFolder(false)} className="py-4 text-[10px] font-black uppercase text-zinc-300 tracking-widest">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {isEditingBio && (
                <BioEditModal 
                    profile={profile}
                    onClose={() => setIsEditingBio(false)}
                    onSave={(updates) => {
                        onUpdateProfile(updates);
                        setIsEditingBio(false);
                    }}
                />
            )}

            {viewingPostIndex !== null && (
                <ImageViewModal posts={userPosts} startIndex={viewingPostIndex} onClose={() => setViewingPostIndex(null)} onLike={onLikePost} onItemClick={onItemClick} onViewProfile={onViewProfile} onComment={(id) => setCommentingPost(userPosts.find(p => p.id === id) || null)} />
            )}
            {commentingPost && <CommentsModal post={commentingPost} currentUser={profile} onClose={() => setCommentingPost(null)} onAddComment={onAddComment} />}
        </div>
    );
};

export default VendorDashboard;
