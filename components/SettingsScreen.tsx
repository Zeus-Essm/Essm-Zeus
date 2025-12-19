
import React from 'react';
import Header from './Header';
import { SunIcon, MoonIcon, ChevronRightIcon, LogoutIcon } from './IconComponents';
import type { Profile } from '../types';

interface SettingsScreenProps {
  onBack: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  profile: Profile;
  onNavigateToVerification: () => void;
  onSignOut: () => void;
}

const MenuItem: React.FC<{ icon: React.ReactNode; text: string; trailing?: React.ReactNode; onClick: () => void; danger?: boolean; }> = ({ icon, text, trailing, onClick, danger }) => (
  <button onClick={onClick} className={`w-full text-left px-3 py-3 text-base ${danger ? 'text-red-500' : 'text-[var(--text-primary)]'} hover:bg-[var(--accent-primary)]/10 rounded-lg transition-colors flex items-center gap-4 group`}>
    <div className={`w-6 h-6 ${danger ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>{icon}</div>
    <span className="flex-grow">{text}</span>
    {!danger && (trailing ? trailing : <ChevronRightIcon className="w-5 h-5 text-[var(--text-tertiary)]" />)}
  </button>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, theme, onToggleTheme, profile, onNavigateToVerification, onSignOut }) => {
  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] animate-fadeIn">
      <Header title="Configurações e Atividade" onBack={onBack} />
      <div className="flex-grow pt-16 overflow-y-auto p-4 space-y-4 pb-20">
        <div>
          <h3 className="font-bold text-sm text-[var(--text-secondary)] px-3 py-2">Preferências</h3>
           <div className="space-y-1">
             <MenuItem 
                icon={theme === 'dark' ? <SunIcon /> : <MoonIcon />} 
                text={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'} 
                onClick={onToggleTheme}
            />
           </div>
        </div>

        <div>
          <h3 className="font-bold text-sm text-[var(--text-secondary)] px-3 py-2">Sessão</h3>
           <div className="space-y-1">
             <MenuItem 
                icon={<LogoutIcon />} 
                text="Sair da Conta" 
                onClick={onSignOut}
                danger={true}
            />
           </div>
        </div>
        
      </div>
    </div>
  );
};

export default SettingsScreen;
