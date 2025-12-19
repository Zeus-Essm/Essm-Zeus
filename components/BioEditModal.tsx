
import React, { useState, useEffect } from 'react';
import GradientButton from './GradientButton';
import type { Profile } from '../types';

interface BioEditModalProps {
  profile: Profile;
  onClose: () => void;
  onSave: (name: string, bio: string) => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MAX_BIO_LENGTH = 150;
const MAX_NAME_LENGTH = 30;

const BioEditModal: React.FC<BioEditModalProps> = ({ profile, onClose, onSave }) => {
  const [name, setName] = useState(profile.full_name || "");
  const [bio, setBio] = useState(profile.bio || "");

  // Lógica de sincronização inicial
  useEffect(() => {
    if (profile) {
      setName(profile.full_name || ""); 
      setBio(profile.bio || "");
    }
  }, [profile]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = () => {
    if (!name.trim()) {
        alert("O nome não pode estar vazio.");
        return;
    }
    onSave(name, bio);
  };
  
  const charactersLeft = MAX_BIO_LENGTH - bio.length;

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-sm flex items-center justify-center z-50 animate-modalFadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[2.5rem] w-11/12 max-w-sm p-8 text-[var(--text-primary)] animate-modalZoomIn relative flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
            <h2 id="edit-profile-title" className="text-xl font-black text-zinc-900 uppercase tracking-tighter italic">Editar Perfil</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-2xl bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-colors"
              aria-label="Fechar"
            >
              <XIcon className="w-5 h-5" />
            </button>
        </div>
        
        <div className="space-y-6">
            <div>
                <label className="block text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-[0.2em] ml-4">Nome</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
                    placeholder="Nome"
                    className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 focus:border-amber-500/40 focus:bg-white focus:outline-none transition-all text-sm font-bold text-zinc-900 shadow-sm"
                />
            </div>

            <div>
                <label className="block text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-[0.2em] ml-4">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={MAX_BIO_LENGTH}
                  className="w-full h-64 p-5 bg-zinc-50 rounded-2xl border border-zinc-100 focus:border-amber-500/40 focus:bg-white focus:outline-none transition-all text-sm font-bold text-zinc-900 shadow-sm resize-none"
                  placeholder="Escreva algo sobre você ou sua loja..."
                />
                <p className={`text-right text-[10px] font-black mt-2 uppercase tracking-widest ${charactersLeft < 10 ? 'text-red-400' : 'text-zinc-300'}`}>
                  {charactersLeft} restantes
                </p>
            </div>
        </div>

        <GradientButton onClick={handleSave} className="mt-8 !rounded-[1.5rem] !py-5">
          SALVAR ALTERAÇÕES
        </GradientButton>
      </div>
    </div>
  );
};

export default BioEditModal;
