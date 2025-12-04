import React, { useState, useRef, useEffect } from 'react';
import type { Post, Item, Story, MarketplaceType, Category, Profile, Comment, BusinessProfile } from '../types';
import { CATEGORIES, INITIAL_POSTS } from '../constants';
import Header from './Header';
import PostCard from './PostCard';
import { PlusIcon } from './IconComponents';
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
  unreadNotificationCount: number;
  onNotificationsClick: () => void;
  onSearchClick: () => void;
}

const YourStoryCard: React.FC<{ profileImage: string | null }> = ({ profileImage }) => (
    <div className="flex-shrink-0 flex flex-col items-center gap-1.5 w-24 cursor-pointer group snap-start">
        <div className="relative w-20 h-20">
             <img 
                src={profileImage || 'https://i.pravatar.cc/150?u=me'} 
                alt="Seu story"
                className="w-full h-full rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-[var(--accent-primary)] rounded-full flex items-center justify-center border-2 border-[var(--bg-main)] group-hover:bg-amber-600 transition-colors">
              <PlusIcon className="w-4 h-4 text-[var(--accent-primary-text)]" />
            </div>
        </div>
        <span className="text-xs text-[var(--text-tertiary)] w-full text-center truncate">Seu story</span>
    </div>
);

const StoryCard: React.FC<{ story: Story }> = ({ story }) => (
    <div className="flex-shrink-0 flex flex-col items-center gap-1.5 w-24 cursor-pointer group snap-start">
        <div className="relative p-1 bg-gradient-to-tr from-yellow-300 via-amber-500 to-orange-500 rounded-full">
            <img 
                src={story.user.avatar} 
                alt={story.user.name} 
                className="w-18 h-18 rounded-full object-cover border-2 border-[var(--bg-main)] transform group-hover:scale-110 transition-transform" 
            />
        </div>
        <span className="text-xs text-[var(--text-tertiary)] w-full text-center truncate">{story.user.name}</span>
    </div>
);

const getCategoryTypeFromItem = (item: Item): MarketplaceType => {
    const rootCategoryId = item.category.split('_')[0];
    const category = CATEGORIES.find(c => c.id === rootCategoryId);
    return category?.type || 'fashion';
};


const FeedScreen: React.FC<FeedScreenProps> = ({ 
    posts, 
    stories, 
    profile, 
    businessProfile,
    isProfilePromoted,
    promotedItems,
    onBack, 
    onItemClick, 
    onAddToCartMultiple, 
    onBuyMultiple, 
    onViewProfile, 
    onSelectCategory,
    onLikePost,
    onAddComment,
    onNavigateToAllHighlights,
    unreadNotificationCount,
    onNotificationsClick,
    onSearchClick,
 }) => {
  const [viewingPostIndex, setViewingPostIndex] = useState<number | null>(null);
  const [shoppingPost, setShoppingPost] = useState<{post: Post, type: MarketplaceType} | null>(null);
  const [commentingPost, setCommentingPost] = useState<Post | null>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const featuredCategories: Category[] = [
      CATEGORIES.find(c => c.id === 'lv')!,
      CATEGORIES.find(c => c.id === 'new_feeling')!,
      CATEGORIES.find(c => c.id === 'mdc')!,
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
  
  // Keep commentingPost state in sync with the main posts state
  useEffect(() => {
    if (commentingPost) {
        const updatedPost = posts.find(p => p.id === commentingPost.id);
        if (updatedPost) {
            setCommentingPost(updatedPost);
        } else {
            // The post might have been deleted, so close the modal
            setCommentingPost(null);
        }
    }
  }, [posts, commentingPost]);

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

  const handleViewPost = (index: number) => {
    setViewingPostIndex(index);
  };

  const handleClosePostView = () => {
    setViewingPostIndex(null);
  };

  const handleShopTheLook = (post: Post) => {
    const type = post.items.length > 0 ? getCategoryTypeFromItem(post.items[0]) : 'fashion';
    setShoppingPost({ post, type });
  };
  
  const handleOpenComments = (postId: string) => {
    const postToComment = posts.find(p => p.id === postId);
    if (postToComment) {
        setCommentingPost(postToComment);
    }
  };

  return (
    <>
      <div className="w-full h-full flex flex-col text-[var(--text-primary)] bg-[var(--bg-main)] animate-fadeIn">
        <Header 
            title="Feed" 
            showLogo={true}
            unreadNotificationCount={unreadNotificationCount}
            onNotificationsClick={onNotificationsClick}
            onSearchClick={onSearchClick}
        />
        <div className="flex-grow pt-16 overflow-y-auto scroll-smooth pb-20">
          {/* Stories Section */}
          <div className="py-4 border-b border-[var(--border-primary)]">
            <div className="flex items-start space-x-4 px-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory scroll-smooth">
              <YourStoryCard profileImage={profile?.profile_image_url || null} />
              {stories.map(story => (
                <StoryCard 
                  key={story.id} 
                  story={story} 
                />
              ))}
            </div>
          </div>
          
          {/* Featured Categories (Highlights) Section */}
          <div className="relative border-b border-[var(--border-primary)] py-4">
            <div className="px-4 flex justify-between items-center mb-3">
                <button
                    onClick={onNavigateToAllHighlights}
                    className="text-left hover:opacity-80 transition-opacity"
                >
                    <h2 className="text-xl font-bold text-[var(--accent-primary)] text-glow tracking-wide">
                        Marcas e produtos
                    </h2>
                </button>
                <button
                    onClick={onNavigateToAllHighlights}
                    className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    Ver todos
                </button>
            </div>
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-[var(--accent-primary)]">
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-[var(--accent-primary)]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            )}
          </div>
          
           {/* For You Section */}
          <div className="px-4 pt-4">
              <h2 className="text-xl font-bold text-[var(--accent-primary)] text-glow tracking-wide">Para você</h2>
          </div>

          <div className="space-y-2 pt-2">
            {posts.map((post, index) => (
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
                    <PromotedProfileCard
                        businessProfile={businessProfile}
                        promotedItems={promotedItems}
                        onVisit={() => onViewProfile(businessProfile.id)}
                    />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      {viewingPostIndex !== null && (
        <ImageViewModal
          posts={posts}
          startIndex={viewingPostIndex}
          onClose={handleClosePostView}
          onLike={onLikePost}
          onItemClick={onItemClick}
          onViewProfile={onViewProfile}
          onComment={handleOpenComments}
        />
      )}
      {shoppingPost && (
        <ShopTheLookModal
          post={shoppingPost.post}
          postType={shoppingPost.type}
          onClose={() => setShoppingPost(null)}
          onAddToCart={(items) => {
            onAddToCartMultiple(items);
            setShoppingPost(null);
          }}
          onBuyNow={(items) => onBuyMultiple(items)}
        />
      )}
      {commentingPost && (
          <CommentsModal
            post={commentingPost}
            currentUser={profile}
            onClose={() => setCommentingPost(null)}
            onAddComment={onAddComment}
          />
      )}
    </>
  );
};

export default FeedScreen;