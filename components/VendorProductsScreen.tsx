import React, { useState, useRef, useEffect } from 'react';
import type { BusinessProfile, Product, Folder } from '../types';
import { ArrowLeftIcon, PlusIcon, TrashIcon, CameraIcon, ChevronDownIcon } from './IconComponents';

interface VendorProductsScreenProps {
  onBack: () => void;
  businessProfile: BusinessProfile;
  products: Product[];
  folders: Folder[];
  onCreateProduct: (folderId: string | null, details: any) => Promise<any>;
  onDeleteProduct: (id: string) => void;
  initialFolderId?: string | null;
}

const VendorProductsScreen: React.FC<VendorProductsScreenProps> = ({
  onBack, products, folders, onCreateProduct, onDeleteProduct, initialFolderId = null
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(initialFolderId);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemFile, setNewItemFile] = useState<Blob | null>(null);
  const [newItemPreview, setNewItemPreview] = useState<string | null>(null);
  const itemFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFolderId) {
      setSelectedFolderId(initialFolderId);
    } else if (folders.length > 0 && !selectedFolderId) {
      setSelectedFolderId(folders[0].id);
    }
  }, [initialFolderId, folders, selectedFolderId]);

  const filteredProducts = (selectedFolderId 
    ? products.filter(p => p.folder_id === selectedFolderId)
    : products).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
       setNewItemFile(file);
       const reader = new FileReader();
       reader.onloadend = () => setNewItemPreview(reader.result as string);
       reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = async () => {
     if (!newItemTitle || !newItemFile || isSaving) return;
     setIsSaving(true);
     try {
         const result = await onCreateProduct(selectedFolderId, {
            title: newItemTitle,
            description: newItemDesc,
            price: parseFloat(newItemPrice) || 0,
            file: newItemFile
         });
         
         if (result) {
            setIsAddingItem(false);
            setNewItemTitle(''); 
            setNewItemPrice(''); 
            setNewItemDesc(''); 
            setNewItemFile(null); 
            setNewItemPreview(null);
         }
     } catch (err) {
         console.error("Erro ao salvar item no dashboard:", err);
     } finally {
         setIsSaving(false);
     }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col animate-fadeIn font-sans relative">
       <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-zinc-50 shrink-0">
          <button onClick={onBack} className="p-2 bg-zinc-50 rounded-xl text-zinc-500 active:scale-90 transition-transform">
            <ArrowLeftIcon className="w-5 h-5"/>
          </button>
          <h1 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900 italic">Gerir Catálogo</h1>
          <div className="w-9"></div> 
       </div>

       <div className="flex gap-2 px-4 py-4 overflow-x-auto scrollbar-hide shrink-0">
          {folders.map(f => (
             <button 
                key={f.id}
                onClick={() => setSelectedFolderId(f.id)}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedFolderId === f.id ? 'bg-zinc-900 text-white shadow-md' : 'bg-zinc-50 text-zinc-400'}`}
             >
                {f.title}
             </button>
          ))}
       </div>

       <div className="flex-grow overflow-y-auto px-4 pb-32 grid grid-cols-2 gap-4">
          {filteredProducts.map(product => (
             <div key={product.id} className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-sm border border-zinc-100 group animate-fadeIn bg-zinc-50">
                <img src={product.image_url || 'https://i.postimg.cc/LXmdq4H2/D.jpg'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                
                <button 
                   onClick={() => onDeleteProduct(product.id)}
                   className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 active:scale-90 transition-all z-10"
                >
                   <TrashIcon className="w-4 h-4" />
                </button>

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-5">
                   <p className="text-white font-black text-[12px] truncate uppercase italic tracking-tighter">{product.title}</p>
                   <p className="text-amber-400 font-black text-[11px] mt-0.5 tracking-tight">{(product.price || 0).toLocaleString('pt-AO', {style: 'currency', currency: 'AOA'})}</p>
                </div>
             </div>
          ))}

          <button 
            onClick={() => setIsAddingItem(true)} 
            className="aspect-[3/4] border-2 border-dashed border-zinc-100 rounded-[2rem] flex flex-col items-center justify-center gap-3 bg-zinc-50/30 text-zinc-300 hover:bg-zinc-50 transition-all group active:scale-95"
          >
             <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-zinc-300 group-hover:text-amber-500 transition-colors">
                <PlusIcon className="w-6 h-6" strokeWidth={3} />
             </div>
             <span className="text-[9px] font-black uppercase tracking-[0.2em]">Novo Item</span>
          </button>
       </div>

       {isAddingItem && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-end animate-fadeIn" onClick={() => !isSaving && setIsAddingItem(false)}>
             <div 
                className="w-full h-[92vh] bg-white rounded-t-[3.5rem] flex flex-col shadow-2xl overflow-hidden" 
                onClick={e => e.stopPropagation()}
             >
                <div className="flex justify-between items-center px-8 pt-8 pb-4 shrink-0">
                   <h2 className="text-2xl font-black uppercase italic text-zinc-900 tracking-tighter">NOVO ITEM</h2>
                   <button onClick={() => !isSaving && setIsAddingItem(false)} className="p-3 bg-zinc-50 rounded-2xl text-zinc-400 hover:text-zinc-900 active:scale-90 transition-all">
                      <ChevronDownIcon className="w-6 h-6" />
                   </button>
                </div>

                <div className="flex-grow overflow-y-auto px-8 pb-24 space-y-6 scrollbar-hide">
                    <div 
                      onClick={() => !isSaving && itemFileInputRef.current?.click()} 
                      className="w-full aspect-[3/4] max-w-[280px] mx-auto bg-zinc-50 border-2 border-dashed border-zinc-100 rounded-[2.5rem] flex flex-col items-center justify-center relative overflow-hidden transition-all hover:bg-zinc-100/50 cursor-pointer shadow-inner group"
                    >
                       {newItemPreview ? (
                          <img src={newItemPreview} className="w-full h-full object-cover animate-imageAppear" />
                       ) : (
                          <div className="flex flex-col items-center gap-3">
                             <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-zinc-300 group-hover:text-amber-500 transition-colors">
                                <CameraIcon className="w-8 h-8" />
                             </div>
                             <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Adicionar Foto</span>
                          </div>
                       )}
                       <input type="file" ref={itemFileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                    </div>
                    
                    <div className="space-y-5">
                       <div>
                          <label className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] ml-4 mb-1 block">Nome do Produto</label>
                          <input 
                            type="text" 
                            disabled={isSaving}
                            placeholder="Ex: T-shirt Oversized Black" 
                            value={newItemTitle} 
                            onChange={e => setNewItemTitle(e.target.value)} 
                            className="w-full p-5 bg-zinc-50 rounded-2xl font-bold text-sm text-zinc-900 focus:bg-white focus:ring-4 ring-amber-500/10 transition-all border border-transparent focus:border-amber-500/20 outline-none" 
                          />
                       </div>

                       <div>
                          <label className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] ml-4 mb-1 block">Preço de Venda (AOA)</label>
                          <input 
                            type="number" 
                            disabled={isSaving}
                            placeholder="0.00" 
                            value={newItemPrice} 
                            onChange={e => setNewItemPrice(e.target.value)} 
                            className="w-full p-5 bg-zinc-50 rounded-2xl font-bold text-sm text-zinc-900 focus:bg-white focus:ring-4 ring-amber-500/10 transition-all border border-transparent focus:border-amber-500/20 outline-none" 
                          />
                       </div>

                       <div>
                          <label className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] ml-4 mb-1 block">Descrição Adicional</label>
                          <textarea 
                            placeholder="Fale sobre o material, tamanho..." 
                            disabled={isSaving}
                            value={newItemDesc} 
                            onChange={e => setNewItemDesc(e.target.value)} 
                            className="w-full p-5 bg-zinc-50 rounded-2xl font-bold text-sm text-zinc-900 focus:bg-white focus:ring-4 ring-amber-500/10 transition-all border border-transparent focus:border-amber-500/20 outline-none h-32 resize-none shadow-inner" 
                          />
                       </div>
                    </div>

                    <div className="pt-4 pb-8">
                      <button 
                        onClick={handleSaveItem} 
                        disabled={!newItemTitle || !newItemFile || isSaving} 
                        className="w-full py-6 bg-amber-500 text-white font-black uppercase text-[12px] tracking-[0.2em] rounded-[1.8rem] shadow-[0_15px_30px_rgba(245,158,11,0.25)] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                      >
                        <span>{isSaving ? 'A ENVIAR...' : 'CONCLUIR E CRIAR'}</span>
                        {!isSaving && <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90" strokeWidth={3} />}
                      </button>
                    </div>
                </div>
             </div>
          </div>
       )}

       <style>{`
          @keyframes imageAppear {
            from { opacity: 0; transform: scale(1.05); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-imageAppear {
            animation: imageAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
       `}</style>
    </div>
  );
};

export default VendorProductsScreen;