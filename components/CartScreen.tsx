

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
    <div className="w-full h-full flex flex-col text-[var(--text-primary)] animate-fadeIn bg-[var(--bg-main)]">
      <Header title="Meu Carrinho" onBack={onBack} />
      <div className="flex-grow pt-16 overflow-y-auto">
        {cartItems.length > 0 ? (
          <div className="p-4 space-y-3">
            {cartItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-3 rounded-lg">
                <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded-md" />
                <div className="flex-grow">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-[var(--accent-primary)]">
                    {item.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                         <button
                            onClick={() => onTryOnItem(item)}
                            className="text-xs font-bold py-1.5 px-4 rounded-full bg-[var(--bg-tertiary)] hover:brightness-95 transition-colors"
                            aria-label={`Provar ${item.name}`}
                        >
                            Provar
                        </button>
                        <button
                          onClick={() => onBuyItem(item, index)}
                          className="text-xs font-bold py-1.5 px-4 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-text)] hover:brightness-125 transition-colors"
                          aria-label={`Comprar ${item.name}`}
                        >
                          Comprar
                        </button>
                    </div>
                    <button onClick={() => onRemoveItem(index)} className="p-1 text-[var(--text-secondary)] opacity-75 hover:text-red-500 transition-colors">
                      <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-grow h-full flex flex-col items-center justify-center text-center p-8 -mt-16">
            <ShoppingBagIcon className="w-24 h-24 text-zinc-600 mb-6" />
            <h2 className="text-2xl font-bold">Seu Carrinho está Vazio</h2>
            <p className="text-[var(--text-secondary)] mt-2">
              Adicione itens do mercado para vê-los aqui.
            </p>
          </div>
        )}
      </div>
      {cartItems.length > 0 && (
        <div className="flex-shrink-0 p-4 space-y-3 bg-[var(--bg-main)] border-t border-[var(--border-primary)]">
          <div className="flex justify-between items-center font-bold text-lg">
            <span>TOTAL:</span>
            <span className="text-[var(--accent-primary)] text-glow">
              {totalPrice.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
            </span>
          </div>
          <GradientButton onClick={onCheckout} className="!bg-[var(--accent-primary)] !text-[var(--accent-primary-text)] hover:!brightness-125">
            <div className="flex items-center justify-center gap-2">
              <ShoppingBagIcon className="w-5 h-5" />
              Finalizar Compra
            </div>
          </GradientButton>
        </div>
      )}
    </div>
  );
};

export default CartScreen;