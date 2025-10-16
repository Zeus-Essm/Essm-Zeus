import React, { useState, useRef } from 'react';
import { ArrowLeftIcon, CameraIcon } from './IconComponents';
import GradientButton from './GradientButton';

interface IdUploadScreenProps {
  onBack: () => void;
  onComplete: (idFront: string, idBack: string) => void;
}

const IdUploadBox: React.FC<{
  label: string;
  onImageSelect: (dataUrl: string) => void;
  previewUrl: string | null;
}> = ({ label, onImageSelect, previewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onImageSelect(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  const openFilePicker = () => fileInputRef.current?.click();

  return (
    <div
      onClick={openFilePicker}
      className="w-full h-48 border-2 border-dashed border-[var(--accent-primary)]/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-black/20 hover:bg-[var(--accent-primary)]/10 hover:border-[var(--accent-primary)] transition-all"
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      {previewUrl ? (
        <img src={previewUrl} alt={`${label} preview`} className="w-full h-full object-contain rounded-2xl p-2" />
      ) : (
        <div className="text-center text-zinc-500">
          <CameraIcon className="w-12 h-12 mx-auto mb-2 text-[var(--accent-primary)]/70" />
          <p className="font-semibold">{label}</p>
          <p className="text-sm">Clique para carregar</p>
        </div>
      )}
    </div>
  );
};

const IdUploadScreen: React.FC<IdUploadScreenProps> = ({ onBack, onComplete }) => {
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);

  const handleNext = () => {
    if (idFront && idBack) {
      onComplete(idFront, idBack);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-main)] text-[var(--text-primary)] animate-fadeIn">
      <header className="absolute top-0 left-0 right-0 p-2 flex items-center bg-[var(--bg-header)] backdrop-blur-md z-10">
        <button onClick={onBack} className="p-2 mr-2 -ml-2 rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors">
          <ArrowLeftIcon className="w-5 h-5 text-[var(--accent-primary)]" />
        </button>
        <h1 className="text-lg font-bold text-[var(--accent-primary)] text-glow tracking-wider uppercase">Documento</h1>
      </header>
      <main className="flex-grow pt-16 flex flex-col items-center text-center p-6 space-y-6">
        <h2 className="text-2xl font-bold">Envie seu Documento</h2>
        <p className="text-[var(--text-secondary)]">
          Carregue uma foto da frente e do verso do seu documento de identidade (BI, Passaporte ou Carta de Condução).
        </p>
        <IdUploadBox label="Frente do Documento" previewUrl={idFront} onImageSelect={setIdFront} />
        <IdUploadBox label="Verso do Documento" previewUrl={idBack} onImageSelect={setIdBack} />
      </main>
      <footer className="p-4 flex-shrink-0 bg-[var(--bg-main)] border-t border-[var(--border-primary)]">
        <GradientButton onClick={handleNext} disabled={!idFront || !idBack}>
          Continuar
        </GradientButton>
      </footer>
    </div>
  );
};

export default IdUploadScreen;
