
import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeftIcon, CheckCircleIconFilled } from './IconComponents';
import GradientButton from './GradientButton';
import type { Item } from '../types';

interface DecorationPlacementScreenProps {
  backgroundImage: string;
  item: Item;
  onBack: () => void;
  onGenerate: (compositeImage: string) => void;
}

const DecorationPlacementScreen: React.FC<DecorationPlacementScreenProps> = ({ backgroundImage, item, onBack, onGenerate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLImageElement>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Percentage 0-100
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  // Helper to get touch/mouse coordinates relative to container
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const coords = getCoordinates(e);
    if (coords) {
      const x = Math.max(0, Math.min(100, coords.x));
      const y = Math.max(0, Math.min(100, coords.y));
      setPosition({ x, y });
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Function to load image securely to avoid Tainted Canvas
  const loadSafeImage = async (url: string): Promise<HTMLImageElement> => {
      const img = new Image();
      // Crucial: Set CrossOrigin to Anonymous to request CORS headers
      img.crossOrigin = "Anonymous";
      
      return new Promise((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = () => {
              // If direct load fails (e.g. server doesn't support CORS), try proxy
              console.warn("Direct load failed, trying proxy for:", url);
              const corsApiKey = 'AQ.Ab8RN6K4XMcdwkHtoN1KbfTHg_gTy0YGT85ZyKjzHFGMoxIlCg';
              const urlWithKey = new URL(url);
              urlWithKey.searchParams.append('key', corsApiKey);
              const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(urlWithKey.href)}`;
              
              const imgProxy = new Image();
              imgProxy.crossOrigin = "Anonymous";
              imgProxy.onload = () => resolve(imgProxy);
              imgProxy.onerror = reject;
              imgProxy.src = proxyUrl;
          };
          img.src = url;
      });
  };

  const handleCaptureComposite = async () => {
    if (!containerRef.current || !itemRef.current) return;

    const container = containerRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    try {
        // Load background image
        const bgImg = new Image();
        bgImg.src = backgroundImage;
        await new Promise(resolve => { bgImg.onload = resolve; });

        canvas.width = bgImg.width;
        canvas.height = bgImg.height;

        // Draw background
        ctx.drawImage(bgImg, 0, 0);

        // Load item image securely
        const itemImg = await loadSafeImage(item.image);

        // Get container displayed ratio
        const containerRect = container.getBoundingClientRect();
        
        // Determine rendered width/height of the item in the DOM
        const renderedItemWidth = itemRef.current.offsetWidth;
        const renderedItemHeight = itemRef.current.offsetHeight;

        // Calculate ratio of Rendered Container to Actual Canvas
        const scaleX = canvas.width / containerRect.width;
        const scaleY = canvas.height / containerRect.height;

        // Calculate position on canvas (percentage based)
        const centerX = (position.x / 100) * canvas.width;
        const centerY = (position.y / 100) * canvas.height;

        // Calculate dimensions on canvas
        const drawWidth = renderedItemWidth * scaleX;
        const drawHeight = renderedItemHeight * scaleY;

        // Draw item centered at coordinates
        ctx.drawImage(
            itemImg, 
            centerX - drawWidth / 2, 
            centerY - drawHeight / 2, 
            drawWidth, 
            drawHeight
        );

        const compositeDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onGenerate(compositeDataUrl);
        
    } catch (e) {
        console.error("Error generating composite:", e);
        alert("Não foi possível gerar a imagem composta devido a restrições de segurança do navegador na imagem do produto.");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-main)] text-[var(--text-primary)] animate-fadeIn select-none">
      <header className="absolute top-0 left-0 right-0 p-2 flex items-center justify-between z-20 bg-[var(--bg-header)] backdrop-blur-md">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors">
          <ArrowLeftIcon className="w-5 h-5 text-[var(--accent-primary)]" />
        </button>
        <h1 className="text-lg font-bold text-[var(--accent-primary)] uppercase tracking-wider">Posicionar Item</h1>
        <div className="w-9"></div>
      </header>

      {/* Workspace */}
      <div 
        className="flex-grow relative overflow-hidden flex items-center justify-center bg-black"
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        onMouseUp={handleEnd}
        onTouchEnd={handleEnd}
        onMouseLeave={handleEnd}
      >
        <div 
            ref={containerRef}
            className="relative w-full max-w-lg aspect-[3/4] md:aspect-[9/16] max-h-full"
        >
            {/* Background */}
            <img 
                src={backgroundImage} 
                alt="Background" 
                className="w-full h-full object-contain pointer-events-none" 
            />

            {/* Draggable Item */}
            <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move touch-none"
                style={{ 
                    left: `${position.x}%`, 
                    top: `${position.y}%`,
                    width: '40%',
                }}
                onMouseDown={handleStart}
                onTouchStart={handleStart}
            >
                <img 
                    ref={itemRef}
                    src={item.image} 
                    alt="Decoration" 
                    className="w-full h-auto drop-shadow-2xl border-2 border-dashed border-white/50 rounded-lg"
                    style={{ transform: `scale(${scale})` }}
                    draggable={false}
                />
            </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] space-y-4 z-20">
        <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                <span>Tamanho</span>
                <span>{Math.round(scale * 100)}%</span>
            </div>
            <input 
                type="range" 
                min="0.3" 
                max="2.0" 
                step="0.1" 
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)]"
            />
        </div>
        
        <p className="text-center text-xs text-[var(--text-tertiary)]">
            Arraste para mover • Use o slider para ajustar o tamanho
        </p>

        <GradientButton onClick={handleCaptureComposite} className="!py-3">
            <div className="flex items-center justify-center gap-2">
                <CheckCircleIconFilled className="w-5 h-5" />
                Gerar Visualização
            </div>
        </GradientButton>
      </div>
    </div>
  );
};

export default DecorationPlacementScreen;
