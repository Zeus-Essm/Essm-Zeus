import React, { useState, useMemo } from 'react';
import Header from './Header';
import type { CollaborationPost, Post } from '../types';
import GradientButton from './GradientButton';
import { StarIcon } from './IconComponents';

interface VendorCollaborationsScreenProps {
    onBack: () => void;
    collaborationRequests: CollaborationPost[];
    posts: Post[];
    onApprove: (requestId: string) => void;
    onReject: (requestId: string) => void;
    onSponsor: (postId: string) => void;
}

const VendorCollaborationsScreen: React.FC<VendorCollaborationsScreenProps> = ({ onBack, collaborationRequests, posts, onApprove, onReject, onSponsor }) => {
    const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

    const pendingRequests = useMemo(() => collaborationRequests.filter(r => r.status === 'pending'), [collaborationRequests]);
    const approvedRequests = useMemo(() => collaborationRequests.filter(r => r.status === 'approved'), [collaborationRequests]);

    const getPostById = (postId: string) => posts.find(p => p.id === postId);

    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
            <Header title="Colaborações" onBack={onBack} />
            <main className="flex-grow pt-16 flex flex-col animate-fadeIn">
                <div className="border-b border-[var(--border-primary)] flex">
                    <button onClick={() => setActiveTab('pending')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'pending' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        Pendentes ({pendingRequests.length})
                    </button>
                    <button onClick={() => setActiveTab('approved')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'approved' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        Aprovados ({approvedRequests.length})
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {activeTab === 'pending' && (
                        pendingRequests.length > 0 ? pendingRequests.map(req => {
                            const post = getPostById(req.postId);
                            if (!post) return null;
                            return (
                                <div key={req.id} className="bg-[var(--bg-secondary)] border border-[var(--border-secondary)] p-3 rounded-lg">
                                    <div className="flex items-start gap-4 mb-3">
                                        <img src={req.influencer.avatar} alt={req.influencer.name} className="w-10 h-10 object-cover rounded-full"/>
                                        <div>
                                            <p className="font-semibold text-sm">{req.influencer.name}</p>
                                            <p className="text-xs text-[var(--text-secondary)]">enviou uma publicação para colaboração.</p>
                                        </div>
                                    </div>
                                    <img src={post.image} alt="Post" className="w-full h-auto object-cover rounded-md"/>
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={() => onApprove(req.id)} className="flex-1 text-sm font-bold py-2 px-4 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">Aprovar</button>
                                        <button onClick={() => onReject(req.id)} className="flex-1 text-sm font-bold py-2 px-4 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">Recusar</button>
                                    </div>
                                </div>
                            );
                        }) : <p className="text-center text-[var(--text-secondary)] pt-8">Nenhuma solicitação pendente.</p>
                    )}

                    {activeTab === 'approved' && (
                        approvedRequests.length > 0 ? approvedRequests.map(req => {
                             const post = getPostById(req.postId);
                            if (!post) return null;
                            return (
                                 <div key={req.id} className="bg-[var(--bg-secondary)] border border-[var(--border-secondary)] p-3 rounded-lg space-y-3">
                                    <img src={post.image} alt="Post Aprovado" className="w-full h-auto object-cover rounded-md"/>
                                    {post.isSponsored ? (
                                        <div className="text-center py-2 text-sm font-bold text-green-400 bg-green-500/10 rounded-lg">
                                            Patrocinado
                                        </div>
                                    ) : (
                                        <GradientButton onClick={() => onSponsor(post.id)} className="!py-2.5">
                                            <div className="flex items-center justify-center gap-2">
                                                <StarIcon className="w-5 h-5" />
                                                Patrocinar Post
                                            </div>
                                        </GradientButton>
                                    )}
                                </div>
                            );
                        }) : <p className="text-center text-[var(--text-secondary)] pt-8">Nenhuma colaboração aprovada.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default VendorCollaborationsScreen;
