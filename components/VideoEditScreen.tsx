
import React, { useState, useMemo } from 'react';
import type { Item } from '../types';
import { PaperAirplaneIcon, RepositionIcon } from './IconComponents';
import GradientButton from './GradientButton';

type OverlayPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface VideoEditScreenProps {
  videoBlob: Blob;
  item: Item;
  onBack: () => void;
  onPublish: (details: { caption: string; position: OverlayPosition }) => void;
  isPublishing: boolean;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const VideoEditScreen: React.FC<VideoEditScreenProps> = ({ videoBlob, item, onBack, onPublish, isPublishing }) => {
  const videoUrl = useMemo(() => URL.createObjectURL(videoBlob), [videoBlob]);
  const [caption, setCaption] = useState('');
  const [position, setPosition] = useState<OverlayPosition>('bottom-right');

  const positionClasses: Record<OverlayPosition, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const cyclePosition = () => {
    const positions: OverlayPosition[] = ['bottom-right', 'bottom-left', 'top-left', 'top-right'];
    const currentIndex = positions.indexOf(position);
    const nextIndex = (currentIndex + 1) % positions.length;
    setPosition(positions[nextIndex]);
  };

  return (
    <div className="flex flex-col h-full w-full bg-black text-white animate-fadeIn">
      <header className="absolute top-0 left-0 right-0 p-2 flex items-center justify-between z-20">
        <button onClick={onBack} className="p-2 mr-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors">
          <XIcon className="w-5 h-5 text-white" />
        </button>
      </header>

      <main className="flex-grow flex flex-col pt-14">
        {/* Preview */}
        <div className="relative w-full aspect-[9/16] bg-zinc-900 mx-auto max-w-full max-h-[60vh] rounded-b-lg overflow-hidden">
          <video src={videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          <div className={`absolute p-1 bg-black/30 backdrop-blur-sm rounded-lg transition-all duration-300 ${positionClasses[position]}`}>
            <img src={item.image} alt={item.name} className="w-40 h-40 object-cover rounded-md" />
          </div>
        </div>

        {/* Edit Controls */}
        <div className="p-4 space-y-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Escreva uma legenda..."
            className="w-full p-3 bg-[var(--bg-tertiary)] rounded-lg border-2 border-transparent focus:border-[var(--accent-primary)] focus:outline-none focus:ring-0 transition-colors resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={cyclePosition}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all"
            >
              <RepositionIcon className="w-5 h-5" />
              Posição
            </button>
            <GradientButton
              onClick={() => onPublish({ caption, position })}
              disabled={isPublishing}
              className="flex-1"
            >
              <div className="flex items-center justify-center gap-2">
                <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                {isPublishing ? 'Publicando...' : 'Publicar'}
              </div>
            </GradientButton>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoEditScreen;
