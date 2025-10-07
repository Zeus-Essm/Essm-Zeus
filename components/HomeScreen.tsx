import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Profile, Category, Post, Item, MarketplaceType } from '../types';
import { CATEGORIES, INITIAL_STORIES } from '../constants';
import { 
    PencilIcon, CameraIcon, ShoppingBagIcon, UserIcon, CompassIcon, 
    GiftIcon, PlusIcon, EllipsisVerticalIcon
} from './IconComponents';
import ImageViewModal from './ImageViewModal';


// Props definition based on App.tsx usage
interface HomeScreenProps {
  loggedInProfile: Profile;
  viewedProfileId: string | null;
  onUpdateProfileImage: (imageDataUrl: string) => void;
  onUpdateCoverImage: (imageDataUrl: string) => void;
  onUpdateProfile: (updates: { username?: string; bio?: string }) => void;
  onSelectCategory: (category: Category) => void;
  onNavigateToFeed: () => void;
  onNavigateToMyLooks: () => void;
  onNavigateToCart: () => void;
  onNavigateToRewards: () => void;
  onStartTryOn: () => void;
  isCartAnimating: boolean;
  onBack: () => void;
  posts: Post[];
  onItemClick: (item: Item) => void;
  onViewProfile: (profileId: string) => void;
  // FIX: Added missing props to fix type error in App.tsx
  onNavigateToSettings: () => void;
  onSignOut: () => void;
  isPreviewingAsVisitor: boolean;
  onToggleVisitorPreview: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  loggedInProfile,
  viewedProfileId,
  onUpdateProfileImage,
  onUpdateCoverImage,
  onUpdateProfile,
  onSelectCategory,
  onNavigateToFeed,
  onNavigateToMyLooks,
  onNavigateToCart,
  onNavigateToRewards,
  onStartTryOn,
  isCartAnimating,
  onBack,
  posts,
  onItemClick,
  onViewProfile,
  onNavigateToSettings,
  onSignOut,
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'market' | 'posts'>('market');
  const [activeMarketplaceType, setActiveMarketplaceType] = useState<MarketplaceType>('fashion');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const marketplaceTypesContainerRef = useRef<HTMLDivElement>(null);

  const [localProfilePosts, setLocalProfilePosts] = useState<Post[]>([]);
  const [viewingPostIndex, setViewingPostIndex] = useState<number | null>(null);

  const isMyProfile = !viewedProfileId || viewedProfileId === loggedInProfile.id;

  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  
  const featuredCategories: Category[] = [
      CATEGORIES.find(c => c.id === 'lv')!,
      CATEGORIES.find(c => c.id === 'new_feeling')!,
  ].filter(Boolean);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || featuredCategories.length === 0) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
                    setCurrentIndex(index);
                }
            });
        },
        {
            root: container,
            threshold: 0.6,
        }
    );

    const children = Array.from(container.children);
    children.forEach(child => {
        if (child instanceof Element) {
            observer.observe(child);
        }
    });

    return () => {
        children.forEach(child => {
            if (child instanceof Element) {
                observer.unobserve(child);
            }
        });
    };
  }, [featuredCategories.length]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

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
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', viewedProfileId)
          .single();
        if (error) throw error;
        setProfile(data);
      } catch (err: any) {
        setError("Não foi possível carregar o perfil.");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [viewedProfileId, loggedInProfile]);
  
  useEffect(() => {
      if (profile) {
          setLocalProfilePosts(posts.filter(p => p.user.id === profile.id));
      } else {
          setLocalProfilePosts([]);
      }
  }, [profile, posts]);

  const handleLike = (postId: string) => {
    setLocalProfilePosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked } : post
      )
    );
  };

  const handlePrev = () => {
    if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const newIndex = Math.max(0, currentIndex - 1);
        const item = container.children[newIndex] as HTMLElement;
        if (item) {
            const scrollLeft = item.offsetLeft - container.offsetLeft - (container.offsetWidth - item.offsetWidth) / 2;
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    }
  };

  const handleNext = () => {
      if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const newIndex = Math.min(featuredCategories.length - 1, currentIndex + 1);
          const item = container.children[newIndex] as HTMLElement;
          if (item) {
              const scrollLeft = item.offsetLeft - container.offsetLeft - (container.offsetWidth - item.offsetWidth) / 2;
              container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
          }
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (dataUrl: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfile = () => {
    if (!profile) return;
    const newUsername = prompt("Novo nome de usuário:", profile.username);
    if (newUsername !== null) {
      const newBio = prompt("Nova bio:", profile.bio || "");
      if (newBio !== null) {
        onUpdateProfile({ 
            username: newUsername || profile.username, 
            bio: newBio || profile.bio 
        });
      }
    }
  };

  const handleMarketplaceTypeClick = (type: MarketplaceType) => {
    setActiveMarketplaceType(type);
    if (marketplaceTypesContainerRef.current) {
      const container = marketplaceTypesContainerRef.current;
      
      const clickedButton = Array.from(container.children).find(
        (child) => (child as HTMLElement).dataset.type === type
      ) as HTMLElement | undefined;

      if (clickedButton) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = clickedButton.getBoundingClientRect();
        
        // Calculate the ideal scroll position to center the button
        const scrollLeft = container.scrollLeft + buttonRect.left - containerRect.left - (containerRect.width / 2) + (buttonRect.width / 2);
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full w-full bg-[var(--bg-main)] text-[var(--text-primary)]">Carregando perfil...</div>;
  }

  if (error || !profile) {
    return <div className="flex items-center justify-center h-full w-full bg-[var(--bg-main)] text-red-400 p-4">{error || "Perfil não encontrado."}</div>;
  }

  const defaultCover = 'https://i.postimg.cc/wTQh27Rt/Captura-de-Tela-2025-09-19-a-s-2-10-14-PM.png';
  const defaultAvatar = 'https://i.postimg.cc/pL7M6Vgv/bv.jpg';
  
  const marketplaceTypes: { type: MarketplaceType; label: string }[] = [
    { type: 'fashion', label: 'Moda' },
    { type: 'restaurant', label: 'Restaurantes' },
    { type: 'supermarket', label: 'Supermercados' },
    { type: 'beauty', label: 'Beleza' },
    { type: 'technology', label: 'Tecnologia' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Main Content */}
      <main className="flex-grow overflow-y-auto pb-20">
        <header className="relative">
          <div className="h-48 bg-zinc-800">
            <img src={profile.cover_image_url || defaultCover} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            {isMyProfile && (
              <>
                <button onClick={() => coverImageInputRef.current?.click()} className="absolute bottom-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/80 transition-colors">
                  <CameraIcon className="w-5 h-5" />
                </button>
                <input type="file" accept="image/*" ref={coverImageInputRef} onChange={(e) => handleFileChange(e, onUpdateCoverImage)} className="hidden" />
              </>
            )}
          </div>

          <div className="px-4 pb-4 -mt-16 z-10">
            <div className="relative w-32 h-32 rounded-full border-4 border-[var(--bg-main)] shadow-lg">
              <img src={profile.profile_image_url || defaultAvatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
              {isMyProfile && (
                <>
                  <button onClick={() => profileImageInputRef.current?.click()} className="absolute bottom-1 right-1 p-1.5 bg-black/50 rounded-full hover:bg-black/80 transition-colors">
                    <CameraIcon className="w-5 h-5" />
                  </button>
                  <input type="file" accept="image/*" ref={profileImageInputRef} onChange={(e) => handleFileChange(e, onUpdateProfileImage)} className="hidden" />
                </>
              )}
            </div>
          </div>
        </header>

        <div className="px-4">
          <div className="flex items-start justify-between">
              <div>
                 <h1 className="text-2xl font-bold">{profile.username}</h1>
                 {profile.bio && <p className="text-sm text-[var(--text-secondary)] mt-1">{profile.bio}</p>}
              </div>
              {isMyProfile && (
                <div className="flex items-center gap-1 -mt-1">
                    <button onClick={handleEditProfile} className="p-2 rounded-full hover:bg-yellow-400/10">
                        <PencilIcon className="w-5 h-5 text-[var(--accent-primary)]"/>
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setMenuOpen(prev => !prev)} className="p-2 rounded-full hover:bg-yellow-400/10">
                            <EllipsisVerticalIcon className="w-5 h-5 text-[var(--accent-primary)]"/>
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-lg z-20 animate-fadeIn">
                                <button onClick={() => { onNavigateToSettings(); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-yellow-400/10 rounded-t-lg">
                                    Configurações
                                </button>
                                <button onClick={() => { onSignOut(); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-b-lg">
                                    Sair
                                </button>
                            </div>
                        )}
                    </div>
                </div>
              )}
          </div>
        </div>

        <div className="px-4 py-3 my-4 flex justify-around text-center">
            <div><span className="font-bold">{localProfilePosts.length}</span><p className="text-xs text-[var(--text-secondary)]">Publicações</p></div>
            <div><span className="font-bold">1.2M</span><p className="text-xs text-[var(--text-secondary)]">Seguidores</p></div>
            <div><span className="font-bold">150</span><p className="text-xs text-[var(--text-secondary)]">Seguindo</p></div>
        </div>
        
        <div className="relative border-b border-t border-[var(--border-primary)] py-4">
            <h2 className="text-xl font-bold px-4 mb-3 text-[var(--accent-primary)] text-glow tracking-wide">Destaques</h2>
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 space-x-4 pl-4 pr-16 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
                {featuredCategories.map((category, index) => (
                    <div
                        key={category.id}
                        onClick={() => onSelectCategory(category)}
                        className="relative flex-shrink-0 w-[85%] h-80 snap-center"
                        data-index={index}
                    >
                        <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group transform hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-black/30">
                            {category.video ? (
                                <video 
                                    src={category.video} 
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-5">
                                <h3 className="text-4xl font-black tracking-tighter uppercase leading-tight text-glow text-white">{category.name}</h3>
                            </div>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-xl font-bold border-2 border-yellow-400 text-yellow-400 rounded-full px-6 py-3">Ver</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {currentIndex > 0 && (
                <button
                    onClick={handlePrev}
                    className="absolute left-1 top-1/2 -translate-y-1/2 mt-2 p-2 bg-black/40 rounded-full hover:bg-black/70 backdrop-blur-sm transition-all z-10"
                    aria-label="Anterior"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-yellow-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
            )}
            {currentIndex < featuredCategories.length - 1 && (
                <button
                    onClick={handleNext}
                    className="absolute right-1 top-1/2 -translate-y-1/2 mt-2 p-2 bg-black/40 rounded-full hover:bg-black/70 backdrop-blur-sm transition-all z-10"
                    aria-label="Próximo"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-yellow-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            )}
        </div>

        <div className="mt-4 border-b border-[var(--border-primary)] flex">
          <button onClick={() => setActiveTab('market')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'market' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>Mercado</button>
          <button onClick={() => setActiveTab('posts')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'posts' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>Publicações</button>
        </div>

        <div>
            {activeTab === 'market' ? (
                <div>
                    <div className="px-4 py-2 border-b border-[var(--border-primary)]">
                        <div ref={marketplaceTypesContainerRef} className="flex space-x-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth">
                        {marketplaceTypes.map(({ type, label }) => (
                            <button
                                key={type}
                                data-type={type}
                                onClick={() => handleMarketplaceTypeClick(type)}
                                className={`py-2 px-3 text-sm font-semibold whitespace-nowrap rounded-md transition-colors ${
                                activeMarketplaceType === type
                                    ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)]'
                                    : 'bg-transparent text-[var(--text-secondary)] hover:bg-yellow-400/10'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                        </div>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                        {CATEGORIES.filter(c => c.type === activeMarketplaceType).map(category => (
                        <div
                            key={category.id}
                            onClick={() => onSelectCategory(category)}
                            className="relative w-full h-56 rounded-2xl overflow-hidden cursor-pointer group transform hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-yellow-400/20"
                        >
                            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                            <h3 className="text-2xl font-black tracking-tighter uppercase text-white">{category.name}</h3>
                            </div>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-lg font-bold border-2 border-yellow-400 text-yellow-400 rounded-full px-5 py-2">Ver</span>
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

      {/* Bottom Nav */}
      <nav className="absolute bottom-0 left-0 right-0 flex justify-around items-center p-2 bg-[var(--bg-header)] border-t border-[var(--border-primary)] backdrop-blur-md">
        <button onClick={onNavigateToFeed} className="flex flex-col items-center text-[var(--text-secondary)] hover:text-white p-1 w-1/5">
          <CompassIcon className="w-7 h-7" />
          <span className="text-[10px]">Feed</span>
        </button>
        <button onClick={onNavigateToCart} className="relative flex flex-col items-center text-[var(--text-secondary)] hover:text-white p-1 w-1/5">
          <ShoppingBagIcon className={`w-7 h-7 transition-transform ${isCartAnimating ? 'scale-125' : ''}`} />
          <span className="text-[10px]">Carrinho</span>
        </button>
        <button onClick={onStartTryOn} className="w-1/5 flex justify-center">
            <div className="p-3 bg-[var(--accent-primary)] rounded-xl transform hover:scale-110 transition-transform">
                <PlusIcon className="w-7 h-7 text-[var(--accent-primary-text)]" />
            </div>
        </button>
         <button onClick={onNavigateToRewards} className="flex flex-col items-center text-[var(--text-secondary)] hover:text-white p-1 w-1/5">
          <GiftIcon className="w-7 h-7" />
          <span className="text-[10px]">Recompensas</span>
        </button>
        <button className="flex flex-col items-center text-[var(--accent-primary)] p-1 w-1/5">
          <UserIcon className="w-7 h-7" />
          <span className="text-[10px]">Perfil</span>
        </button>
      </nav>

      {viewingPostIndex !== null && (
        <ImageViewModal
            posts={localProfilePosts}
            startIndex={viewingPostIndex}
            onClose={() => setViewingPostIndex(null)}
            onLike={handleLike}
            onItemClick={(item) => {
                setViewingPostIndex(null);
                onItemClick(item);
            }}
            onViewProfile={(profileId) => {
                setViewingPostIndex(null);
                onViewProfile(profileId);
            }}
        />
      )}
    </div>
  );
};

export default HomeScreen;