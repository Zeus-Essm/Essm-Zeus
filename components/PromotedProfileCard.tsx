import React, { useState } from 'react';
import type { BusinessProfile } from '../types';
import { HeartIcon, ShoppingBagIcon, ChatBubbleIcon } from './IconComponents';

interface PromotedProfileCardProps {
  businessProfile: BusinessProfile;
  promotedItems: { id: string; image: string; }[];
  onVisit: () => void;
}

const PromotedProfileCard: React.FC<PromotedProfileCardProps> = ({ businessProfile, promotedItems, onVisit }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? promotedItems.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isLastSlide = currentIndex === promotedItems.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };
    
    if (!promotedItems || promotedItems.length === 0) return null;

    return (
        <div className="bg-[var(--bg-main)] flex flex-col animate-fadeIn border-b border-[var(--border-primary)]">
            {/* Header */}
            <button onClick={onVisit} className="p-3 flex items-center gap-3 text-left hover:bg-[var(--accent-primary)]/10 transition-colors">
                <img src={businessProfile.logo_url} alt={businessProfile.business_name} className="w-10 h-10 rounded-full object-cover border-2 border-zinc-700" />
                <div>
                    <span className="font-bold text-sm">{businessProfile.business_name}</span>
                    <p className="text-xs text-[var(--text-secondary)]">Patrocinado</p>
                </div>
            </button>
            
            {/* Image Carousel */}
            <div className="relative aspect-square bg-black group">
                {/* Image */}
                <div style={{ backgroundImage: `url(${promotedItems[currentIndex].image})` }} className="w-full h-full bg-center bg-cover duration-500"></div>

                {/* Left Arrow */}
                {promotedItems.length > 1 && (
                    <button onClick={goToPrevious} className="absolute top-1/2 left-2 -translate-y-1/2 p-1.5 bg-black/40 rounded-full hover:bg-black/70 backdrop-blur-sm transition-all z-10 opacity-0 group-hover:opacity-100">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    </button>
                )}
                {/* Right Arrow */}
                {promotedItems.length > 1 && (
                    <button onClick={goToNext} className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 bg-black/40 rounded-full hover:bg-black/70 backdrop-blur-sm transition-all z-10 opacity-0 group-hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </button>
                )}
                {/* Dots */}
                {promotedItems.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        {promotedItems.map((_, slideIndex) => (
                            <div
                                key={slideIndex}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(slideIndex); }}
                                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${currentIndex === slideIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                            ></div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons & Likes */}
            <div className="p-3">
                <div className="flex items-center gap-4">
                    <button className="transform hover:scale-110 transition-transform" aria-label="Curtir">
                        <HeartIcon className="w-7 h-7 text-[var(--text-primary)]" fill='none' />
                    </button>
                    <button className="transform hover:scale-110 transition-transform" aria-label="Comentar">
                        <ChatBubbleIcon className="w-7 h-7 text-[var(--text-primary)]" />
                    </button>
                    <button onClick={onVisit} className="transform hover:scale-110 transition-transform" aria-label="Comprar o look">
                        <ShoppingBagIcon className="w-7 h-7 text-[var(--text-primary)]" />
                    </button>
                </div>
                 <p className="px-1 pt-2 text-sm">
                    Clique para saber mais sobre os produtos de <button onClick={onVisit} className="font-bold hover:underline">{businessProfile.business_name}</button>.
                </p>
            </div>
        </div>
    );
}

export default PromotedProfileCard;
