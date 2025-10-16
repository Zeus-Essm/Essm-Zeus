import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeftIcon } from './IconComponents';
import GradientButton from './GradientButton';

interface FaceScanScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

const FaceScanScreen: React.FC<FaceScanScreenProps> = ({ onBack, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [instruction, setInstruction] = useState('Posicione seu rosto no centro');

  const startScan = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setScanState('scanning');

      setTimeout(() => setInstruction('Sorria para a câmera'), 2000);
      setTimeout(() => setInstruction('Verificação concluída!'), 4000);
      setTimeout(() => {
        setScanState('done');
        onComplete();
      }, 5000);

    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
      setScanState('idle');
    }
  };

  useEffect(() => {
    // Automatically start the scan when the component mounts
    startScan();
    
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="flex flex-col h-full w-full bg-black text-white animate-fadeIn">
      <header className="absolute top-0 left-0 right-0 p-2 flex items-center bg-transparent z-10">
        <button onClick={onBack} className="p-2 mr-2 -ml-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
      </header>
      <main className="relative flex-grow flex flex-col items-center justify-center">
        {error ? (
          <div className="text-center p-4">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        
        <div className={`relative w-[300px] h-[400px] rounded-[50%/40%] border-4 ${scanState === 'scanning' ? 'border-amber-500 animate-pulse-border' : 'border-white/50'}`} style={{ boxShadow: '0 0 0 100vmax rgba(0,0,0,0.6)' }} />
        
        <div className="absolute bottom-10 left-0 right-0 p-6 text-center space-y-4">
            <h2 className="text-2xl font-bold drop-shadow-lg">{instruction}</h2>
        </div>
      </main>
      <style>{`
        @keyframes pulse-border {
          0%, 100% { border-color: rgba(251, 191, 36, 0.5); }
          50% { border-color: rgba(251, 191, 36, 1); }
        }
        .animate-pulse-border {
          animation: pulse-border 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default FaceScanScreen;
