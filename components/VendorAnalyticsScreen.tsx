import React from 'react';
import Header from './Header';

interface VendorAnalyticsScreenProps {
    onBack: () => void;
}

const VendorAnalyticsScreen: React.FC<VendorAnalyticsScreenProps> = ({ onBack }) => (
    <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
        <Header title="Visão Geral" onBack={onBack} />
        <main className="flex-grow overflow-y-auto pt-16 p-4 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-secondary)]">
                    <h3 className="text-sm font-bold text-[var(--text-secondary)]">Visitas ao Perfil (30d)</h3>
                    <p className="text-3xl font-bold text-[var(--accent-primary)] text-glow">12,8K</p>
                    <p className="text-sm text-green-400">+15%</p>
                </div>
                <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-secondary)]">
                    <h3 className="text-sm font-bold text-[var(--text-secondary)]">Usos no Provador (30d)</h3>
                    <p className="text-3xl font-bold text-[var(--accent-primary)] text-glow">4,2K</p>
                    <p className="text-sm text-green-400">+22%</p>
                </div>
                 <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-secondary)]">
                    <h3 className="text-sm font-bold text-[var(--text-secondary)]">Novos Afiliados (30d)</h3>
                    <p className="text-3xl font-bold text-[var(--accent-primary)] text-glow">8</p>
                    <p className="text-sm text-green-400">+5%</p>
                </div>
                 <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-secondary)]">
                    <h3 className="text-sm font-bold text-[var(--text-secondary)]">Vendas Totais (30d)</h3>
                    <p className="text-3xl font-bold text-[var(--accent-primary)] text-glow">R$ 5.670</p>
                    <p className="text-sm text-red-400">-2%</p>
                </div>
            </div>
            <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-secondary)]">
                <h3 className="text-sm font-bold text-[var(--text-secondary)] mb-2">Vendas por Categoria</h3>
                <div className="space-y-3">
                    <div className="flex items-center">
                        <span className="w-20 text-xs uppercase text-[var(--text-tertiary)]">T-shirts</span>
                        <div className="flex-grow h-2 bg-zinc-700 rounded-full"><div className="w-[80%] h-full bg-[var(--accent-primary)] rounded-full"></div></div>
                    </div>
                    <div className="flex items-center">
                        <span className="w-20 text-xs uppercase text-[var(--text-tertiary)]">Calças</span>
                        <div className="flex-grow h-2 bg-zinc-700 rounded-full"><div className="w-[60%] h-full bg-[var(--accent-primary)] rounded-full"></div></div>
                    </div>
                    <div className="flex items-center">
                        <span className="w-20 text-xs uppercase text-[var(--text-tertiary)]">Ténis</span>
                        <div className="flex-grow h-2 bg-zinc-700 rounded-full"><div className="w-[45%] h-full bg-[var(--accent-primary)] rounded-full"></div></div>
                    </div>
                </div>
            </div>
        </main>
    </div>
);

export default VendorAnalyticsScreen;
