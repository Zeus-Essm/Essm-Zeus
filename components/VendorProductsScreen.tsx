import React, { useState, useRef } from 'react';
import Header from './Header';
import type { BusinessProfile, Product, Folder } from '../types';
import { PlusIcon, PencilIcon, EyeIcon, XCircleIcon, ShoppingBagIcon, CameraIcon } from './IconComponents';
import GradientButton from './GradientButton';
import { toast } from '../utils/toast';
import { removeImageBackground, generateProductImage } from '../services/geminiService';

const SparklesIconUI = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 15L17.5 17.625l-.75-2.625a2.25 2.25 0 00-1.545-1.545L12.583 12.688l2.625-.75a2.25 2.25 0 001.545-1.545l.75-2.625.75 2.625a2.25 2.25 0 001.545 1.545l2.625.75-2.625.75a2.25 2.25 0 00-1.545 1.545L18.25 15z" />
    </svg>
);

interface VendorProductsScreenProps {
    onBack: () => void;
    businessProfile: BusinessProfile;
    products: Product[];
    folders: Folder[];
    onCreateProduct: (folderId: string | null, data: { title: string, description: string, price: number, file: Blob | null }) => Promise<void>;
}

const VendorProductsScreen: React.FC<VendorProductsScreenProps> = ({ onBack, products, folders, onCreateProduct }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [file, setFile] = useState<Blob | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
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

    const handleStartCreating = () => {
        setIsCreating(true);
    };

    const handleRemoveBg = async () => {
        if (!preview) return;
        setIsProcessing(true);
        try {
            const result = await removeImageBackground(preview);
            setPreview(result);
            const res = await fetch(result);
            setFile(await res.blob());
        } catch (e) {
            toast("Erro ao remover fundo pela IA.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAiGenerate = async () => {
        if (!title) return toast("Digite o título para a IA gerar o produto.");
        setIsProcessing(true);
        try {
            const result = await generateProductImage(title, description);
            setPreview(result);
            const res = await fetch(result);
            setFile(await res.blob());
        } catch (e) {
            toast("Erro ao gerar imagem pela IA.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) {
          toast("O nome do produto é obrigatório.");
          return;
        }

        const priceValue = price ? parseFloat(price) : 0;
        
        await onCreateProduct(selectedFolderId, { 
          title, 
          description, 
          price: priceValue, 
          file: file || null 
        });

        toast.success("Produto criado e adicionado à coleção ✅");
        
        setTimeout(() => {
            document.querySelector('.grid')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);

        setIsCreating(false);
        setTitle('');
        setDescription('');
        setPrice('');
        setSelectedFolderId(null);
        setFile(null);
        setPreview(null);
    };

    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
            <Header title={isCreating ? "Novo Produto" : "Gerenciar Catálogo"} onBack={isCreating ? () => setIsCreating(false) : onBack} />
            <main className="flex-grow overflow-y-auto pt-16 p-4 space-y-4 animate-fadeIn pb-24">
                
                {!isCreating && (
                    <div className="flex gap-2">
                        <GradientButton onClick={handleStartCreating} className="flex-1 !py-3 !text-sm">
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
                        <div className="space-y-3">
                            <div 
                                onClick={() => !isProcessing && fileInputRef.current?.click()}
                                className="w-full h-64 border-2 border-dashed border-zinc-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer bg-zinc-50 overflow-hidden relative"
                            >
                                {isProcessing && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-2">
                                        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Sincronizando IA...</span>
                                    </div>
                                )}
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

                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    type="button"
                                    onClick={handleRemoveBg}
                                    disabled={!preview || isProcessing}
                                    className="flex items-center justify-center gap-2 py-3 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase disabled:opacity-50"
                                >
                                    <SparklesIconUI />
                                    Isolar Produto
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleAiGenerate}
                                    disabled={!title || isProcessing}
                                    className="flex items-center justify-center gap-2 py-3 border-2 border-amber-500 text-amber-600 rounded-xl text-[10px] font-black uppercase disabled:opacity-50"
                                >
                                    <SparklesIconUI />
                                    Criar pela IA
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 mb-1 block tracking-widest">Coleção Destino</label>
                                <select
                                    value={selectedFolderId || ''}
                                    onChange={e => setSelectedFolderId(e.target.value === '' ? null : e.target.value)}
                                    className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 focus:outline-none focus:border-amber-500 font-bold text-sm appearance-none"
                                >
                                    <option value="">Geral / Vitrine</option>
                                    {folders.map(f => (
                                        <option key={f.id} value={f.id}>{f.title}</option>
                                    ))}
                                </select>
                            </div>

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
                            />
                            <textarea
                                placeholder="Descrição"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 focus:outline-none focus:border-amber-500 font-bold text-sm h-32 resize-none"
                            />
                        </div>

                        <GradientButton type="submit" disabled={!title || isProcessing}>
                            Salvar no Banco de Dados
                        </GradientButton>
                    </form>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {products.map(product => (
                            <div key={product.id} className="bg-[var(--bg-secondary)] border border-[var(--border-secondary)] p-3 rounded-2xl flex items-center gap-4">
                                <div className="relative w-16 h-16 bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0">
                                    <img src={product.image_url || ''} alt={product.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-sm uppercase truncate max-w-[150px]">{product.title}</h3>
                                    <p className="text-xs font-black text-[var(--accent-primary)]">
                                        {product.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
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
                        <button onClick={handleStartCreating} className="text-[10px] font-black text-[var(--accent-primary)] uppercase underline tracking-widest">
                            Cadastrar meu primeiro produto
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default VendorProductsScreen;