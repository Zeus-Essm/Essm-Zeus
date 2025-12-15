
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import { GiftIcon, LockIcon, TruckIcon, StarIcon, CheckCircleIconFilled } from './IconComponents';
import GradientButton from './GradientButton';
import type { Item } from '../types';

// --- MOCK DATA ---
const USER_POINTS = 5000;

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

    // NEW FEELING (Fatos Exclusivos)
    { id: 'nf-r1', name: 'Fato Executivo Navy', description: 'Elegância absoluta para o escritório.', category: 'suit', image: 'https://i.postimg.cc/TwNdQgN6/Gemini_Generated_Image_1tdh7l1tdh7l1tdh.png', price: 0, pointsCost: 4000, brandId: 'new_feeling' },
    { id: 'nf-r2', name: 'Fato Slim Grey', description: 'Corte moderno e tecido premium.', category: 'suit', image: 'https://i.postimg.cc/s2XDWTKD/Gemini_Generated_Image_6o1rfi6o1rfi6o1r.png', price: 0, pointsCost: 12500, brandId: 'new_feeling' },
    { id: 'nf-r3', name: 'Fato Premium Black', description: 'O clássico indispensável.', category: 'suit', image: 'https://i.postimg.cc/T2ZL6v00/Gemini_Generated_Image_atk1gxatk1gxatk1.png', price: 0, pointsCost: 13000, brandId: 'new_feeling' },
    { id: 'nf-r4', name: 'Fato Modern Fit', description: 'Conforto e estilo em sintonia.', category: 'suit', image: 'https://i.postimg.cc/8C5PvZwz/Gemini_Generated_Image_c9tbmfc9tbmfc9tb.png', price: 0, pointsCost: 11500, brandId: 'new_feeling' },
    { id: 'nf-r5', name: 'Fato Clássico Beige', description: 'Sofisticação para eventos diurnos.', category: 'suit', image: 'https://i.postimg.cc/mDpLVCXj/Gemini_Generated_Image_doczjodoczjodocz.png', price: 0, pointsCost: 12000, brandId: 'new_feeling' },
    { id: 'nf-r6', name: 'Fato Charcoal Elite', description: 'Acabamento de luxo.', category: 'suit', image: 'https://i.postimg.cc/fRWw4H4N/Gemini_Generated_Image_eklfymeklfymeklf.png', price: 0, pointsCost: 13500, brandId: 'new_feeling' },

    // LOUIS VUITTON (Novos Itens Exclusivos)
    { id: 'lv-ex-1', name: 'LV Skate Marine', description: 'Design robusto com detalhes em malha técnica.', category: 'shoes', image: 'https://i.postimg.cc/VvTx5mX1/louis-vuitton-sneaker-lv-skate-BO9-U3-PMI31-PM2-Front-view.webp', price: 0, pointsCost: 4500, brandId: 'lv' },
    { id: 'lv-ex-2', name: 'LV Skate Beige', description: 'Estilo vintage dos anos 90 reinventado.', category: 'shoes', image: 'https://i.postimg.cc/66mJMLgS/louis-vuitton-tenis-lv-skate-BP9-U2-PMI92-PM2-Front-view.webp', price: 0, pointsCost: 18000, brandId: 'lv' },
    { id: 'lv-ex-3', name: 'LV Skate Grey', description: 'Monocromático com conforto supremo.', category: 'shoes', image: 'https://i.postimg.cc/xTNrhNSd/louis-vuitton-tenis-lv-skate-BR9-U1-PMI20-PM2-Front-view.webp', price: 0, pointsCost: 18500, brandId: 'lv' },
    { id: 'lv-ex-4', name: 'LV Trainer Blue', description: 'Silhueta icônica de basquete.', category: 'shoes', image: 'https://i.postimg.cc/hjCWW9jX/louis-vuitton-tenis-lv-trainer-BSUPN8-GC52-PM2-Front-view.webp', price: 0, pointsCost: 22000, brandId: 'lv' },
    { id: 'lv-ex-5', name: 'LV Trainer White', description: 'Couro premium com detalhes perfurados.', category: 'shoes', image: 'https://i.postimg.cc/KjRXZRkJ/louis-vuitton-tenis-lv-trainer-BTU017-MI01-PM2-Front-view.webp', price: 0, pointsCost: 25000, brandId: 'lv' },

    // OUTROS
    { id: 'r3', name: 'Kit Maquiagem Pro', description: 'Paleta completa para profissionais.', category: 'beauty', image: 'https://i.postimg.cc/YS6p2Fsd/Gemini_Generated_Image_fz7zo1fz7zo1fz7z.png', price: 0, pointsCost: 2500, brandId: 'beleza' },
];

const BRANDS = [
    { id: 'adidas', name: 'Adidas', logo: 'https://i.postimg.cc/LXmdq4H2/D.jpg', color: 'from-blue-600 to-blue-900' },
    { id: 'new_feeling', name: 'New Feeling', logo: 'https://i.postimg.cc/pTbvCjjp/NEW-FEELING.png', color: 'from-purple-600 to-purple-900' },
    { id: 'lv', name: 'Louis Vuitton', logo: 'https://i.postimg.cc/xCknv8vV/pexels-rdne-6224633.jpg', color: 'from-amber-600 to-amber-900' },
];

// --- ANIMATION COMPONENTS ---

const RedemptionOverlay: React.FC<{ item: RewardItem; onClose: () => void }> = ({ item, onClose }) => {
    const [stage, setStage] = useState<'warp' | 'box' | 'success'>('warp');

    useEffect(() => {
        // Timeline da animação
        const timer1 = setTimeout(() => setStage('box'), 2000); // 2s de Warp
        const timer2 = setTimeout(() => setStage('success'), 4500); // 2.5s de caixa fechando/explodindo

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
            {/* STAGE 1: WARP SPEED */}
            {stage === 'warp' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="warp-tunnel absolute inset-0"></div>
                    <img 
                        src={item.image} 
                        alt={item.name} 
                        className="relative z-10 w-64 h-64 object-contain animate-zoomIn"
                    />
                    <h2 className="absolute bottom-20 text-white text-2xl font-black uppercase tracking-widest animate-pulse">
                        Acessando Cofre...
                    </h2>
                </div>
            )}

            {/* STAGE 2: THE BOX */}
            {stage === 'box' && (
                <div className="flex flex-col items-center animate-bounceIn">
                    <div className="relative w-64 h-64">
                        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-black border-2 border-[var(--accent-primary)] rounded-lg flex items-center justify-center shadow-[0_0_50px_var(--accent-primary)]">
                            <img src="https://i.postimg.cc/XJf6gckX/Pump_STARTAP.png" alt="PUMP" className="w-20 opacity-50" />
                        </div>
                        <img 
                            src={item.image} 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 object-contain animate-shrinkIntoBox" 
                        />
                        <div className="absolute inset-0 border-4 border-white/20 rounded-lg animate-pulse"></div>
                    </div>
                    <p className="text-green-400 font-mono mt-8 text-xl">EMBALANDO RECOMPENSA...</p>
                </div>
            )}

            {/* STAGE 3: SUCCESS */}
            {stage === 'success' && (
                <div className="text-center p-6 animate-fadeIn relative w-full h-full flex flex-col items-center justify-center">
                    {/* Confetti CSS effect would go here, using simple particles for now */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="confetti-particle" style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random()}s`,
                                backgroundColor: ['#FBBF24', '#10B981', '#8B5CF6'][Math.floor(Math.random() * 3)]
                            }} />
                        ))}
                    </div>

                    <CheckCircleIconFilled className="w-24 h-24 text-green-400 mb-6 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
                    <h1 className="text-4xl font-black text-white italic uppercase mb-2">É TODO TEU!</h1>
                    <p className="text-zinc-400 text-lg mb-8 max-w-xs mx-auto">
                        Você resgatou <span className="text-white font-bold">{item.name}</span>.
                    </p>
                    <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl mb-8 w-full max-w-xs">
                        <div className="flex items-center gap-3 mb-2">
                            <TruckIcon className="w-5 h-5 text-[var(--accent-primary)]" />
                            <span className="text-sm font-bold text-white">Envio Expresso PUMP</span>
                        </div>
                        <p className="text-xs text-zinc-500 text-left">
                            Enviaremos o código de rastreio para o seu chat em breve. O frete é por nossa conta.
                        </p>
                    </div>
                    <GradientButton onClick={onClose} className="w-full max-w-xs !bg-green-500 !text-black !border-none hover:!bg-green-400">
                        VOLTAR AO COFRE
                    </GradientButton>
                </div>
            )}

            <style>{`
                .warp-tunnel {
                    background: radial-gradient(circle, transparent 0%, transparent 20%, #4c1d95 100%);
                    animation: warpSpeed 0.2s infinite linear;
                    opacity: 0.5;
                }
                @keyframes warpSpeed {
                    0% { transform: scale(1); opacity: 0.1; }
                    50% { opacity: 0.8; }
                    100% { transform: scale(3); opacity: 0; }
                }
                @keyframes zoomIn {
                    0% { transform: scale(0); }
                    100% { transform: scale(1); }
                }
                @keyframes shrinkIntoBox {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                }
                @keyframes bounceIn {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); opacity: 1; }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); }
                }
                .confetti-particle {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    animation: confettiFall 3s linear infinite;
                }
                @keyframes confettiFall {
                    0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

// --- MAIN COMPONENT ---

interface RewardsScreenProps {
  onBack: () => void;
}

const RewardsScreen: React.FC<RewardsScreenProps> = ({ onBack }) => {
    const [selectedBrandId, setSelectedBrandId] = useState(BRANDS[0].id);
    const [redeemingItem, setRedeemingItem] = useState<RewardItem | null>(null);
    const [userPoints, setUserPoints] = useState(USER_POINTS);

    const selectedBrand = BRANDS.find(b => b.id === selectedBrandId)!;
    
    // Filter items exactly for the selected brand
    const brandItems = REWARD_ITEMS.filter(item => item.brandId === selectedBrandId);

    const handleRedeem = (item: RewardItem) => {
        if (userPoints >= item.pointsCost) {
            setUserPoints(prev => prev - item.pointsCost);
            setRedeemingItem(item);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] animate-fadeIn font-sans">
            {redeemingItem && (
                <RedemptionOverlay 
                    item={redeemingItem} 
                    onClose={() => setRedeemingItem(null)} 
                />
            )}

            <Header title="RECOMPENSAS" onBack={onBack} />

            <div className="flex-grow pt-16 overflow-y-auto pb-4">
                {/* --- HEADER: STATUS & BALANCE --- */}
                <div className={`relative p-6 overflow-hidden bg-gradient-to-br ${selectedBrand.color}`}>
                    {/* Brand Watermark */}
                    <div 
                        className="absolute right-[-20px] top-[-20px] w-64 h-64 bg-contain bg-no-repeat bg-center opacity-10 rotate-12 pointer-events-none"
                        style={{ backgroundImage: `url(${selectedBrand.logo})` }}
                    />
                    
                    <div className="relative z-10 flex flex-col items-center text-center space-y-2 pt-4">
                        <div className="inline-block px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/20 mb-2">
                            <span className="text-xs font-bold text-green-400 animate-pulse uppercase tracking-widest">
                                🎯 Meta Destruída!
                            </span>
                        </div>
                        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                            {userPoints.toLocaleString()}
                        </h1>
                        <p className="text-sm font-bold uppercase tracking-widest text-white/80">
                            PUMP POINTS DISPONÍVEIS
                        </p>
                    </div>
                </div>

                {/* --- BRAND SELECTOR --- */}
                <div className="flex gap-4 p-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                    {BRANDS.map(brand => (
                        <button
                            key={brand.id}
                            onClick={() => setSelectedBrandId(brand.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                                selectedBrandId === brand.id 
                                ? 'bg-[var(--text-primary)] text-[var(--bg-main)] border-[var(--text-primary)] shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--text-secondary)]'
                            }`}
                        >
                            <img src={brand.logo} className="w-5 h-5 rounded-full object-cover" alt="" />
                            <span className="text-xs font-bold uppercase">{brand.name}</span>
                        </button>
                    ))}
                </div>

                {/* --- THE VAULT BODY (CAROUSEL) --- */}
                <div className="pl-6 py-4">
                    <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)] flex items-center gap-2">
                        <LockIcon className="w-5 h-5 text-[var(--accent-primary)]" />
                        Recompensas Exclusivas
                    </h3>
                    
                    <div className="flex overflow-x-auto gap-6 pb-8 pr-6 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden">
                        {brandItems.map(item => {
                            const canAfford = userPoints >= item.pointsCost;
                            return (
                                <div 
                                    key={item.id} 
                                    className="snap-center flex-shrink-0 w-72 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-4 flex flex-col relative group"
                                >
                                    {/* Brand Tag */}
                                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase text-white/80">
                                        {selectedBrand.name}
                                    </div>

                                    {/* Floating Image */}
                                    <div className="h-48 w-full flex items-center justify-center my-4 relative">
                                        <div className="absolute inset-0 bg-[var(--accent-primary)]/5 rounded-full blur-2xl transform scale-75 group-hover:scale-100 transition-transform duration-500"></div>
                                        <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            className="w-full h-full object-contain drop-shadow-2xl transform group-hover:-translate-y-2 transition-transform duration-300 z-10"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow flex flex-col justify-end">
                                        <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight mb-1">{item.name}</h3>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`text-xl font-black ${canAfford ? 'text-[var(--accent-primary)] text-glow' : 'text-[var(--text-secondary)]'}`}>
                                                {item.pointsCost.toLocaleString()} PTS
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleRedeem(item)}
                                            disabled={!canAfford}
                                            className={`w-full py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all duration-300 ${
                                                canAfford 
                                                ? 'bg-[var(--accent-primary)] text-black shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] transform hover:scale-[1.02]' 
                                                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] cursor-not-allowed border border-[var(--border-primary)]'
                                            }`}
                                        >
                                            {canAfford ? 'Resgatar Agora' : `Faltam ${(item.pointsCost - userPoints).toLocaleString()} Pts`}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Placeholder for "More coming soon" */}
                        <div className="snap-center flex-shrink-0 w-40 flex flex-col items-center justify-center bg-[var(--bg-secondary)]/30 border-2 border-dashed border-[var(--border-primary)] rounded-3xl p-4 text-[var(--text-secondary)]">
                            <LockIcon className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-xs font-bold text-center">Novos drops em breve</span>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER: URGENCY & STATUS --- */}
                <div className="mx-4 p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)]">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">Nível de Afinidade: {selectedBrand.name}</span>
                        <span className="text-xs font-bold text-[var(--accent-primary)]">DIAMANTE</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-main)] rounded-full overflow-hidden mb-3">
                        <div className="h-full w-[92%] bg-gradient-to-r from-[var(--accent-primary)] to-orange-500 rounded-full shadow-[0_0_10px_var(--accent-primary)]"></div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
                        <TruckIcon className="w-4 h-4 text-green-500" />
                        <p>Resgate agora e receba em casa. <span className="text-green-400 font-bold">O frete é por nossa conta.</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RewardsScreen;
