
import React, { useState, useRef } from 'react';
import Header from './Header';
import type { Item, BusinessProfile } from '../types';
import { PlusIcon, PencilIcon, EyeIcon, XCircleIcon, ShoppingBagIcon, CameraIcon } from './IconComponents';
import GradientButton from './GradientButton';

interface VendorProductsScreenProps {
    onBack: () => void;
    businessProfile: BusinessProfile;
    products: Item[];
    onCreateProduct: (data: { title: string, description: string, price: number, file: Blob }) => Promise<void>;
}

const VendorProductsScreen: React.FC<VendorProductsScreenProps> = ({ onBack, products, onCreateProduct }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [file, setFile] = useState<Blob | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(selected);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !price || !file) return;
        await onCreateProduct({ title, description, price: parseFloat(price), file });
        setIsCreating(false);
        setTitle('');
        setDescription('');
        setPrice('');
        setFile(null);
        setPreview(null);
    };

    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
            <Header title={isCreating ? "Novo Produto" : "Gerenciar Catálogo"} onBack={isCreating ? () => setIsCreating(false) : onBack} />
            <main className="flex-grow overflow-y-auto pt-16 p-4 space-y-4 animate-fadeIn pb-24">
                
                {!isCreating && (
                    <div className="flex gap-2">
                        <GradientButton onClick={() => setIsCreating(true)} className="flex-1 !py-3 !text-sm">
                            <div className="flex items-center justify-center gap-2">
                                <PlusIcon className="w-5 h-5" />
                                Cadastrar Produto
                            </div>
                        </GradientButton>
                        <button className="px-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-primary)] text-[var(--accent-primary)]">
                            <EyeIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {isCreating ? (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-slideUp">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-64 border-2 border-dashed border-zinc-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer bg-zinc-50 overflow-hidden"
                        >
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <CameraIcon className="w-10 h-10 text-zinc-300 mb-2" />
                                    <span className="text-[10px] font-black uppercase text-zinc-400">Foto do Produto</span>
                                </>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Título do Produto"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 focus:outline-none focus:border-amber-500 font-bold text-sm"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Preço (AOA)"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 focus:outline-none focus:border-amber-500 font-bold text-sm"
                                required
                            />
                            <textarea
                                placeholder="Descrição"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 focus:outline-none focus:border-amber-500 font-bold text-sm h-32 resize-none"
                            />
                        </div>

                        <GradientButton type="submit" disabled={!title || !price || !file}>
                            Salvar no Banco de Dados
                        </GradientButton>
                    </form>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {products.map(item => (
                            <div key={item.id} className="bg-[var(--bg-secondary)] border border-[var(--border-secondary)] p-3 rounded-2xl flex items-center gap-4">
                                <div className="relative w-16 h-16 bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-sm uppercase truncate max-w-[150px]">{item.name}</h3>
                                    <p className="text-xs font-black text-[var(--accent-primary)]">
                                        {item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <button className="p-2 bg-[var(--bg-tertiary)] rounded-lg hover:bg-zinc-200 transition-colors">
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 bg-[var(--bg-tertiary)] text-red-400 rounded-lg hover:bg-red-50 transition-colors">
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
                            <h3 className="font-black uppercase text-sm">Catálogo Vazio</h3>
                            <p className="text-xs text-zinc-500 max-w-[200px] mx-auto mt-1">O seu estoque está vazio. Adicione produtos para começar a vender.</p>
                        </div>
                        <button onClick={() => setIsCreating(true)} className="text-[10px] font-black text-[var(--accent-primary)] uppercase underline tracking-widest">
                            Cadastrar meu primeiro produto
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default VendorProductsScreen;
