
import React from 'react';
import { ArrowLeftIcon, BellIcon } from './IconComponents';

interface HeaderProps {
  title: string;
  showLogo?: boolean;
  onBack?: () => void;
  unreadNotificationCount?: number;
  onNotificationsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showLogo, onBack, unreadNotificationCount, onNotificationsClick }) => {
  return (
    <header className="absolute top-0 left-0 right-0 p-2 flex items-center justify-between bg-[var(--bg-header)] border-b border-[var(--border-primary)] backdrop-blur-md z-10">
      <div className="flex items-center">
        {showLogo ? (
          <img src="https://i.postimg.cc/L4190LN2/PUMP-startup-2.png" alt="PUMP Logo" className="h-8 w-auto" />
        ) : (
          <>
            {onBack && (
              <button onClick={onBack} className="p-2 mr-2 -ml-2 rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors">
                <ArrowLeftIcon className="w-5 h-5 text-[var(--accent-primary)]" />
              </button>
            )}
            <h1 className="text-lg font-bold text-[var(--accent-primary)] text-glow tracking-wider uppercase">{title}</h1>
          </>
        )}
      </div>
      {onNotificationsClick && (
        <button onClick={onNotificationsClick} className="relative p-2 rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors">
            <BellIcon className="w-5 h-5 text-[var(--accent-primary)]" />
            {unreadNotificationCount && unreadNotificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 block w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--bg-main)]"></span>
            )}
        </button>
      )}
    </header>
  );
};

export default Header;