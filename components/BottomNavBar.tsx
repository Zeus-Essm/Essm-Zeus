
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
      className={`relative flex flex-col items-center justify-center h-full w-1/5 transition-all duration-200 ${isActive ? 'text-[#D97706]' : 'text-[#64748b]'}`}
    >
      <div className="mb-1">
        {React.cloneElement(icon as React.ReactElement, { 
          strokeWidth: isActive ? 2 : 1.5,
          className: (icon as React.ReactElement).props.className 
        })}
      </div>
      {badgeCount && badgeCount > 0 && (
        <span className="absolute top-2 right-[25%] flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
      <span className="text-[11px] font-medium leading-none">
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-100 pb-safe">
      <nav className="flex justify-around items-center h-20 px-2 max-w-lg mx-auto">
        <NavItem 
          icon={<CompassIcon className="w-7 h-7" />}
          label="Feed"
          isActive={activeScreen === Screen.Feed || activeScreen === Screen.AllHighlights}
          onClick={onNavigateToFeed}
        />
        
        {accountType === 'business' ? (
          <NavItem
            icon={<ChartBarIcon className="w-7 h-7" />}
            label="Dados"
            isActive={activeScreen === Screen.VendorAnalytics}
            onClick={onNavigateToVendorAnalytics}
          />
        ) : (
          <NavItem
            icon={<ShoppingBagIcon className={`w-7 h-7 ${isCartAnimating ? 'animate-bounce' : ''}`} />}
            label="Carrinho"
            isActive={activeScreen === Screen.Cart}
            onClick={onNavigateToCart}
          />
        )}

        <div className="w-1/5 flex justify-center">
            <button 
              onClick={onStartTryOn} 
              className="w-16 h-14 bg-[#D97706] rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
            >
              <PlusIcon className="w-8 h-8 text-white" strokeWidth={2.5} />
            </button>
        </div>

        <NavItem 
          icon={<StarIcon className="w-7 h-7" />}
          label="Promover"
          isActive={false}
          onClick={onNavigateToPromotion}
        />

        <NavItem 
          icon={<UserIcon className="w-7 h-7" />}
          label="Perfil"
          isActive={activeScreen === Screen.Home || activeScreen === Screen.VendorDashboard}
          onClick={onNavigateToProfile}
        />
      </nav>
    </div>
  );
};

export default BottomNavBar;
