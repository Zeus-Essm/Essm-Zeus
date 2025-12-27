
import React, { useState, useRef } from 'react';
import type { Profile, Category, Post, Item, MarketplaceType } from '../types';
import { 
    PlusIcon, UserIcon, 
    ChevronDownIcon, MenuIcon,
    ChatBubbleIcon, BellIcon, PencilIcon, SearchIcon, ArrowLeftIcon
} from './IconComponents';
import ImageViewModal from './ImageViewModal';
import CommentsModal from './CommentsModal';
import BioEditModal from './BioEditModal';

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
  onBack,
  viewedProfileId,
  realBusinesses = []
}) => {
  const isOwnProfile = !viewedProfileId || viewedProfileId === loggedInProfile.user_id;
  const [activeTab, setActiveTab] = useState<'market' | 'posts'>('market'); 
  const [selectedMarketSector, setSelectedMarketSector] = useState<MarketplaceType>('fashion');
  const [viewingPostIndex, setViewingPostIndex] = useState<number | null>(null);
  const [commentingPost, setCommentingPost] = useState<Post | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (isOwnProfile) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdateProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const userPosts = posts.filter(p => p.user.id === loggedInProfile.user_id);

  const marketSectors: { id: MarketplaceType; label: string }[] = [
    { id: 'fashion', label: 'Moda' },
    { id: 'restaurant', label: 'Restaurantes' },
    { id: 'supermarket', label: 'Supermercados' },
    { id: 'beauty', label: 'Beleza' },
    { id: 'technology', label: 'Tecnologia' },
    { id: 'decoration', label: 'Casa' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-white text-zinc-900 overflow-hidden font-sans">
      {/* Header Fixo - Alinhado com a captura */}
      <header className="px-5 pt-5 pb-3 flex items-center justify-between bg-white shrink-0 z-10">
          <div className="flex items-center gap-2">
              {!isOwnProfile && (
                  <button onClick={onBack} className="p-2 -ml-2 rounded-xl bg-zinc-50 text-zinc-400">
                      <ArrowLeftIcon className="w-5 h-5" />
                  </button>
              )}
              <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => isOwnProfile && onNavigateToSettings()}>
                  <h1 className="text-2xl font-black tracking-tighter text-zinc-900 uppercase italic">
                    {loggedInProfile.username || "CONVIDADO"}
                  </h1>
                  <ChevronDownIcon className="w-4 h-4 text-zinc-800 transition-transform group-hover:translate-y-0.5" strokeWidth={4} />
              </div>
          </div>
          <div className="flex items-center gap-1">
              <button onClick={onSearchClick} className="p-2.5 active:scale-90 transition-transform">
                  <SearchIcon className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
              </button>
              <button onClick={onNavigateToChat} className="relative p-2.5 active:scale-90 transition-transform">
                  <ChatBubbleIcon className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
                  {unreadMessagesCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadMessagesCount}
                      </span>
                  )}
              </button>
              <button onClick={onOpenNotificationsPanel} className="relative p-2.5 active:scale-90 transition-transform">
                  <BellIcon className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
                  {unreadNotificationCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadNotificationCount}
                      </span>
                  )}
              </button>
              <button onClick={onNavigateToSettings} className="p-2.5 active:scale-90 transition-transform">
                  <MenuIcon className="w-7 h-7 text-zinc-900" strokeWidth={2.5} />
              </button>
          </div>
      </header>

      <main className="flex-grow overflow-y-auto pb-24">
        {/* Perfil Header - Estilo Círculo com Borda Laranja */}
        <div className="px-6 py-4 flex items-center gap-6">
            <div className="relative shrink-0" onClick={handleAvatarClick}>
                <div className="w-24 h-24 rounded-full p-[3px] border-[2.5px] border-amber-500 flex items-center justify-center bg-white shadow-sm overflow-hidden">
                    <div className="w-full h-full rounded-full overflow-hidden bg-zinc-50">
                        {loggedInProfile.avatar_url ? (
                            <img src={loggedInProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-amber-400 to-amber-600">
                                <span className="text-3xl font-black text-white italic">P</span>
                            </div>
                        )}
                    </div>
                </div>
                {isOwnProfile && (
                    <div className="absolute bottom-0 right-0 w-7 h-7 bg-zinc-900 rounded-full border-2 border-white flex items-center justify-center text-white">
                        <PlusIcon className="w-4 h-4" strokeWidth={4} />
                    </div>
                )}
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>

            <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="font-black text-lg text-zinc-900 truncate uppercase italic leading-none">
                        {loggedInProfile.full_name || "USUÁRIO CONVIDADO"}
                    </h2>
                    {isOwnProfile && (
                        <button onClick={() => setIsEditingBio(true)}>
                            <PencilIcon className="w-4 h-4 text-zinc-300" />
                        </button>
                    )}
                </div>
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-snug">
                    {loggedInProfile.bio || "Explorando o PUMP sem limites."}
                </div>
            </div>
        </div>
        
        {/* Métricas Originais da Captura */}
        <div className="flex justify-between border-t border-zinc-50 mt-4 px-10 py-5">
            <div className="text-center">
                <p className="text-xl font-black text-zinc-900 leading-none">{userPosts.length}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">Posts</p>
            </div>
            <div className="text-center">
                <p className="text-xl font-black text-zinc-900 leading-none">
                    {followersCount >= 1000 ? `${(followersCount/1000).toFixed(1).replace('.', ',')}K` : followersCount}
                </p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">Seguidores</p>
            </div>
            <div className="text-center">
                <p className="text-xl font-black text-zinc-900 leading-none">{followingCount}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">Seguindo</p>
            </div>
        </div>

        {/* Abas da Captura - MERCADO / PUBLICAÇÕES */}
        <div className="flex bg-white sticky top-0 z-10 border-b border-zinc-100 mt-2">
          <button 
            onClick={() => setActiveTab('market')} 
            className={`flex-1 py-4 flex justify-center items-center relative transition-colors ${activeTab === 'market' ? 'text-amber-600' : 'text-zinc-400'}`}
          >
            <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">MERCADO</span>
            {activeTab === 'market' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-600"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('posts')} 
            className={`flex-1 py-4 flex justify-center items-center relative transition-colors ${activeTab === 'posts' ? 'text-amber-600' : 'text-zinc-400'}`}
          >
            <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">PUBLICAÇÕES</span>
            {activeTab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-600"></div>}
          </button>
        </div>

        <div className="min-h-[400px] bg-white">
            {activeTab === 'market' && (
                <div className="animate-fadeIn">
                    {/* Seletor de Categorias Estilo Pill - Horizontal Scroll */}
                    <div className="flex gap-2 overflow-x-auto px-5 py-6 scrollbar-hide">
                        {marketSectors.map(sector => (
                            <button
                                key={sector.id}
                                onClick={() => setSelectedMarketSector(sector.id)}
                                className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${selectedMarketSector === sector.id ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-zinc-50 text-zinc-400 border border-zinc-100'}`}
                            >
                                {sector.label}
                            </button>
                        ))}
                    </div>

                    {/* Grid de Lojas Real Filtrado */}
                    <div className="grid grid-cols-2 gap-4 px-5 pb-12">
                        {realBusinesses.filter(c => c.type === selectedMarketSector).length > 0 ? (
                            realBusinesses.filter(c => c.type === selectedMarketSector).map(category => (
                                <div 
                                    key={category.id} 
                                    onClick={() => onSelectCategory(category)} 
                                    className="relative aspect-[2/3] rounded-[2.5rem] overflow-hidden group shadow-xl active:scale-[0.98] transition-all border border-zinc-100 bg-zinc-900"
                                >
                                    <img 
                                        src={category.image} 
                                        alt={category.name} 
                                        className="w-full h-full object-cover opacity-90 transition-transform duration-[1.5s] group-hover:scale-110" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent flex flex-col justify-end p-6">
                                        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-tight drop-shadow-md">{category.name}</h3>
                                        <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-2 italic flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                            Loja Oficial
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 py-32 text-center opacity-30 flex flex-col items-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Aguardando novas lojas reais...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'posts' && (
                <div className="grid grid-cols-2 gap-4 animate-fadeIn p-5">
                    {userPosts.length > 0 ? (
                        userPosts.map((post, index) => (
                            <div 
                                key={post.id} 
                                onClick={() => setViewingPostIndex(index)}
                                className="aspect-[2/3] bg-zinc-50 rounded-[2.5rem] overflow-hidden shadow-md active:opacity-80 transition-opacity cursor-pointer border border-zinc-100"
                            >
                                <img src={post.image} alt="" className="w-full h-full object-cover" />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 py-32 text-center opacity-20 flex flex-col items-center">
                            <PlusIcon className="w-14 h-14 text-zinc-300 mb-4" strokeWidth={1} />
                            <p className="text-[10px] font-black uppercase tracking-[0.25em]">Nenhum look publicado</p>
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
