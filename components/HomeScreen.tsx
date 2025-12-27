
import React, { useState, useRef, useMemo } from 'react';
import type { Profile, Category, Post, Item, MarketplaceType } from '../types';
import { 
    PlusIcon, UserIcon, 
    ChevronDownIcon, MenuIcon,
    LooksIcon,
    ChatBubbleIcon, BellIcon, PencilIcon, SearchIcon, ArrowLeftIcon
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
  viewedProfileId,
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
  isFollowing,
  onToggleFollow,
  onBack,
  realBusinesses = []
}) => {
  const isOwnProfile = !viewedProfileId || viewedProfileId === loggedInProfile.user_id;
  const currentProfile = isOwnProfile ? loggedInProfile : (posts.find(p => p.user.id === viewedProfileId)?.user || {
      id: viewedProfileId || '',
      full_name: 'Utilizador',
      avatar_url: null,
      username: 'utilizador'
  } as any);

  const [activeTab, setActiveTab] = useState<'posts' | 'market'>(isOwnProfile ? 'market' : 'posts'); 
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceType>('fashion');
  const [viewingPostIndex, setViewingPostIndex] = useState<number | null>(null);
  const [commentingPost, setCommentingPost] = useState<Post | null>(null);

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

  const userPosts = posts.filter(p => p.user.id === (viewedProfileId || loggedInProfile.user_id));

  return (
    <div className="w-full h-full flex flex-col bg-white text-zinc-900 overflow-hidden font-sans">
      <header className="px-4 pt-4 pb-2 flex items-center justify-between bg-white shrink-0 z-10 border-b border-zinc-50">
          <div className="flex items-center gap-2">
              {!isOwnProfile && (
                  <button onClick={onBack} className="p-2 -ml-2 rounded-xl bg-zinc-50 text-zinc-400">
                      <ArrowLeftIcon className="w-5 h-5" />
                  </button>
              )}
              <div className="flex items-center gap-1 cursor-pointer">
                  <h1 className="text-lg font-bold tracking-tight text-zinc-900 uppercase italic">
                    {currentProfile.username || currentProfile.full_name || "perfil"}
                  </h1>
                  {isOwnProfile && <ChevronDownIcon className="w-3.5 h-3.5 text-zinc-800" strokeWidth={3} />}
              </div>
          </div>
          {isOwnProfile && (
              <div className="flex items-center gap-1">
                  <button onClick={onSearchClick} className="p-2 active:scale-90 transition-transform">
                      <SearchIcon className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
                  </button>
                  <button onClick={onNavigateToChat} className="relative p-2 active:scale-90 transition-transform">
                      <ChatBubbleIcon className="w-7 h-7 text-zinc-900" strokeWidth={1.5} />
                  </button>
                  <button onClick={onNavigateToSettings} className="p-2 active:scale-90 transition-transform">
                      <MenuIcon className="w-7 h-7 text-zinc-900" strokeWidth={2.5} />
                  </button>
              </div>
          )}
      </header>

      <main className="flex-grow overflow-y-auto pb-24">
        <div className="px-5 pt-4">
            <div className="flex items-center gap-4 mb-4">
                <div className="relative shrink-0" onClick={handleAvatarClick}>
                    <div className={`w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 to-amber-600 shadow-sm overflow-hidden`}>
                        <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                            {currentProfile.avatar_url ? (
                                <img src={currentProfile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <div className="w-full h-full bg-zinc-100 flex items-center justify-center rounded-full">
                                    <UserIcon className="w-8 h-8 text-zinc-300" />
                                </div>
                            )}
                        </div>
                    </div>
                    {isOwnProfile && (
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                            <PencilIcon className="w-3 h-3" strokeWidth={4} />
                        </div>
                    )}
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </div>

                <div className="flex-grow min-w-0">
                    <h2 className="font-bold text-md text-zinc-900 truncate uppercase tracking-tighter italic leading-none">
                        {currentProfile.full_name || currentProfile.username}
                    </h2>
                    
                    {!isOwnProfile ? (
                        <div className="flex gap-2 mt-2">
                            <button 
                                onClick={() => onToggleFollow(viewedProfileId!)}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isFollowing ? 'bg-zinc-100 text-zinc-600' : 'bg-amber-500 text-white shadow-lg'}`}
                            >
                                {isFollowing ? 'Seguindo' : 'Seguir'}
                            </button>
                            <button onClick={onNavigateToChat} className="px-4 py-2 bg-zinc-100 rounded-xl text-zinc-600 active:scale-95 transition-all">
                                <ChatBubbleIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
                            {loggedInProfile.bio || "Membro exclusivo PUMP."}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-around py-4 border-t border-b border-zinc-50 mb-2">
                <div className="flex flex-col items-center">
                    <span className="text-md font-bold text-zinc-900">{userPosts.length}</span>
                    <span className="text-[10px] text-zinc-400 font-black uppercase tracking-tight">posts</span>
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
            onClick={() => setActiveTab('posts')} 
            className={`flex-1 py-4 flex justify-center items-center relative transition-colors ${activeTab === 'posts' ? 'text-amber-600' : 'text-zinc-400'}`}
          >
            <span className="text-xs font-bold uppercase tracking-widest">LOOKS</span>
            {activeTab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-amber-600"></div>}
          </button>
          {isOwnProfile && (
              <button 
                onClick={() => setActiveTab('market')} 
                className={`flex-1 py-4 flex justify-center items-center relative transition-colors ${activeTab === 'market' ? 'text-amber-600' : 'text-zinc-400'}`}
              >
                <span className="text-xs font-bold uppercase tracking-widest">MERCADO</span>
                {activeTab === 'market' && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-amber-600"></div>}
              </button>
          )}
        </div>

        <div className="min-h-[400px] bg-white">
            {activeTab === 'posts' && (
                <div className="grid grid-cols-2 gap-4 animate-fadeIn p-4">
                    {userPosts.map((post, index) => (
                        <div key={post.id} onClick={() => setViewingPostIndex(index)} className="aspect-[2/3] bg-zinc-100 rounded-[2rem] overflow-hidden shadow-sm active:opacity-80 transition-opacity cursor-pointer border border-zinc-50">
                            <img src={post.image} alt="" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'market' && isOwnProfile && (
                <div className="grid grid-cols-2 gap-4 px-4 py-4 pb-12">
                    {realBusinesses.filter(c => c.type === selectedCategory).map(category => (
                        <div key={category.id} onClick={() => onSelectCategory(category)} className="relative aspect-[2/3.5] rounded-[2rem] overflow-hidden group shadow-lg active:scale-[0.98] transition-all border border-zinc-100">
                            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
                                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">{category.name}</h3>
                                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2 italic">Loja Real</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>

      {viewingPostIndex !== null && (
          <ImageViewModal posts={userPosts} startIndex={viewingPostIndex} onClose={() => setViewingPostIndex(null)} onLike={onLikePost} onItemClick={onItemClick} onViewProfile={onViewProfile} onComment={(id) => setCommentingPost(userPosts.find(p => p.id === id)!)} />
      )}
      {commentingPost && <CommentsModal post={commentingPost} currentUser={loggedInProfile} onClose={() => setCommentingPost(null)} onAddComment={onAddComment} />}
    </div>
  );
};

export default HomeScreen;
