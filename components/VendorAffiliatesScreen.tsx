
import React from 'react';
import Header from './Header';
import type { InfluencerAffiliationRequest } from '../types';
import { UsersIcon } from './IconComponents';

// Lista zerada para uso real
const AFFILIATION_REQUESTS: InfluencerAffiliationRequest[] = [];

interface VendorAffiliatesScreenProps {
    onBack: () => void;
}

const VendorAffiliatesScreen: React.FC<VendorAffiliatesScreenProps> = ({ onBack }) => {
    const pendingRequests = AFFILIATION_REQUESTS.filter(r => r.status === 'pending');
    const approvedRequests = AFFILIATION_REQUESTS.filter(r => r.status === 'approved');

    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
            <Header title="Afiliados" onBack={onBack} />
            <main className="flex-grow overflow-y-auto pt-16 p-4 space-y-6 animate-fadeIn">
                {AFFILIATION_REQUESTS.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                        <UsersIcon className="w-16 h-16 text-zinc-700 mb-4" />
                        <h3 className="font-bold text-lg">Nenhum afiliado ainda</h3>
                        <p className="text-[var(--text-secondary)] text-sm max-w-xs mt-2">Quando influenciadores solicitarem afiliação à sua loja, eles aparecerão aqui.</p>
                    </div>
                ) : (
                    <>
                        <div>
                            <h3 className="font-bold text-lg text-[var(--accent-primary)] text-glow mb-3">Novas Solicitações ({pendingRequests.length})</h3>
                            <div className="space-y-3">
                                {pendingRequests.map(req => (
                                    <div key={req.id} className="bg-[var(--bg-secondary)] border border-[var(--border-secondary)] p-3 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <img src={req.influencer.avatar} alt={req.influencer.name} className="w-12 h-12 object-cover rounded-full"/>
                                            <div className="flex-grow">
                                                <h4 className="font-semibold">{req.influencer.name}</h4>
                                                <p className="text-sm text-[var(--text-secondary)]">
                                                    {req.influencer.followers.toLocaleString()} seguidores
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <button className="flex-1 text-sm font-bold py-2 px-4 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">Aprovar</button>
                                            <button className="flex-1 text-sm font-bold py-2 px-4 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">Recusar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-[var(--accent-primary)] text-glow mb-3">Afiliados Ativos ({approvedRequests.length})</h3>
                            <div className="space-y-3">
                                {approvedRequests.map(req => (
                                    <div key={req.id} className="bg-[var(--bg-secondary)] border border-[var(--border-secondary)] p-3 rounded-lg flex items-center gap-4">
                                        <img src={req.influencer.avatar} alt={req.influencer.name} className="w-12 h-12 object-cover rounded-full"/>
                                         <div className="flex-grow">
                                            <h4 className="font-semibold">{req.influencer.name}</h4>
                                            <p className="text-sm text-[var(--text-secondary)]">
                                                {req.influencer.followers.toLocaleString()} seguidores
                                            </p>
                                        </div>
                                        <button className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors">Ver Perfil</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default VendorAffiliatesScreen;
