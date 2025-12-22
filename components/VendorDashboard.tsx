
import React, { useState, useMemo, useRef } from 'react';
import type { BusinessProfile, Item, Profile, Folder, Post, Product } from '../types';
import { 
    MenuIcon, CameraIcon, PlusIcon, StarIcon, 
    BellIcon, ChevronDownIcon, ArchiveIcon, ShoppingBagIcon, RepositionIcon,
    PencilIcon, UserIcon
} from './IconComponents';
import GradientButton from './GradientButton';
import ImageViewModal from './ImageViewModal';
import CommentsModal from './CommentsModal';
import BioEditModal from './BioEditModal';
import { toast } from '../utils/toast';
import { removeImageBackground, generateProductImage } from '../services/geminiService';

const SparklesIconUI = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 15L17.5 17.625l-.75-2.625a2.25 2.25 0 00-1.545-1.545L12.583 12.688l2.625-.75a2.25 2.25 0 001.545-1.545l.75-2.625.75 2.625a2.25 2.25 0 001.545 1.545l2.625.75-2.625.75a2.25 2.25 0 00-1.545 1.545L18.25 15z" />
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
  onCreateProductInFolder: (folderId: string, details: { title: string, description: string, price: number, file: Blob | null }) => Promise<any>;
  onMoveProductToFolder: (productId: string, folderId: string | null) => Promise<void>;
  onUpdateProfile: (updates: { username?: string, bio?: string, name?: string }) => void;
  onUpdateProfileImage: (dataUrl: string) => void;
  onNavigateToProducts: () => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onItemClick: (item: Item) => void;
  onViewProfile: (profileId: string) => void;
}

const FolderCard: React.FC<{ folder: Folder; onClick: () => void }> = ({ folder, onClick }) => (
    <div 
        onClick={onClick}
        className="relative h-56 rounded-xl overflow-hidden group shadow-sm active:scale-[0.98] transition-all border border-zinc-100 cursor-pointer"
    >
        {folder.cover_image ? (
            <img src={folder.cover_image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
            <div className="w-full h-full bg-zinc-50 flex items-center justify-center">
                <ArchiveIcon className="w-12 h-12 text-zinc-200" strokeWidth={1} />
            </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
            <h3 className="text-md font-black text-white uppercase italic tracking-tighter leading-none">{folder.title}</h3>
            <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mt-1">{folder.item_count || 0} itens</p>
        </div>
    </div>
);

const VendorDashboard: React.FC<VendorDashboardProps> = ({ 
    businessProfile,
    profile,
    onOpenMenu, 
    onOpenNotificationsPanel, 
    onOpenPromotionModal, 
    followersCount,
    followingCount,
    folders,
    products,
    posts,
    onCreateFolder,
    onCreateProductInFolder,
    onMoveProductToFolder,
    onUpdateProfile,
    onUpdateProfileImage,
    onLikePost,
    onAddComment,
    onItemClick,
    onViewProfile
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
        if (!selectedFolderId) return [];
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

    const handleRemoveBackground = async () => {
        if (!newItemPreview) return;
        setIsAiProcessing(true);
        try {
            const result = await removeImageBackground(newItemPreview);
            setNewItemPreview(result);
            const res = await fetch(result);
            setNewItemFile(await res.blob());
        } catch (e) {
            toast("Falha ao remover fundo.");
        } finally {
            setIsAiProcessing(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!newItemTitle) return toast("Dê um nome ao produto para a IA saber o que criar.");
        setIsAiProcessing(true);
        try {
            const result = await generateProductImage(newItemTitle, newItemDesc);
            setNewItemPreview(result);
            const res = await fetch(result);
            setNewItemFile(await res.blob());
        } catch (e) {
            toast("Falha ao gerar imagem.");
        } finally {
            setIsAiProcessing(false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => onUpdateProfileImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleCreateFolderSubmit = () => {
        if (!newFolderTitle.trim()) return;
        onCreateFolder(newFolderTitle.trim());
        setNewFolderTitle('');
        setIsCreatingFolder(false);
    };

    const handleSaveItem = async (keepAdding: boolean = false) => {
        if (!selectedFolderId || !newItemTitle) {
          toast("O nome do produto é obrigatório.");
          return;
        }

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

    const mapProductToItem = (p: Product): Item => ({
        id: p.id,
        name: p.title,
        description: p.description || '',
        image: p.image_url || '',
        price: p.price,
        category: 'catalog',
        owner_id: p.owner_id,
        folder_id: p.folder_id
    });

    return (
        <div className="w-full h-full flex flex-col bg-white text-zinc-900 overflow-hidden font-sans">
            <header className="px-4 pt-4 pb-2 flex items-center justify-between bg-white shrink-0 z-10 border-b border-zinc-50">
                <div className="flex items-center gap-1 cursor-pointer active:opacity-60 transition-opacity">
                    <h1 className="text-lg font-bold tracking-tight text-zinc-900 uppercase italic">
                        @{profile.username || "loja"}
                    </h1>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-zinc-800" strokeWidth={3} />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onOpenPromotionModal} className="p-2 bg-amber-50 rounded-xl text-amber-600 active:scale-90 transition-transform">
                        <StarIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onOpenNotificationsPanel} className="p-2 active:scale-90 transition-transform">
                        <BellIcon className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
                    </button>
                    <button onClick={onOpenMenu} className="p-2 active:scale-90 transition-transform">
                        <MenuIcon className="w-7 h-7 text-zinc-900" strokeWidth={2.5} />
                    </button>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto pb-24">
                <div className="px-5 pt-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative shrink-0">
                            <div 
                                onClick={() => logoInputRef.current?.click()}
                                className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 to-amber-600 shadow-sm cursor-pointer"
                            >
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
                            <button 
                                onClick={() => logoInputRef.current?.click()}
                                className="absolute bottom-0 right-0 w-7 h-7 bg-zinc-800 rounded-full border-2 border-white flex items-center justify-center text-white shadow-md active:scale-90 transition-all"
                            >
                                <PlusIcon className="w-3.5 h-3.5" strokeWidth={4} />
                            </button>
                            <input type="file" ref={logoInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
                        </div>

                        <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-md text-zinc-900 truncate uppercase tracking-tighter italic leading-none">
                                    {profile.full_name || profile.username}
                                </h2>
                                <button onClick={() => setIsEditingProfile(true)} className="p-1 active:scale-90 transition-transform">
                                    <PencilIcon className="w-4 h-4 text-zinc-400" />
                                </button>
                            </div>
                            <div className="text-[11px] text-zinc-600 font-medium leading-tight line-clamp-3 mt-1 whitespace-pre-line">
                                {profile.bio || "Bio da loja não definida."}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-around py-4 border-t border-b border-zinc-100 mb-2">
                        <div className="flex flex-col items-center">
                            <span className="text-md font-bold text-zinc-900">{products.length}</span>
                            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-tight">produtos</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-md font-bold text-zinc-900">{followersCount}</span>
                            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-tight">seguidores</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-md font-bold text-zinc-900">{followingCount}</span>
                            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-tight">seguindo</span>
                        </div>
                    </div>
                </div>

                <div className="flex bg-white sticky top-0 z-10 shadow-sm border-b border-zinc-50">
                    <button 
                        onClick={() => { setActiveTab('shop'); setSelectedFolderId(null); }} 
                        className={`flex-1 py-4 flex justify-center items-center relative transition-colors ${activeTab === 'shop' ? 'text-amber-600' : 'text-zinc-400'}`}
                    >
                        <span className="text-xs font-bold uppercase tracking-widest">CATÁLOGO</span>
                        {activeTab === 'shop' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-600"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('posts')} 
                        className={`flex-1 py-4 flex justify-center items-center relative transition-colors ${activeTab === 'posts' ? 'text-amber-600' : 'text-zinc-400'}`}
                    >
                        <span className="text-xs font-bold uppercase tracking-widest">PUBLICAÇÕES</span>
                        {activeTab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-600"></div>}
                    </button>
                </div>

                <div className="min-h-[400px] bg-white">
                    {activeTab === 'shop' ? (
                        <div className="animate-fadeIn p-4">
                            {selectedFolderId ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <button onClick={() => setSelectedFolderId(null)} className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 uppercase bg-zinc-50 px-4 py-2 rounded-lg border border-zinc-100">
                                            <ChevronDownIcon className="w-3.5 h-3.5 rotate-90" />
                                            Voltar
                                        </button>
                                        <div className="text-right">
                                            <h3 className="text-sm font-bold text-amber-600 uppercase tracking-tight">{currentFolder?.title}</h3>
                                            <span className="text-[10px] font-medium text-zinc-400">{folderProducts.length} itens</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pb-12">
                                        {folderProducts.map(product => (
                                            <div key={product.id} className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-sm border border-zinc-100 group cursor-pointer" onClick={() => onItemClick(mapProductToItem(product))}>
                                                <img src={product.image_url || ''} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-3">
                                                    <p className="text-xs font-bold text-white uppercase italic truncate">{product.title}</p>
                                                    <p className="text-[10px] font-bold text-amber-400 mt-0.5">{product.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
                                                </div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setMovingProduct(product); }}
                                                    className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-sm rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <RepositionIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        <button onClick={() => setIsAddingItem(true)} className="aspect-[4/5] border-2 border-dashed border-zinc-100 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-zinc-50 transition-colors">
                                            <PlusIcon className="w-6 h-6 text-zinc-300" strokeWidth={3} />
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Novo Item</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 pb-12">
                                    {folders.map(folder => (
                                        <FolderCard key={folder.id} folder={folder} onClick={() => setSelectedFolderId(folder.id)} />
                                    ))}
                                    <button 
                                        onClick={() => setIsCreatingFolder(true)}
                                        className="h-56 border-2 border-dashed border-zinc-100 rounded-xl flex flex-col items-center justify-center gap-2 bg-zinc-50/50 hover:bg-zinc-50 transition-colors"
                                    >
                                        <PlusIcon className="w-6 h-6 text-zinc-300" strokeWidth={3} />
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nova Coleção</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-0.5 animate-fadeIn p-0.5">
                            {userPosts.length > 0 ? (
                                userPosts.map((post, index) => (
                                    <div 
                                        key={post.id} 
                                        onClick={() => setViewingPostIndex(index)}
                                        className="aspect-square bg-zinc-100 overflow-hidden active:opacity-80 transition-opacity cursor-pointer"
                                    >
                                        <img src={post.image} alt={post.id} className="w-full h-full object-cover" />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 py-32 text-center flex flex-col items-center opacity-30">
                                    <ShoppingBagIcon className="w-12 h-12 text-zinc-400 mb-4" strokeWidth={1} />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Nenhuma publicação ainda</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

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

            {isEditingProfile && (
                <BioEditModal 
                    profile={profile}
                    onClose={() => setIsEditingProfile(false)}
                    onSave={(updates) => {
                        onUpdateProfile({ name: updates.name, bio: updates.bio, username: updates.username });
                        setIsEditingProfile(false);
                    }}
                />
            )}

            {isCreatingFolder && (
                <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn" onClick={() => setIsCreatingFolder(false)}>
                    <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 flex flex-col gap-6 animate-modalZoomIn shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <h2 className="text-xl font-black uppercase italic text-zinc-900 tracking-tighter leading-none">Nova Coleção</h2>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Organize seu catálogo</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Nome da Pasta</label>
                            <input 
                                type="text" 
                                placeholder="Ex: Verão 2025" 
                                value={newFolderTitle} 
                                onChange={e => setNewFolderTitle(e.target.value)} 
                                className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 font-bold text-sm text-zinc-900 focus:outline-none focus:border-amber-500/40" 
                                autoFocus
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <GradientButton onClick={handleCreateFolderSubmit} disabled={!newFolderTitle.trim()}>
                                CRIAR PASTA
                            </GradientButton>
                            <button onClick={() => setIsCreatingFolder(false)} className="py-4 text-[11px] font-bold uppercase text-zinc-400 tracking-widest hover:text-zinc-900">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {isAddingItem && (
                <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-end animate-fadeIn" onClick={() => setIsAddingItem(false)}>
                    <div className="w-full max-h-[95vh] bg-white rounded-t-[2.5rem] p-8 flex flex-col gap-6 animate-slideUp overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <h2 className="text-xl font-black uppercase italic text-zinc-900 tracking-tighter italic leading-none">Novo Item</h2>
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1 italic">Na coleção: {currentFolder?.title}</span>
                            </div>
                            <button onClick={() => setIsAddingItem(false)} className="p-2 bg-zinc-50 rounded-xl text-zinc-400">
                                <ChevronDownIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div 
                                onClick={() => itemFileInputRef.current?.click()} 
                                className="w-full aspect-[4/5] bg-zinc-50 border-2 border-dashed border-zinc-100 rounded-[2rem] flex flex-col items-center justify-center overflow-hidden transition-all hover:border-amber-400/50 group relative"
                            >
                                {isAiProcessing && (
                                    <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                                        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest animate-pulse">Processamento IA...</p>
                                    </div>
                                )}
                                {newItemPreview ? (
                                    <>
                                        <img src={newItemPreview} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <CameraIcon className="w-10 h-10 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <CameraIcon className="w-10 h-10 text-zinc-200 mb-2" />
                                        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic">Capturar Estilo</p>
                                    </>
                                )}
                            </div>
                            <input type="file" ref={itemFileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />

                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={handleRemoveBackground}
                                    disabled={!newItemPreview || isAiProcessing}
                                    className="flex items-center justify-center gap-2 py-3 px-2 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-tighter disabled:opacity-50 active:scale-95 transition-all"
                                >
                                    <SparklesIconUI />
                                    Remover Fundo
                                </button>
                                <button 
                                    onClick={handleGenerateImage}
                                    disabled={!newItemTitle || isAiProcessing}
                                    className="flex items-center justify-center gap-2 py-3 px-2 border-2 border-amber-500 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-tighter disabled:opacity-50 active:scale-95 transition-all"
                                >
                                    <SparklesIconUI />
                                    Gerar pela IA
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Designação</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ex: Blazer Minimalist" 
                                        value={newItemTitle} 
                                        onChange={e => setNewItemTitle(e.target.value)} 
                                        className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 font-bold text-sm text-zinc-900 focus:outline-none focus:border-amber-500/40" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Preço (AOA)</label>
                                    <input 
                                        type="number" 
                                        placeholder="0" 
                                        value={newItemPrice} 
                                        onChange={e => setNewItemPrice(e.target.value)} 
                                        className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 font-bold text-sm text-zinc-900 focus:outline-none focus:border-amber-500/40" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Descrição</label>
                                    <textarea 
                                        placeholder="Descreve os detalhes da peça..." 
                                        value={newItemDesc} 
                                        onChange={e => setNewItemDesc(e.target.value)} 
                                        className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 font-bold text-sm text-zinc-900 focus:outline-none focus:border-amber-500/40 h-32 resize-none" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pb-8">
                             <button 
                                onClick={() => handleSaveItem(true)} 
                                disabled={!newItemTitle || isAiProcessing}
                                className="w-full py-4 bg-transparent text-amber-600 border border-amber-600 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                Salvar e Continuar
                            </button>
                            <GradientButton 
                                onClick={() => handleSaveItem(false)} 
                                disabled={!newItemTitle || isAiProcessing}
                                className="!py-4 !rounded-2xl !text-[11px]"
                            >
                                CONCLUIR CADASTRO
                            </GradientButton>
                        </div>
                    </div>
                </div>
            )}

            {movingProduct && (
                <div className="fixed inset-0 z-[210] bg-black/70 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn" onClick={() => setMovingProduct(null)}>
                    <div className="bg-white rounded-[2.5rem] w-full max-sm p-8 flex flex-col gap-6 animate-modalZoomIn shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                          <h2 className="text-lg font-black uppercase tracking-tighter italic text-zinc-900">Relocar Item</h2>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Escolha o novo destino</p>
                        </div>
                        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 scrollbar-hide">
                            <button 
                                onClick={() => { onMoveProductToFolder(movingProduct.id, null); setMovingProduct(null); }}
                                className={`w-full p-4 rounded-xl border font-bold text-[11px] uppercase tracking-tight transition-all flex items-center justify-between ${!movingProduct.folder_id ? 'bg-amber-600 text-white border-amber-600' : 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-amber-600'}`}
                            >
                                <span>Geral / Vitrine</span>
                            </button>
                            {folders.map(folder => (
                                <button 
                                    key={folder.id}
                                    onClick={() => { onMoveProductToFolder(movingProduct.id, folder.id); setMovingProduct(null); }}
                                    className={`w-full p-4 rounded-xl border font-bold text-[11px] uppercase tracking-tight transition-all flex items-center justify-between ${movingProduct.folder_id === folder.id ? 'bg-amber-600 text-white border-amber-600' : 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-amber-600'}`}
                                >
                                    <span className="truncate pr-4">{folder.title}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setMovingProduct(null)} className="text-[11px] font-bold uppercase text-zinc-400 tracking-widest hover:text-zinc-900 transition-colors">Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;
