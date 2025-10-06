import React, { useRef, useEffect, useState } from 'react';
import Header from './Header';
import { CameraIcon } from './IconComponents';

interface CameraScreenProps {
  onPhotoTaken: (imageDataUrl: string) => void;
  onBack: () => void;
}

const CameraScreen: React.FC<CameraScreenProps> = ({ onPhotoTaken, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mediaStream: MediaStream;

    const getCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Não foi possível acessar a câmera. Verifique as permissões no seu navegador.");
      }
    };

    getCamera();

    return () => {
      // Cleanup: Stop all tracks on unmount
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        // Flip the image horizontally for a mirror effect
        context.translate(videoWidth, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, videoWidth, videoHeight);

        const dataUrl = canvas.toDataURL('image/jpeg');
        onPhotoTaken(dataUrl);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Header title="Tire uma Foto" onBack={onBack} />
      <div className="relative flex-grow flex items-center justify-center pt-16">
        {error ? (
          <div className="text-center p-4">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="flex-shrink-0 p-4 bg-[var(--bg-header)] backdrop-blur-sm border-t border-[var(--border-primary)]">
        <button
          onClick={handleCapture}
          disabled={!stream}
          className="w-20 h-20 mx-auto rounded-full border-4 border-[var(--accent-primary)] bg-yellow-400/20 flex items-center justify-center disabled:opacity-50 transition-transform transform active:scale-90 hover:bg-yellow-400/30"
          aria-label="Tirar foto"
        >
            <CameraIcon className="w-10 h-10 text-white" />
        </button>
      </div>
    </div>
  );
};

export default CameraScreen;