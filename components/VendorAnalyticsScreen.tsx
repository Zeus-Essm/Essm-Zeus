
import React from 'react';
import Header from './Header';
import { ShoppingBagIcon, EyeIcon, UsersIcon, StarIcon } from './IconComponents';

interface VendorAnalyticsScreenProps {
    onBack: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; trend: string; icon: React.ReactNode }> = ({ title, value, trend, icon }) => (
    <div className="bg-white p-5 rounded-2xl border border-zinc-50 shadow-sm relative overflow-hidden group active:scale-95 transition-all">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 transition-colors group-hover:bg-amber-100">
                {icon}
            </div>
            <div className="bg-green-50 text-green-500 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest border border-green-100/50">
                {trend}
            </div>
        </div>
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] leading-tight mb-1">{title}</h3>
        <p className="text-3xl font-black text-zinc-900 tracking-tighter leading-none">{value}</p>
    </div>
);

const FunnelRow: React.FC<{ label: string; value: number; progress: number; color?: string }> = ({ label, value, progress, color = "bg-amber-500" }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-black text-zinc-900">{value}</span>
        </div>
        <div className="w-full h-2 bg-zinc-50 rounded-full overflow-hidden border border-zinc-100">
            <div 
                className={`h-full ${color} transition-all duration-1000 ease-out`} 
                style={{ width: `${progress}%` }} 
            />
        </div>
    </div>
);

const VendorAnalyticsScreen: React.FC<VendorAnalyticsScreenProps> = ({ onBack }) => {
    return (
        <div className="w-full h-full flex flex-col bg-white text-zinc-900 animate-fadeIn font-sans">
            <header className="px-4 pt-4 pb-2 flex items-center gap-4 shrink-0 z-10 border-b border-zinc-50">
                <button onClick={onBack} className="p-2 -ml-2 rounded-xl bg-zinc-50 text-zinc-400 active:scale-90 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </button>
                <h1 className="text-lg font-black tracking-tight text-zinc-900 uppercase italic">
                    VISÃO GERAL
                </h1>
            </header>

            <main className="flex-grow overflow-y-auto px-5 py-6 space-y-8 scrollbar-hide pb-32">
                
                {/* Grid de Métricas 2x2 */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard title="Vendas Totais" value="0" trend="0%" icon={<ShoppingBagIcon className="w-5 h-5" />} />
                    <StatCard title="Visitas" value="0" trend="0%" icon={<EyeIcon className="w-5 h-5" />} />
                    <StatCard title="Novos Seguidores" value="0" trend="0%" icon={<UsersIcon className="w-5 h-5" />} />
                    <StatCard title="Engajamento" value="0%" trend="0%" icon={<StarIcon className="w-5 h-5" />} />
                </div>

                {/* Funil de Conversão */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-50 shadow-sm space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900 italic border-b border-zinc-50 pb-4">Funil de Conversão</h3>
                    <div className="space-y-6">
                        <FunnelRow label="Visualizações" value={0} progress={0} />
                        <div className="pl-4">
                            <FunnelRow label="Provador IA" value={0} progress={0} color="bg-amber-500/40" />
                        </div>
                        <div className="pl-8">
                            <FunnelRow label="Vendas" value={0} progress={0} color="bg-green-500" />
                        </div>
                    </div>
                    <p className="text-[10px] text-center text-zinc-300 mt-6 font-black uppercase tracking-widest italic pt-2">
                        Aguardando as primeiras interações dos clientes...
                    </p>
                </div>

                {/* Desempenho Semanal */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-50 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900 italic mb-8">Desempenho Semanal</h3>
                    <div className="flex items-end justify-between h-24 gap-3">
                        {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map((day) => (
                            <div key={day} className="flex-1 flex flex-col items-center gap-3">
                                <div className="w-full bg-zinc-50 rounded-t-lg h-1.5 border border-zinc-100/50 group-hover:bg-amber-100 transition-colors"></div>
                                <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
};

export default VendorAnalyticsScreen;
