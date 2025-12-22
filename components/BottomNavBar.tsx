
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
      className={`relative flex flex-col items-center justify-center h-full w-1/5 transition-all duration-300 ${isActive ? 'text-amber-600' : 'text-zinc-400 hover:text-zinc-800'}`}
    >
      <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
        {React.cloneElement(icon as React.ReactElement, { strokeWidth: isActive ? 2.5 : 1.8 })}
      </div>
      {badgeCount && badgeCount > 0 && (
        <span className="absolute top-2 right-[25%] flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
      <span className={`text-[9px] font-bold uppercase tracking-tighter mt-1 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 scale-75'}`}>
        {label}
      </span>
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
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <nav className="flex justify-around items-center h-16 bg-white/95 backdrop-blur-md rounded-[2rem] shadow-[0_-4px_24px_rgba(0,0,0,0.05)] border border-zinc-100 px-2 pointer-events-auto max-w-lg mx-auto">
        <NavItem 
          icon={<CompassIcon className="w-6 h-6" />}
          label="Feed"
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
          <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center shadow-[0_8px_16px_rgba(217,119,6,0.3)] transition-all hover:scale-105 active:scale-95 border-2 border-white">
            <PlusIcon className="w-8 h-8 text-white" strokeWidth={3} />
          </div>
        </button>

        <NavItem 
          icon={<StarIcon className="w-6 h-6" />}
          label="Promover"
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
