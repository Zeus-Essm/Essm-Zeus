
import React, { useRef, useEffect, useState } from 'react';
import type { Item } from '../types';
import GradientButton from './GradientButton';
import { ShoppingBagIcon, PlayIcon, PauseIcon } from './IconComponents';

interface RecommendationModalProps {
  item: Item;
  onClose: () => void;
  onAddToCart: (item: Item) => void;
  onStartTryOn: (item: Item) => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const RecommendationModal: React.FC<RecommendationModalProps> = ({ item, onClose, onAddToCart, onStartTryOn }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    // Attempt to play on mount
    if (videoRef.current) {
        videoRef.current.play().catch(e => {
            console.log("Autoplay failed", e);
            setIsPlaying(false);
        });
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black animate-fadeIn">
      {/* Top Half: Product Details */}
      <div className="h-1/2 relative bg-[var(--bg-secondary)] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <div className="flex-grow flex items-center justify-center p-6 relative">
             {/* Background blur effect */}
             <div 
                className="absolute inset-0 bg-cover bg-center opacity-20 blur-md"
                style={{ backgroundImage: `url(${item.image})` }}
             />
             
             <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
                <img 
                    src={item.image} 
                    alt={item.name} 
                    className="h-40 w-auto object-contain rounded-xl shadow-lg mb-4 bg-white"
                />
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{item.name}</h2>
                <p className="text-lg font-semibold text-[var(--accent-primary)] mb-2">
                    {item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </p>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">{item.description}</p>
                
                <div className="flex w-full gap-3">
                    <button
                        onClick={() => onAddToCart(item)}
                        className="flex-1 flex items-center justify-center py-3 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all"
                    >
                        <ShoppingBagIcon className="w-5 h-5 mr-2" />
                        Carrinho
                    </button>
                    <GradientButton 
                        onClick={() => onStartTryOn(item)}
                        className="flex-1 !py-3 text-sm"
                    >
                        Provar Agora
                    </GradientButton>
                </div>
             </div>
        </div>
      </div>

      {/* Bottom Half: Video */}
      <div className="h-1/2 relative bg-black">
        {item.recommendationVideo ? (
            <>
                <video
                    ref={videoRef}
                    src={item.recommendationVideo}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    onClick={togglePlay}
                />
                {!isPlaying && (
                    <div 
                        className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none"
                    >
                        <PlayIcon className="w-16 h-16 text-white/80" />
                    </div>
                )}
                {/* Play/Pause overlay interaction */}
                <div 
                    className="absolute inset-0 z-10" 
                    onClick={togglePlay}
                />
            </>
        ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
                <p>Vídeo não disponível</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationModal;
