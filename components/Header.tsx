import React from 'react';
import { ArrowLeftIcon, BellIcon, SearchIcon } from './IconComponents';

interface HeaderProps {
  title: string;
  showLogo?: boolean;
  onBack?: () => void;
  unreadNotificationCount?: number;
  onNotificationsClick?: () => void;
  onSearchClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showLogo, onBack, unreadNotificationCount = 0, onNotificationsClick, onSearchClick }) => {
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
      <div className="flex items-center gap-4">
        {onSearchClick && (
          <button onClick={onSearchClick} className="relative rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors">
            <SearchIcon className="w-7 h-7 text-[var(--accent-primary)]" />
          </button>
        )}
        {onNotificationsClick && (
          <button onClick={onNotificationsClick} className="relative rounded-full hover:bg-[var(--accent-primary)]/10 transition-colors">
              <BellIcon className="w-7 h-7 text-[var(--accent-primary)]" />
              {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-[var(--bg-main)]">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
              )}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;