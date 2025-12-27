
import React, { useState, useRef, useMemo } from 'react';
import type { Profile, Category, Post, Item, MarketplaceType } from '../types';
import { 
    PlusIcon, UserIcon, 
    ChevronDownIcon, MenuIcon,
    LooksIcon,
    ChatBubbleIcon, BellIcon, PencilIcon, SearchIcon
} from './IconComponents';
import BioEditModal from './BioEditModal';
import ImageViewModal from './ImageViewModal';
import CommentsModal from './CommentsModal';

interface HomeScreenProps {
  loggedInProfile: Profile;
  viewedProfileId: string | null;
  realBusinesses?: Category[];
  onUpdateProfile: (updates: { username?: string, bio?: string, name?: string }) => void;
  onUpdateProfileImage: (imageDataUrl: string) => void;
  onSelectCategory: (category: Category) => void;
  onNavigateToFeed: () => void;
  onNavigateToMyLooks: () => void;
  onNavigateToCart: () => void;
  onNavigateToChat: () => void;
  onNavigateToRewards: () => void;
  onStartTryOn: () => void;
  isCartAnimating: boolean;
  onBack: () => void;
  posts: Post[];
  onItemClick: (item: Item) => void;
  onViewProfile: (profileId: string) => void;
  onNavigateToSettings: () => void;
  onSignOut: () => void;
  unreadNotificationCount: number;
  unreadMessagesCount: number;
  onOpenNotificationsPanel: () => void;
  isFollowing: boolean;
  onToggleFollow: (id: string) => void;
  followersCount: number;
  followingCount: number;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onSearchClick?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  loggedInProfile,
  onUpdateProfile,
  onUpdateProfileImage,
  onSelectCategory,
  onNavigateToSettings,
  onNavigateToChat,
  onOpenNotificationsPanel,
  unreadNotificationCount,
  unreadMessagesCount,
  followersCount,
  followingCount,
  posts,
  onLikePost,
  onAddComment,
  onItemClick,
  onViewProfile,
  onSearchClick,
  realBusinesses = []
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'market'>('market'); 
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceType>('fashion');
  const [viewingPostIndex, setViewingPostIndex] = useState<number | null>(null);
  const [commentingPost, setCommentingPost] = useState<Post | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdateProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const marketplaceItems = useMemo(() => {
    return realBusinesses.filter(c => c.type === selectedCategory);
  }, [selectedCategory, realBusinesses]);

  const userPosts = posts.filter(p => p.user.id === loggedInProfile.user_id);

  return (
    <div className="w-full h-full flex flex-col bg-white text-zinc-900 overflow-hidden font-sans">
      <header className="px-4 pt-4 pb-2 flex items-center justify-between bg-white shrink-0 z-10">
          <div className="flex items-center gap-1 cursor-pointer active:opacity-60 transition-opacity">
              <h1 className="text-lg font-bold tracking-tight text-zinc-900 uppercase italic">
                {loggedInProfile.username || "perfil"}
              </h1>
              <ChevronDownIcon className="w-3.5 h-3.5 text-zinc-800" strokeWidth={3} />
          </div>
          <div className="flex items-center gap-1">
              {onSearchClick && (
                  <button onClick={onSearchClick} className="p-2 active:scale-90 transition-transform">
                      <SearchIcon className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
                  </button>
              )}
              <button onClick={onNavigateToChat} className="relative p-2 active:scale-90 transition-transform">
                  <ChatBubbleIcon className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
                  {unreadMessagesCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadMessagesCount}
                      </span>
                  )}
              </button>
              <button onClick={onOpenNotificationsPanel} className="p-2 active:scale-90 transition-transform">
                  <BellIcon className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
                  {unreadNotificationCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadNotificationCount}
                      </span>
                  )}
              </button>
              <button onClick={onNavigateToSettings} className="p-2 active:scale-90 transition-transform">
                  <MenuIcon className="w-7 h-7 text-zinc-900" strokeWidth={2.5} />
              </button>
          </div>
      </header>

      <main className="flex-grow overflow-y-auto pb-24">
        <div className="px-5 pt-4">
            <div className="flex items-center gap-4 mb-4">
                <div className="relative shrink-0" onClick={handleAvatarClick}>
                    <div className={`w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 to-amber-600 shadow-sm cursor-pointer active:scale-95 transition-transform`}>
                        <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-100 flex items-center justify-center">
                                {loggedInProfile.avatar_url ? (
                                    <img src={loggedInProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <PlusIcon className="w-6 h-6 text-zinc-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <button 
                        className="absolute bottom-0 right-0 w-7 h-7 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-md"
                    >
                        <PencilIcon className="w-3.5 h-3.5" strokeWidth={4} />
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </div>

                <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-md text-zinc-900 truncate uppercase tracking-tighter italic leading-none">
                            {loggedInProfile.full_name || loggedInProfile.username}
                        </h2>
                        <button onClick={() => setIsEditingBio(true)} className="p-2 bg-zinc-50 rounded-full text-zinc-400 hover:text-amber-500 active:scale-90 transition-all">
                            <PencilIcon className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {/* Botão de Adicionar Foto Chamativo se vazio */}
                    {!loggedInProfile.avatar_url && (
                        <button 
                            onClick={handleAvatarClick}
                            className="mt-1 px-4 py-1.5 bg-amber-500 text-white text-[9px] font-black uppercase rounded-xl tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
                        >
                            ADICIONAR FOTO
                        </button>
                    )}

                    <div className="text-[11px] text-zinc-600 font-medium leading-tight line-clamp-3 mt-2 whitespace-pre-line">
                        {loggedInProfile.bio || "Membro exclusivo da comunidade PUMP."}
                    </div>
                </div>
            </div>

            <div className="flex justify-around py-4 border-t border-b border-zinc-50 mb-2">
                <div className="flex flex-col items-center">
                    <span className="text-md font-bold text-zinc-900">{userPosts.length}</span>
                    <span className="text-[10px] text-zinc-400 font-black uppercase tracking-tight">posts</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-md font-bold text-zinc-900">
                        {followersCount >= 1000 ? `${(followersCount/1000).toFixed(1).replace('.', ',')} mil` : followersCount}
                    </span>
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
            onClick={() => setActiveTab('market')} 
            className={`flex-1 py-4 flex justify-center items-center relative transition-colors ${activeTab === 'market' ? 'text-amber-600' : 'text-zinc-400'}`}
          >
            <span className="text-xs font-bold uppercase tracking-widest">MERCADO</span>
            {activeTab === 'market' && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-amber-600"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('posts')} 
            className={`flex-1 py-4 flex justify-center items-center relative transition-colors ${activeTab === 'posts' ? 'text-amber-600' : 'text-zinc-400'}`}
          >
            <span className="text-xs font-bold uppercase tracking-widest">PUBLICAÇÕES</span>
            {activeTab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-amber-600"></div>}
          </button>
        </div>

        <div className="min-h-[400px] bg-white">
            {activeTab === 'posts' && (
                <div className="grid grid-cols-2 gap-4 animate-fadeIn p-4">
                    {userPosts.length > 0 ? (
                        userPosts.map((post, index) => (
                            <div 
                                key={post.id} 
                                onClick={() => setViewingPostIndex(index)}
                                className="aspect-[2/3] bg-zinc-100 rounded-[2rem] shadow-sm overflow-hidden active:opacity-80 transition-opacity cursor-pointer border border-zinc-100"
                            >
                                <img src={post.image} alt="" className="w-full h-full object-cover" />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 py-32 text-center flex flex-col items-center opacity-30">
                            <LooksIcon className="w-12 h-12 text-zinc-400 mb-4" strokeWidth={1} />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Nenhuma publicação ainda</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'market' && (
                <div className="animate-fadeIn">
                    <div 
                      ref={categoryScrollRef}
                      className="flex overflow-x-auto gap-3 px-4 py-4 scrollbar-hide"
                    >
                        {[
                            { label: 'Moda', id: 'fashion' },
                            { label: 'Restaurantes', id: 'restaurant' },
                            { label: 'Supermercados', id: 'supermarket' },
                            { label: 'Beleza', id: 'beauty' },
                            { label: 'Decoração', id: 'decoration' }
                        ].map((cat) => (
                            <button 
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id as MarketplaceType)}
                                className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat.id ? 'bg-amber-600 text-white shadow-md' : 'bg-zinc-50 text-zinc-500 border border-zinc-100'}`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 px-4 pb-12">
                        {marketplaceItems.length > 0 ? marketplaceItems.map(category => (
                            <div 
                                key={category.id} 
                                onClick={() => onSelectCategory(category)} 
                                className="relative aspect-[2/3.5] rounded-[2rem] overflow-hidden group shadow-lg active:scale-[0.98] transition-all border border-zinc-100"
                            >
                                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">{category.name}</h3>
                                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2 italic">Loja Real</p>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-2 py-20 text-center opacity-30 flex flex-col items-center">
                                <SearchIcon className="w-10 h-10 text-zinc-300 mb-4" />
                                <p className="text-[10px] font-bold uppercase tracking-widest italic text-zinc-400">Nenhuma loja real nesta categoria ainda...</p>
                            </div>
                        )}
                    </div>
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
            currentUser={loggedInProfile} 
            onClose={() => setCommentingPost(null)} 
            onAddComment={onAddComment} 
          />
      )}

      {isEditingBio && (
          <BioEditModal 
            profile={loggedInProfile}
            onClose={() => setIsEditingBio(false)} 
            onSave={(updates) => {
                onUpdateProfile({ name: updates.name, bio: updates.bio, username: updates.username });
                setIsEditingBio(false);
            }} 
          />
      )}
    </div>
  );
};

export default HomeScreen;
