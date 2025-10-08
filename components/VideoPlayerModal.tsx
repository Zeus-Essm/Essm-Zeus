import React, { useEffect } from 'react';
import { UploadIcon, DownloadIcon } from './IconComponents';

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
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
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-modalFadeIn" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Player de vídeo do look"
    >
      <div 
        className="relative w-[90vw] max-w-md animate-modalZoomIn" 
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors z-20"
          aria-label="Fechar vídeo"
        >
          <XIcon className="w-6 h-6 text-white" />
        </button>
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto rounded-lg shadow-2xl shadow-black/50"
          aria-label="Vídeo do look gerado por IA"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
          <div className="flex gap-3">
            <button
              onClick={onPublish}
              disabled={isPublishing}
              className="flex-1 flex items-center justify-center gap-2 text-[var(--accent-primary-text)] font-bold py-3 px-4 rounded-lg bg-[var(--accent-primary)] hover:brightness-125 transition-colors disabled:opacity-60 disabled:cursor-wait"
            >
              {isPublishing ? (
                <>
                  <SpinnerIcon />
                  Publicando...
                </>
              ) : (
                <>
                  <UploadIcon className="w-5 h-5" />
                  Publicar
                </>
              )}
            </button>
            <button
              onClick={onSave}
              disabled={isPublishing}
              className="flex-1 flex items-center justify-center gap-2 text-[var(--text-primary)] font-bold py-3 px-4 rounded-lg bg-[var(--bg-tertiary)] hover:brightness-95 transition-colors disabled:opacity-60"
            >
              <DownloadIcon className="w-5 h-5" />
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;