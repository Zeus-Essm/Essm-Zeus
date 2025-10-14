import React from 'react';
import { Screen } from '../types';
import { 
    CompassIcon, 
    ShoppingBagIcon, 
    PlusIcon, 
    UserIcon,
    ChatBubbleIcon,
    ChartBarIcon
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
  accountType?: 'personal' | 'business' | null;
  onNavigateToVendorAnalytics: () => void;
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
        <span className="absolute top-0 right-[20%] flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">{badgeCount > 9 ? '9+' : badgeCount}</span>
      )}
      <span className="text-[9px] mt-0.5">{label}</span>
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
  accountType,
  onNavigateToVendorAnalytics
}) => {
  const isCartActive = activeScreen === Screen.Cart;

  return (
    <nav className="flex justify-around items-center py-1 px-2 bg-[var(--bg-header)] border-t border-[var(--border-primary)] backdrop-blur-md">
      <NavItem 
        icon={<CompassIcon className="w-6 h-6" />}
        label="Feed"
        isActive={activeScreen === Screen.Feed}
        onClick={onNavigateToFeed}
      />
      
      {accountType === 'business' ? (
        <NavItem
          icon={<ChartBarIcon className="w-6 h-6" />}
          label="Visão Geral"
          isActive={activeScreen === Screen.VendorAnalytics}
          onClick={onNavigateToVendorAnalytics}
        />
      ) : (
        <button onClick={onNavigateToCart} className={`relative flex flex-col items-center p-1 w-1/5 transition-colors ${isCartActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-white'}`}>
            <ShoppingBagIcon className={`w-6 h-6 transition-transform ${isCartAnimating ? 'scale-125' : ''}`} />
            <span className="text-[9px] mt-0.5">Carrinho</span>
        </button>
      )}

      <button onClick={onStartTryOn} className="w-1/5 flex justify-center">
          <div className="p-2.5 bg-[var(--accent-primary)] rounded-lg transform hover:scale-110 transition-transform">
              <PlusIcon className="w-6 h-6 text-[var(--accent-primary-text)]" />
          </div>
      </button>

      <NavItem 
        icon={<ChatBubbleIcon className="w-6 h-6" />}
        label="Mensagens"
        isActive={activeScreen === Screen.ChatList || activeScreen === Screen.Chat}
        onClick={onNavigateToChat}
        badgeCount={unreadMessagesCount}
      />

      <NavItem 
        icon={<UserIcon className="w-6 h-6" />}
        label="Perfil"
        isActive={activeScreen === Screen.Home || activeScreen === Screen.VendorDashboard}
        onClick={onNavigateToProfile}
      />
    </nav>
  );
};

export default BottomNavBar;