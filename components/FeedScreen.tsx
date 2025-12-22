
import React, { useState, useRef, useEffect } from 'react';
import type { Post, Item, Story, MarketplaceType, Category, Profile, BusinessProfile } from '../types';
import { CATEGORIES } from '../constants';
import Header from './Header';
import PostCard from './PostCard';
import { PlusIcon, UserIcon, ChevronRightIcon, ChevronLeftIcon } from './IconComponents';
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
             <div className="w-full h-full rounded-full overflow-hidden border-2 border-zinc-100 bg-zinc-50 flex items-center justify-center transition-transform shadow-sm">
                  {profileImage ? (
                      <img 
                          src={profileImage} 
                          alt="Seu story"
                          className="w-full h-full object-cover"
                      />
                  ) : (
                      <UserIcon className="w-8 h-8 text-zinc-300" />
                  )}
             </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white shadow-md z-10">
              <PlusIcon className="w-3 h-3 text-white" strokeWidth={4} />
            </div>
        </div>
        <span className="text-[11px] font-medium text-zinc-500 text-center">Seu story</span>
    </div>
);

const StoryCard: React.FC<{ story: Story }> = ({ story }) => (
    <div className="flex-shrink-0 flex flex-col items-center gap-2 w-20 cursor-pointer group snap-start">
        <div className="relative p-[2px] bg-gradient-to-tr from-amber-400 to-amber-500 rounded-full shadow-sm">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white">
              <img 
                  src={story.user.avatar} 
                  alt={story.user.name} 
                  className="w-full h-full object-cover" 
              />
            </div>
        </div>
        <span className="text-[11px] font-medium text-zinc-500 w-full text-center truncate">{story.user.name}</span>
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
  
  // Carousel logic for featured categories
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleCarouselScroll = () => {
      if (!carouselRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 20);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
      if (!carouselRef.current) return;
      const scrollAmount = carouselRef.current.clientWidth * 0.72; // Tries to align with card width
      carouselRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth'
      });
  };

  const featuredCategories = CATEGORIES.slice(0, 5);
  
  const handleShopTheLook = (post: Post) => {
    setShoppingPost({ post, type: 'fashion' });
  };

  const handleViewPost = (index: number) => {
    setViewingPostIndex(index);
  };

  const handleOpenComments = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setCommentingPost(post);
    }
  };

  return (
    <>
      <div className="w-full h-full flex flex-col text-zinc-900 bg-white animate-fadeIn">
        <Header 
            title="FEED" 
            showLogo={true}
            unreadNotificationCount={unreadNotificationCount}
            onNotificationsClick={onNotificationsClick}
            onSearchClick={onSearchClick}
        />
        <div className="flex-grow pt-16 overflow-y-auto scroll-smooth pb-28">
          {/* Stories Bar */}
          <div className="py-4 border-b border-zinc-50 bg-white">
            <div className="flex items-start space-x-3 px-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
              <YourStoryCard profileImage={profile?.avatar_url || null} />
              {stories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
          
          {/* Featured Collections Section (Marcas e produtos) */}
          <div className="py-6 border-b border-zinc-50">
            <div className="px-5 flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-amber-600 tracking-tight leading-none">Marcas e produtos</h2>
                <button onClick={onNavigateToAllHighlights} className="text-[12px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors">
                  Ver todos
                </button>
            </div>
            
            <div className="relative px-1 group">
                {/* Botões de Navegação Bidirecional Inteligente */}
                {showLeftArrow && (
                    <button 
                        onClick={() => scrollCarousel('left')}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-zinc-100 shadow-xl flex items-center justify-center text-zinc-800 transition-all hover:bg-white hover:scale-110 active:scale-90"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                )}
                
                {showRightArrow && (
                    <button 
                        onClick={() => scrollCarousel('right')}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-zinc-100 shadow-xl flex items-center justify-center text-zinc-800 transition-all hover:bg-white hover:scale-110 active:scale-90"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                )}

                <div 
                    ref={carouselRef}
                    onScroll={handleCarouselScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 space-x-3 scrollbar-hide pb-2"
                >
                    {featuredCategories.map((category) => (
                        <div key={category.id} onClick={() => onSelectCategory(category)} className="relative flex-shrink-0 w-[72%] aspect-[4/3] snap-center">
                            <div className="relative w-full h-full rounded-[2rem] overflow-hidden cursor-pointer group shadow-lg border border-zinc-100 bg-zinc-900">
                                {category.video ? (
                                    <video 
                                        src={category.video} 
                                        autoPlay 
                                        loop 
                                        muted 
                                        playsInline 
                                        className="w-full h-full object-cover transition-transform duration-[1.5s]" 
                                    />
                                ) : (
                                    <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-[1.5s]" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                    <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white drop-shadow-lg">{category.name}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
          
          {/* Para Você Section */}
          <div className="px-5 pt-6 pb-2">
              <h2 className="text-xl font-bold text-amber-600 tracking-tight leading-none">Para você</h2>
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
                <div className="p-16 text-center flex flex-col items-center opacity-30">
                    <PlusIcon className="w-16 h-16 text-zinc-400 mb-6" strokeWidth={1} />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Nenhum post disponível no momento</p>
                    <button onClick={onStartCreate} className="mt-6 text-[12px] font-black uppercase tracking-widest text-amber-500 underline">Criar post agora</button>
                </div>
            )}
          </div>
        </div>
      </div>
      
      {viewingPostIndex !== null && <ImageViewModal posts={posts} startIndex={viewingPostIndex} onClose={() => setViewingPostIndex(null)} onLike={onLikePost} onItemClick={onItemClick} onViewProfile={onViewProfile} onComment={handleOpenComments} />}
      {shoppingPost && <ShopTheLookModal post={shoppingPost.post} postType={shoppingPost.type} onClose={() => setShoppingPost(null)} onAddToCart={(items) => { onAddToCartMultiple(items); setShoppingPost(null); }} onBuyNow={(items) => onBuyMultiple(items)} />}
      {commentingPost && <CommentsModal post={commentingPost} currentUser={profile} onClose={() => setCommentingPost(null)} onAddComment={onAddComment} />}
    </>
  );
};

export default FeedScreen;
