

import React, { useRef, useState, useEffect } from 'react';
import type { Category, Profile, Post, MarketplaceType, Item } from '../types';
import { supabase } from '../services/supabaseClient';
import { CATEGORIES, ITEMS } from '../constants';
import { CompassIcon, LooksIcon, ShoppingBagIcon, UploadIcon, UserIcon, PencilIcon, CameraIcon, RepositionIcon, ArrowLeftIcon, EyeIcon, EllipsisVerticalIcon, MoonIcon, SunIcon } from './IconComponents';
import ImageViewModal from './ImageViewModal';

interface HomeScreenProps {
  loggedInProfile: Profile;
  viewedProfileId: string | null;
  onUpdateProfileImage: (imageDataUrl: string) => void;
  onUpdateCoverImage: (imageDataUrl: string) => void;
  onUpdateProfile: (updates: { username?: string, bio?: string }) => void;
  onSelectCategory: (category: Category) => void;
  onNavigateToFeed: () => void;
  onNavigateToMyLooks: () => void;
  onNavigateToCart: () => void;
  onNavigateToRewards: () => void;
  onStartTryOn: () => void;
  onSignOut: () => void;
  onBack: () => void;
  isCartAnimating: boolean;
  isPreviewingAsVisitor: boolean;
  onToggleVisitorPreview: () => void;
  posts: Post[];
  onItemClick: (item: any) => void; // Added for modal
  onViewProfile: (profileId: string) => void; // Added for modal
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; className?: string; }> = ({ icon, label, onClick, className = '' }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-2 p-3 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-secondary)] hover:bg-yellow-400/10 transition-all flex-1 text-center group ${className}`}>
        <div className="w-8 h-8 text-[var(--accent-primary)] group-hover:text-yellow-300 transition-colors">{icon}</div>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors">{label}</span>
    </button>
);

const SignOutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);

const MessageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);


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
    onSignOut,
    onBack,
    isCartAnimating,
    isPreviewingAsVisitor,
    onToggleVisitorPreview,
    posts,
    onItemClick,
    onViewProfile,
    theme,
    onToggleTheme
}) => {

  const [displayProfile, setDisplayProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [viewingPostIndex, setViewingPostIndex] = useState<number | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [activeMarketplace, setActiveMarketplace] = useState<MarketplaceType>('fashion');

  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [coverPosition, setCoverPosition] = useState('center');
  const [showRepositionButton, setShowRepositionButton] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isTrulyOwner = !viewedProfileId || viewedProfileId === loggedInProfile.id;
  const isOwner = isTrulyOwner && !isPreviewingAsVisitor;

  // Carousel state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // New featured categories list
  const featuredCategories: Category[] = [
      CATEGORIES.find(c => c.id === 'lv')!,
      CATEGORIES.find(c => c.id === 'new_feeling')!,
  ].filter(Boolean);

   // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
        setLoadingProfile(true);
        let targetProfile: Profile | null = null;
        if (isTrulyOwner) {
            targetProfile = loggedInProfile;
            setDisplayProfile(loggedInProfile);
        } else {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', viewedProfileId)
                    .single();

                if (error) throw error; 

                targetProfile = data;
                setDisplayProfile(data);
            } catch (err: any) { 
                if (err.code === 'PGRST116') {
                    console.warn(`Profile with ID "${viewedProfileId}" not found. This is expected for demo users. Navigating back.`);
                } else {
                    console.error("An unexpected error occurred while fetching profile:", err.message || err);
                }
                onBack();
            }
        }
        if (targetProfile) {
            setUserPosts(posts.filter(p => p.user.id === targetProfile!.id));
        }
        setLoadingProfile(false);
    };

    fetchProfile();
  }, [viewedProfileId, loggedInProfile, isTrulyOwner, onBack, posts]);

  // Carousel observer effect
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
            threshold: 0.6, // Trigger when 60% of the item is visible
        }
    );

    const children = Array.from(container.children);
    // FIX: Add type guard to ensure `child` is an Element, resolving a TypeScript error where its type was inferred as `unknown`.
    children.forEach(child => {
        if (child instanceof Element) {
            observer.observe(child);
        }
    });

    return () => {
        // FIX: Add type guard to ensure `child` is an Element, resolving a TypeScript error where its type was inferred as `unknown`.
        children.forEach(child => {
            if (child instanceof Element) {
                observer.unobserve(child);
            }
        });
    };
}, [featuredCategories.length]);
  
  const handleProfileFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateCoverImage(reader.result as string);
        setCoverPosition('top'); 
        setShowRepositionButton(true);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRepositionClick = () => {
      setCoverPosition('center');
      setShowRepositionButton(false);
  };

  const openProfileFilePicker = () => {
    profileFileInputRef.current?.click();
  };
  
  const openCoverFilePicker = () => {
    coverFileInputRef.current?.click();
  };

  const handleToggleEditBio = () => {
    if (!isEditingBio && displayProfile) {
        setTempBio(displayProfile.bio || '');
    }
    setIsEditingBio(!isEditingBio);
  };

  const handleSaveBio = () => {
    onUpdateProfile({ bio: tempBio });
    setIsEditingBio(false);
  };
  
  const handleViewPost = (index: number) => {
    setViewingPostIndex(index);
  };

  const handleClosePostView = () => {
    setViewingPostIndex(null);
  };
  
  const handleLike = (postId: string) => {
    setUserPosts(currentPosts =>
      currentPosts.map(post =>
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
            // Calculate scroll position to center the item
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
            // Calculate scroll position to center the item
            const scrollLeft = item.offsetLeft - container.offsetLeft - (container.offsetWidth - item.offsetWidth) / 2;
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    }
};

  const marketplaceTabs: { type: MarketplaceType; name: string }[] = [
    { type: 'fashion', name: 'Vestuário' },
    { type: 'restaurant', name: 'Restaurantes' },
    { type: 'supermarket', name: 'Supermercados' },
    { type: 'beauty', name: 'Beleza' },
    { type: 'technology', name: 'Tecnologia' },
  ];

  const displayedCategories = CATEGORIES.filter(category => category.type === activeMarketplace);
  
  if (loadingProfile || !displayProfile) {
    return <div className="w-full h-full flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-primary)]">Carregando perfil...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col text-[var(--text-primary)] animate-fadeIn bg-[var(--bg-main)] overflow-y-auto">
       <input
        type="file"
        ref={profileFileInputRef}
        onChange={handleProfileFileChange}
        accept="image/*"
        className="hidden"
        disabled={!isOwner}
      />
      <input
        type="file"
        ref={coverFileInputRef}
        onChange={handleCoverFileChange}
        accept="image/*"
        className="hidden"
        disabled={!isOwner}
      />
      <header className="flex-shrink-0 relative">
        <div 
            className="h-48 bg-gray-700 bg-cover"
            style={{ 
                backgroundImage: `url(${displayProfile.cover_image_url || 'https://i.postimg.cc/wTQh27Rt/Captura-de-Tela-2025-09-19-a-s-2-10-14-PM.png'})`,
                backgroundPosition: coverPosition,
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            {isOwner && (
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    {showRepositionButton && (
                        <button 
                            onClick={handleRepositionClick} 
                            className="p-2 bg-black/50 rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors"
                            aria-label="Centralizar imagem de capa"
                        >
                            <RepositionIcon className="w-5 h-5 text-yellow-300" />
                        </button>
                    )}
                    <button 
                        onClick={openCoverFilePicker} 
                        className="p-2 bg-black/50 rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors"
                        aria-label="Alterar capa de perfil"
                    >
                        <CameraIcon className="w-5 h-5 text-yellow-300" />
                    </button>
                </div>
            )}
        </div>
        <div 
            onClick={isOwner ? openProfileFilePicker : undefined}
            className={`absolute left-4 -bottom-12 w-36 h-36 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center border-4 border-[var(--bg-main)] shadow-lg ${isOwner ? 'cursor-pointer group' : ''}`}
        >
            {displayProfile.profile_image_url ? (
                <img src={displayProfile.profile_image_url} alt="Você" className="w-full h-full rounded-full object-cover" />
            ) : (
                <UserIcon className="w-20 h-20 text-yellow-800" />
            )}
            {isOwner && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <CameraIcon className="w-8 h-8 text-yellow-300" />
                </div>
            )}
        </div>
        {!isTrulyOwner && (
             <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full text-yellow-300 bg-black/50 hover:bg-black/70 transition-colors" aria-label="Voltar">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
        )}
         {isTrulyOwner && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
                {!isPreviewingAsVisitor && (
                    <button onClick={onToggleVisitorPreview} className="p-2 rounded-full text-yellow-300 bg-black/50 hover:bg-black/70 transition-colors" aria-label="Ver como visitante">
                        <EyeIcon className="w-6 h-6" />
                    </button>
                )}
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(p => !p)} className="p-2 rounded-full text-yellow-300 bg-black/50 hover:bg-black/70 transition-colors">
                      <EllipsisVerticalIcon className="w-6 h-6" />
                    </button>
                    {isMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-lg z-20 animate-fadeIn">
                        <button
                          onClick={() => { onToggleTheme(); setIsMenuOpen(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-yellow-400/10 rounded-lg transition-colors flex items-center gap-3"
                        >
                          {theme === 'dark' ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
                          <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                        </button>
                      </div>
                    )}
                </div>
                <button onClick={onSignOut} className="p-2 rounded-full text-yellow-300 bg-black/50 hover:bg-black/70 transition-colors" aria-label="Sair">
                    <SignOutIcon className="w-6 h-6" />
                </button>
            </div>
         )}
      </header>
      
      <div className="px-4 flex-grow">
        <div className="pl-40 pt-2 flex items-center gap-3">
            <h1 className="text-xl font-bold">{displayProfile.username}</h1>
             {isOwner ? (
                <button onClick={handleToggleEditBio} className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)] transition-colors" aria-label="Editar biografia">
                    <PencilIcon className="w-4 h-4" />
                </button>
             ) : (
                <span className="text-xs font-semibold bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                    VISITANDO
                </span>
             )}
        </div>
        
        <div className="pt-4">
            <div className="flex justify-between items-start gap-4">
                {isEditingBio ? (
                    <div className="flex-grow">
                        <textarea
                            value={tempBio}
                            onChange={(e) => setTempBio(e.target.value)}
                            className="w-full h-24 p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none transition-all"
                            aria-label="Editar biografia"
                            autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={handleSaveBio}
                                className="px-4 py-1.5 text-sm font-semibold text-[var(--accent-primary-text)] bg-[var(--accent-primary)] rounded-md hover:bg-yellow-500 transition-colors"
                            >
                                Salvar
                            </button>
                            <button
                                onClick={handleToggleEditBio}
                                className="px-4 py-1.5 text-sm font-semibold text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] rounded-md hover:brightness-95 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="flex-grow text-sm text-[var(--text-tertiary)] leading-snug whitespace-pre-wrap">
                        {displayProfile.bio || (isOwner ? 'Edite sua bio...' : 'Nenhuma bio disponível.')}
                    </p>
                )}
                {isOwner && (
                    <div className="relative group flex-shrink-0">
                        <button 
                            onClick={onNavigateToRewards}
                            className="p-1 rounded-full hover:bg-yellow-500/20 transition-colors" 
                            aria-label="Ver recompensas"
                        >
                            <img src="https://i.postimg.cc/wjyHYD8S/moeda.png" alt="Recompensas" className="w-10 h-10 transition-transform transform hover:scale-110" />
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                            Ver Recompensas
                            <svg className="absolute text-zinc-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                                <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-lg">12</span>
                    <span className="text-sm text-[var(--text-secondary)]">Posts</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-lg">1.2M</span>
                    <span className="text-sm text-[var(--text-secondary)]">Seguidores</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-lg">345</span>
                    <span className="text-sm text-[var(--text-secondary)]">Seguindo</span>
                </div>
            </div>
        </div>
        
        {isOwner ? (
             <div className="grid grid-cols-4 items-stretch justify-around gap-2 my-6">
                <ActionButton icon={<LooksIcon />} label="LOOKS" onClick={onNavigateToMyLooks} />
                <ActionButton icon={<ShoppingBagIcon />} label="CARRINHO" onClick={onNavigateToCart} className={isCartAnimating ? 'animate-cart-pulse' : ''} />
                <ActionButton icon={<CompassIcon />} label="FEED" onClick={onNavigateToFeed} />
                <ActionButton icon={<UploadIcon />} label="VESTIR" onClick={onStartTryOn} />
            </div>
        ) : (
            <div className="flex items-center gap-3 my-6">
                <button className="flex-1 text-center font-bold py-3 px-4 rounded-lg bg-[var(--accent-primary)] text-[var(--accent-primary-text)] hover:bg-yellow-500 transition-colors">
                    Seguir
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 text-center font-bold py-3 px-4 rounded-lg bg-[var(--bg-tertiary)] hover:brightness-95 transition-colors">
                    <MessageIcon className="w-5 h-5"/>
                    Mensagem
                </button>
            </div>
        )}
      </div>
      
      {isOwner ? (
          <div className='flex-grow flex flex-col'>
             {/* Featured Section */}
              <div className="relative">
                  <h2 className="text-xl font-bold px-4 mb-3 pt-4 text-[var(--accent-primary)] text-glow tracking-wide">Destaques</h2>
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

              <div className="flex-shrink-0 overflow-x-auto py-2 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="flex items-center gap-2 border-b border-t border-[var(--border-primary)]">
                      {marketplaceTabs.map(tab => (
                          <button
                              key={tab.type}
                              onClick={() => setActiveMarketplace(tab.type)}
                              className={`px-4 py-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                                  activeMarketplace === tab.type
                                      ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)] text-glow'
                                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                              }`}
                          >
                              {tab.name}
                          </button>
                      ))}
                  </div>
              </div>

              <main className="flex-grow overflow-y-auto px-4 py-4">
                  {displayedCategories.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                          {displayedCategories.map(category => (
                              <div
                                  key={category.id}
                                  onClick={() => onSelectCategory(category)}
                                  className="relative w-full h-40 rounded-2xl overflow-hidden cursor-pointer group transform hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-yellow-400/20"
                              >
                                  <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:blur-sm transition-all duration-300" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                      <h2 className="text-2xl font-black tracking-tighter uppercase text-white">{category.name}</h2>
                                  </div>
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                      <span className="text-xl font-bold text-yellow-300">Ver Itens</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-10 text-zinc-500">
                          <p>Nenhuma coleção encontrada para esta categoria.</p>
                      </div>
                  )}
              </main>
          </div>
      ) : ( // Visitor View of Profile
          <div className="px-4 flex-grow mt-6">
              <div className="border-b border-[var(--border-primary)] mb-2">
                  <h2 className="text-lg font-bold text-[var(--text-tertiary)] pb-2">Publicações</h2>
              </div>
              {userPosts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1 pb-4">
                      {userPosts.map((post, index) => (
                          <div 
                              key={post.id} 
                              className="aspect-square bg-[var(--bg-secondary)] cursor-pointer group relative"
                              onClick={() => handleViewPost(index)}
                          >
                              <img src={post.image} alt={`Post by ${post.user.name}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                                  <span className="text-white text-xs text-center line-clamp-2">
                                      {post.items.map(i => i.name).join(', ')}
                                  </span>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-10">
                      <CameraIcon className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                      <h3 className="font-bold text-lg">Sem Publicações</h3>
                      <p className="text-zinc-500 text-sm">Este perfil ainda não tem publicações.</p>
                  </div>
              )}
          </div>
      )}

      {isPreviewingAsVisitor && isTrulyOwner && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-yellow-900/95 backdrop-blur-sm z-20 border-t border-yellow-700 animate-fadeIn">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <EyeIcon className="w-5 h-5 text-yellow-300"/>
                      <p className="text-sm font-semibold text-yellow-100">Modo de pré-visualização.</p>
                  </div>
                  <button onClick={onToggleVisitorPreview} className="font-bold text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors">
                      Voltar à sua visão
                  </button>
              </div>
          </div>
      )}
       {viewingPostIndex !== null && (
          <ImageViewModal 
              posts={userPosts} 
              startIndex={viewingPostIndex} 
              onClose={handleClosePostView}
              onLike={handleLike}
              onItemClick={onItemClick}
              onViewProfile={onViewProfile}
          />
        )}
    </div>
  );
};

export default HomeScreen;