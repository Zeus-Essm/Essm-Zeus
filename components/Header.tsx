
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
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between bg-[var(--bg-header)] glass border-b border-[var(--border-primary)] px-5 z-40">
      <div className="flex items-center">
        {showLogo ? (
          <img src="https://i.postimg.cc/L4190LN2/PUMP-startup-2.png" alt="PUMP" className="h-7 w-auto animate-logo-pulse" />
        ) : (
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="p-2 -ml-2 rounded-2xl bg-[var(--bg-tertiary)] hover:bg-amber-500 hover:text-white transition-all active:scale-90">
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg font-black text-[var(--text-primary)] tracking-tighter uppercase italic">{title}</h1>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {onSearchClick && (
          <button onClick={onSearchClick} className="p-2 rounded-2xl bg-[var(--bg-tertiary)] hover:bg-[var(--accent-primary)]/10 transition-all active:scale-90">
            <SearchIcon className="w-6 h-6 text-[var(--text-primary)]" />
          </button>
        )}
        {onNotificationsClick && (
          <button onClick={onNotificationsClick} className="relative p-2 rounded-2xl bg-[var(--bg-tertiary)] hover:bg-[var(--accent-primary)]/10 transition-all active:scale-90">
              <BellIcon className="w-6 h-6 text-[var(--text-primary)]" />
              {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-lg bg-red-500 text-[9px] font-black text-white shadow-sm ring-2 ring-[var(--bg-main)]">
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
