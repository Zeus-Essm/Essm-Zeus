import React from 'react';
import Header from './Header';
import { ChartBarIcon } from './IconComponents';

interface VendorAnalyticsScreenProps {
    onBack: () => void;
    isProfilePromoted: boolean;
}

const VendorAnalyticsScreen: React.FC<VendorAnalyticsScreenProps> = ({ onBack, isProfilePromoted }) => (
    <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
        <Header title="Visão Geral" onBack={onBack} />
        <main className="flex-grow overflow-y-auto pt-16 p-4 space-y-6 animate-fadeIn">
            <div>
                <h2 className="text-lg font-bold text-[var(--text-secondary)] mb-2">Desempenho Geral</h2>
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
                        <p className="text-3xl font-bold text-[var(--accent-primary)] text-glow">{(5670).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
                        <p className="text-sm text-red-400">-2%</p>
                    </div>
                </div>
            </div>

            {isProfilePromoted ? (
                <div>
                    <h2 className="text-lg font-bold text-[var(--text-secondary)] mb-2">Desempenho da Promoção (Ativa)</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-amber-600/10 p-4 rounded-lg border border-amber-500/30">
                            <h3 className="text-sm font-bold text-amber-300">Alcance</h3>
                            <p className="text-3xl font-bold text-amber-400 text-glow">2.315</p>
                            <p className="text-sm text-amber-200">pessoas alcançadas</p>
                        </div>
                        <div className="bg-amber-600/10 p-4 rounded-lg border border-amber-500/30">
                            <h3 className="text-sm font-bold text-amber-300">Cliques no Perfil</h3>
                            <p className="text-3xl font-bold text-amber-400 text-glow">142</p>
                            <p className="text-sm text-amber-200">visitas da promoção</p>
                        </div>
                        <div className="bg-amber-600/10 p-4 rounded-lg border border-amber-500/30 col-span-2">
                            <h3 className="text-sm font-bold text-amber-300">Orçamento Gasto</h3>
                            <p className="text-3xl font-bold text-amber-400 text-glow">{(8.50).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })} / {(20.00).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
                            <div className="w-full h-2 bg-amber-900/50 rounded-full mt-2 overflow-hidden"><div className="w-[42.5%] h-full bg-amber-400 rounded-full"></div></div>
                        </div>
                    </div>
                </div>
            ) : (
                 <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-dashed border-[var(--border-secondary)] text-center">
                    <ChartBarIcon className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-2" />
                    <h3 className="font-bold text-[var(--text-primary)]">Promova seu perfil</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Ative uma promoção para ver as estatísticas de desempenho aqui.</p>
                </div>
            )}

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