
import React from 'react';
import { Home, ShoppingBag, User, LogOut, Gamepad2, Shield, Trophy } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { ViewState } from '../types';

const Sidebar: React.FC = () => {
  const { view, setView, user, logout } = useGame();

  const NavItem = ({ target, icon: Icon, label }: { target: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => setView(target)}
      className={`group flex flex-col items-center justify-center p-4 w-full transition-all duration-200 
        ${view === target 
          ? 'text-emerald-400 bg-slate-800/50 border-r-4 border-emerald-400' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
    >
      <Icon size={24} className={`mb-1 transition-transform group-hover:scale-110 ${view === target ? 'drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : ''}`} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="w-24 h-screen bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 shadow-xl z-20 sticky top-0">
      <div className="mb-8 p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
        <Gamepad2 size={32} className="text-white" />
      </div>

      <nav className="flex-1 w-full space-y-2">
        <NavItem target="HOME" icon={Home} label="Hub" />
        <NavItem target="SHOP" icon={ShoppingBag} label="Shop" />
        <NavItem target="LEADERBOARD" icon={Trophy} label="Ranking" />
        <NavItem target="PROFILE" icon={User} label="Profile" />
        
        {user?.role === 'admin' && (
           <NavItem target="ADMIN" icon={Shield} label="Admin" />
        )}
      </nav>

      <button 
        onClick={logout}
        className="mt-auto mb-4 p-3 text-slate-500 hover:text-red-400 transition-colors flex flex-col items-center gap-1 group"
      >
        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
        <span className="text-[10px] font-bold uppercase">Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
