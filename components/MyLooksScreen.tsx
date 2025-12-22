
import React from 'react';
import Header from './Header';
import { BookmarkIcon, ShareIcon, ShoppingBagIcon, UploadIcon } from './IconComponents';
import type { SavedLook, Item } from '../types';
import { toast } from '../utils/toast';

interface MyLooksScreenProps {
  looks: SavedLook[];
  onBack: () => void;
  onItemClick: (item: Item) => void;
  onBuyLook: (items: Item[]) => void;
  onPostLook: (look: SavedLook) => void;
}

const MyLooksScreen: React.FC<MyLooksScreenProps> = ({ looks, onBack, onItemClick, onBuyLook, onPostLook }) => {
  const handleShare = async (look: SavedLook) => {
    const text = `Confira meu novo look criado com o app PUMP! Itens: ${look.items.map(i => i.name).join(', ')}.`;

    if (navigator.share) {
      try {
        const response = await fetch(look.image);
        const blob = await response.blob();
        const file = new File([blob], 'meu-estilo-look.png', { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Meu Look PUMP',
            text: text,
            files: [file],
          });
        } else {
          await navigator.share({
            title: 'Meu Look PUMP',
            text: text,
            url: window.location.href,
          });
        }
      } catch (error) {
        console.error('Error sharing look:', error);
        toast('Ocorreu um erro ao tentar compartilhar.');
      }
    } else {
      toast('Seu navegador não suporta a função de compartilhamento. Tente salvar a imagem e compartilhar manualmente.');
    }
  };


  return (
    <div className="w-full h-full flex flex-col text-[var(--text-primary)] animate-fadeIn bg-[var(--bg-main)]">
      <Header title="Itens Salvos" onBack={onBack} />
      <div className="flex-grow pt-16 overflow-y-auto">
        {looks.length > 0 ? (
          <div className="space-y-4 p-2">
            {looks.map(look => (
              <div key={look.id} className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg overflow-hidden flex flex-col">
                <div className="w-full bg-black">
                    <img src={look.image} alt="Look salvo" className="w-full h-auto" />
                </div>

                <div className="p-4 text-sm">
                    <h3 className="font-bold mb-2 text-[var(--accent-primary)] opacity-90">Itens neste look:</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {look.items.map(item => (
                             <li key={item.id}>
                                <button
                                    onClick={() => onItemClick(item)}
                                    className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:underline text-left"
                                >
                                    {item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-3 flex gap-2 border-t border-[var(--border-primary)] bg-black/50">
                    <button
                        onClick={() => onBuyLook(look.items)}
                        className="flex-1 flex items-center justify-center text-[var(--accent-primary-text)] font-bold py-2.5 px-4 rounded-lg bg-[var(--accent-primary)] hover:brightness-125 transition-colors"
                    >
                        <ShoppingBagIcon className="w-5 h-5 mr-2" />
                        Comprar
                    </button>
                    <button
                        onClick={() => onPostLook(look)}
                        className="flex-1 flex items-center justify-center text-[var(--text-primary)] font-bold py-2.5 px-4 rounded-lg bg-[var(--bg-tertiary)] hover:brightness-95 transition-colors"
                    >
                        <UploadIcon className="w-5 h-5 mr-2" />
                        Postar
                    </button>
                    <button
                        onClick={() => handleShare(look)}
                        className="flex-1 flex items-center justify-center text-[var(--text-primary)] font-bold py-2.5 px-4 rounded-lg bg-[var(--bg-tertiary)] hover:brightness-95 transition-colors"
                    >
                        <ShareIcon className="w-5 h-5 mr-2" />
                        Compartilhar
                    </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-grow h-full flex flex-col items-center justify-center text-center p-8">
            <BookmarkIcon className="w-24 h-24 text-[var(--accent-primary)]/70 mb-6" />
            <h2 className="text-2xl font-bold">Nenhum Item Salvo</h2>
            <p className="text-[var(--text-secondary)] mt-2">
              Itens que você salva aparecem aqui para você rever e comprar quando quiser.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLooksScreen;
