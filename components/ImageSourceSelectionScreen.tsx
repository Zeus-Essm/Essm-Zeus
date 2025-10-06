import React, { useRef } from 'react';
import Header from './Header';
import { UploadIcon, CameraIcon } from './IconComponents';

interface ImageSourceSelectionScreenProps {
  onImageUpload: (imageDataUrl: string) => void;
  onUseCamera: () => void;
  onBack: () => void;
}

const ImageSourceSelectionScreen: React.FC<ImageSourceSelectionScreenProps> = ({ onImageUpload, onUseCamera, onBack }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-main)] text-[var(--text-primary)] animate-fadeIn">
      <Header title="Escolha uma foto" onBack={onBack} />
      <div className="flex-grow flex flex-col items-center justify-center p-6 space-y-6">
        <h1 className="text-3xl font-bold text-center text-glow text-[var(--accent-primary)] opacity-90">Como você quer enviar sua foto?</h1>
        <p className="text-[var(--text-secondary)] text-center max-w-sm">
          Use uma foto de corpo inteiro para obter os melhores resultados.
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <button
          onClick={openFilePicker}
          className="w-full flex items-center justify-start gap-4 p-6 bg-[var(--bg-secondary)] rounded-2xl border-2 border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-all duration-300 transform hover:scale-105"
        >
          <UploadIcon className="w-10 h-10 text-[var(--accent-primary)] flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-left">Carregar da Galeria</h2>
            <p className="text-[var(--text-secondary)] text-sm text-left">Escolha uma foto existente</p>
          </div>
        </button>

        <button
          onClick={onUseCamera}
          className="w-full flex items-center justify-start gap-4 p-6 bg-[var(--bg-secondary)] rounded-2xl border-2 border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-all duration-300 transform hover:scale-105"
        >
          <CameraIcon className="w-10 h-10 text-[var(--accent-primary)] flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-left">Tirar com a Câmera</h2>
            <p className="text-[var(--text-secondary)] text-sm text-left">Use a câmera do seu dispositivo</p>
          </div>
        </button>

      </div>
    </div>
  );
};

export default ImageSourceSelectionScreen;