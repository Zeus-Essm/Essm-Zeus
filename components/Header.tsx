
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
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between bg-white border-b border-zinc-100 px-5 z-40">
      <div className="flex items-center">
        {showLogo ? (
          <img 
            src="https://i.postimg.cc/L4190LN2/PUMP_startup_2.png" 
            alt="PUMP" 
            className="h-8 w-auto object-contain" 
          />
        ) : (
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="p-2 -ml-2 rounded-xl bg-zinc-50 hover:bg-amber-500 hover:text-white transition-all active:scale-90">
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg font-black text-zinc-900 tracking-tighter uppercase italic">{title}</h1>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        {onSearchClick && (
          <button onClick={onSearchClick} className="p-2.5 rounded-xl hover:bg-zinc-50 transition-all active:scale-90">
            <SearchIcon className="w-7 h-7 text-zinc-400" strokeWidth={1.5} />
          </button>
        )}
        {onNotificationsClick && (
          <button onClick={onNotificationsClick} className="relative p-2.5 rounded-xl hover:bg-zinc-50 transition-all active:scale-90">
              <BellIcon className="w-7 h-7 text-zinc-400" strokeWidth={1.5} />
              {unreadNotificationCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white shadow-sm ring-2 ring-white">
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
