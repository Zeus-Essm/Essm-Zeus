import React from 'react';
import Header from './Header';
import type { Item, BusinessProfile } from '../types';
import { PlusIcon } from './IconComponents';
import GradientButton from './GradientButton';
import { INITIAL_VENDOR_ITEMS } from '../constants';

interface VendorProductsScreenProps {
    onBack: () => void;
    businessProfile: BusinessProfile;
}

const VendorProductsScreen: React.FC<VendorProductsScreenProps> = ({ onBack, businessProfile }) => {
    // In a real app, you would fetch items where item.vendorId === businessProfile.id
    const items = INITIAL_VENDOR_ITEMS;

    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
            <Header title="Meus Produtos" onBack={onBack} />
            <main className="flex-grow overflow-y-auto pt-16 p-4 space-y-3 animate-fadeIn">
                <GradientButton className="!py-3">
                    <div className="flex items-center justify-center gap-2">
                        <PlusIcon className="w-5 h-5" />
                        Adicionar Novo Produto
                    </div>
                </GradientButton>
                {items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--border-secondary)] p-3 rounded-lg">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md"/>
                        <div className="flex-grow">
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-[var(--accent-primary)]">
                                {item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                            </p>
                        </div>
                        <button className="text-xs font-bold py-1.5 px-4 rounded-full bg-[var(--bg-tertiary)] hover:brightness-95 transition-colors">
                            Editar
                        </button>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default VendorProductsScreen;