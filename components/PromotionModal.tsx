
import React, { useState } from 'react';
import type { BusinessProfile, Item, Post, Profile } from '../types';
import GradientButton from './GradientButton';
import { INITIAL_VENDOR_ITEMS, VENDOR_POSTS } from '../constants';
import { CheckCircleIconFilled, UserIcon } from './IconComponents';
import { toast } from '../utils/toast';

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

type PromoItem = {
    id: string;
    image: string;
    type: 'product' | 'post';
};

interface PromotionModalProps {
  accountType: 'personal' | 'business';
  profile: Profile | BusinessProfile;
  userPosts?: Post[];
  onClose: () => void;
  onConfirm: (details: { budget: number, duration: number, items: PromoItem[] }) => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ accountType, profile, userPosts = [], onClose, onConfirm }) => {
    const [step, setStep] = useState<'selection' | 'budget'>('selection');
    const [activeSelectionTab, setActiveSelectionTab] = useState<'products' | 'posts'>('posts');
    const [selectedItems, setSelectedItems] = useState<PromoItem[]>([]);
    const [budget, setBudget] = useState(50);
    const [duration, setDuration] = useState(3);

    const MAX_SELECTION = 5;

    const handleToggleItem = (item: PromoItem) => {
        setSelectedItems(prev => {
            const isSelected = prev.some(i => i.id === item.id);
            if (isSelected) {
                return prev.filter(i => i.id !== item.id);
            } else {
                if (prev.length >= MAX_SELECTION) {
                    toast(`Você pode selecionar no máximo ${MAX_SELECTION} itens.`);
                    return prev;
                }
                return [...prev, item];
            }
        });
    };

    const profileName = accountType === 'business' ? (profile as BusinessProfile).business_name : (profile as Profile).username;
    const profileAvatar = accountType === 'business' ? (profile as BusinessProfile).logo_url : (profile as Profile).avatar_url;
    
    const renderSelectionStep = () => (
        <>
            <main className="flex-grow overflow-y-auto p-4 space-y-4">
                 <div>
                    {accountType === 'business' && (
                        <div className="border-b border-[var(--border-primary)] flex">
                            <button onClick={() => setActiveSelectionTab('products')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeSelectionTab === 'products' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>Produtos</button>
                            <button onClick={() => setActiveSelectionTab('posts')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeSelectionTab === 'posts' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>Publicações</button>
                        </div>
                    )}
                     <div className="grid grid-cols-2 gap-4 p-4">
                        {(activeSelectionTab === 'products' && accountType === 'business' ? INITIAL_VENDOR_ITEMS : (accountType === 'business' ? VENDOR_POSTS : userPosts)).map(item => {
                            const promoItem: PromoItem = { id: item.id, image: item.image, type: activeSelectionTab === 'products' ? 'product' : 'post' };
                            const isSelected = selectedItems.some(i => i.id === promoItem.id);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleToggleItem(promoItem)}
                                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group transform hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-[var(--accent-primary)]/20"
                                >
                                    <img src={item.image} alt={(item as Item).name || 'Post'} className="w-full h-full object-cover" />
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-black/60 border-2 border-[var(--accent-primary)] rounded-xl flex items-center justify-center">
                                            <CheckCircleIconFilled className="w-12 h-12 text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>
            <footer className="flex-shrink-0 p-4 border-t border-[var(--border-primary)] space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-[var(--text-secondary)]">SELECIONADOS</span>
                    <span className="text-[var(--accent-primary)]">{selectedItems.length} / {MAX_SELECTION}</span>
                </div>
                 <GradientButton onClick={() => setStep('budget')} disabled={selectedItems.length === 0}>
                    Próximo
                </GradientButton>
            </footer>
        </>
    );
    
    const renderBudgetStep = () => (
        <>
             <main className="flex-grow overflow-y-auto p-4 space-y-6">
                <div>
                    <h3 className="font-bold text-md mb-2">Pré-visualização da Promoção</h3>
                    <div className="bg-[var(--bg-main)] p-2 rounded-lg">
                        <div className="relative border border-[var(--border-primary)] rounded-lg p-3">
                             <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--bg-tertiary)] flex items-center justify-center">
                                    {profileAvatar ? (
                                        <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover"/>
                                    ) : (
                                        <UserIcon className="w-6 h-6 text-[var(--text-secondary)] opacity-50" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{profileName}</p>
                                    <p className="text-xs text-[var(--text-secondary)]">Patrocinado</p>
                                </div>
                            </div>
                            <div className="flex overflow-x-auto gap-2 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {selectedItems.map(item => (
                                     <div key={item.id} className="flex-shrink-0 w-24 h-36 bg-zinc-800 rounded-lg overflow-hidden">
                                        <img src={item.image} alt="Item" className="w-full h-full object-cover"/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-md mb-2">Orçamento e Duração</h3>
                    <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="budget" className="font-semibold text-sm">Orçamento</label>
                                <span className="font-bold text-[var(--accent-primary)]">{budget.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</span>
                            </div>
                            <input
                                id="budget"
                                type="range"
                                min="10"
                                max="500"
                                step="5"
                                value={budget}
                                onChange={(e) => setBudget(Number(e.target.value))}
                                className="w-full h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)]"
                            />
                        </div>
                         <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="duration" className="font-semibold text-sm">Duração</label>
                                <span className="font-bold text-[var(--accent-primary)]">{duration} {duration > 1 ? 'dias' : 'dia'}</span>
                            </div>
                            <input
                                id="duration"
                                type="range"
                                min="1"
                                max="30"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="w-full h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)]"
                            />
                        </div>
                    </div>
                </div>
             </main>
             <footer className="flex-shrink-0 p-4 border-t border-[var(--border-primary)] space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--text-secondary)]">Total</span>
                    <span className="font-bold text-lg">{budget.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</span>
                </div>
                 <div className="flex gap-2">
                    <button onClick={() => setStep('selection')} className="flex-1 text-sm font-bold py-3 px-4 rounded-lg bg-[var(--bg-tertiary)] hover:brightness-95 transition-colors">Voltar</button>
                    <GradientButton 
                        onClick={() => onConfirm({ budget, duration, items: selectedItems })}
                        className="flex-1 !py-3 !bg-[var(--accent-primary)] !text-[var(--accent-primary-text)] hover:!brightness-125"
                    >
                        Pagar e Promover
                    </GradientButton>
                 </div>
            </footer>
        </>
    );

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
                    <h2 className="text-xl font-bold text-[var(--accent-primary)] text-glow">
                        {step === 'selection' ? `1. ${accountType === 'business' ? 'Selecione o Conteúdo' : 'Selecione as Publicações'}` : '2. Defina o Orçamento'}
                    </h2>
                    <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                
                {step === 'selection' ? renderSelectionStep() : renderBudgetStep()}
            </div>
        </div>
    );
};

export default PromotionModal;
