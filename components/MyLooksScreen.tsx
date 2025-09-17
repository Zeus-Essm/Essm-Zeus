import React from 'react';
import Header from './Header';
import { LooksIcon, ShareIcon, ShoppingBagIcon } from './IconComponents';
import type { SavedLook, Item } from '../types';

interface MyLooksScreenProps {
  looks: SavedLook[];
  onBack: () => void;
  onItemClick: (item: Item) => void;
  onBuyLook: (items: Item[]) => void;
}

const MyLooksScreen: React.FC<MyLooksScreenProps> = ({ looks, onBack, onItemClick, onBuyLook }) => {
  const handleShare = async (look: SavedLook) => {
    const text = `Confira meu novo look criado com o app MEU ESTILO! Itens: ${look.items.map(i => i.name).join(', ')}.`;

    // The Web Share API is the preferred method, but it requires HTTPS and user interaction.
    // It also has limitations on sharing files directly from data URLs.
    // We'll convert the data URL to a blob to share it as a file.
    if (navigator.share) {
      try {
        const response = await fetch(look.image);
        const blob = await response.blob();
        const file = new File([blob], 'meu-estilo-look.png', { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Meu Look MEU ESTILO',
            text: text,
            files: [file],
          });
        } else {
          // Fallback if files cannot be shared
          await navigator.share({
            title: 'Meu Look MEU ESTILO',
            text: text,
            url: window.location.href, // Share the app's URL instead
          });
        }
      } catch (error) {
        console.error('Error sharing look:', error);
        alert('Ocorreu um erro ao tentar compartilhar.');
      }
    } else {
      // Fallback for browsers that do not support the Web Share API
      alert('Seu navegador não suporta a função de compartilhamento. Tente salvar a imagem e compartilhar manualmente.');
    }
  };


  return (
    <div className="w-full h-full flex flex-col text-white animate-fadeIn bg-black">
      <Header title="Meus Looks" onBack={onBack} />
      <div className="flex-grow pt-16 overflow-y-auto">
        {looks.length > 0 ? (
          <div className="space-y-4 p-2">
            {looks.map(look => (
              <div key={look.id} className="bg-gray-900 rounded-lg overflow-hidden flex flex-col">
                {/* Image */}
                <div className="aspect-[3/4] w-full bg-black">
                    <img src={look.image} alt="Look salvo" className="w-full h-full object-cover" />
                </div>

                {/* Items List */}
                <div className="p-4 text-sm">
                    <h3 className="font-bold mb-2 text-gray-200">Itens neste look:</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {look.items.map(item => (
                             <li key={item.id}>
                                <button
                                    onClick={() => onItemClick(item)}
                                    className="text-gray-300 hover:text-white hover:underline text-left"
                                >
                                    {item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                 {/* Actions */}
                <div className="p-3 flex gap-3 border-t border-gray-800 bg-gray-900/50">
                    <button
                        onClick={() => onBuyLook(look.items)}
                        className="flex-1 flex items-center justify-center text-white font-bold py-2.5 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
                    >
                        <ShoppingBagIcon className="w-5 h-5 mr-2" />
                        Comprar
                    </button>
                    <button
                        onClick={() => handleShare(look)}
                        className="flex-1 flex items-center justify-center text-white font-bold py-2.5 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
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
            <LooksIcon className="w-24 h-24 text-blue-400 mb-6" />
            <h2 className="text-2xl font-bold">Nenhum Look Salvo</h2>
            <p className="text-gray-400 mt-2">
              Looks que você salva aparecem aqui para você rever e comprar quando quiser.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLooksScreen;