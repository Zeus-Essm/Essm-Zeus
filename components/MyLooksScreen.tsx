import React from 'react';
import Header from './Header';
import { LooksIcon } from './IconComponents';

interface MyLooksScreenProps {
  onBack: () => void;
}

const MyLooksScreen: React.FC<MyLooksScreenProps> = ({ onBack }) => {
  return (
    <div className="w-full h-full flex flex-col text-white animate-fadeIn bg-black">
      <Header title="Meus Looks" onBack={onBack} />
      <div className="flex-grow flex flex-col items-center justify-center text-center p-8 pt-20">
        <LooksIcon className="w-24 h-24 text-blue-400 mb-6" />
        <h2 className="text-2xl font-bold">Seus Looks Salvos</h2>
        <p className="text-gray-400 mt-2">
            Looks que você posta no feed são salvos aqui para você rever e comprar quando quiser.
        </p>
        <div className="mt-8 p-4 bg-gray-900 rounded-lg">
            <p className="text-sm">Esta funcionalidade está em desenvolvimento.</p>
        </div>
      </div>
    </div>
  );
};

export default MyLooksScreen;