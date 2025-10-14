import React, { useEffect } from 'react';
import { ChartBarIcon, ShoppingBagIcon, UsersIcon, ChevronRightIcon, StarIcon } from './IconComponents';

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

const MenuItem: React.FC<{ icon: React.ReactNode; text: string; onClick: () => void; }> = ({ icon, text, onClick }) => (
  <button onClick={onClick} className="w-full text-left px-3 py-3 text-base text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition-colors flex items-center gap-4 group">
    <div className="w-6 h-6 text-[var(--accent-primary)]">{icon}</div>
    <span className="flex-grow">{text}</span>
    <ChevronRightIcon className="w-5 h-5 text-[var(--text-tertiary)]" />
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
            className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-sm z-50 animate-modalFadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
             <div 
                className="absolute top-0 right-0 h-full w-full max-w-sm bg-[var(--bg-secondary)] border-l border-[var(--border-primary)] shadow-2xl flex flex-col p-4"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'slideInRight 0.3s ease-out forwards' }}
            >
                <header className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[var(--accent-primary)] text-glow">Menu da Loja</h2>
                     <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors">
                        <XIcon className="w-6 h-6 text-[var(--text-primary)]" />
                    </button>
                </header>
                
                <div className="space-y-2 flex-grow">
                    <MenuItem icon={<ChartBarIcon />} text="Visão Geral (Analytics)" onClick={onNavigateToAnalytics} />
                    <MenuItem icon={<ShoppingBagIcon />} text="Gerenciar Produtos" onClick={onNavigateToProducts} />
                    <MenuItem icon={<UsersIcon />} text="Solicitações de Afiliados" onClick={onNavigateToAffiliates} />
                    <MenuItem icon={<StarIcon />} text="Colaborações" onClick={onNavigateToCollaborations} />
                </div>
                
                <div className="mt-auto">
                    <button 
                        onClick={onSignOut}
                        className="w-full text-center py-3 text-red-400 font-bold hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        Sair da Conta
                    </button>
                </div>
            </div>
             {/* Add keyframes for slide-in animation */}
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