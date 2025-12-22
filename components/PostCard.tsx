
import React, { useRef, useEffect, useState } from 'react';
import type { Post, Item } from '../types';
import { HeartIcon, ShoppingBagIcon, ChatBubbleIcon, PlayIcon, UserIcon } from './IconComponents';

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
        if (entry.isIntersecting) {
          video.muted = false;
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              video.muted = true;
              video.play();
            });
          }
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );

    const currentCardRef = cardRef.current;
    if (currentCardRef) observer.observe(currentCardRef);
    return () => {
      if (currentCardRef) observer.unobserve(currentCardRef);
    };
  }, []);

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.muted = false;
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleProgress = () => {
    if (videoRef.current?.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  return (
    <div ref={cardRef} className="bg-white flex flex-col animate-fadeIn">
      {/* Card Header - Matches Screenshot */}
      <button onClick={onViewProfile} className="px-4 py-3 flex items-center gap-3 text-left">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-100 flex items-center justify-center border border-zinc-100 shadow-sm">
            {/* FIX: Corrected property name from avatar to avatar_url to match User/Profile type */}
            {post.user.avatar_url ? (
                <img src={post.user.avatar_url} alt={post.user.full_name || ''} className="w-full h-full object-cover" />
            ) : (
                <UserIcon className="w-6 h-6 text-zinc-300" />
            )}
        </div>
        <div className="flex flex-col">
            {/* FIX: Corrected property name from name to full_name to match User/Profile type */}
            <span className="font-bold text-[14px] text-zinc-900 leading-tight">{post.user.full_name}</span>
            {post.isSponsored && <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Patrocinado</p>}
        </div>
      </button>

      {/* Post Content */}
      <div className={`relative bg-zinc-50 overflow-hidden w-full ${post.video ? 'aspect-[9/16]' : 'min-h-[400px]'}`}>
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
                <div onClick={handleVideoClick} className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${!isPlaying ? 'opacity-100 bg-black/20' : 'opacity-0'}`}>
                  {!isPlaying && <PlayIcon className="w-12 h-12 text-white/90 drop-shadow-md" />}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div className="h-full bg-amber-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
                </div>
            </>
        ) : (
            <div onClick={onImageClick} className="w-full cursor-pointer">
                <img src={post.image} alt="" className="w-full h-auto block" />
            </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-b border-zinc-50">
        <div className="flex items-center gap-5">
          <button onClick={onLike} className="active:scale-90 transition-transform">
            <HeartIcon 
              className={`w-7 h-7 ${post.isLiked ? 'text-amber-500' : 'text-zinc-800'}`} 
              fill={post.isLiked ? 'currentColor' : 'none'}
              strokeWidth={1.8}
            />
          </button>
           <button onClick={onComment} className="active:scale-90 transition-transform">
            <ChatBubbleIcon className="w-7 h-7 text-zinc-800" strokeWidth={1.8} />
          </button>
          <button onClick={onShopTheLook} className="active:scale-90 transition-transform">
            <ShoppingBagIcon className="w-7 h-7 text-zinc-800" strokeWidth={1.8} />
          </button>
        </div>
        <p className="text-[13px] font-bold mt-2.5 text-zinc-900">{post.likes.toLocaleString()} curtidas</p>
        
        {post.caption && (
            <div className="mt-1 text-[13px] leading-relaxed">
                {/* FIX: Corrected property name from name to full_name to match User/Profile type */}
                <span className="font-bold mr-2">{post.user.full_name}</span>
                <span className="text-zinc-700">{post.caption}</span>
            </div>
        )}
        
        {post.commentCount > 0 && (
            <button onClick={onComment} className="mt-1 text-[13px] font-medium text-zinc-400 hover:text-zinc-600 transition-colors">
                Ver todos os {post.commentCount} comentários
            </button>
        )}
      </div>
    </div>
  );
};

export default PostCard;
