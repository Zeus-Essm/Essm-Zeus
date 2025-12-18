
import React, { useState } from 'react';
import Header from './Header';
import type { CollaborationPost, Post } from '../types';
import { StarIcon, UsersIcon } from './IconComponents';

interface VendorCollaborationsScreenProps {
    onBack: () => void;
    collaborationRequests: CollaborationPost[];
    posts: Post[];
}

const VendorCollaborationsScreen: React.FC<VendorCollaborationsScreenProps> = ({ onBack, collaborationRequests, posts }) => {
    const [activeTab, setActiveTab] = useState<'requests' | 'active'>('requests');

    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
            <Header title="Colaborações" onBack={onBack} />
            <main className="flex-grow pt-16 flex flex-col animate-fadeIn pb-24">
                
                <div className="px-4 py-2 flex border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/50">
                    <button onClick={() => setActiveTab('requests')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-zinc-500'}`}>
                        Pendente
                    </button>
                    <button onClick={() => setActiveTab('active')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-zinc-500'}`}>
                        Em Andamento
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-3xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
                        {activeTab === 'requests' ? <UsersIcon className="w-8 h-8 text-zinc-500" /> : <StarIcon className="w-8 h-8 text-zinc-500" />}
                    </div>
                    <h3 className="font-black uppercase text-sm tracking-widest">
                        {activeTab === 'requests' ? "Nenhuma Proposta" : "Nenhuma Campanha"}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-2 max-w-[220px]">
                        {activeTab === 'requests' 
                            ? "Quando influenciadores marcarem sua loja em conteúdos, as solicitações aparecerão aqui." 
                            : "Suas colaborações aprovadas e campanhas ativas serão listadas nesta seção."}
                    </p>
                </div>

            </main>
            {/* Update Confirmation Seal */}
            <div className="fixed bottom-24 right-4 bg-purple-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg z-50 animate-bounce">
                MEDIA HUB ATIVO
            </div>
        </div>
    );
};

export default VendorCollaborationsScreen;
