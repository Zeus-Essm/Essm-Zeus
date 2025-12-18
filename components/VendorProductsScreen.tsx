
import React, { useState } from 'react';
import Header from './Header';
import type { Item, BusinessProfile } from '../types';
import { PlusIcon, PencilIcon, EyeIcon, XCircleIcon, ShoppingBagIcon } from './IconComponents';
import GradientButton from './GradientButton';

interface VendorProductsScreenProps {
    onBack: () => void;
    businessProfile: BusinessProfile;
}

const VendorProductsScreen: React.FC<VendorProductsScreenProps> = ({ onBack, businessProfile }) => {
    // Inicializado vazio para o vendedor real
    const [products, setProducts] = useState<Item[]>([]);

    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
            <Header title="Gerenciar Produtos" onBack={onBack} />
            <main className="flex-grow overflow-y-auto pt-16 p-4 space-y-4 animate-fadeIn pb-24">
                
                <div className="flex gap-2">
                    <GradientButton className="flex-1 !py-3 !text-sm">
                        <div className="flex items-center justify-center gap-2">
                            <PlusIcon className="w-5 h-5" />
                            Cadastrar Produto
                        </div>
                    </GradientButton>
                    <button className="px-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-primary)] text-[var(--accent-primary)]">
                        <EyeIcon className="w-5 h-5" />
                    </button>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {products.map(item => (
                            <div key={item.id} className="bg-[var(--bg-secondary)] border border-[var(--border-secondary)] p-3 rounded-2xl flex items-center gap-4">
                                <div className="relative w-16 h-16 bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-sm uppercase">{item.name}</h3>
                                    <p className="text-xs font-black text-[var(--accent-primary)]">
                                        {item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <button className="p-2 bg-[var(--bg-tertiary)] rounded-lg">
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 bg-[var(--bg-tertiary)] text-red-400 rounded-lg">
                                        <XCircleIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-slideUp">
                        <div className="w-20 h-20 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center border-2 border-dashed border-[var(--border-primary)]">
                            <ShoppingBagIcon className="w-10 h-10 text-zinc-500" />
                        </div>
                        <div>
                            <h3 className="font-black uppercase text-sm">Nenhum produto ainda</h3>
                            <p className="text-xs text-zinc-500 max-w-[200px] mx-auto mt-1">Comece a carregar seu catálogo para aparecer na vitrine global.</p>
                        </div>
                        <button className="text-[10px] font-black text-[var(--accent-primary)] uppercase underline tracking-widest">
                            Como cadastrar?
                        </button>
                    </div>
                )}
            </main>
            {/* Update Confirmation Seal */}
            <div className="fixed bottom-24 right-4 bg-amber-500 text-black text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg z-50 animate-pulse">
                INVENTÁRIO ZERADO
            </div>
        </div>
    );
};

export default VendorProductsScreen;
