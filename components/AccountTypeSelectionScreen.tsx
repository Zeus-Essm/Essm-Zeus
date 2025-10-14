import React from 'react';
import { UserIcon, StorefrontIcon } from './IconComponents';

interface AccountTypeSelectionScreenProps {
  onSelect: (type: 'personal' | 'business') => void;
}

const AccountTypeSelectionScreen: React.FC<AccountTypeSelectionScreenProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 bg-[var(--bg-main)] text-[var(--text-primary)] text-center animate-fadeIn">
      <img src="https://i.postimg.cc/XJf6gckX/Pump_STARTAP.png" alt="PUMP Logo" className="w-24 h-auto mb-8 animate-logo-pulse" />
      <h1 className="text-3xl font-bold mb-2 text-glow text-[var(--accent-primary)] opacity-90">Como você usará o PUMP?</h1>
      <p className="text-[var(--text-secondary)] mb-10">Escolha um tipo de conta para começar.</p>
      
      <div className="w-full max-w-sm space-y-6">
        <button
          onClick={() => onSelect('personal')}
          className="w-full flex items-center justify-start gap-5 p-6 bg-[var(--bg-secondary)] rounded-2xl border-2 border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-all duration-300 transform hover:scale-105"
        >
          <UserIcon className="w-12 h-12 text-[var(--accent-primary)] flex-shrink-0" />
          <div className="flex-1 text-left">
            <h2 className="text-xl font-bold">Conta Pessoal</h2>
            <p className="text-[var(--text-secondary)] text-sm">Descubra, experimente e compre os melhores looks.</p>
          </div>
        </button>

        <button
          onClick={() => onSelect('business')}
          className="w-full flex items-center justify-start gap-5 p-6 bg-[var(--bg-secondary)] rounded-2xl border-2 border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-all duration-300 transform hover:scale-105"
        >
          <StorefrontIcon className="w-12 h-12 text-[var(--accent-primary)] flex-shrink-0" />
          <div className="flex-1 text-left">
            <h2 className="text-xl font-bold">Conta Empresarial</h2>
            <p className="text-[var(--text-secondary)] text-sm">Venda seus produtos e gerencie sua loja.</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AccountTypeSelectionScreen;
