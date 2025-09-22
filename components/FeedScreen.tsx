import React, { useState } from 'react';
import type { Post, Item, Story } from '../types';
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
}

const YourStoryCard: React.FC<{ profileImage: string | null }> = ({ profileImage }) => (
    <div className="flex-shrink-0 w-36 h-56 flex flex-col rounded-xl overflow-hidden bg-gray-800 border border-gray-700 cursor-pointer group snap-start">
        <div className="h-3/5 w-full relative">
            <img 
                src={profileImage || 'https://i.pravatar.cc/150?u=me'} 
                alt="Seu story"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
        </div>
        <div className="h-2/5 w-full bg-gray-900 flex items-end justify-center pb-3">
             <span className="text-sm font-semibold text-gray-200">Criar story</span>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-4 border-gray-900">
          <PlusIcon className="w-6 h-6 text-white" />
        </div>
    </div>
);


const StoryCard: React.FC<{ story: Story }> = ({ story }) => (
  <div className="flex-shrink-0 w-36 h-56 rounded-xl overflow-hidden relative cursor-pointer group snap-start">
    <img 
        src={story.backgroundImage} 
        alt={`Story by ${story.user.name}`} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
    <div className="absolute top-2 left-2 p-0.5 bg-blue-500 rounded-full">
         <img 
            src={story.user.avatar} 
            alt={story.user.name} 
            className="w-9 h-9 rounded-full object-cover border-2 border-black" 
        />
    </div>
    <span className="absolute bottom-2 left-2 text-sm font-bold text-white shadow-black/50 [text-shadow:0_1px_3px_var(--tw-shadow-color)]">{story.user.name}</span>
  </div>
);


const FeedScreen: React.FC<FeedScreenProps> = ({ posts: initialPosts, stories, profileImage, onBack, onItemClick, onAddToCartMultiple, onBuyMultiple, onViewProfile }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [viewingPostIndex, setViewingPostIndex] = useState<number | null>(null);
  const [shoppingPost, setShoppingPost] = useState<Post | null>(null);

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
    setShoppingPost(post);
  };


  return (
    <>
      <div className="w-full h-full flex flex-col text-white bg-black animate-fadeIn">
        <Header title="Feed" onBack={onBack} />
        <div className="flex-grow pt-16 overflow-y-auto scroll-smooth">
          {/* Stories Section */}
          <div className="py-3 border-b border-gray-800">
            <div className="flex items-center space-x-3 px-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory scroll-smooth">
              <YourStoryCard profileImage={profileImage} />
              {stories.map(story => (
                <StoryCard 
                  key={story.id} 
                  story={story} 
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
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
          post={shoppingPost}
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