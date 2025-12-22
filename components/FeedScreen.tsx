
import React, { useState, useRef, useEffect } from 'react';
/* Import BusinessProfile from types */
import type { Post, Item, Story, MarketplaceType, Category, Profile, BusinessProfile } from '../types';
import { CATEGORIES } from '../constants';
import Header from './Header';
import PostCard from './PostCard';
import { PlusIcon, UserIcon, ChevronRightIcon } from './IconComponents';
import ImageViewModal from './ImageViewModal';
import ShopTheLookModal from './ShopTheLookModal';
import CommentsModal from './CommentsModal';
import PromotedProfileCard from './PromotedProfileCard';

interface FeedScreenProps {
  posts: Post[];
  stories: Story[];
  profile: Profile;
  businessProfile: BusinessProfile | null;
  isProfilePromoted: boolean;
  promotedItems: { id: string; image: string; }[];
  onBack: () => void;
  onItemClick: (item: Item) => void;
  onAddToCartMultiple: (items: Item[]) => void;
  onBuyMultiple: (items: Item[]) => void;
  onViewProfile: (profileId: string) => void;
  onSelectCategory: (category: Category) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onNavigateToAllHighlights: () => void;
  onStartCreate: () => void;
  unreadNotificationCount: number;
  onNotificationsClick: () => void;
  onSearchClick: () => void;
}

const YourStoryCard: React.FC<{ profileImage: string | null }> = ({ profileImage }) => (
    <div className="flex-shrink-0 flex flex-col items-center gap-2 w-20 cursor-pointer group snap-start">
        <div className="relative w-16 h-16">
             <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-[var(--border-primary)] bg-[var(--bg-tertiary)] flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-lg">
                <div className="-rotate-3 group-hover:rotate-0 transition-transform w-full h-full">
                  {profileImage ? (
                      <img 
                          src={profileImage} 
                          alt="Seu story"
                          className="w-full h-full object-cover"
                      />
                  ) : (
                      <UserIcon className="w-8 h-8 text-[var(--text-secondary)] opacity-50 mx-auto mt-4" />
                  )}
                </div>
             </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center border-2 border-[var(--bg-main)] shadow-lg z-10 group-active:scale-90 transition-transform">
              <PlusIcon className="w-3.5 h-3.5 text-white" strokeWidth={4} />
            </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-400 group-hover:text-amber-500 transition-colors">Story</span>
    </div>
);

const StoryCard: React.FC<{ story: Story }> = ({ story }) => (
    <div className="flex-shrink-0 flex flex-col items-center gap-2 w-20 cursor-pointer group snap-start">
        <div className="relative p-0.5 bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 rounded-2xl rotate-3 group-hover:rotate-0 transition-transform shadow-lg">
            <div className="w-16 h-16 rounded-[1.1rem] overflow-hidden border-2 border-[var(--bg-main)] -rotate-3 group-hover:rotate-0 transition-transform">
              <img 
                  src={story.user.avatar} 
                  alt={story.user.name} 
                  className="w-full h-full object-cover" 
              />
            </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-tighter text-[var(--text-tertiary)] w-full text-center truncate">{story.user.name}</span>
    </div>
);

const FeedScreen: React.FC<FeedScreenProps> = ({ 
    posts, 
    stories, 
    profile, 
    businessProfile,
    isProfilePromoted,
    promotedItems,
    onItemClick, 
    onAddToCartMultiple, 
    onBuyMultiple, 
    onViewProfile, 
    onSelectCategory,
    onLikePost,
    onAddComment,
    onNavigateToAllHighlights,
    onStartCreate,
    unreadNotificationCount,
    onNotificationsClick,
    onSearchClick,
 }) => {
  const [viewingPostIndex, setViewingPostIndex] = useState<number | null>(null);
  const [shoppingPost, setShoppingPost] = useState<{post: Post, type: MarketplaceType} | null>(null);
  const [commentingPost, setCommentingPost] = useState<Post | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const featuredCategories = CATEGORIES.slice(0, 4);
  
  /* Handler to open the "Shop the Look" modal */
  const handleShopTheLook = (post: Post) => {
    setShoppingPost({ post, type: 'fashion' });
  };

  /* Handler to open the post detail view (ImageViewModal) */
  const handleViewPost = (index: number) => {
    setViewingPostIndex(index);
  };

  /* Handler to open the comments modal for a specific post */
  const handleOpenComments = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setCommentingPost(post);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
                    setCurrentIndex(index);
                }
            });
        },
        { root: container, threshold: 0.6 }
    );

    Array.from(container.children).forEach(child => {
        if (child instanceof Element) observer.observe(child);
    });

    return () => {
        Array.from(container.children).forEach(child => {
            if (child instanceof Element) observer.unobserve(child);
        });
    };
  }, []);
  
  return (
    <>
      <div className="w-full h-full flex flex-col text-[var(--text-primary)] bg-[var(--bg-main)] animate-fadeIn">
        <Header 
            title="FEED" 
            showLogo={true}
            unreadNotificationCount={unreadNotificationCount}
            onNotificationsClick={onNotificationsClick}
            onSearchClick={onSearchClick}
        />
        <div className="flex-grow pt-16 overflow-y-auto scroll-smooth pb-24">
          {/* Stories Bar */}
          <div className="py-6 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/30">
            <div className="flex items-start space-x-6 px-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
              <YourStoryCard profileImage={profile?.avatar_url || null} />
              {stories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
          
          {/* Featured Collections Slider */}
          <div className="relative py-8 bg-gradient-to-b from-[var(--bg-main)] to-[var(--bg-secondary)]/20">
            <div className="px-5 flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic leading-none">Explorar</h2>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mt-2 italic">Marcas em Destaque</p>
                </div>
                <button onClick={onNavigateToAllHighlights} className="flex items-center gap-1 text-[11px] font-black text-zinc-400 uppercase tracking-widest hover:text-amber-500 transition-colors">
                  Ver Tudo
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </button>
            </div>
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 space-x-5 pl-5 pr-12 scrollbar-hide"
            >
                {featuredCategories.map((category, index) => (
                    <div key={category.id} onClick={() => onSelectCategory(category)} className="relative flex-shrink-0 w-[82%] aspect-[4/5] snap-center" data-index={index}>
                        <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden cursor-pointer group shadow-2xl transition-all duration-500 hover:scale-[1.02] border-4 border-white dark:border-zinc-800">
                            {category.video ? (
                                <video src={category.video} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                            ) : (
                                <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                                <h3 className="text-4xl font-black tracking-tighter uppercase leading-[0.9] text-white italic drop-shadow-2xl mb-2">{category.name}</h3>
                                <div className="w-12 h-1 bg-amber-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
          
          {/* For You Section */}
          <div className="px-5 pt-4 pb-2">
              <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Para Você</h2>
          </div>

          <div className="space-y-4 pt-2">
            {posts.length > 0 ? (
                posts.map((post, index) => (
                    <React.Fragment key={post.id}>
                        <PostCard
                            post={post}
                            onLike={() => onLikePost(post.id)}
                            onItemClick={onItemClick}
                            onShopTheLook={() => handleShopTheLook(post)}
                            onViewProfile={() => onViewProfile(post.user.id)}
                            onImageClick={() => handleViewPost(index)}
                            onComment={() => handleOpenComments(post.id)}
                        />
                        {index === 1 && isProfilePromoted && businessProfile && (
                            <PromotedProfileCard businessProfile={businessProfile} promotedItems={promotedItems} onVisit={() => onViewProfile(businessProfile.id)} />
                        )}
                    </React.Fragment>
                ))
            ) : (
                <div className="p-16 text-center flex flex-col items-center opacity-30 grayscale">
                    <PlusIcon className="w-16 h-16 text-zinc-400 mb-6" strokeWidth={1} />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Seu Feed está pronto para brilhar</p>
                    <button onClick={onStartCreate} className="mt-6 text-[11px] font-black uppercase tracking-widest text-amber-500 underline">Criar agora</button>
                </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modals remain same functionality, assuming styling is handled in their respective files or global CSS */}
      {viewingPostIndex !== null && <ImageViewModal posts={posts} startIndex={viewingPostIndex} onClose={() => setViewingPostIndex(null)} onLike={onLikePost} onItemClick={onItemClick} onViewProfile={onViewProfile} onComment={handleOpenComments} />}
      {shoppingPost && <ShopTheLookModal post={shoppingPost.post} postType={shoppingPost.type} onClose={() => setShoppingPost(null)} onAddToCart={(items) => { onAddToCartMultiple(items); setShoppingPost(null); }} onBuyNow={(items) => onBuyMultiple(items)} />}
      {commentingPost && <CommentsModal post={commentingPost} currentUser={profile} onClose={() => setCommentingPost(null)} onAddComment={onAddComment} />}
    </>
  );
};

export default FeedScreen;
