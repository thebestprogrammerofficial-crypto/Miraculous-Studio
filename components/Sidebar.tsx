
import React from 'react';
import { Home, Tv, Settings, Heart, Zap, Palette } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState['type'];
  onNavigate: (view: ViewState['type']) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const isHomeActive = currentView === 'HOME';
  const isShowsActive = currentView === 'SHOWS' || currentView === 'SHOW_DETAIL' || currentView === 'CREATE_SHOW' || currentView === 'CREATE_EPISODE' || currentView === 'VIEW_EPISODE';
  const isFavoritesActive = currentView === 'FAVORITES';
  const isDesignActive = currentView === 'DESIGN';
  const isSettingsActive = currentView === 'SETTINGS';
  const isUpgradeActive = currentView === 'UPGRADE';

  const itemClass = (active: boolean) => 
    `flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold ${active ? 'bg-[var(--accent-bg)] text-[var(--accent-color)] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`;

  // Custom Ladybug Icon
  const LadybugIcon = () => (
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-color)] to-black flex items-center justify-center shadow-lg shadow-red-200/50 ring-4 ring-gray-50 dark:ring-gray-800 transform -rotate-6 relative overflow-hidden">
        {/* Spots */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-8 bg-black/20 rounded-full"></div>
        <div className="absolute top-2 left-2 w-2 h-2 bg-black rounded-full opacity-60"></div>
        <div className="absolute bottom-3 right-2 w-2 h-2 bg-black rounded-full opacity-60"></div>
        <div className="absolute top-5 right-1 w-1.5 h-1.5 bg-black rounded-full opacity-60"></div>
        <div className="absolute bottom-2 left-3 w-1.5 h-1.5 bg-black rounded-full opacity-60"></div>
        {/* Center */}
        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center relative z-10">
            <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-pulse"></div>
        </div>
    </div>
  );

  return (
    <div className="w-64 bg-white dark:bg-gray-900 h-full border-r border-gray-100 dark:border-gray-800 flex flex-col transition-colors duration-300">
      <div className="p-6">
        <div 
            className="flex items-center gap-3 cursor-pointer mb-10 group" 
            onClick={() => onNavigate('HOME')}
        >
            <LadybugIcon />
            <div>
                <h1 className="font-extrabold text-xl leading-none text-gray-900 dark:text-white tracking-tight group-hover:text-[var(--accent-color)] transition-colors">
                    Miraculous
                </h1>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-[var(--accent-color)] transition-colors">Studio</span>
            </div>
        </div>

        <nav className="space-y-2">
            <button onClick={() => onNavigate('HOME')} className={itemClass(isHomeActive)}>
                <Home size={20} />
                Home
            </button>
            <button onClick={() => onNavigate('SHOWS')} className={itemClass(isShowsActive)}>
                <Tv size={20} />
                Shows
            </button>
            <button onClick={() => onNavigate('DESIGN')} className={itemClass(isDesignActive)}>
                <Palette size={20} />
                Design
            </button>
            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => onNavigate('FAVORITES')} className={itemClass(isFavoritesActive)}>
                    <Heart size={20} />
                    Favorites
                </button>
                 <button onClick={() => onNavigate('SETTINGS')} className={itemClass(isSettingsActive)}>
                    <Settings size={20} />
                    Settings
                </button>
            </div>
        </nav>
      </div>
      
      <div className="mt-auto p-6">
        <div 
            onClick={() => onNavigate('UPGRADE')}
            className={`bg-gradient-to-br from-gray-900 to-black dark:from-gray-800 dark:to-gray-950 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02] ${isUpgradeActive ? 'ring-2 ring-[var(--accent-color)]' : ''}`}
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-color)] opacity-20 rounded-full blur-xl group-hover:opacity-30 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full blur-lg group-hover:opacity-20 transition-opacity"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-[var(--accent-color)]">
                    <Zap size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Pro</span>
                </div>
                <p className="text-sm font-bold mb-3 leading-tight">Unlock Akuma Power & Unlimited Scripts</p>
                <div className="text-xs bg-white text-black px-3 py-2 rounded-lg font-bold w-full text-center group-hover:bg-[var(--accent-bg)] group-hover:text-[var(--accent-color)] transition-colors">
                    Upgrade Now
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
