
import React from 'react';
import { UserIcon, StorefrontIcon } from './IconComponents';

interface AccountTypeSelectionScreenProps {
  onSelect: (type: 'personal' | 'business') => void;
}

const AccountTypeSelectionScreen: React.FC<AccountTypeSelectionScreenProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8 bg-[#FFFFFF] text-center animate-fadeIn font-sans">
      <div className="max-w-xs mb-12">
        <h1 className="text-4xl font-bold text-[#F59E0B] leading-tight mb-4">
            Como você usará o PUMP?
        </h1>
        <p className="text-lg text-zinc-500">
            Escolha um tipo de conta para começar.
        </p>
      </div>
      
      <div className="w-full max-w-sm space-y-6">
        <button
          onClick={() => onSelect('personal')}
          className="w-full flex items-center justify-start gap-5 p-6 bg-[#f9fafb] rounded-[2rem] border border-[#e5e7eb] hover:border-[#F59E0B] transition-all duration-300 transform hover:scale-[1.02] shadow-sm text-left group"
        >
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border border-zinc-100 group-hover:border-[#F59E0B]/20 transition-colors shadow-sm">
            <UserIcon className="w-8 h-8 text-[#F59E0B]" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#111827]">Conta Pessoal</h2>
            <p className="text-sm text-zinc-500 font-medium leading-tight">Descubra, experimente e compre os melhores looks.</p>
          </div>
        </button>

        <button
          onClick={() => onSelect('business')}
          className="w-full flex items-center justify-start gap-5 p-6 bg-[#f9fafb] rounded-[2rem] border border-[#e5e7eb] hover:border-[#F59E0B] transition-all duration-300 transform hover:scale-[1.02] shadow-sm text-left group"
        >
           <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border border-zinc-100 group-hover:border-[#F59E0B]/20 transition-colors shadow-sm">
            <StorefrontIcon className="w-8 h-8 text-[#F59E0B]" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#111827]">Conta Empresarial</h2>
            <p className="text-sm text-zinc-500 font-medium leading-tight">Venda seus produtos e gerencie sua loja.</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AccountTypeSelectionScreen;
