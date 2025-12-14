
import React, { useState, useRef } from 'react';
import type { Item } from '../types';
import Header from './Header';
import GradientButton from './GradientButton';
import { PlusIcon, MinusIcon } from './IconComponents';

interface DecorationPlacementScreenProps {
  userImage: string;
  item: Item;
  onBack: () => void;
  onConfirm: (compositeImage: string) => void;
}

const DecorationPlacementScreen: React.FC<DecorationPlacementScreenProps> = ({ userImage, item, onBack, onConfirm }) => {
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Center in percentage
  const [scale, setScale] = useState(0.3); // 30% of container width
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, itemX: 0, itemY: 0 });

  const handleInteractionStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartRef.current = { x: clientX, y: clientY, itemX: position.x, itemY: position.y };
  };

  const handleInteractionMove = (clientX: number, clientY: number) => {
    const container = containerRef.current as HTMLDivElement | null;
    if (!isDragging || !container) return;
    const containerRect = container.getBoundingClientRect();
    const dx = ((clientX - dragStartRef.current.x) / containerRect.width) * 100;
    const dy = ((clientY - dragStartRef.current.y) / containerRect.height) * 100;
    setPosition({
      x: Math.max(0, Math.min(100, dragStartRef.current.itemX + dx)),
      y: Math.max(0, Math.min(100, dragStartRef.current.itemY + dy)),
    });
  };

  const handleInteractionEnd = () => {
    setIsDragging(false);
  };

  const handleConfirm = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bgImage = new Image();
    bgImage.crossOrigin = "anonymous";
    bgImage.onload = () => {
      // Otimização: Limitar resolução máxima para evitar erro de payload na API
      const maxDimension = 1024;
      let width = bgImage.naturalWidth;
      let height = bgImage.naturalHeight;

      if (width > maxDimension || height > maxDimension) {
        const ratio = width / height;
        if (width > height) {
            width = maxDimension;
            height = maxDimension / ratio;
        } else {
            height = maxDimension;
            width = maxDimension * ratio;
        }
      }

      canvas.width = width;
      canvas.height = height;
      
      // Desenhar fundo redimensionado
      ctx.drawImage(bgImage, 0, 0, width, height);

      const fgImage = new Image();
      fgImage.crossOrigin = "anonymous";
      fgImage.onload = () => {
        const aspectRatio = fgImage.naturalWidth / fgImage.naturalHeight;
        
        // Calcular tamanho e posição baseado nas coordenadas relativas (%)
        const drawWidth = width * scale;
        const drawHeight = drawWidth / aspectRatio;
        
        const drawX = (position.x / 100) * width - drawWidth / 2;
        const drawY = (position.y / 100) * height - drawHeight / 2;

        ctx.drawImage(fgImage, drawX, drawY, drawWidth, drawHeight);
        
        // Qualidade 0.9 para bom equilíbrio
        onConfirm(canvas.toDataURL('image/jpeg', 0.9));
      };
      fgImage.src = item.image;
    };
    bgImage.src = userImage;
  };

  return (
    <div className="w-full h-full flex flex-col text-[var(--text-primary)] animate-fadeIn bg-[var(--bg-main)]">
      <Header title="Posicione o Item" onBack={onBack} />
      <main 
        className="flex-grow pt-16 flex flex-col items-center p-4 overflow-hidden"
        onMouseMove={(e) => handleInteractionMove(e.clientX, e.clientY)}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={handleInteractionEnd}
        onTouchMove={(e) => handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleInteractionEnd}
      >
        <p className="text-[var(--text-secondary)] text-center text-sm mb-4">Arraste para mover. Use os botões para ajustar o tamanho.</p>
        
        {/* Container matches image's natural aspect ratio via img tag block */}
        <div ref={containerRef} className="relative w-full max-w-md rounded-lg overflow-hidden shadow-lg shadow-black/20 border-2 border-[var(--border-primary)] select-none">
          {/* Display image with w-full h-auto to respect original size */}
          <img src={userImage} alt="Seu ambiente" className="w-full h-auto block pointer-events-none" />
          
          {/* Overlay area absolute to container */}
          <div className="absolute inset-0 overflow-hidden">
             <div
                className="absolute cursor-move touch-none"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  width: `${scale * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseDown={(e) => handleInteractionStart(e.clientX, e.clientY)}
                onTouchStart={(e) => handleInteractionStart(e.touches[0].clientX, e.touches[0].clientY)}
              >
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-auto object-contain pointer-events-none drop-shadow-lg"
                  draggable="false"
                />
              </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-4 bg-[var(--bg-secondary)] p-2 rounded-full">
            <button onClick={() => setScale(s => Math.max(0.05, s - 0.05))} className="p-3 bg-[var(--bg-tertiary)] rounded-full active:scale-90 transition-transform">
                <MinusIcon className="w-6 h-6"/>
            </button>
            <span className="font-bold w-12 text-center">Tamanho</span>
             <button onClick={() => setScale(s => Math.min(1.0, s + 0.05))} className="p-3 bg-[var(--bg-tertiary)] rounded-full active:scale-90 transition-transform">
                <PlusIcon className="w-6 h-6"/>
            </button>
        </div>
      </main>
      <div className="p-4 flex-shrink-0 bg-[var(--bg-main)] border-t border-[var(--border-primary)]">
        <GradientButton onClick={handleConfirm}>
          Confirmar Posição e Gerar
        </GradientButton>
      </div>
    </div>
  );
};

export default DecorationPlacementScreen;
