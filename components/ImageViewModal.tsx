import React, { useRef, useEffect, useState } from 'react';
import type { Post, Item } from '../types';
import { HeartIcon, ShareIcon } from './IconComponents';

interface ImageViewModalProps {
  posts: Post[];
  startIndex: number;
  onClose: () => void;
  onLike: (postId: string) => void;
  onItemClick: (item: Item) => void;
  onViewProfile: (profileId: string) => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ImageViewModal: React.FC<ImageViewModalProps> = ({ posts, startIndex, onClose, onLike, onItemClick, onViewProfile }) => {
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
            container.scrollTop = startIndex * container.clientHeight;
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose, startIndex]);

    return (
        <div
            className="fixed inset-0 bg-black z-50 animate-modalFadeIn"
            role="dialog"
            aria-modal="true"
            aria-label="Visualização de posts em tela cheia"
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors z-20"
                aria-label="Fechar visualização"
            >
                <XIcon className="w-6 h-6 text-white" />
            </button>

            <div
                ref={scrollContainerRef}
                className="h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
            >
                {posts.map(post => (
                    <div key={post.id} className="h-full w-full relative flex-shrink-0 snap-start flex flex-col justify-between">
                        <img src={post.image} alt={`Look by ${post.user.name}`} className="absolute inset-0 w-full h-full object-cover -z-10" />
                        
                        {/* Gradient Overlays for readability */}
                        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>
                        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>

                        {/* Header */}
                        <div className="p-4 pt-6">
                            <button onClick={() => onViewProfile(post.user.id)} className="flex items-center gap-3 text-left">
                                <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover border-2 border-white/80" />
                                <span className="font-bold text-sm text-white [text-shadow:1px_1px_3px_rgba(0,0,0,0.7)]">{post.user.name}</span>
                            </button>
                        </div>
                        
                        {/* Footer */}
                        <div className="p-4">
                            <div className="flex items-end justify-between">
                                <div className="text-sm text-white [text-shadow:1px_1px_3px_rgba(0,0,0,0.7)]">
                                    <p>
                                        vestindo{' '}
                                        {post.items.map((item, index) => (
                                            <React.Fragment key={item.id}>
                                            <button 
                                                onClick={() => onItemClick(item)}
                                                className="font-semibold hover:underline focus:outline-none"
                                            >
                                                {item.name}
                                            </button>
                                            {index < post.items.length - 1 ? ', ' : '.'}
                                            </React.Fragment>
                                        ))}
                                    </p>
                                     <p className="font-semibold mt-2">{post.likes.toLocaleString()} curtidas</p>
                                </div>
                                <div className="flex flex-col items-center gap-4">
                                    <button onClick={() => onLike(post.id)} className="transform hover:scale-110 transition-transform" aria-label="Curtir">
                                        <HeartIcon 
                                            className={`w-8 h-8 ${post.isLiked ? 'text-red-500' : 'text-white'}`} 
                                            fill={post.isLiked ? 'currentColor' : 'none'}
                                        />
                                    </button>
                                    <button className="transform hover:scale-110 transition-transform" aria-label="Compartilhar">
                                        <ShareIcon className="w-8 h-8 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageViewModal;