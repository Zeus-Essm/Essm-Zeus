import React from 'react';
import Header from './Header';
import { ShoppingBagIcon, XCircleIcon } from './IconComponents';
import type { Item } from '../types';
import GradientButton from './GradientButton';

interface CartScreenProps {
  cartItems: Item[];
  onBack: () => void;
  onRemoveItem: (index: number) => void;
  onBuyItem: (item: Item, index: number) => void;
  onTryOnItem: (item: Item) => void;
  onCheckout: () => void;
}

const CartScreen: React.FC<CartScreenProps> = ({ cartItems, onBack, onRemoveItem, onBuyItem, onTryOnItem, onCheckout }) => {
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="w-full h-full flex flex-col text-white animate-fadeIn bg-black">
      <Header title="Meu Carrinho" onBack={onBack} />
      <div className="flex-grow pt-16 overflow-y-auto">
        {cartItems.length > 0 ? (
          <div className="p-4 space-y-3">
            {cartItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4 bg-gray-900 p-3 rounded-lg">
                <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded-md" />
                <div className="flex-grow">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-blue-400">
                    {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                         <button
                            onClick={() => onTryOnItem(item)}
                            className="text-xs font-bold py-1.5 px-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                            aria-label={`Provar ${item.name}`}
                        >
                            Provar
                        </button>
                        <button
                          onClick={() => onBuyItem(item, index)}
                          className="text-xs font-bold py-1.5 px-4 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
                          aria-label={`Comprar ${item.name}`}
                        >
                          Comprar
                        </button>
                    </div>
                    <button onClick={() => onRemoveItem(index)} className="p-1 text-gray-500 hover:text-red-500 transition-colors">
                      <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-grow h-full flex flex-col items-center justify-center text-center p-8 -mt-16">
            <ShoppingBagIcon className="w-24 h-24 text-gray-600 mb-6" />
            <h2 className="text-2xl font-bold">Seu Carrinho está Vazio</h2>
            <p className="text-gray-400 mt-2">
              Adicione itens das coleções para vê-los aqui.
            </p>
          </div>
        )}
      </div>
      {cartItems.length > 0 && (
        <div className="flex-shrink-0 p-4 space-y-3 bg-black border-t border-gray-800">
          <div className="flex justify-between items-center font-bold text-lg">
            <span>TOTAL:</span>
            <span className="text-blue-400">
              {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <GradientButton onClick={onCheckout}>
            <div className="flex items-center justify-center">
              <ShoppingBagIcon className="w-5 h-5 mr-2" />
              Finalizar Compra
            </div>
          </GradientButton>
        </div>
      )}
    </div>
  );
};

export default CartScreen;
