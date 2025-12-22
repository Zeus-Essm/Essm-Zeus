
import React from 'react';
import { Screen } from '../types';
import { 
    CompassIcon, 
    ShoppingBagIcon, 
    PlusIcon, 
    UserIcon,
    StarIcon,
    ChartBarIcon
} from './IconComponents';

interface BottomNavBarProps {
  activeScreen: Screen;
  onNavigateToFeed: () => void;
  onNavigateToCart: () => void;
  onNavigateToPromotion: () => void;
  onNavigateToProfile: () => void;
  onStartTryOn: () => void;
  isCartAnimating: boolean;
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
  return (
    <button 
      onClick={onClick} 
      className={`relative flex flex-col items-center justify-center h-full w-1/5 transition-all duration-300 ${isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
    >
      <div className={`transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-1' : ''}`}>
        {icon}
      </div>
      {badgeCount && badgeCount > 0 && (
        <span className="absolute top-2 right-[25%] flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
      <span className={`text-[10px] font-black uppercase tracking-tighter mt-1 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        {label}
      </span>
      {isActive && (
        <div className="absolute bottom-1 w-1 h-1 bg-[var(--accent-primary)] rounded-full animate-pulse" />
      )}
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeScreen,
  onNavigateToFeed,
  onNavigateToCart,
  onNavigateToPromotion,
  onNavigateToProfile,
  onStartTryOn,
  isCartAnimating,
  accountType,
  onNavigateToVendorAnalytics
}) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none">
      <nav className="flex justify-around items-center h-16 bg-[var(--bg-header)] glass rounded-3xl shadow-2xl shadow-black/10 border border-[var(--glass-border)] px-2 pointer-events-auto max-w-lg mx-auto">
        <NavItem 
          icon={<CompassIcon className="w-6 h-6" />}
          label="Início"
          isActive={activeScreen === Screen.Feed || activeScreen === Screen.AllHighlights}
          onClick={onNavigateToFeed}
        />
        
        {accountType === 'business' ? (
          <NavItem
            icon={<ChartBarIcon className="w-6 h-6" />}
            label="Dados"
            isActive={activeScreen === Screen.VendorAnalytics}
            onClick={onNavigateToVendorAnalytics}
          />
        ) : (
          <NavItem
            icon={<ShoppingBagIcon className={`w-6 h-6 ${isCartAnimating ? 'animate-bounce' : ''}`} />}
            label="Carrinho"
            isActive={activeScreen === Screen.Cart}
            onClick={onNavigateToCart}
          />
        )}

        <button 
          onClick={onStartTryOn} 
          className="w-1/5 flex justify-center -translate-y-4"
        >
          <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl flex items-center justify-center shadow-[0_12px_24px_rgba(245,158,11,0.4)] transition-all hover:scale-110 active:scale-95 border-2 border-white/20">
            <PlusIcon className="w-7 h-7 text-white" strokeWidth={3} />
          </div>
        </button>

        <NavItem 
          icon={<StarIcon className="w-6 h-6" />}
          label="Promo"
          isActive={false}
          onClick={onNavigateToPromotion}
        />

        <NavItem 
          icon={<UserIcon className="w-6 h-6" />}
          label="Perfil"
          isActive={activeScreen === Screen.Home || activeScreen === Screen.VendorDashboard}
          onClick={onNavigateToProfile}
        />
      </nav>
    </div>
  );
};

export default BottomNavBar;
