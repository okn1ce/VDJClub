
import React, { useState } from 'react';
import { ArrowLeft, Zap, Target, Crosshair, Users, Activity, Lock, TrendingUp, Coins, PieChart, RotateCcw } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { DEFAULT_CORE_TURRETS, ICON_MAP } from '../../constants';

const TheCore: React.FC = () => {
  const { setView, setActiveGameId, user, coreState, corePlayers, buyCoreTurret, adminResetCore } = useGame();
  
  const [notification, setNotification] = useState<string | null>(null);

  if (!coreState) return <div className="text-white p-10">Initializing Core...</div>;

  const myPlayer = corePlayers.find(p => p.userId === user?.username);
  const myDps = myPlayer?.dps || 0;
  const totalDps = corePlayers.reduce((sum, p) => sum + p.dps, 0);

  // Health Percentage for Bar
  const hpPercent = (coreState.hp / coreState.maxHp) * 100;
  
  // Dynamic Color based on HP
  const hpColor = hpPercent > 60 ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]' 
               : hpPercent > 30 ? 'bg-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.6)]' 
               : 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]';

  // Reward Calculations
  const REWARD_RATIO = 0.1;
  const totalPool = Math.floor(coreState.maxHp * REWARD_RATIO);
  const myEstimatedReward = Math.floor((myPlayer?.damageDealt || 0) * REWARD_RATIO);

  const handleBuy = (turretId: string) => {
      const turret = DEFAULT_CORE_TURRETS.find(t => t.id === turretId);
      if(!turret) return;

      if(user && user.credits < turret.cost) {
          setNotification("Not enough credits!");
          setTimeout(() => setNotification(null), 2000);
          return;
      }
      
      buyCoreTurret(turret);
  };

  const sortedPlayers = [...corePlayers].sort((a,b) => b.damageDealt - a.damageDealt);

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden relative font-sans">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>

        {/* Top Nav */}
        <div className="absolute top-6 left-6 z-50 flex items-center gap-2">
            <button 
                onClick={() => { setView('HOME'); setActiveGameId(null); }}
                className="bg-slate-900/50 hover:bg-slate-800 text-indigo-300 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all border border-indigo-500/30"
            >
                <ArrowLeft size={18} /> Disconnect
            </button>
            
            {/* Admin Reset Button */}
            {user?.role === 'admin' && (
                <button 
                    onClick={() => {
                        if(confirm("Are you sure you want to reset the Core to Level 1? All progress will be lost.")) {
                            adminResetCore();
                        }
                    }}
                    className="bg-red-900/50 hover:bg-red-800 text-red-300 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all border border-red-500/30 ml-2"
                >
                    <RotateCcw size={18} /> Reset Level 1
                </button>
            )}
        </div>

        {/* Notifications */}
        {notification && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-2 rounded-full bg-red-600 text-white font-bold shadow-lg animate-fade-in">
                {notification}
            </div>
        )}

        <div className="flex w-full h-full relative z-10">
            
            {/* LEFT: Shop & Stats */}
            <div className="w-80 md:w-96 bg-slate-900/80 border-r border-indigo-500/20 flex flex-col backdrop-blur-sm z-20">
                <div className="p-6 border-b border-indigo-500/20">
                    <h2 className="text-xl font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        <Users size={20} /> Squad Stats
                    </h2>
                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Total DPS</span>
                            <span className="text-white font-mono font-bold">{totalDps.toLocaleString()} /s</span>
                        </div>
                        <div className="flex justify-between text-sm">
                             <span className="text-slate-400">My DPS</span>
                             <span className="text-emerald-400 font-mono font-bold">{myDps.toLocaleString()} /s</span>
                        </div>
                        <div className="flex justify-between text-sm">
                             <span className="text-slate-400">My Damage</span>
                             <span className="text-yellow-400 font-mono font-bold">{Math.floor(myPlayer?.damageDealt || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Turret Shop</h3>
                    {DEFAULT_CORE_TURRETS.map(turret => {
                        const count = myPlayer?.turrets?.[turret.id] || 0;
                        const canAfford = user && user.credits >= turret.cost;
                        const Icon = ICON_MAP[turret.icon] || Zap;

                        return (
                            <button 
                                key={turret.id}
                                onClick={() => handleBuy(turret.id)}
                                disabled={!canAfford}
                                className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-left group relative overflow-hidden
                                    ${canAfford ? 'bg-slate-800 border-slate-700 hover:border-indigo-500 hover:bg-slate-750' : 'bg-slate-900 border-slate-800 opacity-60 cursor-not-allowed'}
                                `}
                            >
                                <div className={`p-2 rounded-lg bg-slate-950 ${turret.color}`}>
                                    <Icon size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-200 text-sm">{turret.name}</span>
                                        <span className="text-xs font-mono text-slate-500">x{count}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                        <Activity size={10} /> +{turret.dps} DPS
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xs font-bold ${canAfford ? 'text-indigo-300' : 'text-slate-500'}`}>
                                        {turret.cost.toLocaleString()}
                                    </div>
                                    <div className="text-[9px] text-slate-600 uppercase">CR</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* CENTER: The Core */}
            <div className="flex-1 flex flex-col items-center relative">
                 <div className="mt-12 mb-8 text-center z-20">
                     <span className="px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-900/20 text-indigo-300 text-xs font-bold uppercase tracking-widest">
                         Level {coreState.level} Boss
                     </span>
                 </div>

                 <div className="relative flex flex-col items-center justify-center flex-1 w-full max-w-2xl">
                     {/* HP Bar Container */}
                     <div className="w-full px-12 z-20 mb-8">
                         <div className="flex justify-between text-slate-400 text-xs font-bold uppercase mb-2 tracking-wider">
                             <span>Core Integrity</span>
                             <span>{Math.floor(coreState.hp).toLocaleString()} / {coreState.maxHp.toLocaleString()}</span>
                         </div>
                         <div className="h-4 bg-slate-900 rounded-full border border-slate-800 overflow-hidden relative shadow-inner">
                             <div 
                                className={`h-full transition-all duration-300 ease-out ${hpColor}`}
                                style={{ width: `${hpPercent}%` }}
                             ></div>
                             {/* Gloss effect */}
                             <div className="absolute top-0 left-0 w-full h-[50%] bg-white/10"></div>
                         </div>
                     </div>

                     {/* Reward Pool Info */}
                     <div className="flex gap-4 mb-8 z-20">
                        <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-xl px-4 py-2 flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-full text-indigo-400">
                                <Coins size={18} />
                            </div>
                            <div>
                                <div className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Total Bounty</div>
                                <div className="text-lg font-bold text-white tabular-nums">{totalPool.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl px-4 py-2 flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400">
                                <PieChart size={18} />
                            </div>
                            <div>
                                <div className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider">Your Share</div>
                                <div className="text-lg font-bold text-white tabular-nums">~{myEstimatedReward.toLocaleString()}</div>
                            </div>
                        </div>
                     </div>

                     {/* The Core Visual */}
                     <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center">
                         {/* Rings */}
                         <div className="absolute inset-0 border-[1px] border-indigo-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                         <div className="absolute inset-4 border-[1px] border-indigo-400/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                         
                         {/* Core Body */}
                         <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full blur-sm transition-colors duration-500 shadow-[0_0_100px_currentColor] animate-pulse
                            ${hpPercent > 60 ? 'text-emerald-500 bg-emerald-500' : hpPercent > 30 ? 'text-yellow-500 bg-yellow-500' : 'text-red-600 bg-red-600'}
                         `}></div>
                         
                         {/* Inner Core */}
                         <div className="absolute w-24 h-24 md:w-36 md:h-36 bg-white rounded-full mix-blend-overlay blur-md"></div>
                     </div>
                 </div>
            </div>

            {/* RIGHT: Leaderboard */}
            <div className="w-64 bg-slate-900/50 border-l border-indigo-500/10 hidden lg:flex flex-col z-20">
                <div className="p-4 border-b border-indigo-500/10 bg-indigo-900/10">
                    <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={14} /> Top Damage
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {sortedPlayers.map((p, i) => (
                        <div key={p.userId} className={`p-2 rounded flex items-center justify-between text-xs ${p.userId === user?.username ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-white/5'}`}>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-500 w-4">{i+1}.</span>
                                <span className="text-slate-300 font-bold truncate max-w-[100px]">{p.username}</span>
                            </div>
                            <span className="font-mono text-slate-400">{Math.floor(p.damageDealt).toLocaleString()}</span>
                        </div>
                    ))}
                    {sortedPlayers.length === 0 && (
                        <div className="text-center text-slate-600 text-xs py-4">No damage dealt yet.</div>
                    )}
                </div>
            </div>

        </div>
    </div>
  );
};

export default TheCore;
