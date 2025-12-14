
import React from 'react';
import { Home, ShoppingBag, User, LogOut, Gamepad2, Shield, Trophy } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { ViewState } from '../types';

const Sidebar: React.FC = () => {
  const { view, setView, user, logout, setActiveGameId } = useGame();

  const menuItems: { id: ViewState; icon: any; label: string }[] = [
    { id: 'HOME', icon: Home, label: 'Hub' },
    { id: 'SHOP', icon: ShoppingBag, label: 'Shop' },
    { id: 'LEADERBOARD', icon: Trophy, label: 'Ranking' },
    { id: 'PROFILE', icon: User, label: 'Profile' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ id: 'ADMIN', icon: Shield, label: 'Admin' });
  }

  const handleNav = (target: ViewState) => {
    // Force reset game state when navigating
    setActiveGameId(null);
    setView(target);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-20 bg-[#0f172a] border-r border-slate-800 flex flex-col items-center py-6 z-[100] shadow-2xl">
      {/* Brand Icon */}
      <div className="mb-8 p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
        <Gamepad2 size={24} className="text-white" />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 w-full px-2 flex flex-col gap-3">
        {menuItems.map((item) => {
          const isActive = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`
                group relative w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 outline-none
                ${isActive 
                  ? 'bg-slate-800 text-white shadow-inner border border-slate-700' 
                  : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'}
              `}
            >
              <item.icon 
                size={22} 
                className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : ''}`} 
              />
              <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                {item.label}
              </span>

              {/* Active Indicator Pip */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Action */}
      <div className="mt-auto w-full px-2">
        <button 
          onClick={logout}
          className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
        >
          <LogOut size={20} />
          <span className="text-[9px] font-bold uppercase">Exit</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
