
import React, { useState, useEffect } from 'react';
import GradientButton from './GradientButton';
import type { Profile } from '../types';
import { toast } from '../utils/toast';

interface BioEditModalProps {
  profile: Profile;
  onClose: () => void;
  onSave: (updates: { name: string, bio: string, username: string }) => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MAX_BIO_LENGTH = 150;
const MAX_NAME_LENGTH = 30;
const MAX_USERNAME_LENGTH = 20;

const BioEditModal: React.FC<BioEditModalProps> = ({ profile, onClose, onSave }) => {
  const [name, setName] = useState(profile.full_name || "");
  const [username, setUsername] = useState(profile.username || "");
  const [bio, setBio] = useState(profile.bio || "");

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || ""); 
      setUsername(profile.username || "");
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
    if (!name.trim() || !username.trim()) {
        toast("Nome e Username são obrigatórios.");
        return;
    }
    const sanitizedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
    onSave({ name: name.trim(), bio: bio.trim(), username: sanitizedUsername });
  };
  
  const charactersLeft = MAX_BIO_LENGTH - bio.length;

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-sm flex items-center justify-center z-[150] animate-modalFadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div
        className="bg-white border border-zinc-100 rounded-[2.5rem] w-11/12 max-w-sm p-8 text-zinc-900 animate-modalZoomIn relative flex flex-col shadow-2xl"
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
        
        <div className="space-y-5">
            <div>
                <label className="block text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-[0.2em] ml-4">Nome de Exibição</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
                    placeholder="Seu Nome Real ou Marca"
                    className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 focus:border-amber-500/40 focus:bg-white focus:outline-none transition-all text-sm font-bold text-zinc-900 shadow-sm"
                />
            </div>

            <div>
                <label className="block text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-[0.2em] ml-4">Username (@)</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.slice(0, MAX_USERNAME_LENGTH))}
                    placeholder="identificador"
                    className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 focus:border-amber-500/40 focus:bg-white focus:outline-none transition-all text-sm font-bold text-zinc-900 shadow-sm"
                />
            </div>

            <div>
                <label className="block text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-[0.2em] ml-4">Biografia</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={MAX_BIO_LENGTH}
                  className="w-full h-32 p-5 bg-zinc-50 rounded-2xl border border-zinc-100 focus:border-amber-500/40 focus:bg-white focus:outline-none transition-all text-sm font-bold text-zinc-900 shadow-sm resize-none"
                  placeholder="Conte um pouco sobre você..."
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
