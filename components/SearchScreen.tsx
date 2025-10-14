import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeftIcon, SearchIcon } from './IconComponents';
import type { Post, Profile, Item } from '../types';
import ImageViewModal from './ImageViewModal';

interface SearchScreenProps {
    onBack: () => void;
    posts: Post[];
    onViewProfile: (profileId: string) => void;
    onLikePost: (postId: string) => void;
    onItemClick: (item: Item) => void;
    onOpenComments: (postId: string) => void;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ 
    onBack, 
    posts, 
    onViewProfile,
    onLikePost,
    onItemClick,
    onOpenComments
}) => {
    const [query, setQuery] = useState('');
    const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
    const [viewingPostDetails, setViewingPostDetails] = useState<{ posts: Post[]; startIndex: number } | null>(null);

    const popularPosts = useMemo(() => {
        // Create a copy before sorting to avoid mutating the original prop
        return [...posts].sort((a, b) => b.likes - a.likes);
    }, [posts]);
    
    // Create a unique list of profiles from all posts for searching
    const allProfiles = useMemo(() => {
        const profileMap = new Map<string, Profile>();
        posts.forEach(post => {
            if (!profileMap.has(post.user.id)) {
                profileMap.set(post.user.id, {
                    id: post.user.id,
                    username: post.user.name,
                    profile_image_url: post.user.avatar,
                    bio: null,
                    cover_image_url: null,
                    account_type: 'personal', // Assumption
                });
            }
        });
        return Array.from(profileMap.values());
    }, [posts]);

    useEffect(() => {
        if (query.trim() === '') {
            setFilteredProfiles([]);
            return;
        }

        const lowercasedQuery = query.toLowerCase();
        const results = allProfiles.filter(profile =>
            profile.username.toLowerCase().includes(lowercasedQuery)
        );
        setFilteredProfiles(results);

    }, [query, allProfiles]);

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
                            placeholder="Pesquisar perfis..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-[var(--bg-secondary)] rounded-lg pl-10 pr-4 py-2 border border-[var(--border-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                            autoFocus
                        />
                    </div>
                </header>
                <main className="flex-grow overflow-y-auto">
                    {query.trim() === '' ? (
                        // Grid view for popular posts
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
                        // List view for search results
                        <div>
                            {filteredProfiles.length > 0 ? (
                                filteredProfiles.map(profile => (
                                    <button 
                                        key={profile.id}
                                        onClick={() => onViewProfile(profile.id)}
                                        className="w-full flex items-center gap-4 p-3 text-left hover:bg-[var(--bg-tertiary)] transition-colors"
                                    >
                                        <img src={profile.profile_image_url || 'https://i.postimg.cc/jSVNgmm4/IMG-2069.jpg'} alt={profile.username} className="w-12 h-12 rounded-full object-cover"/>
                                        <div>
                                            <p className="font-semibold">{profile.username}</p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="text-[var(--text-secondary)] text-center p-8">Nenhum perfil encontrado.</p>
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
        </>
    );
};

export default SearchScreen;