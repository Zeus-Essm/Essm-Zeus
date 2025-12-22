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
             <div className="w-full h-full rounded-full overflow-hidden border-2 border-zinc-100 bg-zinc-50 flex items-center justify-center transition-transform shadow-sm group-active:scale-95">
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
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Início</span>
    </div>
);

const StoryCard: React.FC<{ story: Story }> = ({ story }) => (
    <div className="flex-shrink-0 flex flex-col items-center gap-2 w-20 cursor-pointer group snap-start">
        <div className="relative p-[2px] bg-gradient-to-tr from-amber-400 via-amber-500 to-orange-600 rounded-full shadow-md group-active:scale-95 transition-transform">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white">
              <img 
                  src={story.user.avatar_url || ''} 
                  alt={story.user.full_name || ''} 
                  className="w-full h-full object-cover" 
              />
            </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 w-full text-center truncate">{story.user.full_name?.split(' ')[0]}</span>
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
      const scrollAmount = carouselRef.current.clientWidth * 0.72;
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
      <div className="w-full h-full flex flex-col text-zinc-900 bg-[#FAFAFA] animate-fadeIn">
        <Header 
            title="FEED" 
            showLogo={true}
            unreadNotificationCount={unreadNotificationCount}
            onNotificationsClick={onNotificationsClick}
            onSearchClick={onSearchClick}
        />
        <div className="flex-grow pt-16 overflow-y-auto scroll-smooth pb-28 scrollbar-hide">
          {/* Stories Bar */}
          <div className="py-5 border-b border-zinc-100 bg-white">
            <div className="flex items-start space-x-4 px-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
              <YourStoryCard profileImage={profile?.avatar_url || null} />
              {stories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
          
          {/* Marcas e Produtos - Estética Premium */}
          <div className="py-8 bg-white border-b border-zinc-100">
            <div className="px-5 flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">Highlights</h2>
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] mt-1.5">Marcas e Produtos</p>
                </div>
                <button 
                  onClick={onNavigateToAllHighlights} 
                  className="text-[11px] font-black uppercase tracking-widest text-zinc-300 hover:text-amber-500 transition-colors border-b border-zinc-100 pb-1"
                >
                  Explorar
                </button>
            </div>
            
            <div className="relative px-1 group">
                {showLeftArrow && (
                    <button 
                        onClick={() => scrollCarousel('left')}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-zinc-100 shadow-2xl flex items-center justify-center text-zinc-800 transition-all hover:scale-110 active:scale-90"
                    >
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                )}
                
                {showRightArrow && (
                    <button 
                        onClick={() => scrollCarousel('right')}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-zinc-100 shadow-2xl flex items-center justify-center text-zinc-800 transition-all hover:scale-110 active:scale-90"
                    >
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>
                )}

                <div 
                    ref={carouselRef}
                    onScroll={handleCarouselScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth px-5 space-x-4 scrollbar-hide pb-2"
                >
                    {featuredCategories.map((category) => (
                        <div key={category.id} onClick={() => onSelectCategory(category)} className="relative flex-shrink-0 w-[78%] aspect-[4/3] snap-center">
                            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden cursor-pointer group shadow-xl border border-zinc-100/50 bg-zinc-900">
                                {category.video ? (
                                    <video 
                                        src={category.video} 
                                        autoPlay 
                                        loop 
                                        muted 
                                        playsInline 
                                        className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
                                    />
                                ) : (
                                    <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
                                    <h3 className="text-3xl font-black tracking-tighter uppercase italic text-white drop-shadow-2xl">{category.name}</h3>
                                    <div className="w-8 h-1 bg-amber-500 mt-2 rounded-full transform origin-left transition-all duration-500 group-hover:w-20"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
          
          {/* Feed Content */}
          <div className="px-5 pt-10 pb-4">
              <h2 className="text-2xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">Para você</h2>
              <div className="w-12 h-1 bg-zinc-900 mt-3 rounded-full opacity-10"></div>
          </div>

          <div className="space-y-6 pt-2">
            {posts.length > 0 ? (
                posts.map((post, index) => (
                    <div 
                        key={post.id} 
                        className="animate-slideUp" 
                        style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'backwards' }}
                    >
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
                            <div className="my-6 px-4">
                                <PromotedProfileCard businessProfile={businessProfile} promotedItems={promotedItems} onVisit={() => onViewProfile(businessProfile.id)} />
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div className="p-20 text-center flex flex-col items-center opacity-30">
                    <PlusIcon className="w-16 h-16 text-zinc-400 mb-6" strokeWidth={1} />
                    <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">O feed está em silêncio</p>
                    <button onClick={onStartCreate} className="mt-6 text-[12px] font-black uppercase tracking-widest text-amber-500 underline underline-offset-8">Criar primeira tendência</button>
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