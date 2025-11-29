
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
  const [showAllComments, setShowAllComments] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Attempt to play with sound. This may be blocked by the browser.
          video.muted = false;
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              // Autoplay with sound failed. Play muted instead.
              console.log("Autoplay with sound was prevented. Playing muted.", error);
              video.muted = true;
              video.play();
            });
          }
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the video is visible/hidden
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
      const video = videoRef.current;
      if (video.paused) {
        video.muted = false; // Always try to play with sound on user interaction
        video.play();
      } else {
        video.pause();
      }
    }
  };

  const handleProgress = () => {
    if (videoRef.current?.duration) {
      const value = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(value);
    }
  };

  const positionClasses: Record<string, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };


  return (
    <div ref={cardRef} className="bg-[var(--bg-main)] flex flex-col animate-fadeIn border-b border-[var(--border-primary)]">
      {/* Card Header */}
      <button onClick={onViewProfile} className="p-3 flex items-center gap-3 text-left hover:bg-[var(--accent-primary)]/10 transition-colors">
        <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover border-2 border-zinc-700" />
        <div>
            <span className="font-bold text-sm text-black">{post.user.name}</span>
            {post.isSponsored && <p className="text-xs text-zinc-500">Patrocinado</p>}
        </div>
      </button>

      {/* Post Image or Video */}
      <div className="relative bg-black aspect-square overflow-hidden">
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
                
                {/* Product Overlay for specific layout */}
                {post.layout === 'product-overlay' && post.items.length > 0 && (
                    <div 
                        className={`absolute z-20 w-40 h-40 p-1 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95 ${positionClasses[post.overlayPosition || 'bottom-right']}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onItemClick(post.items[0]);
                        }}
                    >
                        <img 
                            src={post.items[0].image} 
                            alt={post.items[0].name} 
                            className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute bottom-0 right-0 bg-[var(--accent-primary)] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-tl-lg rounded-br-lg">
                            Ver
                        </div>
                    </div>
                )}

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
              className={`w-7 h-7 ${post.isLiked ? 'text-[var(--accent-primary)]' : 'text-black'}`} 
              fill={post.isLiked ? 'currentColor' : 'none'}
            />
          </button>
           <button onClick={onComment} className="transform hover:scale-110 transition-transform" aria-label="Comentar">
            <ChatBubbleIcon className="w-7 h-7 text-black" />
          </button>
          <button onClick={onShopTheLook} className="transform hover:scale-110 transition-transform" aria-label="Comprar o look">
            <ShoppingBagIcon className="w-7 h-7 text-black" />
          </button>
        </div>
        <p className="text-sm font-semibold mt-2 text-black">{post.likes.toLocaleString()} curtidas</p>
      </div>

      {/* Caption & Comments Section */}
      <div className="px-3 pb-4 text-sm space-y-1.5 text-black">
        {post.items.length > 0 && (
          <p>
            <span className="mr-1 text-zinc-600">
                {post.video ? 'Apresentando ' : 'Vestindo '}
            </span>
            {post.items.map((item, index) => (
            <React.Fragment key={item.id}>
                <button
                    onClick={() => onItemClick(item)}
                    className="font-semibold text-zinc-800 hover:underline focus:outline-none"
                >
                {item.name}
                </button>
                {index < post.items.length - 1 ? ', ' : ''}
            </React.Fragment>
            ))}
          </p>
        )}
        <p>
            <button onClick={onViewProfile} className="font-bold mr-2 hover:underline text-black">{post.user.name}</button>
            {post.caption && <span className="font-normal text-black">{post.caption}</span>}
        </p>

        {/* Comments */}
        <div className="space-y-1">
            {(showAllComments ? post.comments : post.comments.slice(0, 2)).map(comment => (
                <p key={comment.id} className="text-zinc-700">
                    <span className="font-semibold text-black mr-2">{comment.user.name}</span>
                    {comment.text}
                </p>
            ))}
        </div>
        
        {post.commentCount > 2 && !showAllComments && (
            <button onClick={() => setShowAllComments(true)} className="text-zinc-500 hover:underline">
                Ver todos os {post.commentCount} comentários
            </button>
        )}
      </div>
    </div>
  );
};

export default PostCard;
