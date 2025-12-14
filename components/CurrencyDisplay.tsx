import React from 'react';
import { Coins, Plus } from 'lucide-react';
import { useGame } from '../contexts/GameContext';

const CurrencyDisplay: React.FC = () => {
  const { user } = useGame();

  return (
    <div className="fixed top-6 right-8 z-30 animate-fade-in">
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-full px-5 py-2 flex items-center gap-3 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/20 p-1.5 rounded-full">
            <Coins size={18} className="text-emerald-400" />
          </div>
          <span className="font-bold text-emerald-100 text-lg tabular-nums tracking-wide">
            {user.credits.toLocaleString()}
          </span>
        </div>
        
        <div className="h-6 w-px bg-slate-700"></div>

        <button className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
          <Plus size={14} />
          <span>BUY</span>
        </button>
      </div>
    </div>
  );
};

export default CurrencyDisplay;
