
import React, { useEffect } from 'react';
import { ChartBarIcon, ShoppingBagIcon, UsersIcon, ChevronRightIcon, StarIcon, LogoutIcon } from './IconComponents';

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface VendorMenuModalProps {
  onClose: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToProducts: () => void;
  onNavigateToAffiliates: () => void;
  onNavigateToCollaborations: () => void;
  onSignOut: () => void;
}

const MenuItem: React.FC<{ icon: React.ReactNode; text: string; onClick: () => void; isLast?: boolean }> = ({ icon, text, onClick, isLast }) => (
  <button 
    onClick={onClick} 
    className={`w-full text-left px-5 py-5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/5 transition-colors flex items-center gap-4 group ${!isLast ? 'border-b border-[var(--border-secondary)]' : ''}`}
  >
    <div className="w-5 h-5 text-[var(--accent-primary)]">{icon}</div>
    <span className="flex-grow font-bold uppercase tracking-tight text-[11px] text-zinc-600 group-hover:text-zinc-900 transition-colors">{text}</span>
    <ChevronRightIcon className="w-4 h-4 text-zinc-300 group-hover:text-[var(--accent-primary)] transition-colors" />
  </button>
);


const VendorMenuModal: React.FC<VendorMenuModalProps> = ({ 
    onClose, 
    onNavigateToAnalytics, 
    onNavigateToProducts,
    onNavigateToAffiliates,
    onNavigateToCollaborations,
    onSignOut 
}) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 animate-modalFadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
             <div 
                className="absolute top-0 right-0 h-full w-full max-w-[300px] bg-white shadow-2xl flex flex-col p-6"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            >
                <header className="flex items-center justify-between mb-8 pt-4">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tighter italic">Painel Loja</h2>
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-0.5">Sessão Empresarial</span>
                    </div>
                     <button onClick={onClose} className="p-2.5 bg-zinc-50 rounded-2xl text-zinc-400 hover:text-zinc-900 transition-colors">
                        <XIcon className="w-5 h-5" />
                    </button>
                </header>
                
                <div className="bg-white rounded-[2.5rem] border border-zinc-100 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] mb-8">
                    <MenuItem 
                        icon={<ChartBarIcon className="w-5 h-5" />} 
                        text="Visualizar Analytics" 
                        onClick={() => { onNavigateToAnalytics(); onClose(); }} 
                    />
                    <MenuItem 
                        icon={<ShoppingBagIcon className="w-5 h-5" />} 
                        text="Estoque & Catálogo" 
                        onClick={() => { onNavigateToProducts(); onClose(); }} 
                    />
                    <MenuItem 
                        icon={<UsersIcon className="w-5 h-5" />} 
                        text="Gestão de Afiliados" 
                        onClick={() => { onNavigateToAffiliates(); onClose(); }} 
                    />
                    <MenuItem 
                        icon={<StarIcon className="w-5 h-5" />} 
                        text="Colaborações de IA" 
                        onClick={() => { onNavigateToCollaborations(); onClose(); }} 
                        isLast={true}
                    />
                </div>
                
                <div className="mt-auto flex flex-col gap-4 pb-6">
                    <div className="p-4 bg-zinc-50 rounded-3xl border border-zinc-100">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase text-center leading-tight">
                            Alterações são salvas automaticamente no banco de dados.
                        </p>
                    </div>
                    <button 
                        onClick={onSignOut}
                        className="w-full py-5 bg-white border-2 border-red-50 text-red-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-[1.8rem] hover:bg-red-50 hover:border-red-100 transition-all active:scale-[0.97] flex items-center justify-center gap-3 shadow-sm group"
                    >
                        <LogoutIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Encerrar Sessão
                    </button>
                </div>
            </div>

            <style>
            {`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}
            </style>
        </div>
    );
};

export default VendorMenuModal;
