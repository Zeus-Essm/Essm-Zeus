import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeftIcon, CheckCircleIcon, PlayIcon } from './IconComponents';
import type { Item } from '../types';
import GradientButton from './GradientButton';

interface SplitCameraScreenProps {
  item: Item;
  onBack: () => void;
  onPublish: (videoBlob: Blob | null) => void;
}

const SplitCameraScreen: React.FC<SplitCameraScreenProps> = ({ item, onBack, onPublish }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);

  // Initialize camera
  useEffect(() => {
    let mediaStream: MediaStream;

    const getCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', aspectRatio: 9/16 }, // Vertical aspect ratio
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Não foi possível acessar a câmera. Verifique as permissões.");
      }
    };

    getCamera();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = () => {
    if (!stream) {
      setError("Câmera não disponível.");
      return;
    }

    recordedChunksRef.current = [];
    try {
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            setRecordedVideoBlob(blob);
            setIsFinished(true);
            setIsRecording(false);
            setRecordingProgress(0);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
                videoRef.current.src = URL.createObjectURL(blob);
                videoRef.current.loop = true;
                videoRef.current.controls = false;
                videoRef.current.play().then(() => setIsPlayingRecorded(true)).catch(e => console.error("Error playing recorded video:", e));
            }
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
        setRecordingProgress(0);

    } catch (e) {
        console.error("Error starting MediaRecorder:", e);
        setError("Não foi possível iniciar a gravação.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // Recording progress timer
  useEffect(() => {
      // FIX: Changed NodeJS.Timeout to ReturnType<typeof setInterval> for browser compatibility and removed incorrect logic.
      let interval: ReturnType<typeof setInterval>;
      if (isRecording) {
          interval = setInterval(() => {
              setRecordingProgress(prev => {
                  if (prev >= 100) {
                      stopRecording();
                      clearInterval(interval);
                      return 100;
                  }
                  return prev + 1; 
              });
          }, 50); // 5 seconds recording time
      }
      return () => clearInterval(interval);
  }, [isRecording]);

  const handlePublishClick = () => {
      onPublish(recordedVideoBlob); 
  };

  const handleRetake = async () => {
    setIsFinished(false);
    setRecordedVideoBlob(null);
    setIsPlayingRecorded(false);
    if (videoRef.current) {
        try {
            if (stream) {
                videoRef.current.srcObject = stream;
                videoRef.current.src = '';
                videoRef.current.play();
            } else {
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', aspectRatio: 9/16 },
                    audio: true,
                });
                setStream(newStream);
                videoRef.current.srcObject = newStream;
                videoRef.current.src = '';
                videoRef.current.play();
            }
        } catch (e) {
            setError("Não foi possível reiniciar a câmera.");
        }
    }
  };
  
  const toggleRecordedVideoPlay = () => {
    if (videoRef.current) {
        if (isPlayingRecorded) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch(e => console.error("Error playing recorded video:", e));
        }
        setIsPlayingRecorded(prev => !prev);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-black text-white animate-fadeIn">
      <header className="absolute top-0 left-0 right-0 p-2 flex items-center z-20">
        <button onClick={onBack} className="p-2 mr-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors">
          <ArrowLeftIcon className="w-5 h-5 text-white" />
        </button>
      </header>

      <div className="h-1/2 w-full relative bg-[var(--bg-secondary)] border-b-2 border-[var(--accent-primary)]">
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg">
              <p className="font-bold text-sm text-white">{item.name}</p>
          </div>
      </div>

      <div className="h-1/2 w-full relative bg-zinc-900 flex items-center justify-center overflow-hidden">
        {error ? (
            <p className="text-red-400 text-center px-4">{error}</p>
        ) : (
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover transform scale-x-[-1]"
                onClick={isFinished ? toggleRecordedVideoPlay : undefined}
            />
        )}

        {!isFinished ? (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center">
                <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!stream}
                    className={`relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${isRecording ? 'scale-110' : 'hover:scale-105'}`}
                >
                    <div className={`rounded-full transition-all duration-300 ${isRecording ? 'w-8 h-8 bg-red-600 rounded-md' : 'w-16 h-16 bg-red-500'}`} />
                    {isRecording && (
                        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                            <circle cx="50%" cy="50%" r="36" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="4" />
                            <circle cx="50%" cy="50%" r="36" fill="none" stroke="red" strokeWidth="4" strokeDasharray="226" strokeDashoffset={226 - (226 * recordingProgress) / 100} className="transition-all duration-75 linear" />
                        </svg>
                    )}
                </button>
            </div>
        ) : (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 animate-fadeIn p-4">
                {!isPlayingRecorded && <PlayIcon className="w-16 h-16 text-white/90 drop-shadow-lg" />}
                <h3 className="text-xl font-bold">Vídeo Criado!</h3>
                <div className="flex gap-3 w-full max-w-xs">
                    <button onClick={handleRetake} className="flex-1 py-3 bg-white/20 rounded-xl font-bold hover:bg-white/30 transition-colors">Refazer</button>
                    <GradientButton onClick={handlePublishClick} className="flex-1">Publicar</GradientButton>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SplitCameraScreen;