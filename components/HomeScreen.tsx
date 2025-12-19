
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Profile, Category, Post, Item, MarketplaceType } from '../types';
import { CATEGORIES } from '../constants';
import { 
    PlusIcon, CameraIcon, UserIcon, 
    ChevronDownIcon, MenuIcon,
    BellIcon, PencilIcon, ChatBubbleIcon
} from './IconComponents';
import BioEditModal from './BioEditModal';

interface HomeScreenProps {
  loggedInProfile: Profile;
  viewedProfileId: string | null;
  onUpdateProfile: (updates: { username?: string, bio?: string, full_name?: string }) => void;
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
  onNavigateToCart,
  onNavigateToChat,
  onNavigateToRewards,
  onStartTryOn,
  onNavigateToSettings,
  unreadNotificationCount,
  unreadMessagesCount,
  onOpenNotificationsPanel,
  isFollowing,
  onToggleFollow,
  followersCount,
  followingCount,
  posts
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'market' | 'posts'>('posts');
  
  const isMyProfile = !viewedProfileId || viewedProfileId === loggedInProfile.user_id;
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isMyProfile) {
        setProfile(loggedInProfile);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', viewedProfileId)
          .single();
        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error("Perfil externo não encontrado");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [viewedProfileId, loggedInProfile, isMyProfile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdateProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (loading) return (
      <div className="h-full w-full bg-white flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Carregando Perfil...</span>
      </div>
  );
  
  if (!profile) return null;

  return (
    <div className="w-full h-full flex flex-col bg-white text-zinc-900 animate-fadeIn">
      <header className="px-5 pt-6 pb-2 flex items-center justify-between flex-shrink-0 bg-white z-10 sticky top-0">
          <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black uppercase tracking-tighter italic">{profile.full_name || profile.username}</h1>
              <ChevronDownIcon className="w-3 h-3 text-zinc-300" />
          </div>
          <div className="flex items-center gap-6">
              <button onClick={onNavigateToChat} className="relative active:scale-90 transition-transform">
                  <ChatBubbleIcon className="w-7 h-7" />
                  {unreadMessagesCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white border border-white">{unreadMessagesCount}</span>}
              </button>
              <button onClick={onNavigateToSettings} className="active:rotate-45 transition-transform"><MenuIcon className="w-7 h-7" /></button>
          </div>
      </header>

      <main className="flex-grow overflow-y-auto pb-24">
        <div className="px-5 py-8 flex flex-col items-center text-center">
            <div className="relative mb-6">
                <div className="w-32 h-32 rounded-[3rem] p-0.5 bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center overflow-hidden shadow-2xl shadow-amber-500/20">
                    <div className="w-full h-full rounded-[2.8rem] bg-white flex items-center justify-center overflow-hidden border-2 border-white">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-14 h-14 text-zinc-200" />
                        )}
                    </div>
                </div>
                {isMyProfile && (
                    <>
                        <button 
                            onClick={() => profileImageInputRef.current?.click()} 
                            className="absolute -bottom-1 -right-1 p-3 bg-zinc-900 rounded-2xl border-4 border-white text-white shadow-xl active:scale-90 transition-all hover:bg-amber-500"
                        >
                            <CameraIcon className="w-5 h-5" />
                        </button>
                        <input type="file" accept="image/*" ref={profileImageInputRef} onChange={handleFileChange} className="hidden" />
                    </>
                )}
            </div>
            
            <div className="flex flex-col items-center max-w-xs">
                <h2 className="font-black text-lg uppercase tracking-[0.15em] mb-1">{profile.full_name || profile.username}</h2>
                <div className="flex items-center gap-2">
                    {profile.bio ? (
                        <p className="text-xs text-zinc-500 font-medium leading-relaxed italic">"{profile.bio}"</p>
                    ) : isMyProfile && (
                        <button onClick={() => setIsEditingBio(true)} className="text-[10px] font-bold uppercase text-amber-500 tracking-[0.2em] border-b border-amber-500/20 pb-0.5">Adicionar biografia</button>
                    )}
                    {isMyProfile && profile.bio && (
                        <button onClick={() => setIsEditingBio(true)} className="p-1.5 bg-zinc-50 rounded-full border border-zinc-100 text-zinc-400 active:scale-95 transition-all">
                            <PencilIcon className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
        
        <div className="px-10 grid grid-cols-3 gap-4 text-center py-6 border-y border-zinc-50 bg-zinc-50/30">
            <div><span className="text-lg font-black tracking-tight">0</span><p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1">Posts</p></div>
            <div><span className="text-lg font-black tracking-tight">{followersCount}</span><p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1">Seguidores</p></div>
            <div><span className="text-lg font-black tracking-tight">{followingCount}</span><p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1">Seguindo</p></div>
        </div>
        
        <div className="flex px-5 mt-6">
          <button onClick={() => setActiveTab('posts')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${activeTab === 'posts' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-300'}`}>Vitrine</button>
          <button onClick={() => setActiveTab('market')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${activeTab === 'market' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-300'}`}>Marcas</button>
        </div>

        <div className="p-1 min-h-[300px]">
            {activeTab === 'posts' ? (
                <div className="py-24 text-center flex flex-col items-center opacity-30">
                    <div className="w-16 h-16 rounded-full bg-zinc-50 border border-dashed border-zinc-300 flex items-center justify-center mb-4">
                        <PlusIcon className="w-6 h-6 text-zinc-400" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Comece sua coleção</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 p-4">
                    {CATEGORIES.slice(0, 4).map(category => (
                        <div key={category.id} onClick={() => onSelectCategory(category)} className="relative h-48 rounded-[2rem] overflow-hidden group shadow-lg shadow-zinc-100/50 transition-all active:scale-[0.98]">
                            <img src={category.image} alt={category.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
                                <h3 className="text-sm font-black text-white italic uppercase tracking-tight">{category.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>

      {isEditingBio && (
          <BioEditModal 
            initialUsername={profile.full_name || profile.username} 
            initialBio={profile.bio || ''} 
            onClose={() => setIsEditingBio(false)} 
            onSave={(newName, newBio) => {
                onUpdateProfile({ full_name: newName, bio: newBio });
                setIsEditingBio(false);
            }} 
          />
      )}
    </div>
  );
};

export default HomeScreen;
