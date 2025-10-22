import React, { useRef, useEffect, useState } from 'react';
import type { Post, Item } from '../types';
import { HeartIcon, ShoppingBagIcon, ChatBubbleIcon, PlayIcon } from './IconComponents';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
        }
      },
      { threshold: 0.5 } // Pause when less than 50% of the video is visible
    );

    const currentCardRef = cardRef.current;
    if (currentCardRef) {
      observer.observe(currentCardRef);
    }

    return () => {
      if (currentCardRef) {
        observer.unobserve(currentCardRef);
      }
    };
  }, []);

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering other click handlers
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleProgress = () => {
    if (videoRef.current?.duration) {
      const value = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(value);
    }
  };


  return (
    <div ref={cardRef} className="bg-[var(--bg-main)] flex flex-col animate-fadeIn border-b border-[var(--border-primary)]">
      {/* Card Header */}
      <button onClick={onViewProfile} className="p-3 flex items-center gap-3 text-left hover:bg-[var(--accent-primary)]/10 transition-colors">
        <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover border-2 border-zinc-700" />
        <div>
            <span className="font-bold text-sm">{post.user.name}</span>
            {post.isSponsored && <p className="text-xs text-[var(--text-secondary)]">Patrocinado</p>}
        </div>
      </button>

      {/* Post Image or Video */}
      <div className="relative bg-black aspect-square">
        {post.video ? (
            <>
                <video
                    ref={videoRef}
                    src={post.video}
                    loop
                    playsInline
                    onClick={handleVideoClick}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={handleProgress}
                    poster={post.image}
                    className="w-full h-full object-cover cursor-pointer"
                />
                <div 
                  onClick={handleVideoClick}
                  className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${!isPlaying ? 'opacity-100 bg-black/20' : 'opacity-0'}`}
                >
                  {!isPlaying && <PlayIcon className="w-16 h-16 text-white/80 drop-shadow-lg" />}
                </div>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                    <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
                </div>
            </>
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