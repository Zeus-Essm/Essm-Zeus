
import React, { useState, useEffect } from 'react';
import Header from './Header';
import { LockIcon, TruckIcon, CheckCircleIconFilled } from './IconComponents';
import GradientButton from './GradientButton';
import type { Item } from '../types';

interface RewardItem extends Item {
    pointsCost: number;
    brandId: string;
}

const REWARD_ITEMS: RewardItem[] = [
    // ADIDAS
    { id: 'ad-new-1', name: 'Conjunto Essentials Beige', description: 'Conforto premium com estilo minimalista.', category: 'jacket', image: 'https://i.postimg.cc/GtC64Bgs/7afc787b99b64c10a9e7efa06126cee6.webp', price: 0, pointsCost: 3500, brandId: 'adidas' },
    { id: 'ad-new-2', name: 'Jaqueta Firebird TT', description: 'O ícone retrô que nunca sai de moda.', category: 'jacket', image: 'https://i.postimg.cc/0jshz6XK/63842428_o.webp', price: 0, pointsCost: 5500, brandId: 'adidas' },
    { id: 'ad-new-3', name: 'Adidas Campus 00s', description: 'Estilo skate com proporções ousadas.', category: 'shoes', image: 'https://i.postimg.cc/J43bLyWk/tenis_adidas_campus_794830.jpg', price: 0, pointsCost: 5200, brandId: 'adidas' },
    { id: 'ad-new-4', name: 'Superstar XLG', description: 'O clássico shell-toe elevado.', category: 'shoes', image: 'https://i.postimg.cc/PqyVKt4z/sapatilhas_adidas_originals_superstar_ii_ih4172.png', price: 0, pointsCost: 4800, brandId: 'adidas' },

    // NEW FEELING
    { id: 'nf-r1', name: 'Fato Executivo Navy', description: 'Elegância absoluta para o escritório.', category: 'suit', image: 'https://i.postimg.cc/TwNdQgN6/Gemini_Generated_Image_1tdh7l1tdh7l1tdh.png', price: 0, pointsCost: 4000, brandId: 'new_feeling' },
    { id: 'nf-r2', name: 'Fato Slim Grey', description: 'Corte moderno e tecido premium.', category: 'suit', image: 'https://i.postimg.cc/s2XDWTKD/Gemini_Generated_Image_6o1rfi6o1rfi6o1r.png', price: 0, pointsCost: 12500, brandId: 'new_feeling' },

    // LOUIS VUITTON
    { id: 'lv-ex-1', name: 'LV Skate Marine', description: 'Design robusto com detalhes em malha técnica.', category: 'shoes', image: 'https://i.postimg.cc/VvTx5mX1/louis-vuitton-sneaker-lv-skate-BO9-U3-PMI31-PM2-Front-view.webp', price: 0, pointsCost: 4500, brandId: 'lv' },
    { id: 'lv-ex-2', name: 'LV Skate Beige', description: 'Estilo vintage dos anos 90 reinventado.', category: 'shoes', image: 'https://i.postimg.cc/66mJMLgS/louis-vuitton-tenis-lv-skate-BP9-U2-PMI92-PM2-Front-view.webp', price: 0, pointsCost: 18000, brandId: 'lv' },
];

const BRANDS = [
    { id: 'adidas', name: 'Adidas', logo: 'https://i.postimg.cc/LXmdq4H2/D.jpg', color: 'from-blue-600 to-blue-900' },
    { id: 'new_feeling', name: 'New Feeling', logo: 'https://i.postimg.cc/pTbvCjjp/NEW-FEELING.png', color: 'from-purple-600 to-purple-900' },
    { id: 'lv', name: 'Louis Vuitton', logo: 'https://i.postimg.cc/xCknv8vV/pexels-rdne-6224633.jpg', color: 'from-amber-600 to-amber-900' },
];

const RedemptionOverlay: React.FC<{ item: RewardItem; onClose: () => void }> = ({ item, onClose }) => {
    const [stage, setStage] = useState<'warp' | 'box' | 'success'>('warp');

    useEffect(() => {
        const timer1 = setTimeout(() => setStage('box'), 2000);
        const timer2 = setTimeout(() => setStage('success'), 4500);
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
            {stage === 'warp' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="warp-tunnel absolute inset-0"></div>
                    <img src={item.image} alt={item.name} className="relative z-10 w-64 h-64 object-contain animate-zoomIn" />
                    <h2 className="absolute bottom-20 text-white text-2xl font-black uppercase tracking-widest animate-pulse">Acessando Cofre...</h2>
                </div>
            )}
            {stage === 'box' && (
                <div className="flex flex-col items-center animate-bounceIn">
                    <div className="relative w-64 h-64">
                        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-black border-2 border-[var(--accent-primary)] rounded-lg flex items-center justify-center shadow-[0_0_50px_var(--accent-primary)]">
                            <img src="https://i.postimg.cc/XJf6gckX/Pump_STARTAP.png" alt="PUMP" className="w-20 opacity-50" />
                        </div>
                        <img src={item.image} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 object-contain animate-shrinkIntoBox" />
                    </div>
                    <p className="text-green-400 font-mono mt-8 text-xl">EMBALANDO RECOMPENSA...</p>
                </div>
            )}
            {stage === 'success' && (
                <div className="text-center p-6 animate-fadeIn relative w-full h-full flex flex-col items-center justify-center">
                    <CheckCircleIconFilled className="w-24 h-24 text-green-400 mb-6 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
                    <h1 className="text-4xl font-black text-white italic uppercase mb-2">É TODO TEU!</h1>
                    <p className="text-zinc-400 text-lg mb-8 max-w-xs mx-auto">Você resgatou <span className="text-white font-bold">{item.name}</span>.</p>
                    <GradientButton onClick={onClose} className="w-full max-w-xs !bg-green-500 !text-black !border-none">VOLTAR AO COFRE</GradientButton>
                </div>
            )}
        </div>
    );
};

interface RewardsScreenProps {
  onBack: () => void;
  points: number;
}

const RewardsScreen: React.FC<RewardsScreenProps> = ({ onBack, points }) => {
    const [selectedBrandId, setSelectedBrandId] = useState(BRANDS[0].id);
    const [redeemingItem, setRedeemingItem] = useState<RewardItem | null>(null);

    const selectedBrand = BRANDS.find(b => b.id === selectedBrandId)!;
    const brandItems = REWARD_ITEMS.filter(item => item.brandId === selectedBrandId);

    const handleRedeem = (item: RewardItem) => {
        if (points >= item.pointsCost) {
            setRedeemingItem(item);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] animate-fadeIn font-sans">
            {redeemingItem && <RedemptionOverlay item={redeemingItem} onClose={() => setRedeemingItem(null)} />}
            <Header title="RECOMPENSAS" onBack={onBack} />
            <div className="flex-grow pt-16 overflow-y-auto pb-4">
                <div className={`relative p-6 overflow-hidden bg-gradient-to-br ${selectedBrand.color}`}>
                    <div className="absolute right-[-20px] top-[-20px] w-64 h-64 bg-contain bg-no-repeat bg-center opacity-10 rotate-12 pointer-events-none" style={{ backgroundImage: `url(${selectedBrand.logo})` }} />
                    <div className="relative z-10 flex flex-col items-center text-center space-y-2 pt-4">
                        <div className="inline-block px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/20 mb-2">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">🎯 Meta de Estilo</span>
                        </div>
                        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                            {points.toLocaleString()}
                        </h1>
                        <p className="text-sm font-bold uppercase tracking-widest text-white/80">PUMP POINTS DISPONÍVEIS</p>
                    </div>
                </div>

                <div className="flex gap-4 p-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                    {BRANDS.map(brand => (
                        <button key={brand.id} onClick={() => setSelectedBrandId(brand.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${selectedBrandId === brand.id ? 'bg-[var(--text-primary)] text-[var(--bg-main)] border-[var(--text-primary)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>
                            <img src={brand.logo} className="w-5 h-5 rounded-full object-cover" alt="" />
                            <span className="text-xs font-bold uppercase">{brand.name}</span>
                        </button>
                    ))}
                </div>

                <div className="pl-6 py-4">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">Recompensas Bloqueadas</h3>
                    <div className="flex overflow-x-auto gap-6 pb-8 pr-6 [&::-webkit-scrollbar]:hidden">
                        {brandItems.map(item => {
                            const canAfford = points >= item.pointsCost;
                            return (
                                <div key={item.id} className="flex-shrink-0 w-72 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-4 flex flex-col">
                                    <div className="h-48 w-full flex items-center justify-center my-4 relative">
                                        <img src={item.image} alt={item.name} className={`w-full h-full object-contain drop-shadow-2xl ${!canAfford ? 'grayscale opacity-50' : ''}`} />
                                        {!canAfford && <div className="absolute inset-0 flex items-center justify-center"><LockIcon className="w-10 h-10 text-white/50" /></div>}
                                    </div>
                                    <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                                    <span className={`text-xl font-black mb-4 ${canAfford ? 'text-[var(--accent-primary)]' : 'text-zinc-500'}`}>{item.pointsCost.toLocaleString()} PTS</span>
                                    <button onClick={() => handleRedeem(item)} disabled={!canAfford} className={`w-full py-3 rounded-xl font-black uppercase text-sm ${canAfford ? 'bg-[var(--accent-primary)] text-black' : 'bg-[var(--bg-tertiary)] text-zinc-500 cursor-not-allowed'}`}>
                                        {canAfford ? 'Resgatar' : `Faltam ${(item.pointsCost - points).toLocaleString()} PTS`}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mx-4 p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)]">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">Nível: Novato</span>
                        <span className="text-xs font-bold text-zinc-400">PRATA</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-main)] rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-zinc-600 rounded-full" style={{ width: `${Math.min(100, (points / 1000) * 100)}%` }}></div>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)]">Publique seus looks para ganhar PUMP Points e desbloquear itens exclusivos.</p>
                </div>
            </div>
        </div>
    );
};

export default RewardsScreen;
