
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeftIcon, SearchIcon, UserIcon } from './IconComponents';
import type { Post, Profile, Item, MarketplaceType } from '../types';
import ImageViewModal from './ImageViewModal';
import QuickViewModal from './QuickViewModal';
import { CATEGORIES } from '../constants';

interface SearchScreenProps {
    onBack: () => void;
    posts: Post[];
    items: Item[];
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
    const [activeTab, setActiveTab] = useState<'accounts' | 'products'>('accounts');
    const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [viewingPostDetails, setViewingPostDetails] = useState<{ posts: Post[]; startIndex: number } | null>(null);
    const [quickViewItem, setQuickViewItem] = useState<Item | null>(null);

    const popularPosts = useMemo(() => {
        return [...posts].sort((a, b) => b.likes - a.likes);
    }, [posts]);
    
    const allProfiles = useMemo(() => {
        const profileMap = new Map<string, Profile>();
        posts.forEach(post => {
            if (!profileMap.has(post.user.id)) {
                // FIX: Use full_name instead of name to match the Profile interface in types.ts
                profileMap.set(post.user.id, {
                    user_id: post.user.id, 
                    username: post.user.name,
                    full_name: post.user.name,
                    avatar_url: post.user.avatar,
                    bio: null,
                    cover_image_url: null,
                    account_type: 'personal',
                });
            }
        });
        return Array.from(profileMap.values());
    }, [posts]);

    const getCategoryTypeFromItem = (item: Item): MarketplaceType => {
        const rootCategoryId = item.category.split('_')[0];
        const category = CATEGORIES.find(c => c.id === rootCategoryId);
        return category?.type || 'fashion';
    };

    useEffect(() => {
        if (query.trim() === '') {
            setFilteredProfiles([]);
            setFilteredItems([]);
            return;
        }

        const lowercasedQuery = query.toLowerCase();
        
        // FIX: Include full_name in the search filter if available.
        const profileResults = allProfiles.filter(profile =>
            profile.username.toLowerCase().includes(lowercasedQuery) ||
            (profile.full_name && profile.full_name.toLowerCase().includes(lowercasedQuery))
        );
        setFilteredProfiles(profileResults);
        
        const itemResults = items.filter(item =>
            item.name.toLowerCase().includes(lowercasedQuery) ||
            item.description.toLowerCase().includes(lowercasedQuery)
        );
        setFilteredItems(itemResults);

    }, [query, allProfiles, items]);

    const handleViewPost = (postIndex: number) => {
        setViewingPostDetails({ posts: popularPosts, startIndex: postIndex });
    };

    return (
        <>
            <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
                <header className="p-4 flex items-center gap-4 border-b border-[var(--border-primary)]">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6 text-[var(--accent-primary)]" />
                    </button>
                    <div className="relative flex-grow">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-[var(--bg-secondary)] rounded-lg pl-10 pr-4 py-2 border border-[var(--border-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                            autoFocus
                        />
                    </div>
                </header>
                <main className="flex-grow overflow-y-auto">
                    {query.trim() === '' ? (
                        <div className="grid grid-cols-3 gap-px bg-[var(--border-primary)]">
                            {popularPosts.map((post, index) => (
                                <div 
                                    key={post.id} 
                                    onClick={() => handleViewPost(index)}
                                    className="aspect-square bg-[var(--bg-secondary)] cursor-pointer"
                                >
                                    <img src={post.image} alt="Post popular" className="w-full h-full object-cover"/>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <div className="border-b border-[var(--border-primary)] flex">
                                <button onClick={() => setActiveTab('accounts')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'accounts' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                    Contas
                                </button>
                                <button onClick={() => setActiveTab('products')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'products' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                    Produtos
                                </button>
                            </div>
                            {activeTab === 'accounts' ? (
                                <div>
                                    {filteredProfiles.length > 0 ? (
                                        filteredProfiles.map(profile => (
                                            <button 
                                                key={profile.user_id}
                                                onClick={() => onViewProfile(profile.user_id)}
                                                className="w-full flex items-center gap-4 p-3 text-left hover:bg-[var(--bg-tertiary)] transition-colors"
                                            >
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--bg-secondary)] flex items-center justify-center">
                                                    {/* Fix: Property 'profile_image_url' does not exist on type 'Profile', using 'avatar_url' instead */}
                                                    {profile.avatar_url ? (
                                                        <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover"/>
                                                    ) : (
                                                        <UserIcon className="w-6 h-6 text-[var(--text-secondary)] opacity-50" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{profile.username}</p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-[var(--text-secondary)] text-center p-8">Nenhum perfil encontrado.</p>
                                    )}
                                </div>
                            ) : (
                                 <div>
                                    {filteredItems.length > 0 ? (
                                        filteredItems.map(item => (
                                            <button 
                                                key={item.id}
                                                onClick={() => setQuickViewItem(item)}
                                                className="w-full flex items-center gap-4 p-3 text-left hover:bg-[var(--bg-tertiary)] transition-colors"
                                            >
                                                <img src={item.image} alt={item.name} className="w-12 h-16 object-cover rounded-md"/>
                                                <div className="flex-grow">
                                                    <p className="font-semibold">{item.name}</p>
                                                    <p className="text-sm text-[var(--accent-primary)]">{item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-[var(--text-secondary)] text-center p-8">Nenhum produto encontrado.</p>
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
