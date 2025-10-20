import React, { useRef, useEffect, useState } from 'react';
import type { Post, Item } from '../types';
import { HeartIcon, ChatBubbleIcon, PlayIcon } from './IconComponents';

interface ImageViewModalProps {
  posts: Post[];
  startIndex: number;
  onClose: () => void;
  onLike: (postId: string) => void;
  onItemClick: (item: Item) => void;
  onViewProfile: (profileId: string) => void;
  onComment: (postId: string) => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ImageViewModal: React.FC<ImageViewModalProps> = ({ posts, startIndex, onClose, onLike, onItemClick, onViewProfile, onComment }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const postRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const videoRefs = useRef<Map<string, HTMLVideoElement | null>>(new Map());

    const [progressMap, setProgressMap] = useState<Record<string, number>>({});
    const [visiblePostId, setVisiblePostId] = useState<string | null>(posts[startIndex]?.id || null);
    const [isPlayingMap, setIsPlayingMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            setTimeout(() => {
                container.scrollTop = startIndex * container.clientHeight;
            }, 0);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose, startIndex]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    const postId = entry.target.getAttribute('data-post-id');
                    if (!postId) return;
                    if (entry.isIntersecting) {
                        setVisiblePostId(postId);
                    }
                });
            },
            { root: scrollContainerRef.current, threshold: 0.8 }
        );

        const currentPostRefs = postRefs.current;
        currentPostRefs.forEach(ref => { if (ref) observer.observe(ref); });

        return () => {
            currentPostRefs.forEach(ref => { if (ref) observer.unobserve(ref); });
        };
    }, [posts]);

    useEffect(() => {
        videoRefs.current.forEach((video, postId) => {
            if (video) {
                if (postId !== visiblePostId) {
                    video.pause();
                    video.currentTime = 0;
                }
            }
        });
    }, [visiblePostId]);

    const handleProgress = (postId: string, video: HTMLVideoElement) => {
        if (video.duration) {
            const value = (video.currentTime / video.duration) * 100;
            setProgressMap(prev => ({ ...prev, [postId]: value }));
        }
    };

    const handleVideoClick = (postId: string) => {
        const video = videoRefs.current.get(postId);
        if (video) {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }
    };

    return (
        <div
            className="fixed inset-0 bg-[var(--bg-main)] z-50 animate-modalFadeIn"
            role="dialog"
            aria-modal="true"
            aria-label="Visualização de posts"
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)]/80 transition-colors z-20"
                aria-label="Fechar visualização"
            >
                <XIcon className="w-6 h-6 text-[var(--text-primary)]" />
            </button>

            <div
                ref={scrollContainerRef}
                className="h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
            >
                {posts.map(post => (
                    <div
                        key={post.id}
                        // FIX: The ref callback function should not return a value. Wrapped the set call in a block. Also added cleanup for when the element unmounts.
                        ref={el => {
                            if (el) {
                                postRefs.current.set(post.id, el);
                            } else {
                                postRefs.current.delete(post.id);
                            }
                        }}
                        data-post-id={post.id}
                        className="h-full w-full relative flex-shrink-0 snap-start flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 flex-shrink-0">
                            <button onClick={() => onViewProfile(post.user.id)} className="flex items-center gap-3 text-left">
                                <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover border-2 border-[var(--text-primary)]/80" />
                                <span className="font-bold text-sm text-[var(--text-primary)]">{post.user.name}</span>
                            </button>
                        </div>
                        
                        {/* Image or Video Wrapper */}
                        <div className="flex-grow flex items-center justify-center min-h-0">
                            <div className="relative w-full aspect-square bg-[var(--bg-secondary)]">
                                {post.video ? (
                                    <>
                                        <video
                                            // FIX: The ref callback function should not return a value. Wrapped the set call in a block. Also added cleanup for when the element unmounts.
                                            ref={el => {
                                                if (el) {
                                                    videoRefs.current.set(post.id, el);
                                                } else {
                                                    videoRefs.current.delete(post.id);
                                                }
                                            }}
                                            src={post.video}
                                            loop
                                            playsInline
                                            poster={post.image}
                                            onClick={() => handleVideoClick(post.id)}
                                            onPlay={() => setIsPlayingMap(prev => ({...prev, [post.id]: true}))}
                                            onPause={() => setIsPlayingMap(prev => ({...prev, [post.id]: false}))}
                                            onTimeUpdate={(e) => handleProgress(post.id, e.currentTarget)}
                                            className="w-full h-full object-contain cursor-pointer"
                                        />
                                        {!isPlayingMap[post.id] && (
                                            <div onClick={() => handleVideoClick(post.id)} className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/20 cursor-pointer">
                                                <PlayIcon className="w-16 h-16 text-white/80 drop-shadow-lg" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 pointer-events-none">
                                            <div className="h-full bg-white" style={{ width: `${progressMap[post.id] || 0}%` }}></div>
                                        </div>
                                    </>
                                ) : (
                                    <img src={post.image} alt={`Look by ${post.user.name}`} className="w-full h-full object-contain" />
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <button onClick={() => onLike(post.id)} className="transform hover:scale-110 transition-transform" aria-label="Curtir">
                                    <HeartIcon 
                                        className={`w-7 h-7 ${post.isLiked ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`} 
                                        fill={post.isLiked ? 'currentColor' : 'none'}
                                    />
                                </button>
                                <button onClick={() => onComment(post.id)} className="transform hover:scale-110 transition-transform" aria-label="Comentar">
                                    <ChatBubbleIcon className="w-7 h-7 text-[var(--text-primary)]" />
                                </button>
                            </div>
                            <p className="text-sm font-semibold mt-2 text-[var(--text-primary)]">{post.likes.toLocaleString()} curtidas</p>
                            {post.commentCount > 0 && (
                                <button onClick={() => onComment(post.id)} className="text-sm text-[var(--text-secondary)] mt-1 hover:underline">
                                    Ver todos os {post.commentCount} comentários
                                </button>
                            )}
                            <div className="text-sm text-[var(--text-primary)] mt-1">
                                <p>
                                    <button onClick={() => onViewProfile(post.user.id)} className="font-bold mr-2 hover:underline text-[var(--text-primary)]">{post.user.name}</button>
                                     {post.items.length > 0 ? (post.video ? 'apresentando ' : 'vestindo ') : 'compartilhou um novo vídeo.'}
                                    {post.items.map((item, index) => (
                                        <React.Fragment key={item.id}>
                                        <button 
                                            onClick={() => onItemClick(item)}
                                            className="font-semibold hover:underline text-[var(--accent-primary)] focus:outline-none"
                                        >
                                            {item.name}
                                        </button>
                                        {index < post.items.length - 1 ? ', ' : '.'}
                                        </React.Fragment>
                                    ))}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageViewModal;
