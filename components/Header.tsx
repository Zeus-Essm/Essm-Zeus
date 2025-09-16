
import React from 'react';
import { ArrowLeftIcon } from './IconComponents';

interface HeaderProps {
  title: string;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
  return (
    <header className="absolute top-0 left-0 right-0 p-4 flex items-center bg-black/80 border-b border-gray-800 backdrop-blur-md z-10">
      {onBack && (
        <button onClick={onBack} className="p-2 mr-4 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeftIcon className="w-6 h-6 text-white" />
        </button>
      )}
      <h1 className="text-xl font-bold text-white">{title}</h1>
    </header>
  );
};

export default Header;