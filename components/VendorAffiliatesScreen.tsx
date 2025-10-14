import React from 'react';
import Header from './Header';
import type { InfluencerAffiliationRequest } from '../types';

// Dummy Data
const AFFILIATION_REQUESTS: InfluencerAffiliationRequest[] = [
    { id: 'req1', influencer: { id: 'user1', name: 'Ana Clara', avatar: 'https://i.pravatar.cc/150?u=anaclara', followers: 152000 }, status: 'pending', requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 'req2', influencer: { id: 'user2', name: 'Bruno Gomes', avatar: 'https://i.pravatar.cc/150?u=bruno', followers: 89000 }, status: 'pending', requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: 'req3', influencer: { id: 'user3', name: 'Carla Dias', avatar: 'https://i.pravatar.cc/150?u=carla', followers: 230000 }, status: 'approved', requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
];

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
            </main>
        </div>
    );
};

export default VendorAffiliatesScreen;
