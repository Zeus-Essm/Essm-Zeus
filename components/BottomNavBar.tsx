import React from 'react';
import { Screen } from '../types';
import { 
    CompassIcon, 
    ShoppingBagIcon, 
    PlusIcon, 
    UserIcon,
    ChatBubbleIcon
} from './IconComponents';

interface BottomNavBarProps {
  activeScreen: Screen;
  onNavigateToFeed: () => void;
  onNavigateToCart: () => void;
  onNavigateToChat: () => void;
  onNavigateToProfile: () => void;
  onStartTryOn: () => void;
  isCartAnimating: boolean;
  unreadMessagesCount: number;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
}> = ({ icon, label, isActive, onClick, badgeCount }) => {
  const activeClass = 'text-[var(--accent-primary)]';
  const inactiveClass = 'text-[var(--text-secondary)] hover:text-white';
  
  return (
    <button onClick={onClick} className={`relative flex flex-col items-center p-1 w-1/5 transition-colors ${isActive ? activeClass : inactiveClass}`}>
      {icon}
      {badgeCount && badgeCount > 0 && (
        <span className="absolute top-0 right-[22%] flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{badgeCount}</span>
      )}
      <span className="text-[10px]">{label}</span>
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeScreen,
  onNavigateToFeed,
  onNavigateToCart,
  onNavigateToChat,
  onNavigateToProfile,
  onStartTryOn,
  isCartAnimating,
  unreadMessagesCount,
}) => {
  const isCartActive = activeScreen === Screen.Cart;

  return (
    <nav className="flex justify-around items-center p-2 bg-[var(--bg-header)] border-t border-[var(--border-primary)] backdrop-blur-md">
      <NavItem 
        icon={<CompassIcon className="w-7 h-7" />}
        label="Feed"
        isActive={activeScreen === Screen.Feed}
        onClick={onNavigateToFeed}
      />
      
      <button onClick={onNavigateToCart} className={`relative flex flex-col items-center p-1 w-1/5 transition-colors ${isCartActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-white'}`}>
        <ShoppingBagIcon className={`w-7 h-7 transition-transform ${isCartAnimating ? 'scale-125' : ''}`} />
        <span className="text-[10px]">Carrinho</span>
      </button>

      <button onClick={onStartTryOn} className="w-1/5 flex justify-center">
          <div className="p-3 bg-[var(--accent-primary)] rounded-xl transform hover:scale-110 transition-transform">
              <PlusIcon className="w-7 h-7 text-[var(--accent-primary-text)]" />
          </div>
      </button>

      <NavItem 
        icon={<ChatBubbleIcon className="w-7 h-7" />}
        label="Mensagens"
        isActive={activeScreen === Screen.ChatList || activeScreen === Screen.Chat}
        onClick={onNavigateToChat}
        badgeCount={unreadMessagesCount}
      />

      <NavItem 
        icon={<UserIcon className="w-7 h-7" />}
        label="Perfil"
        isActive={activeScreen === Screen.Home}
        onClick={onNavigateToProfile}
      />
    </nav>
  );
};

export default BottomNavBar;
