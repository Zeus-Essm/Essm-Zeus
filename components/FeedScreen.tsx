import React, { useState } from 'react';
import type { Post, Item } from '../types';
import Header from './Header';
import PostCard from './PostCard';

interface FeedScreenProps {
  posts: Post[];
  onBack: () => void;
  onItemClick: (item: Item) => void; // Para quando o usuário clica em um item no post
}

const FeedScreen: React.FC<FeedScreenProps> = ({ posts: initialPosts, onBack, onItemClick }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const handleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, likes: post.isLiked ? post.likes -1 : post.likes + 1, isLiked: !post.isLiked } : post
      )
    );
  };

  return (
    <div className="w-full h-full flex flex-col text-white bg-black animate-fadeIn">
      <Header title="Feed" onBack={onBack} />
      <div className="flex-grow pt-16 overflow-y-auto">
        <div className="space-y-2">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id)}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedScreen;