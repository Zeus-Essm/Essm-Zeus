import React, { useRef, useState, useEffect } from 'react';
import type { Category, Profile, Post } from '../types';
import { supabase } from '../services/supabaseClient';
import { CATEGORIES } from '../constants';
import { CompassIcon, LooksIcon, ShoppingBagIcon, UploadIcon, UserIcon, PencilIcon, CameraIcon, RepositionIcon, ArrowLeftIcon, EyeIcon } from './IconComponents';
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
}

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; className?: string; }> = ({ icon, label, onClick, className = '' }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-2 p-3 bg-gray-900 rounded-2xl hover:bg-gray-800 transition-colors flex-1 text-center ${className}`}>
        <div className="w-8 h-8 text-gray-300">{icon}</div>
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
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
}) => {

  const [displayProfile, setDisplayProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [viewingPostIndex, setViewingPostIndex] = useState<number | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);

  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [coverPosition, setCoverPosition] = useState('center');
  const [showRepositionButton, setShowRepositionButton] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');

  const isTrulyOwner = !viewedProfileId || viewedProfileId === loggedInProfile.id;
  const isOwner = isTrulyOwner && !isPreviewingAsVisitor;

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

  const featuredCategory = CATEGORIES[0];
  const otherCategories = CATEGORIES.slice(1);
  
  if (loadingProfile || !displayProfile) {
    return <div className="w-full h-full flex items-center justify-center bg-black text-white">Carregando perfil...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col text-white animate-fadeIn bg-black overflow-y-auto">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            {isOwner && (
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    {showRepositionButton && (
                        <button 
                            onClick={handleRepositionClick} 
                            className="p-2 bg-black/50 rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors"
                            aria-label="Centralizar imagem de capa"
                        >
                            <RepositionIcon className="w-5 h-5 text-white" />
                        </button>
                    )}
                    <button 
                        onClick={openCoverFilePicker} 
                        className="p-2 bg-black/50 rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors"
                        aria-label="Alterar capa de perfil"
                    >
                        <CameraIcon className="w-5 h-5 text-white" />
                    </button>
                </div>
            )}
        </div>
        <div 
            onClick={isOwner ? openProfileFilePicker : undefined}
            className={`absolute left-4 -bottom-12 w-36 h-36 rounded-full bg-gray-800 flex items-center justify-center border-4 border-black shadow-lg ${isOwner ? 'cursor-pointer group' : ''}`}
        >
            {displayProfile.profile_image_url ? (
                <img src={displayProfile.profile_image_url} alt="Você" className="w-full h-full rounded-full object-cover" />
            ) : (
                <UserIcon className="w-20 h-20 text-gray-500" />
            )}
            {isOwner && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <CameraIcon className="w-8 h-8 text-white" />
                </div>
            )}
        </div>
        {!isTrulyOwner && (
             <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full text-white bg-black/50 hover:bg-black/70 transition-colors" aria-label="Voltar">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
        )}
         {isTrulyOwner && (
            <>
              {!isPreviewingAsVisitor && (
                  <button onClick={onToggleVisitorPreview} className="absolute top-4 right-14 p-2 rounded-full text-white bg-black/50 hover:bg-black/70 transition-colors" aria-label="Ver como visitante">
                      <EyeIcon className="w-6 h-6" />
                  </button>
              )}
              <button onClick={onSignOut} className="absolute top-4 right-4 p-2 rounded-full text-white bg-black/50 hover:bg-black/70 transition-colors" aria-label="Sair">
                  <SignOutIcon className="w-6 h-6" />
              </button>
            </>
         )}
      </header>
      
      <div className="px-4 flex-grow">
        <div className="pl-40 pt-2 flex items-center gap-3">
            <h1 className="text-xl font-bold">{displayProfile.username}</h1>
             {isOwner ? (
                <button onClick={handleToggleEditBio} className="p-2 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white transition-colors" aria-label="Editar biografia">
                    <PencilIcon className="w-4 h-4" />
                </button>
             ) : (
                <span className="text-xs font-semibold bg-blue-500/30 text-blue-300 px-2 py-1 rounded-full">
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
                            className="w-full h-24 p-2 bg-gray-800 border border-gray-600 rounded-md text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                            aria-label="Editar biografia"
                            autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={handleSaveBio}
                                className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Salvar
                            </button>
                            <button
                                onClick={handleToggleEditBio}
                                className="px-4 py-1.5 text-sm font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="flex-grow text-sm text-gray-300 leading-snug whitespace-pre-wrap">
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
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-semibold text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                            Ver Recompensas
                            <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                                <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-lg">12</span>
                    <span className="text-sm text-gray-400">Posts</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-lg">1.2M</span>
                    <span className="text-sm text-gray-400">Seguidores</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-lg">345</span>
                    <span className="text-sm text-gray-400">Seguindo</span>
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
                <button className="flex-1 text-center font-bold py-3 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors">
                    Seguir
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 text-center font-bold py-3 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                    <MessageIcon className="w-5 h-5"/>
                    Mensagem
                </button>
            </div>
        )}

        {isOwner ? (
            <>
                <div 
                    onClick={() => onSelectCategory(featuredCategory)}
                    className="mb-6 relative h-64 rounded-2xl overflow-hidden cursor-pointer group transform hover:scale-[1.02] transition-transform duration-300 shadow-2xl shadow-black/50"
                >
                    {featuredCategory.video ? (
                        <video
                            src={featuredCategory.video}
                            poster={featuredCategory.image}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 animate-slow-zoom"
                        />
                    ) : (
                        <img 
                            src={featuredCategory.image} 
                            alt="Look em Destaque" 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 animate-slow-zoom" 
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-5">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300">Look em Destaque</h3>
                        <h2 className="text-3xl font-black tracking-tighter text-white uppercase mt-1">{featuredCategory.name}</h2>
                    </div>
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-xl font-bold border-2 border-white rounded-full px-6 py-2">Vestir Agora</span>
                    </div>
                </div>

                <main className="space-y-4 pb-4">
                    {otherCategories.length > 0 && (
                        <h2 className="text-xl font-bold text-gray-300">Outras Coleções</h2>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        {otherCategories.map((category) => (
                            <div
                                key={category.id}
                                onClick={() => onSelectCategory(category)}
                                className="relative w-full h-40 rounded-2xl overflow-hidden cursor-pointer group transform hover:scale-105 transition-transform duration-300"
                            >
                                <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:blur-sm transition-all duration-300" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                                    <h2 className="text-2xl font-black tracking-tighter uppercase">{category.name}</h2>
                                </div>
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-xl font-bold">Ver Itens</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </>
        ) : (
            <div className="mt-6">
                <div className="border-b border-gray-700 mb-2">
                    <h2 className="text-lg font-bold text-gray-300 pb-2">Publicações</h2>
                </div>
                {userPosts.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1 pb-4">
                        {userPosts.map((post, index) => (
                            <div 
                                key={post.id} 
                                className="aspect-square bg-gray-800 cursor-pointer group relative"
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
                        <CameraIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="font-bold text-lg">Sem Publicações</h3>
                        <p className="text-gray-500 text-sm">Este perfil ainda não tem publicações.</p>
                    </div>
                )}
            </div>
        )}
      </div>
      {isPreviewingAsVisitor && isTrulyOwner && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-blue-900/95 backdrop-blur-sm z-20 border-t border-blue-700 animate-fadeIn">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <EyeIcon className="w-5 h-5 text-blue-300"/>
                      <p className="text-sm font-semibold text-blue-100">Modo de pré-visualização.</p>
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