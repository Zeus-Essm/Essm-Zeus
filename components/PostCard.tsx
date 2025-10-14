import React from 'react';
import type { Post, Item } from '../types';
import { HeartIcon, ShoppingBagIcon, ChatBubbleIcon } from './IconComponents';

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onItemClick: (item: Item) => void;
  onShopTheLook: () => void;
  onViewProfile: () => void;
  onImageClick: () => void;
  onComment: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onItemClick, onShopTheLook, onViewProfile, onImageClick, onComment }) => {
  return (
    <div className="bg-[var(--bg-main)] flex flex-col animate-fadeIn border-b border-[var(--border-primary)]">
      {/* Card Header */}
      <button onClick={onViewProfile} className="p-3 flex items-center gap-3 text-left hover:bg-[var(--accent-primary)]/10 transition-colors">
        <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover border-2 border-zinc-700" />
        <div>
            <span className="font-bold text-sm">{post.user.name}</span>
            {post.isSponsored && <p className="text-xs text-[var(--text-secondary)]">Patrocinado</p>}
        </div>
      </button>

      {/* Post Image or Video */}
      <div className="aspect-w-1 aspect-h-1 bg-black">
        {post.video ? (
            <video
                src={post.video}
                loop
                playsInline
                controls
                poster={post.image}
                className="w-full h-full object-cover"
            />
        ) : (
            <div onClick={onImageClick} className="w-full h-full cursor-pointer">
                <img src={post.image} alt={`Look by ${post.user.name}`} className="w-full h-full object-cover" />
            </div>
        )}
      </div>

      {/* Action Buttons & Likes */}
      <div className="p-3">
        <div className="flex items-center gap-4">
          <button onClick={onLike} className="transform hover:scale-110 transition-transform" aria-label="Curtir">
            <HeartIcon 
              className={`w-7 h-7 ${post.isLiked ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`} 
              fill={post.isLiked ? 'currentColor' : 'none'}
            />
          </button>
           <button onClick={onComment} className="transform hover:scale-110 transition-transform" aria-label="Comentar">
            <ChatBubbleIcon className="w-7 h-7 text-[var(--text-primary)]" />
          </button>
          <button onClick={onShopTheLook} className="transform hover:scale-110 transition-transform" aria-label="Comprar o look">
            <ShoppingBagIcon className="w-7 h-7 text-[var(--text-primary)]" />
          </button>
        </div>
        <p className="text-sm font-semibold mt-2">{post.likes.toLocaleString()} curtidas</p>
      </div>

      {/* Caption / Item List */}
      <div className="px-3 pb-4 text-sm">
         {post.commentCount > 0 && (
            <button onClick={onComment} className="text-[var(--text-secondary)] mb-1 hover:underline">
                Ver todos os {post.commentCount} comentários
            </button>
        )}
        <p>
          <button onClick={onViewProfile} className="font-bold mr-2 hover:underline">{post.user.name}</button>
          {post.items.length > 0 ? (post.video ? 'apresentando ' : 'vestindo ') : 'compartilhou um novo vídeo.'}
          {post.items.map((item, index) => (
            <React.Fragment key={item.id}>
              <button 
                onClick={() => onItemClick(item)}
                className="font-semibold text-[var(--accent-primary)] hover:underline focus:outline-none"
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