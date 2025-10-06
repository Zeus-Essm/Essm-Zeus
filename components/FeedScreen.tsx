
import React, { useState } from 'react';
import type { Post, Item, Story, MarketplaceType, Category } from '../types';
import { CATEGORIES } from '../constants';
import Header from './Header';
import PostCard from './PostCard';
import { PlusIcon } from './IconComponents';
import ImageViewModal from './ImageViewModal';
import ShopTheLookModal from './ShopTheLookModal';

interface FeedScreenProps {
  posts: Post[];
  stories: Story[];
  profileImage: string | null;
  onBack: () => void;
  onItemClick: (item: Item) => void;
  onAddToCartMultiple: (items: Item[]) => void;
  onBuyMultiple: (items: Item[]) => void;
  onViewProfile: (profileId: string) => void;
  onSelectCategory: (category: Category) => void;
}

const YourStoryCard: React.FC<{ profileImage: string | null }> = ({ profileImage }) => (
    <div className="flex-shrink-0 flex flex-col items-center gap-1.5 w-24 cursor-pointer group snap-start">
        <div className="relative w-20 h-20">
             <img 
                src={profileImage || 'https://i.pravatar.cc/150?u=me'} 
                alt="Seu story"
                className="w-full h-full rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-[var(--accent-primary)] rounded-full flex items-center justify-center border-2 border-[var(--bg-main)] group-hover:bg-yellow-300 transition-colors">
              <PlusIcon className="w-4 h-4 text-[var(--accent-primary-text)]" />
            </div>
        </div>
        <span className="text-xs text-[var(--text-tertiary)] w-full text-center truncate">Seu story</span>
    </div>
);

const StoryCard: React.FC<{ story: Story }> = ({ story }) => (
    <div className="flex-shrink-0 flex flex-col items-center gap-1.5 w-24 cursor-pointer group snap-start">
        <div className="relative p-1 bg-gradient-to-tr from-yellow-400 via-amber-500 to-orange-600 rounded-full">
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


const FeedScreen: React.FC<FeedScreenProps> = ({ posts: initialPosts, stories, profileImage, onBack, onItemClick, onAddToCartMultiple, onBuyMultiple, onViewProfile, onSelectCategory }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [viewingPostIndex, setViewingPostIndex] = useState<number | null>(null);
  const [shoppingPost, setShoppingPost] = useState<{post: Post, type: MarketplaceType} | null>(null);

  const handleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked } : post
      )
    );
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
  

  return (
    <>
      <div className="w-full h-full flex flex-col text-[var(--text-primary)] bg-[var(--bg-main)] animate-fadeIn">
        <Header title="Feed" onBack={onBack} />
        <div className="flex-grow pt-16 overflow-y-auto scroll-smooth">
          {/* Stories Section */}
          <div className="py-4 border-b border-[var(--border-primary)]">
            <div className="flex items-start space-x-4 px-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory scroll-smooth">
              <YourStoryCard profileImage={profileImage} />
              {stories.map(story => (
                <StoryCard 
                  key={story.id} 
                  story={story} 
                />
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLike(post.id)}
                onItemClick={onItemClick}
                onShopTheLook={() => handleShopTheLook(post)}
                onViewProfile={() => onViewProfile(post.user.id)}
                onImageClick={() => handleViewPost(index)}
              />
            ))}
          </div>
        </div>
      </div>
      {viewingPostIndex !== null && (
        <ImageViewModal
          posts={posts}
          startIndex={viewingPostIndex}
          onClose={handleClosePostView}
          onLike={handleLike}
          onItemClick={onItemClick}
          onViewProfile={onViewProfile}
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
    </>
  );
};

export default FeedScreen;
