import React from 'react';
import Header from './Header';
import { SunIcon, MoonIcon, BookmarkIcon, ArchiveIcon, ActivityIcon, BellIcon, ClockIcon, ChevronRightIcon } from './IconComponents';

interface SettingsScreenProps {
  onBack: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const MenuItem: React.FC<{ icon: React.ReactNode; text: string; onClick: () => void; }> = ({ icon, text, onClick }) => (
  <button onClick={onClick} className="w-full text-left px-3 py-3 text-base text-[var(--text-primary)] hover:bg-yellow-400/10 rounded-lg transition-colors flex items-center gap-4 group">
    <div className="w-6 h-6 text-[var(--text-primary)]">{icon}</div>
    <span className="flex-grow">{text}</span>
    <ChevronRightIcon className="w-5 h-5 text-[var(--text-tertiary)]" />
  </button>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, theme, onToggleTheme }) => {
  const showComingSoon = (featureName: string) => {
    alert(`${featureName} - Em breve!`);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] animate-fadeIn">
      <Header title="Configurações e Atividade" onBack={onBack} />
      <div className="flex-grow pt-16 overflow-y-auto p-4 space-y-4">
        <div>
          <h3 className="font-bold text-sm text-[var(--text-secondary)] px-3 py-2">Como você usa o MEU ESTILO</h3>
          <div className="space-y-1">
            <MenuItem icon={<BookmarkIcon />} text="Salvos" onClick={() => showComingSoon('Salvos')} />
            <MenuItem icon={<ArchiveIcon />} text="Itens Arquivados" onClick={() => showComingSoon('Itens Arquivados')} />
            <MenuItem icon={<ActivityIcon />} text="Sua atividade" onClick={() => showComingSoon('Sua atividade')} />
            <MenuItem icon={<BellIcon />} text="Notificações" onClick={() => showComingSoon('Notificações')} />
            <MenuItem icon={<ClockIcon />} text="Gerenciamento de tempo" onClick={() => showComingSoon('Gerenciamento de tempo')} />
          </div>
        </div>

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
        
      </div>
    </div>
  );
};

export default SettingsScreen;
