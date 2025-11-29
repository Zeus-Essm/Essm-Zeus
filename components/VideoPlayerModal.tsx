import React, { useEffect, useRef, useState } from 'react';
import type { Profile } from '../types';
import { UploadIcon, DownloadIcon, PlayIcon, PauseIcon } from './IconComponents';

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg className="animate-spin h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

interface VideoPlayerModalProps {
  videoUrl: string;
  onClose: () => void;
  onPublish: () => void;
  onSave: () => void;
  isPublishing: boolean;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ videoUrl, onClose, onPublish, onSave, isPublishing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCenterIcon, setShowCenterIcon] = useState(true);
  // FIX: Initialize useRef with null and update the type to handle null values.
  const iconTimer = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleVideoTap = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      
      setShowCenterIcon(true);
      // FIX: Use a null check for the timer ID to avoid issues if the ID is 0.
      if (iconTimer.current !== null) {
        clearTimeout(iconTimer.current);
      }
      iconTimer.current = window.setTimeout(() => {
        setShowCenterIcon(false);
      }, 800);
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-modalFadeIn" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Player de vídeo do look"
    >
      <div 
        className="relative w-[90vw] max-w-md aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/50 animate-modalZoomIn" 
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/40 hover:bg-black/70 transition-colors z-30"
          aria-label="Fechar vídeo"
        >
          <XIcon className="w-6 h-6 text-white" />
        </button>

        <video
          ref={videoRef}
          src={videoUrl}
          loop
          playsInline
          onClick={handleVideoTap}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-cover"
          aria-label="Vídeo do look gerado por IA"
        />
        
        {/* Play/Pause Icon Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showCenterIcon ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-black/50 p-4 rounded-full">
                {!isPlaying ? <PlayIcon className="w-12 h-12 text-white" /> : <PauseIcon className="w-12 h-12 text-white" />}
            </div>
        </div>

        {/* Right side actions */}
        <div className="absolute bottom-24 right-2 flex flex-col items-center gap-6 z-20">
            <button onClick={onPublish} disabled={isPublishing} className="flex flex-col items-center gap-1.5 text-white disabled:opacity-60 disabled:cursor-wait">
                <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    {isPublishing ? <SpinnerIcon /> : <UploadIcon className="w-7 h-7" />}
                </div>
                <span className="text-xs font-semibold drop-shadow-md">{isPublishing ? 'Postando...' : 'Postar'}</span>
            </button>
              <button onClick={onSave} disabled={isPublishing} className="flex flex-col items-center gap-1.5 text-white disabled:opacity-60">
                <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <DownloadIcon className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold drop-shadow-md">Salvar</span>
            </button>
        </div>

          {/* Gradient for legibility */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10"></div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;
