
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Profile, Category, Post, Item, MarketplaceType } from '../types';
import { CATEGORIES, INITIAL_STORIES } from '../constants';
import { 
    PlusIcon, CameraIcon, ShoppingBagIcon, UserIcon, CompassIcon, 
    GiftIcon, VerifiedIcon, ChevronDownIcon, MenuIcon,
    BellIcon, PencilIcon, ChatBubbleIcon, StarIcon, ShieldCheckIcon
} from './IconComponents';
import BioEditModal from './BioEditModal';
import GradientButton from './GradientButton';

// Self-contained modal for viewing profile posts in an Instagram-style overlay.
const ProfilePostModal: React.FC<{
    posts: Post[];
    startIndex: number;
    onClose: () => void;
}> = ({ posts, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const post = posts[currentIndex];

    const goToPrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : posts.length - 1));
    };

    const goToNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(prev => (prev < posts.length - 1 ? prev + 1 : 0));
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
            if (event.key === 'ArrowLeft') goToPrevious(new MouseEvent('click') as any);
            if (event.key === 'ArrowRight') goToNext(new MouseEvent('click') as any);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);

    if (!post) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-modalFadeIn"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors z-20"
                aria-label="Fechar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            {posts.length > 1 && (
                 <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 rounded-full hover:bg-black/70 backdrop-blur-sm transition-all z-20"
                    aria-label="Anterior"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
            )}

            <div className="w-[90vw] max-w-xl aspect-square bg-black animate-modalZoomIn" onClick={(e) => e.stopPropagation()}>
                <img src={post.image} alt="Post" className="w-full h-full object-contain" />
            </div>

             {posts.length > 1 && (
                <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 rounded-full hover:bg-black/70 backdrop-blur-sm transition-all z-20"
                    aria-label="Próximo"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            )}
        </div>
    );
};

interface HomeScreenProps {
  loggedInProfile: Profile;
  viewedProfileId: string | null;
  onUpdateProfile: (updates: { username?: string, bio?: string }) => void;
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
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  loggedInProfile,
  viewedProfileId,
  onUpdateProfile,
  onUpdateProfileImage,
  onSelectCategory,
  onNavigateToFeed,
  onNavigateToMyLooks,
  onNavigateToCart,
  onNavigateToChat,
  onNavigateToRewards,
  onStartTryOn,
  isCartAnimating,
  onBack,
  posts,
  onItemClick,
  onViewProfile,
  onNavigateToSettings,
  onSignOut,
  unreadNotificationCount,
  unreadMessagesCount,
  onOpenNotificationsPanel,
  isFollowing,
  onToggleFollow,
  followersCount,
  followingCount
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'market' | 'posts'>('market');
  const [activeMarketplaceType, setActiveMarketplaceType] = useState<MarketplaceType>('fashion');
  const marketplaceTypesContainerRef = useRef<HTMLDivElement>(null);
  const [localProfilePosts, setLocalProfilePosts] = useState<Post[]>([]);
  const [viewingPostIndex, setViewingPostIndex] = useState<number | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const isMyProfile = !viewedProfileId || viewedProfileId === loggedInProfile.id;
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!viewedProfileId) {
        setProfile(loggedInProfile);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', viewedProfileId).single();
        if (error) throw error;
        setProfile(data);
      } catch (err: any) {
        setError("Não foi possível carregar o perfil.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [viewedProfileId, loggedInProfile]);
  
  useEffect(() => {
      if (profile) setLocalProfilePosts(posts.filter(p => p.user.id === profile.id));
      else setLocalProfilePosts([]);
  }, [profile, posts]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (dataUrl: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMarketplaceTypeClick = (type: MarketplaceType) => {
    setActiveMarketplaceType(type);
    if (marketplaceTypesContainerRef.current) {
      const container = marketplaceTypesContainerRef.current;
      const clickedButton = Array.from(container.children).find(child => (child as HTMLElement).dataset.type === type) as HTMLElement | undefined;
      if (clickedButton) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = clickedButton.getBoundingClientRect();
        const scrollLeft = container.scrollLeft + buttonRect.left - containerRect.left - (containerRect.width / 2) + (buttonRect.width / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full w-full bg-[var(--bg-main)]">Carregando...</div>;
  if (error || !profile) return <div className="flex items-center justify-center h-full w-full bg-[var(--bg-main)] text-red-400 p-4">{error || "Perfil não encontrado."}</div>;
  
  const marketplaceTypes: { type: MarketplaceType; label: string }[] = [
    { type: 'fashion', label: 'Moda' },
    { type: 'restaurant', label: 'Restaurantes' },
    { type: 'supermarket', label: 'Supermercados' },
    { type: 'beauty', label: 'Beleza' },
    { type: 'technology', label: 'Tecnologia' },
    { type: 'decoration', label: 'Decoração' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      <header className="px-4 pt-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold">{profile.username}</h1>
              {profile.verification_status === 'verified' ? (
                  <span title="Perfil Verificado">
                    <ShieldCheckIcon className="w-5 h-5 text-zinc-800 dark:text-white" />
                  </span>
              ) : profile.reward_points && profile.reward_points >= 1000 ? (
                  <span title="Usuário Destaque">
                    <VerifiedIcon className="w-5 h-5 text-[var(--accent-primary)]" />
                  </span>
              ) : null}
              <ChevronDownIcon className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-5 relative">
              <button onClick={onNavigateToChat} className="relative">
                  <ChatBubbleIcon className="w-7 h-7" />
                  {unreadMessagesCount > 0 && (
                     <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-[var(--bg-main)]">
                        {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                     </span>
                  )}
              </button>
              <button onClick={onOpenNotificationsPanel} className="relative">
                <BellIcon className="w-7 h-7" />
                {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-[var(--bg-main)]">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </span>
                )}
              </button>
              <button onClick={onNavigateToSettings}><MenuIcon className="w-7 h-7" /></button>
          </div>
      </header>

      <main className="flex-grow overflow-y-auto pb-20 pt-4">
        <div className="px-4 flex items-start justify-between">
            <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-full p-0.5 bg-[var(--bg-tertiary)] flex items-center justify-center overflow-hidden">
                        {profile.profile_image_url ? (
                            <img src={profile.profile_image_url} alt="Profile" className="w-full h-full object-cover rounded-full border-2 border-[var(--bg-main)]" />
                        ) : (
                            <UserIcon className="w-12 h-12 text-[var(--text-secondary)] opacity-40" />
                        )}
                    </div>
                    {isMyProfile && (
                    <>
                        <button onClick={() => profileImageInputRef.current?.click()} className="absolute bottom-0 -right-1 p-1.5 bg-black/60 rounded-full border-2 border-[var(--bg-main)]" aria-label="Alterar foto">
                            <CameraIcon className="w-5 h-5 text-white" />
                        </button>
                        <input type="file" accept="image/*" ref={profileImageInputRef} onChange={(e) => handleFileChange(e, onUpdateProfileImage)} className="hidden" />
                    </>
                    )}
                </div>
                <div className="flex-grow pt-2">
                    <p className="font-semibold text-sm">{profile.username}</p>
                    {profile.bio && <p className="text-sm text-[var(--text-tertiary)] whitespace-pre-line mt-1">{profile.bio}</p>}
                </div>
            </div>
            <div className="flex flex-col items-center space-y-4 pt-2 flex-shrink-0">
                {isMyProfile && (
                    <button onClick={() => setIsEditingBio(true)} className="p-1 text-[var(--text-secondary)]" aria-label="Editar bio">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                )}
                <button onClick={onNavigateToRewards}>
                    <img src="https://i.postimg.cc/YqhLvSCM/moeda-pump-coin.png" alt="Pontos" className="w-10 h-10" />
                </button>
            </div>
        </div>
        
        <div className="mt-4 py-3 flex justify-around text-center border-y border-[var(--border-primary)]">
            <div><span className="text-lg font-bold">{localProfilePosts.length}</span><p className="text-sm text-[var(--text-secondary)]">posts</p></div>
            <div><span className="text-lg font-bold">{followersCount}</span><p className="text-sm text-[var(--text-secondary)]">seguidores</p></div>
            <div><span className="text-lg font-bold">{followingCount}</span><p className="text-sm text-[var(--text-secondary)]">seguindo</p></div>
        </div>
        
        <div className="px-4 mt-4">
            {!isMyProfile && (
                 <div className="flex items-center gap-2">
                    {isFollowing ? (
                        <button 
                            onClick={() => onToggleFollow(profile.id)} 
                            className="flex-1 py-2.5 text-xs font-bold bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg border border-[var(--border-primary)] transition-all"
                        >
                            Seguindo
                        </button>
                    ) : (
                        <GradientButton onClick={() => onToggleFollow(profile.id)} className="flex-1 !py-2.5 text-xs">Seguir</GradientButton>
                    )}
                    <GradientButton onClick={onNavigateToChat} className="flex-1 !py-2.5 text-xs">Mensagem</GradientButton>
                </div>
            )}
        </div>

        <div className="border-b border-[var(--border-primary)] flex mt-4">
          <button onClick={() => setActiveTab('market')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider ${activeTab === 'market' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>Mercado</button>
          <button onClick={() => setActiveTab('posts')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider ${activeTab === 'posts' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>Publicações</button>
        </div>

        <div>
            {activeTab === 'market' ? (
                <div>
                    <div className="px-4 py-2 border-b border-[var(--border-primary)]">
                        <div ref={marketplaceTypesContainerRef} className="flex space-x-4 overflow-x-auto [&::-webkit-scrollbar]:hidden scroll-smooth">
                        {marketplaceTypes.map(({ type, label }) => (
                            <button key={type} data-type={type} onClick={() => handleMarketplaceTypeClick(type)} className={`py-2 px-3 text-sm font-semibold whitespace-nowrap rounded-md transition-colors ${activeMarketplaceType === type ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)]' : 'bg-transparent text-[var(--text-secondary)]'}`}>{label}</button>
                        ))}
                        </div>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                        {CATEGORIES.filter(c => c.type === activeMarketplaceType).map(category => (
                        <div key={category.id} onClick={() => onSelectCategory(category)} className="relative w-full h-56 rounded-2xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all shadow-lg">
                            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                            <h3 className="text-2xl font-black tracking-tighter uppercase text-white">{category.name}</h3>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-1 p-1">
                    {localProfilePosts.map((post, index) => (
                        <div key={post.id} onClick={() => setViewingPostIndex(index)} className="aspect-w-1 aspect-h-1 bg-zinc-800 rounded-sm cursor-pointer">
                           {post.image && <img src={post.image} alt="Post" className="w-full h-full object-cover"/>}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>

      {viewingPostIndex !== null && <ProfilePostModal posts={localProfilePosts} startIndex={viewingPostIndex} onClose={() => setViewingPostIndex(null)} />}
      {isEditingBio && profile && <BioEditModal initialUsername={profile.username} initialBio={profile.bio || ''} onClose={() => setIsEditingBio(false)} onSave={(newUsername, newBio) => { onUpdateProfile({ username: newUsername, bio: newBio }); setProfile(prev => prev ? { ...prev, username: newUsername, bio: newBio } : null); setIsEditingBio(false); }} />}
    </div>
  );
};

export default HomeScreen;
