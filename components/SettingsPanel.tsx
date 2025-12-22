
import React from 'react';
import { SunIcon, MoonIcon, ChevronRightIcon, LogoutIcon, UserIcon, ShieldCheckIcon, BellIcon } from './IconComponents';
import type { Profile } from '../types';

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface SettingsPanelProps {
  profile: Profile;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onClose: () => void;
  onSignOut: () => void;
  onNavigateToVerification: () => void;
}

const MenuItem: React.FC<{ 
    icon: React.ReactNode; 
    text: string; 
    description?: string;
    onClick: () => void; 
    isLast?: boolean;
}> = ({ icon, text, description, onClick, isLast }) => (
  <button 
    onClick={onClick} 
    className={`w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-zinc-50 transition-all group ${!isLast ? 'border-b border-zinc-50' : ''}`}
  >
    <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-amber-500 transition-colors">
        {icon}
    </div>
    <div className="flex-grow">
        <p className="text-[11px] font-black uppercase tracking-tight text-zinc-800">{text}</p>
        {description && <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-0.5">{description}</p>}
    </div>
    <ChevronRightIcon className="w-4 h-4 text-zinc-200 group-hover:text-amber-500 transition-colors" />
  </button>
);

const SettingsPanel: React.FC<SettingsPanelProps> = ({ profile, theme, onToggleTheme, onClose, onSignOut, onNavigateToVerification }) => {
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 z-[110] flex justify-end overflow-hidden"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            />

            {/* Mini Window Panel */}
            <div 
                className="relative w-[85%] max-w-sm h-full bg-white shadow-2xl flex flex-col border-l border-zinc-100"
                style={{ 
                    animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' 
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 flex items-center justify-between border-b border-zinc-50 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 tracking-tighter uppercase italic">Ajustes</h2>
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">Gestão de conta e app</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2.5 rounded-2xl bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-all active:scale-90" 
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </header>

                <main className="flex-grow overflow-y-auto scrollbar-hide py-4 px-4 space-y-6">
                    {/* Perfil Section */}
                    <div className="bg-white rounded-[2rem] border border-zinc-100 overflow-hidden shadow-sm">
                        <MenuItem 
                            icon={<UserIcon className="w-5 h-5" />} 
                            text="Editar Dados" 
                            description="Nome, bio e foto"
                            onClick={onClose} 
                        />
                        <MenuItem 
                            icon={<ShieldCheckIcon className="w-5 h-5" />} 
                            text="Verificação" 
                            description="Status do selo preto"
                            onClick={onNavigateToVerification} 
                        />
                    </div>

                    {/* Preferências Section */}
                    <div>
                        <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] ml-5 mb-3 italic">Preferências</h3>
                        <div className="bg-white rounded-[2rem] border border-zinc-100 overflow-hidden shadow-sm">
                            <MenuItem 
                                icon={theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />} 
                                text={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'} 
                                description="Alternar aparência"
                                onClick={onToggleTheme} 
                            />
                            <MenuItem 
                                icon={<BellIcon className="w-5 h-5" />} 
                                text="Notificações" 
                                description="Avisos e alertas"
                                onClick={onClose} 
                                isLast={true}
                            />
                        </div>
                    </div>

                    {/* Sobre Section */}
                    <div className="px-5 pt-2">
                        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest text-center">
                            PUMP V1.0.4 • Angola Edition
                        </p>
                    </div>
                </main>

                <footer className="p-6 border-t border-zinc-50 bg-white flex-shrink-0">
                    <button 
                        onClick={onSignOut}
                        className="w-full py-5 bg-red-50 text-red-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-3xl hover:bg-red-100 transition-all active:scale-[0.97] flex items-center justify-center gap-3 group"
                    >
                        <LogoutIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                        Encerrar Sessão
                    </button>
                </footer>
            </div>

            <style>
            {`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}
            </style>
        </div>
    );
};

export default SettingsPanel;
