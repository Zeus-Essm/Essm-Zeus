import React, { useState } from 'react';
import type { BusinessProfile } from '../types';
import GradientButton from './GradientButton';
import PromotedProfileCard from './PromotedProfileCard';

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PROMOTION_TIERS = [
    { id: 1, budget: 20, duration: 2, reach: '5.000 - 15.000' },
    { id: 2, budget: 50, duration: 5, reach: '12.000 - 35.000' },
    { id: 3, budget: 100, duration: 7, reach: '25.000 - 70.000' },
];

interface PromotionModalProps {
  businessProfile: BusinessProfile;
  onClose: () => void;
  onConfirm: (tier: typeof PROMOTION_TIERS[0]) => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ businessProfile, onClose, onConfirm }) => {
    const [selectedTierId, setSelectedTierId] = useState(PROMOTION_TIERS[0].id);

    const selectedTier = PROMOTION_TIERS.find(t => t.id === selectedTierId)!;

    return (
        <div 
            className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-modalFadeIn"
            onClick={onClose}
        >
            <div 
                className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl w-full max-w-md h-full max-h-[90vh] text-[var(--text-primary)] animate-modalZoomIn flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[var(--accent-primary)] text-glow">Turbinar Perfil</h2>
                    <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-grow overflow-y-auto p-4 space-y-6">
                    <div>
                        <h3 className="font-bold text-md mb-2">1. Escolha seu orçamento</h3>
                        <div className="space-y-2">
                            {PROMOTION_TIERS.map(tier => (
                                <div 
                                    key={tier.id}
                                    onClick={() => setSelectedTierId(tier.id)}
                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${selectedTierId === tier.id ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10' : 'border-[var(--border-secondary)] hover:border-[var(--accent-primary)]/50'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-lg">R$ {tier.budget}</span>
                                        <span className="text-sm text-[var(--text-secondary)]">{tier.duration} dias</span>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">Alcance estimado: {tier.reach}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                     <div>
                        <h3 className="font-bold text-md mb-2">2. Pré-visualização</h3>
                        <div className="bg-[var(--bg-main)] p-2 rounded-lg">
                            <PromotedProfileCard businessProfile={businessProfile} onVisit={() => {}} />
                        </div>
                    </div>
                </main>

                <footer className="flex-shrink-0 p-4 border-t border-[var(--border-primary)] space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[var(--text-secondary)]">Total</span>
                        <span className="font-bold text-lg">R$ {selectedTier.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                     <GradientButton 
                        onClick={() => onConfirm(selectedTier)}
                        className="!bg-[var(--accent-primary)] !text-[var(--accent-primary-text)] hover:!brightness-125"
                    >
                        Pagar e Promover
                    </GradientButton>
                </footer>
            </div>
        </div>
    );
};

export default PromotionModal;