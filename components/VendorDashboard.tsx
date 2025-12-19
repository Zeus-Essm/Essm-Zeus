
import React, { useState, useMemo } from 'react';
import type { BusinessProfile, Item, Post, Profile } from '../types';
import { 
    MenuIcon, CameraIcon, PencilIcon, PlusIcon, StarIcon, 
    BellIcon, UserIcon, ChevronDownIcon 
} from './IconComponents';
import BioEditModal from './BioEditModal';
import { VENDOR_POSTS, INITIAL_VENDOR_ITEMS } from '../constants';

interface VendorDashboardProps {
  businessProfile: BusinessProfile;
  profile: Profile;
  onOpenMenu: () => void;
  unreadNotificationCount: number;
  onOpenNotificationsPanel: () => void;
  onOpenPromotionModal: () => void;
  followersCount: number;
  followingCount: number;
  onStartCreate?: () => void;
  onNavigateToProducts: () => void;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ 
    businessProfile, 
    profile,
    onOpenMenu, 
    unreadNotificationCount, 
    onOpenNotificationsPanel, 
    onOpenPromotionModal, 
    followersCount, 
    followingCount,
    onStartCreate,
    onNavigateToProducts
}) => {
    const [activeTab, setActiveTab] = useState<'shop' | 'posts'>('shop');
    const [isEditingBio, setIsEditingBio] = useState(false);
    
    const [vendorItems] = useState<Item[]>(INITIAL_VENDOR_ITEMS);
    const [vendorPosts] = useState<Post[]>(VENDOR_POSTS);

    return (
        <div className="w-full h-full flex flex-col bg-white text-zinc-900 relative overflow-hidden">
            <header className="px-5 pt-6 flex items-center justify-between flex-shrink-0 bg-white/80 backdrop-blur-md z-10 sticky top-0">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black uppercase tracking-tighter italic">
                        {profile.full_name || profile.username}
                    </h1>
                    <ChevronDownIcon className="w-3 h-3 text-zinc-300" />
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={onOpenNotificationsPanel} className="relative active:scale-90 transition-transform">
                        <BellIcon className="w-7 h-7" />
                        {unreadNotificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white border border-white">
                                {unreadNotificationCount}
                            </span>
                        )}
                    </button>
                    <button onClick={onOpenMenu} className="active:scale-90 transition-transform">
                        <MenuIcon className="w-7 h-7" />
                    </button>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto pb-32 pt-6">
                <div className="px-5 flex flex-col items-center gap-4 text-center">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-[2.5rem] p-0.5 bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center overflow-hidden shadow-2xl shadow-amber-500/10">
                            <div className="w-full h-full rounded-[2.3rem] bg-white p-0.5 overflow-hidden">
                                {profile.avatar_url ? (
                                    <img 
                                        src={profile.avatar_url} 
                                        alt="Business Logo" 
                                        className="w-full h-full object-cover rounded-[2.2rem]" 
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                                        <UserIcon className="w-10 h-10 text-zinc-300" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-3 bg-zinc-900 rounded-[1.2rem] border-4 border-white text-white shadow-lg active:scale-90 transition-all hover:bg-amber-500">
                            <CameraIcon className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <h2 className="font-black text-base uppercase tracking-widest">{profile.full_name || profile.username}</h2>
                        <span className="text-[10px] text-amber-500 uppercase font-black tracking-[0.2em] mt-1">
                            {businessProfile.business_category}
                        </span>
                        {profile.bio && (
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed mt-2 max-w-[280px] italic">
                                "{profile.bio}"
                            </p>
                        )}
                        <button onClick={() => setIsEditingBio(true)} className="p-2 mt-2 bg-zinc-50 rounded-full border border-zinc-100 text-zinc-400 active:scale-95 transition-all">
                            <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="mt-8 px-10 py-6 grid grid-cols-3 gap-4 text-center border-y border-zinc-50">
                    <button onClick={onNavigateToProducts} className="flex flex-col items-center">
                        <span className="text-base font-black">{vendorItems.length + vendorPosts.length}</span>
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1">Produtos</p>
                    </button>
                    <div>
                        <span className="text-base font-black">{followersCount}</span>
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1">Seguidores</p>
                    </div>
                    <div>
                        <span className="text-base font-black">{followingCount}</span>
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1">Seguindo</p>
                    </div>
                </div>

                <div className="px-5 mt-8">
                    <button 
                        onClick={onOpenPromotionModal}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-white py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        <StarIcon className="w-4 h-4" />
                        Turbinar Visibilidade
                    </button>
                </div>

                <div className="border-b border-zinc-50 flex mt-10">
                    <button 
                        onClick={() => setActiveTab('shop')} 
                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${activeTab === 'shop' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-300'}`}
                    >
                        Catálogo
                    </button>
                    <button 
                        onClick={() => setActiveTab('posts')} 
                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${activeTab === 'posts' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-300'}`}
                    >
                        Vitrine
                    </button>
                </div>

                <div className="min-h-[400px]">
                    {activeTab === 'shop' ? (
                        <div className="p-5 grid grid-cols-2 gap-4">
                            <div className="col-span-2 py-20 text-center flex flex-col items-center opacity-40">
                                <PlusIcon className="w-8 h-8 text-zinc-400 mb-3" />
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Sua loja está vazia</p>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center flex flex-col items-center opacity-40">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Sua vitrine está vazia</p>
                        </div>
                    )}
                </div>
            </main>

            <div className="absolute bottom-28 right-6 z-20">
                <button 
                    onClick={onStartCreate}
                    className="w-16 h-16 bg-amber-500 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-amber-500/40 active:scale-90 transition-all hover:bg-amber-400"
                >
                    <PlusIcon className="w-8 h-8 text-white" />
                </button>
            </div>

            {isEditingBio && (
                <BioEditModal 
                    initialUsername={profile.full_name || profile.username} 
                    initialBio={profile.bio || ''} 
                    onClose={() => setIsEditingBio(false)} 
                    onSave={(newName, newBio) => {
                        setIsEditingBio(false);
                    }} 
                />
            )}
        </div>
    );
};

export default VendorDashboard;
