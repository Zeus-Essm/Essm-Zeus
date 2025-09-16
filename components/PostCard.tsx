import React from 'react';
import type { Post, Item } from '../types';
import { HeartIcon, ShareIcon } from './IconComponents';

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onItemClick: (item: Item) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onItemClick }) => {
  return (
    <div className="bg-black flex flex-col animate-fadeIn border-b border-gray-800">
      {/* Card Header */}
      <div className="p-3 flex items-center gap-3">
        <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-700" />
        <span className="font-bold text-sm">{post.user.name}</span>
      </div>

      {/* Post Image */}
      <div className="aspect-w-1 aspect-h-1">
        <img src={post.image} alt={`Look by ${post.user.name}`} className="w-full h-full object-cover" />
      </div>

      {/* Action Buttons & Likes */}
      <div className="p-3">
        <div className="flex items-center gap-4">
          <button onClick={onLike} className="transform hover:scale-110 transition-transform" aria-label="Curtir">
            <HeartIcon 
              className={`w-7 h-7 ${post.isLiked ? 'text-red-500' : 'text-white'}`} 
              fill={post.isLiked ? 'currentColor' : 'none'}
            />
          </button>
          <button className="transform hover:scale-110 transition-transform" aria-label="Compartilhar">
            <ShareIcon className="w-7 h-7 text-white" />
          </button>
        </div>
        <p className="text-sm font-semibold mt-2">{post.likes.toLocaleString()} curtidas</p>
      </div>

      {/* Caption / Item List */}
      <div className="px-3 pb-4 text-sm">
        <p>
          <span className="font-bold mr-2">{post.user.name}</span>
          vestindo{' '}
          {post.items.map((item, index) => (
            <React.Fragment key={item.id}>
              <button 
                onClick={() => onItemClick(item)}
                className="font-semibold text-blue-400 hover:underline focus:outline-none"
              >
                {item.name}
              </button>
              {index < post.items.length - 1 ? ', ' : '.'}
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  );
};

export default PostCard;