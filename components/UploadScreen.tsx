

import React, { useState } from 'react';
import GradientButton from './GradientButton';
import { UploadIcon } from './IconComponents';

interface UploadScreenProps {
  onImageUpload: (imageDataUrl: string) => void;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    if (preview) {
      onImageUpload(preview);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-[var(--text-primary)] text-center animate-fadeIn">
      <h1 className="text-4xl font-bold mb-2 text-glow text-[var(--accent-primary)]">Primeiro Passo</h1>
      <p className="text-[var(--text-secondary)] mb-8">Carregue uma foto sua de corpo inteiro.</p>

      <div
        onClick={openFilePicker}
        className="w-full h-80 border-2 border-dashed border-[var(--accent-primary)]/50 rounded-2xl flex flex-col items-center justify-center mb-8 cursor-pointer bg-black/20 hover:bg-[var(--accent-primary)]/10 hover:border-[var(--accent-primary)] transition-all"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        {preview ? (
          <img src={preview} alt="Pré-visualização" className="w-full h-full object-contain rounded-2xl p-2" />
        ) : (
          <div className="text-center text-zinc-500">
            <UploadIcon className="w-16 h-16 mx-auto mb-4 text-[var(--accent-primary)]/70" />
            <p className="font-semibold">Clique para selecionar uma imagem</p>
            <p className="text-sm">PNG ou JPG</p>
          </div>
        )}
      </div>

      {preview && (
        <GradientButton onClick={handleUploadClick}>
          Usar esta foto e começar
        </GradientButton>
      )}
    </div>
  );
};

export default UploadScreen;