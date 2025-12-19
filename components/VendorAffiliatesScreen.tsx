
import React, { useState } from 'react';
import Header from './Header';
import type { InfluencerAffiliationRequest } from '../types';
import { UsersIcon, StarIcon, CheckCircleIconFilled } from './IconComponents';

interface VendorAffiliatesScreenProps {
    onBack: () => void;
}

const VendorAffiliatesScreen: React.FC<VendorAffiliatesScreenProps> = ({ onBack }) => {
    // Inicializado zerado para o espaço real do vendedor
    const [requests, setRequests] = useState<InfluencerAffiliationRequest[]>([]);

    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
            <Header title="Afiliados" onBack={onBack} />
            <main className="flex-grow overflow-y-auto pt-16 p-4 space-y-8 animate-fadeIn pb-24">
                
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center">
                            <StarIcon className="w-4 h-4 text-amber-500" />
                        </div>
                        <h3 className="font-black text-xs uppercase tracking-widest text-[var(--text-secondary)]">Novas Solicitações</h3>
                    </div>

                    {requests.length > 0 ? (
                        <div className="space-y-3">
                            {/* Mapeamento de solicitações aqui */}
                        </div>
                    ) : (
                        <div className="bg-[var(--bg-secondary)] border border-dashed border-[var(--border-primary)] rounded-2xl p-8 text-center">
                            <UsersIcon className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
                            <p className="text-xs font-bold text-zinc-500 uppercase">Sem solicitações no momento</p>
                            <p className="text-[10px] text-zinc-600 mt-1">Influenciadores interessados em vender seus produtos aparecerão aqui.</p>
                        </div>
                    )}
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-green-500/10 flex items-center justify-center">
                            <CheckCircleIconFilled className="w-4 h-4 text-green-500" />
                        </div>
                        <h3 className="font-black text-xs uppercase tracking-widest text-[var(--text-secondary)]">Afiliados Ativos</h3>
                    </div>
                    
                    <div className="p-10 border border-zinc-900 rounded-2xl text-center opacity-30">
                        <p className="text-[10px] font-black uppercase tracking-widest">Nenhum parceiro ativo</p>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default VendorAffiliatesScreen;
