
import React, { useState, useMemo, useRef } from 'react';
import type { BusinessProfile, Item, Profile, Folder, Post, Product } from '../types';
import { 
    MenuIcon, CameraIcon, PlusIcon, StarIcon, 
    BellIcon, ChevronDownIcon, ArchiveIcon, ShoppingBagIcon, RepositionIcon,
    PencilIcon, UserIcon, ArrowLeftIcon, TrashIcon
} from './IconComponents';
import GradientButton from './GradientButton';
import ImageViewModal from './ImageViewModal';
import CommentsModal from './CommentsModal';
import BioEditModal from './BioEditModal';
import { toast } from '../utils/toast';
import { removeImageBackground, generateProductImage } from '../services/geminiService';

const SparklesIconUI = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09-3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 15L17.5 17.625l-.75-2.625a2.25 2.25 0 00-1.545-1.545L12.583 12.688l2.625-.75a2.25 2.25 0 001.545-1.545l.75-2.625.75 2.625a2.25 2.25 0 001.545 1.545l2.625.75-2.625.75a2.25 2.25 0 00-1.545 1.545L18.25 15z" />
    </svg>
);

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
  onDeleteFolder?: (folderId: string) => void;
  onCreateProductInFolder: (folderId: string | null, details: { title: string, description: string, price: number, file: Blob | null }) => Promise<any>;
  onDeleteProduct?: (productId: string) => void;
  onMoveProductToFolder: (productId: string, folderId: string | null) => Promise<void>;
  onUpdateProfile: (updates: { username?: string, bio?: string, name?: string }) => void;
  onUpdateProfileImage: (dataUrl: string) => void;
  onNavigateToProducts: () => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onItemClick: (item: Item) => void;
  onViewProfile: (profileId: string) => void;
  isVisitor?: boolean;
  onBack?: () => void;
}

const FolderCard: React.FC<{ folder: Folder; productCount: number; onClick: () => void; onDelete?: (e: React.MouseEvent) => void; isVisitor: boolean }> = ({ folder, productCount, onClick, onDelete, isVisitor }) => (
    <div 
        onClick={onClick}
        className="relative h-56 rounded-2xl overflow-hidden group shadow-sm active:scale-[0.98] transition-all border border-zinc-100 cursor-pointer"
    >
        {!isVisitor && onDelete && (
            <button 
                onClick={onDelete}
                className="absolute top-3 left-3 z-20 p-2 bg-black/60 backdrop-blur-md rounded-xl text-white transition-all hover:bg-red-500 shadow-lg border border-white/20"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        )}
        {folder.cover_image ? (
            <img src={folder.cover_image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
            <div className="w-full h-full bg-zinc-50 flex items-center justify-center">
                <ArchiveIcon className="w-12 h-12 text-zinc-200" strokeWidth={1} />
            </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
            <h3 className="text-md font-black text-white uppercase italic tracking-tighter leading-none">{folder.title}</h3>
            <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mt-1">{productCount} itens</p>
        </div>
    </div>
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
    posts,
    onCreateFolder,
    onDeleteFolder,
    onCreateProductInFolder,
    onDeleteProduct,
    onMoveProductToFolder,
    onUpdateProfile,
    onUpdateProfileImage,
    onLikePost,
    onAddComment,
    onItemClick,
    onViewProfile,
    isVisitor = false,
    onBack
}) => {
    const [activeTab, setActiveTab] = useState<'shop' | 'posts'>('shop');
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [movingProduct, setMovingProduct] = useState<Product | null>(null);
    const [viewingPostIndex, setViewingPostIndex] = useState<number | null>(null);
    const [commentingPost, setCommentingPost] = useState<Post | null>(null);
    
    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemDesc, setNewItemDesc] = useState('');
    const [newItemFile, setNewItemFile] = useState<Blob | null>(null);
    const [newItemPreview, setNewItemPreview] = useState<string | null>(null);
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [newFolderTitle, setNewFolderTitle] = useState('');

    const itemFileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const currentFolder = folders.find(f => f.id === selectedFolderId);
    const userPosts = posts.filter(p => p.user.id === profile.user_id);
    
    const folderProducts = useMemo(() => {
        return products.filter(p => p.folder_id === selectedFolderId);
    }, [products, selectedFolderId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewItemFile(file);
                setNewItemPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveItem = async (keepAdding: boolean = false) => {
        if (!newItemTitle) return toast("O nome do produto é obrigatório.");
        const priceValue = newItemPrice ? parseFloat(newItemPrice) : 0;
        
        await onCreateProductInFolder(selectedFolderId, {
            title: newItemTitle,
            description: newItemDesc,
            price: priceValue,
            file: newItemFile
        });

        setNewItemTitle('');
        setNewItemPrice('');
        setNewItemDesc('');
        setNewItemFile(null);
        setNewItemPreview(null);
        if (!keepAdding) setIsAddingItem(false);
    };

    const handleCreateFolderSubmit = () => {
        if (!newFolderTitle.trim()) {
            toast("O nome da coleção é obrigatório.");
            return;
        }
        onCreateFolder(newFolderTitle.trim());
        setNewFolderTitle('');
        setIsCreatingFolder(false);
    };

    const mapProductToItem = (p: Product): Item => ({
        id: p.id,
        name: p.title,
        description: p.description || '',
        image: p.image_url || 'https://i.postimg.cc/LXmdq4H2/D.jpg',
        price: p.price,
        category: 'catalog',
        owner_id: p.owner_id,
        folder_id: p.folder_id,
        isTryOn: true 
    });

    return (
        <div className="w-full h-full flex flex-col bg-white text-zinc-900 overflow-hidden font-sans">
            <header className="px-4 pt-4 pb-2 flex items-center justify-between bg-white shrink-0 z-10 border-b border-zinc-50">
                <div className="flex items-center gap-3">
                    {isVisitor && onBack && (
                        <button onClick={onBack} className="p-2 -ml-2 rounded-xl bg-zinc-50 text-zinc-400 active:scale-90 transition-all">
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                    )}
                    <div className="flex items-center gap-1 cursor-pointer active:opacity-60 transition-opacity">
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
                                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
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
                        <div className="relative shrink-0">
                            <div className={`w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 to-amber-600 shadow-sm ${!isVisitor ? 'cursor-pointer' : ''}`}>
                                <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-zinc-100 flex items-center justify-center">
                                        {profile.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-10 h-10 text-zinc-300" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-md text-zinc-900 truncate uppercase tracking-tighter italic leading-none">
                                    {profile.full_name || profile.username}
                                </h2>
                                {!isVisitor && (
                                    <button onClick={() => setIsEditingProfile(true)} className="p-1 active:scale-90 transition-transform">
                                        <PencilIcon className="w-4 h-4 text-zinc-400" />
                                    </button>
                                )}
                            </div>
                            <div className="text-[11px] text-zinc-600 font-medium leading-tight line-clamp-3 mt-1">{profile.bio || "Loja do ecossistema PUMP."}</div>
                        </div>
                    </div>
                </div>

                <div className="flex bg-white sticky top-0 z-10 shadow-sm border-b border-zinc-50">
                    <button onClick={() => { setActiveTab('shop'); setSelectedFolderId(null); }} className={`flex-1 py-4 flex justify-center items-center relative transition-colors ${activeTab === 'shop' ? 'text-amber-600' : 'text-zinc-400'}`}>
                        <span className="text-xs font-bold uppercase tracking-widest">CATÁLOGO</span>
                        {activeTab === 'shop' && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-amber-600 rounded-t-full"></div>}
                    </button>
                    <button onClick={() => setActiveTab('posts')} className={`flex-1 py-4 flex justify-center items-center relative transition-colors ${activeTab === 'posts' ? 'text-amber-600' : 'text-zinc-400'}`}>
                        <span className="text-xs font-bold uppercase tracking-widest">PUBLICAÇÕES</span>
                        {activeTab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-amber-600 rounded-t-full"></div>}
                    </button>
                </div>

                <div className="min-h-[400px] bg-white p-4">
                    {activeTab === 'shop' ? (
                        <div className="animate-fadeIn">
                            {selectedFolderId ? (
                                <div>
                                    <button onClick={() => setSelectedFolderId(null)} className="flex items-center gap-2 text-[11px] font-black text-zinc-400 uppercase bg-zinc-50 px-4 py-2 rounded-2xl border border-zinc-100 mb-6">
                                        <ChevronDownIcon className="w-3.5 h-3.5 rotate-90" /> Voltar
                                    </button>
                                    <div className="grid grid-cols-2 gap-4">
                                        {folderProducts.map(product => (
                                            <div key={product.id} className="relative aspect-[3/4] rounded-[1.8rem] overflow-hidden shadow-md border border-zinc-100 group cursor-pointer" onClick={() => onItemClick(mapProductToItem(product))}>
                                                <img src={product.image_url || 'https://i.postimg.cc/LXmdq4H2/D.jpg'} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent flex flex-col justify-end p-4">
                                                    <p className="text-[11px] font-black text-white uppercase italic">{product.title}</p>
                                                    <p className="text-[10px] font-black text-amber-400 mt-1">{product.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {!isVisitor && (
                                            <button onClick={() => setIsAddingItem(true)} className="aspect-[3/4] border-2 border-dashed border-zinc-100 rounded-[1.8rem] flex flex-col items-center justify-center gap-2 bg-zinc-50/30">
                                                <PlusIcon className="w-8 h-8 text-zinc-300" strokeWidth={3} />
                                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Novo Item</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {folders.map(folder => (
                                        <FolderCard 
                                            key={folder.id} 
                                            folder={folder} 
                                            productCount={products.filter(p => p.folder_id === folder.id).length}
                                            onClick={() => setSelectedFolderId(folder.id)} 
                                            onDelete={(e) => { e.stopPropagation(); onDeleteFolder?.(folder.id); }}
                                            isVisitor={isVisitor}
                                        />
                                    ))}
                                    {/* Vitrine Geral - Apenas Itens Sem Pasta */}
                                    {products.filter(p => !p.folder_id).map(product => (
                                        <div key={product.id} className="relative aspect-[3/4] rounded-[1.8rem] overflow-hidden shadow-md border border-zinc-100 group cursor-pointer" onClick={() => onItemClick(mapProductToItem(product))}>
                                            <img src={product.image_url || 'https://i.postimg.cc/LXmdq4H2/D.jpg'} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent flex flex-col justify-end p-4">
                                                <p className="text-[11px] font-black text-white uppercase italic">{product.title}</p>
                                                <p className="text-[10px] font-black text-amber-400 mt-1">{product.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {!isVisitor && (
                                        <button onClick={() => setIsCreatingFolder(true)} className="h-56 border-2 border-dashed border-zinc-100 rounded-[1.8rem] flex flex-col items-center justify-center gap-2 bg-zinc-50/50 transition-all hover:bg-zinc-50">
                                            <PlusIcon className="w-8 h-8 text-zinc-300" strokeWidth={3} />
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nova Coleção</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-0.5 animate-fadeIn p-0.5">
                            {userPosts.map((post, index) => (
                                <div key={post.id} onClick={() => setViewingPostIndex(index)} className="aspect-square bg-zinc-100 overflow-hidden active:opacity-80 cursor-pointer">
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
                            <GradientButton onClick={handleCreateFolderSubmit}>CRIAR PASTA</GradientButton>
                            <button onClick={() => setIsCreatingFolder(false)} className="py-4 text-[10px] font-black uppercase text-zinc-300 tracking-widest">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {isAddingItem && (
                <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-end animate-fadeIn" onClick={() => setIsAddingItem(false)}>
                    <div className="w-full max-h-[95vh] bg-white rounded-t-[3rem] p-10 flex flex-col gap-8 animate-slideUp overflow-y-auto scrollbar-hide" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-black uppercase italic text-zinc-900 tracking-tighter leading-none">Novo Item</h2>
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-2">{selectedFolderId ? `Na coleção: ${currentFolder?.title}` : "Vitrine Geral"}</span>
                            </div>
                            <button onClick={() => setIsAddingItem(false)} className="p-3 bg-zinc-50 rounded-2xl text-zinc-300"><ChevronDownIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="space-y-6">
                            <div onClick={() => itemFileInputRef.current?.click()} className="w-full aspect-[3/4] bg-zinc-50 border-2 border-dashed border-zinc-100 rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden transition-all relative">
                                {newItemPreview ? <img src={newItemPreview} className="w-full h-full object-cover" /> : <CameraIcon className="w-12 h-12 text-zinc-200" />}
                                <input type="file" ref={itemFileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                            </div>
                            <input type="text" placeholder="Designação" value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} className="w-full p-5 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 font-bold text-sm text-zinc-900 shadow-sm" />
                            <input type="number" placeholder="Preço (AOA)" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="w-full p-5 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 font-bold text-sm text-zinc-900 shadow-sm" />
                        </div>
                        <GradientButton onClick={() => handleSaveItem(false)} disabled={!newItemTitle}>CONCLUIR CADASTRO</GradientButton>
                    </div>
                </div>
            )}

            {isEditingProfile && (
                <BioEditModal 
                    profile={profile}
                    onClose={() => setIsEditingProfile(false)} 
                    onSave={(updates) => {
                        onUpdateProfile(updates);
                        setIsEditingProfile(false);
                    }} 
                />
            )}

            {viewingPostIndex !== null && (
                <ImageViewModal 
                  posts={userPosts} 
                  startIndex={viewingPostIndex} 
                  onClose={() => setViewingPostIndex(null)} 
                  onLike={onLikePost} 
                  onItemClick={onItemClick} 
                  onViewProfile={onViewProfile} 
                  onComment={(postId) => {
                      const post = userPosts.find(p => p.id === postId);
                      if (post) setCommentingPost(post);
                  }} 
                />
            )}

            {commentingPost && (
                <CommentsModal 
                  post={commentingPost} 
                  currentUser={profile} 
                  onClose={() => setCommentingPost(null)} 
                  onAddComment={onAddComment} 
                />
            )}
        </div>
    );
};

export default VendorDashboard;
