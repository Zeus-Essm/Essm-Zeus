import React, { useRef, useEffect } from 'react';
import type { Post, Item } from '../types';
import { HeartIcon, ChatBubbleIcon } from './IconComponents';

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

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        // Scroll to the initial post
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            // A slight delay ensures the browser has rendered the layout before scrolling
            setTimeout(() => {
                container.scrollTop = startIndex * container.clientHeight;
            }, 0);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose, startIndex]);

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
                    <div key={post.id} className="h-full w-full relative flex-shrink-0 snap-start flex flex-col">
                        {/* Header */}
                        <div className="p-4 flex-shrink-0">
                            <button onClick={() => onViewProfile(post.user.id)} className="flex items-center gap-3 text-left">
                                <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover border-2 border-[var(--text-primary)]/80" />
                                <span className="font-bold text-sm text-[var(--text-primary)]">{post.user.name}</span>
                            </button>
                        </div>
                        
                        {/* Image or Video Wrapper */}
                        <div className="flex-grow flex items-center justify-center min-h-0">
                            <div className="w-full aspect-square bg-[var(--bg-secondary)]">
                                {post.video ? (
                                    <video
                                        src={post.video}
                                        loop
                                        playsInline
                                        controls
                                        autoPlay
                                        poster={post.image}
                                        className="w-full h-full object-contain"
                                    />
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