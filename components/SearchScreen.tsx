
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeftIcon, SearchIcon, UserIcon, VerifiedIcon, ShoppingBagIcon, StarIcon, ClockIcon } from './IconComponents';
import type { Post, Profile, Item, MarketplaceType } from '../types';
import ImageViewModal from './ImageViewModal';
import QuickViewModal from './QuickViewModal';
import { CATEGORIES } from '../constants';

interface SearchScreenProps {
    onBack: () => void;
    posts: Post[];
    items: Item[];
    availableProfiles: Profile[];
    onViewProfile: (profileId: string) => void;
    onLikePost: (postId: string) => void;
    onItemClick: (item: Item) => void;
    onItemAction: (item: Item) => void;
    onOpenSplitCamera: (item: Item) => void;
    onOpenComments: (postId: string) => void;
    onAddToCart: (item: Item) => void;
    onBuy: (item: Item) => void;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ 
    onBack, 
    posts, 
    items,
    availableProfiles,
    onViewProfile,
    onLikePost,
    onItemClick,
    onItemAction,
    onOpenSplitCamera,
    onOpenComments,
    onAddToCart,
    onBuy,
}) => {
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'accounts' | 'products' | 'explore'>('explore');
    const [recentSearches, setRecentSearches] = useState<string[]>(() => {
        const saved = localStorage.getItem('pump_recent_searches');
        return saved ? JSON.parse(saved) : [];
    });
    const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [viewingPostDetails, setViewingPostDetails] = useState<{ posts: Post[]; startIndex: number } | null>(null);
    const [quickViewItem, setQuickViewItem] = useState<Item | null>(null);
    
    const popularPosts = useMemo(() => {
        return [...posts].sort((a, b) => b.likes - a.likes);
    }, [posts]);
    
    const getCategoryTypeFromItem = (item: Item): MarketplaceType => {
        const rootCategoryId = item.category.split('_')[0];
        const category = CATEGORIES.find(c => c.id === rootCategoryId);
        return category?.type || 'fashion';
    };

    useEffect(() => {
        if (query.trim() === '') {
            setActiveTab('explore');
            setFilteredProfiles([]);
            setFilteredItems([]);
            return;
        }

        if (activeTab === 'explore') setActiveTab('accounts');

        const lowercasedQuery = query.toLowerCase();
        
        // Busca em todos os perfis reais carregados do Supabase
        const profileResults = availableProfiles.filter(p =>
            (p.full_name?.toLowerCase().includes(lowercasedQuery) || 
             p.username?.toLowerCase().includes(lowercasedQuery) ||
             p.bio?.toLowerCase().includes(lowercasedQuery))
        );
        setFilteredProfiles(profileResults);
        
        // Busca em todos os produtos reais do catálogo PUMP
        const itemResults = items.filter(item =>
            item.name.toLowerCase().includes(lowercasedQuery) ||
            item.description.toLowerCase().includes(lowercasedQuery)
        );
        setFilteredItems(itemResults);

    }, [query, availableProfiles, items, activeTab]);

    const handleSearchSubmit = (searchTerm: string) => {
        if (!searchTerm.trim()) return;
        const term = searchTerm.trim();
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('pump_recent_searches', JSON.stringify(updated));
        setQuery(term);
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('pump_recent_searches');
    };

    const handleViewPost = (postIndex: number) => {
        setViewingPostDetails({ posts: popularPosts, startIndex: postIndex });
    };

    return (
        <>
            <div className="w-full h-full flex flex-col bg-white text-zinc-900 font-sans overflow-hidden">
                <header className="px-4 pt-4 pb-2 flex flex-col gap-4 border-b border-zinc-50 shrink-0 sticky top-0 bg-white/95 backdrop-blur-md z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 -ml-2 rounded-xl bg-zinc-50 text-zinc-400 active:scale-90 transition-all">
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div className="relative flex-grow">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(query); }}>
                                <input
                                    type="text"
                                    placeholder="Procurar contas reais ou itens..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full bg-zinc-50 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white border border-transparent focus:border-amber-500/40 transition-all placeholder:text-zinc-300 shadow-sm"
                                    autoFocus
                                />
                            </form>
                        </div>
                    </div>

                    {query.trim() !== '' && (
                        <div className="flex gap-1 animate-fadeIn px-1">
                            <button 
                                onClick={() => setActiveTab('accounts')} 
                                className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'accounts' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-50'}`}
                            >
                                Contas ({filteredProfiles.length})
                            </button>
                            <button 
                                onClick={() => setActiveTab('products')} 
                                className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'products' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-50'}`}
                            >
                                Itens ({filteredItems.length})
                            </button>
                        </div>
                    )}
                </header>

                <main className="flex-grow overflow-y-auto scrollbar-hide">
                    {query.trim() === '' ? (
                        <div className="animate-fadeIn">
                            {recentSearches.length > 0 && (
                                <div className="p-5 pb-0">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Pesquisas Recentes</h2>
                                        <button onClick={clearRecentSearches} className="text-[9px] font-black uppercase text-amber-600 hover:text-amber-700 transition-colors">Limpar</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map((term, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => handleSearchSubmit(term)}
                                                className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-full border border-zinc-100 text-[11px] font-bold text-zinc-600 hover:border-amber-500/30 active:scale-95 transition-all"
                                            >
                                                <ClockIcon className="w-3 h-3 text-zinc-300" />
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="px-5 mb-4 mt-8">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Mais Relevantes</h2>
                            </div>
                            <div className="grid grid-cols-3 gap-0.5 px-0.5 pb-24">
                                {popularPosts.length > 0 ? popularPosts.map((post, index) => (
                                    <div 
                                        key={post.id} 
                                        onClick={() => handleViewPost(index)}
                                        className={`relative bg-zinc-100 cursor-pointer overflow-hidden group ${index % 7 === 0 ? 'col-span-2 row-span-2' : 'aspect-square'}`}
                                    >
                                        <img src={post.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <StarIcon className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-3 py-32 text-center opacity-30">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Descobrindo tendências...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-2 animate-fadeIn pb-24">
                            {activeTab === 'accounts' ? (
                                <div className="space-y-1">
                                    {filteredProfiles.length > 0 ? (
                                        filteredProfiles.map(p => (
                                            <button 
                                                key={p.user_id}
                                                onClick={() => onViewProfile(p.user_id)}
                                                className="w-full flex items-center gap-4 p-4 text-left hover:bg-zinc-50 rounded-[2rem] transition-all group active:scale-[0.98]"
                                            >
                                                <div className="relative">
                                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-100 border-2 border-zinc-100 p-0.5 group-hover:border-amber-500/50 transition-colors shadow-sm">
                                                        {p.avatar_url ? (
                                                            <img src={p.avatar_url} alt="" className="w-full h-full object-cover rounded-full"/>
                                                        ) : (
                                                            <UserIcon className="w-full h-full text-zinc-300 p-3" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="font-black text-sm text-zinc-900 truncate uppercase tracking-tighter italic leading-none">
                                                            {p.full_name || p.username}
                                                        </p>
                                                        {p.account_type === 'business' && <VerifiedIcon className="w-4 h-4 text-amber-500" />}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                                        {p.account_type === 'business' ? 'Loja Verificada' : 'Membro PUMP'}
                                                    </p>
                                                </div>
                                                <div className="px-5 py-2.5 rounded-2xl bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 shadow-lg">
                                                    Explorar
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="py-32 text-center opacity-30 flex flex-col items-center">
                                            <UserIcon className="w-12 h-12 mb-4 text-zinc-300" strokeWidth={1} />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nenhum utilizador encontrado</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                 <div className="grid grid-cols-2 gap-4 p-3 animate-fadeIn">
                                    {filteredItems.length > 0 ? (
                                        filteredItems.map(item => (
                                            <button 
                                                key={item.id}
                                                onClick={() => setQuickViewItem(item)}
                                                className="flex flex-col bg-white rounded-[2.2rem] border border-zinc-100 overflow-hidden hover:shadow-xl hover:shadow-black/5 transition-all group active:scale-[0.98]"
                                            >
                                                <div className="relative aspect-[3/4] overflow-hidden bg-zinc-50">
                                                    <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                                                    <div className="absolute top-4 left-4 px-2.5 py-1.5 bg-white/95 backdrop-blur-md rounded-xl text-[8px] font-black uppercase tracking-widest text-zinc-900 shadow-sm border border-zinc-100/50">
                                                        Real Item
                                                    </div>
                                                </div>
                                                <div className="p-5 text-left">
                                                    <p className="font-bold text-[12px] text-zinc-900 uppercase truncate mb-1 italic leading-none">{item.name}</p>
                                                    <p className="text-[11px] font-black text-amber-600 tracking-tighter mt-1">
                                                        {item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                                                    </p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="col-span-2 py-32 text-center opacity-30 flex flex-col items-center">
                                            <ShoppingBagIcon className="w-12 h-12 mb-4 text-zinc-300" strokeWidth={1} />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nenhum produto real encontrado</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {viewingPostDetails && (
                <ImageViewModal
                    posts={viewingPostDetails.posts}
                    startIndex={viewingPostDetails.startIndex}
                    onClose={() => setViewingPostDetails(null)}
                    onLike={onLikePost}
                    onItemClick={onItemClick}
                    onViewProfile={onViewProfile}
                    onComment={onOpenComments}
                />
            )}

            {quickViewItem && (
                <QuickViewModal 
                    item={quickViewItem} 
                    collectionType={getCategoryTypeFromItem(quickViewItem)}
                    onClose={() => setQuickViewItem(null)}
                    onBuy={(item) => {
                        onBuy(item);
                        setQuickViewItem(null);
                    }}
                    onAddToCart={(item) => {
                        onAddToCart(item);
                        setQuickViewItem(null);
                    }}
                    onItemAction={(item) => {
                        onItemAction(item);
                        setQuickViewItem(null);
                    }}
                    onOpenSplitCamera={(item) => {
                        onOpenSplitCamera(item);
                        setQuickViewItem(null);
                    }}
                />
            )}
        </>
    );
};

export default SearchScreen;
