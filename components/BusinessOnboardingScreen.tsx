
import React, { useState, useRef } from 'react';
import GradientButton from './GradientButton';
import { UploadIcon } from './IconComponents';
import type { BusinessProfile } from '../types';
import { toast } from '../utils/toast';

interface BusinessOnboardingScreenProps {
    onComplete: (details: Omit<BusinessProfile, 'id'>) => void;
}

const BusinessOnboardingScreen: React.FC<BusinessOnboardingScreenProps> = ({ onComplete }) => {
    const [businessName, setBusinessName] = useState('');
    const [businessCategory, setBusinessCategory] = useState('fashion');
    const [description, setDescription] = useState('');
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!businessName || !logoPreview) {
            toast('Por favor, preencha o nome da empresa e adicione um logo.');
            return;
        }
        onComplete({
            business_name: businessName,
            business_category: businessCategory,
            description: description,
            logo_url: logoPreview,
        });
    };

    return (
        <div className="flex flex-col h-full w-full bg-[var(--bg-main)] text-[var(--text-primary)] animate-fadeIn">
            <div className="p-6 text-center">
                 <h1 className="text-3xl font-bold mb-2 text-glow text-[var(--accent-primary)] opacity-90">Configure sua Loja</h1>
                 <p className="text-[var(--text-secondary)]">Adicione os detalhes da sua empresa para começar a vender.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
                <div>
                    <label htmlFor="logo-upload" className="w-full h-40 border-2 border-dashed border-[var(--accent-primary)]/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-black/20 hover:bg-[var(--accent-primary)]/10 hover:border-[var(--accent-primary)] transition-all">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Pré-visualização do logo" className="w-full h-full object-contain rounded-2xl p-2" />
                        ) : (
                            <div className="text-center text-zinc-500">
                                <UploadIcon className="w-12 h-12 mx-auto mb-2 text-[var(--accent-primary)]/70" />
                                <p className="font-semibold">Logo da Empresa</p>
                                <p className="text-sm">Clique para carregar</p>
                            </div>
                        )}
                    </label>
                    <input id="logo-upload" type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
                
                <input
                    type="text"
                    placeholder="Nome da Empresa"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full p-4 bg-[var(--bg-secondary)] rounded-lg border-2 border-[var(--border-primary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
                    required
                />
                
                <select 
                    value={businessCategory} 
                    onChange={e => setBusinessCategory(e.target.value)}
                    className="w-full p-4 bg-[var(--bg-secondary)] rounded-lg border-2 border-[var(--border-primary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
                >
                    <option value="fashion">Moda</option>
                    <option value="restaurant">Restaurante</option>
                    <option value="supermarket">Supermercado</option>
                    <option value="beauty">Beleza</option>
                    <option value="technology">Tecnologia</option>
                    <option value="decoration">Decoração</option>
                </select>

                <textarea
                    placeholder="Descrição curta da sua empresa..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full p-4 bg-[var(--bg-secondary)] rounded-lg border-2 border-[var(--border-primary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors resize-none"
                />

                <div className="pt-2">
                    <GradientButton type="submit">
                        Concluir e Abrir Painel
                    </GradientButton>
                </div>
            </form>
        </div>
    );
};

export default BusinessOnboardingScreen;
