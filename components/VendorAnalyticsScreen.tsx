
import React from 'react';
import Header from './Header';
import { ChartBarIcon, EyeIcon, ShoppingBagIcon, UsersIcon, StarIcon } from './IconComponents';

interface VendorAnalyticsScreenProps {
    onBack: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; trend: string; isPositive: boolean; icon: React.ReactNode }> = ({ title, value, trend, isPositive, icon }) => (
    <div className="bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-primary)] shadow-sm">
        <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                {icon}
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                {trend}
            </span>
        </div>
        <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-black text-[var(--text-primary)] mt-1">{value}</p>
    </div>
);

const VendorAnalyticsScreen: React.FC<VendorAnalyticsScreenProps> = ({ onBack }) => {
    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
            <Header title="Visão Geral" onBack={onBack} />
            <main className="flex-grow overflow-y-auto pt-16 p-4 space-y-6 animate-fadeIn pb-24">
                
                {/* Métricas Zeradas para Novo Usuário */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard title="Vendas Totais" value="0" trend="0%" isPositive={true} icon={<ShoppingBagIcon className="w-5 h-5" />} />
                    <StatCard title="Visitas" value="0" trend="0%" isPositive={true} icon={<EyeIcon className="w-5 h-5" />} />
                    <StatCard title="Novos Seguidores" value="0" trend="0%" isPositive={true} icon={<UsersIcon className="w-5 h-5" />} />
                    <StatCard title="Engajamento" value="0%" trend="0%" isPositive={true} icon={<StarIcon className="w-5 h-5" />} />
                </div>

                {/* Estrutura de Funil Pronta */}
                <div className="bg-[var(--bg-secondary)] p-5 rounded-2xl border border-[var(--border-primary)]">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-secondary)] mb-4">Funil de Conversão</h3>
                    <div className="space-y-4 opacity-40">
                        <div className="relative">
                            <div className="flex justify-between text-[10px] font-bold mb-1 uppercase">
                                <span>Visualizações</span>
                                <span>0</span>
                            </div>
                            <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--accent-primary)] w-0"></div>
                            </div>
                        </div>
                        <div className="relative pl-4">
                            <div className="flex justify-between text-[10px] font-bold mb-1 uppercase">
                                <span>Provador IA</span>
                                <span>0</span>
                            </div>
                            <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden border-l border-[var(--accent-primary)]">
                                <div className="h-full bg-[var(--accent-primary)]/50 w-0"></div>
                            </div>
                        </div>
                        <div className="relative pl-8">
                            <div className="flex justify-between text-[10px] font-bold mb-1 uppercase">
                                <span>Vendas</span>
                                <span>0</span>
                            </div>
                            <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden border-l border-green-500">
                                <div className="h-full bg-green-500 w-0"></div>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-center text-zinc-500 mt-4 font-medium uppercase italic">Aguardando as primeiras interações dos clientes...</p>
                </div>

                {/* Gráfico de Desempenho Vazio */}
                <div className="bg-[var(--bg-secondary)] p-5 rounded-2xl border border-[var(--border-primary)]">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-secondary)] mb-6">Desempenho Semanal</h3>
                    <div className="flex items-end justify-between h-24 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-[var(--bg-tertiary)] rounded-t-sm h-1"></div>
                                <span className="text-[8px] font-bold text-zinc-600">D{i}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
};

export default VendorAnalyticsScreen;
