
import React from 'react';
import { ArrowLeftIcon } from './IconComponents';

interface HeaderProps {
  title: string;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
  return (
    <header className="absolute top-0 left-0 right-0 p-4 flex items-center bg-[var(--bg-header)] border-b border-[var(--border-primary)] backdrop-blur-md z-10">
      {onBack && (
        <button onClick={onBack} className="p-2 mr-4 rounded-full hover:bg-yellow-400/10 transition-colors">
          <ArrowLeftIcon className="w-6 h-6 text-[var(--accent-primary)]" />
        </button>
      )}
      <h1 className="text-xl font-bold text-[var(--accent-primary)] text-glow tracking-wider uppercase">{title}</h1>
    </header>
  );
};

export default Header;