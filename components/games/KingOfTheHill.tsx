
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Crown, Coins, Sword, History, User } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

const KingOfTheHill: React.FC = () => {
  const { setView, setActiveGameId, user, kothState, usurpThrone } = useGame();
  const [notification, setNotification] = useState<string | null>(null);
  const [earnings, setEarnings] = useState(0);

  // Simulation for local visual earnings counter
  useEffect(() => {
    if (!kothState || !kothState.kingId) {
        setEarnings(0);
        return;
    }
    
    // Reset if king changes
    const timeReign = (Date.now() - kothState.kingSince) / 1000;
    // Rough estimate of earnings for UI (1% of treasury per 3s)
    const estimatedTicks = Math.floor(timeReign / 3);
    const estimatedEarned = estimatedTicks * Math.floor(kothState.treasury * 0.01);
    setEarnings(estimatedEarned);

  }, [kothState?.kingId, kothState?.kingSince, kothState?.treasury]);

  if (!kothState) return <div className="text-white p-10">Loading Kingdom...</div>;

  const isKing = user?.username === kothState.kingId;
  const canAfford = user && user.credits >= kothState.currentPrice;

  const handleUsurp = () => {
      if (!user) return;
      if (isKing) return;
      
      if (user.credits < kothState.currentPrice) {
          setNotification("Not enough credits to seize the throne!");
          setTimeout(() => setNotification(null), 3000);
          return;
      }

      const success = usurpThrone();
      if (success) {
          setNotification("You have seized the throne!");
          setTimeout(() => setNotification(null), 3000);
      }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden relative font-serif">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black z-0"></div>
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #7c3aed 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        {/* Top UI */}
        <div className="absolute top-6 left-6 z-50 flex items-center gap-2">
            <button 
                onClick={() => { setView('HOME'); setActiveGameId(null); }}
                className="bg-black/50 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all border border-white/10"
            >
                <ArrowLeft size={18} /> Retreat
            </button>
        </div>

        {/* Notification */}
        {notification && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] bg-indigo-900 text-white font-bold border border-indigo-500 animate-fade-in text-center">
                {notification}
            </div>
        )}

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
            
            {/* Header / Treasury */}
            <div className="mb-8 text-center animate-fade-in">
                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-sm mb-2 uppercase tracking-widest">
                    King of the Hill
                </h1>
                <div className="inline-flex items-center gap-3 bg-slate-900/80 px-6 py-3 rounded-full border border-yellow-600/30 shadow-lg">
                    <span className="text-slate-400 text-sm uppercase tracking-wider font-sans font-bold">Royal Treasury</span>
                    <div className="w-px h-4 bg-slate-700"></div>
                    <div className="flex items-center gap-2 text-yellow-400 text-xl font-bold font-sans">
                        <Coins size={20} /> {kothState.treasury.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* The Throne Area */}
            <div className="relative group w-full max-w-md aspect-square flex items-center justify-center">
                
                {/* Glow Effects */}
                <div className={`absolute inset-0 blur-[100px] rounded-full transition-colors duration-1000 ${isKing ? 'bg-indigo-600/30' : 'bg-red-600/20'}`}></div>

                {/* Throne Card */}
                <div className="relative z-10 bg-slate-900 border border-slate-700 w-64 h-80 rounded-t-[100px] rounded-b-3xl shadow-2xl flex flex-col items-center p-6 overflow-hidden">
                    
                    {/* Crown Icon */}
                    <div className="absolute -top-6">
                        <Crown size={64} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-bounce" />
                    </div>

                    <div className="mt-12 w-24 h-24 rounded-full border-4 border-yellow-500/50 overflow-hidden bg-slate-800 shadow-inner mb-4 relative">
                        {kothState.kingAvatar ? (
                             <img src={kothState.kingAvatar} alt="King" className="w-full h-full object-cover" />
                        ) : (
                             <User size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-600" />
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-1 truncate max-w-full">
                        {kothState.kingName || 'Empty Throne'}
                    </h2>
                    <p className="text-yellow-500 text-xs uppercase tracking-widest font-sans font-bold mb-6">
                        Reigning Monarch
                    </p>

                    {/* Stats for King */}
                    {isKing ? (
                        <div className="w-full bg-indigo-900/30 rounded-lg p-3 text-center border border-indigo-500/30">
                            <p className="text-slate-400 text-xs uppercase mb-1">Current Session Earnings</p>
                            <p className="text-xl font-bold text-indigo-300">+{earnings} Credits</p>
                        </div>
                    ) : (
                        <div className="w-full bg-slate-800 rounded-lg p-3 text-center border border-slate-700">
                             <p className="text-slate-500 text-xs">Reigning for</p>
                             <p className="text-slate-300 font-mono">
                                 {kothState.kingSince ? Math.floor((Date.now() - kothState.kingSince)/1000) : 0}s
                             </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Area */}
            <div className="mt-8 w-full max-w-md">
                {isKing ? (
                    <div className="text-center p-6 bg-indigo-900/20 border border-indigo-500/50 rounded-2xl">
                        <p className="text-indigo-200 text-lg font-bold mb-2">You control the throne!</p>
                        <p className="text-slate-400 text-sm">Defend your title. You earn <span className="text-white font-bold">1%</span> of the treasury every 3 seconds.</p>
                    </div>
                ) : (
                    <button 
                        onClick={handleUsurp}
                        disabled={!canAfford}
                        className={`w-full group relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 shadow-xl
                            ${canAfford 
                                ? 'bg-red-900/80 border-red-600 hover:bg-red-800 hover:scale-105 cursor-pointer' 
                                : 'bg-slate-800 border-slate-700 opacity-70 cursor-not-allowed'}
                        `}
                    >
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex flex-col items-start">
                                <span className={`text-2xl font-black uppercase italic ${canAfford ? 'text-white' : 'text-slate-500'}`}>
                                    Usurp Throne
                                </span>
                                <span className="text-xs text-red-200/70 font-sans mt-1">Pay fee to overthrow</span>
                            </div>
                            <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-lg border border-white/10">
                                <Sword size={24} className={`${canAfford ? 'text-red-400' : 'text-slate-600'}`} />
                                <span className="text-2xl font-bold text-white font-sans">{kothState.currentPrice}</span>
                                <Coins size={16} className="text-yellow-500" />
                            </div>
                        </div>
                    </button>
                )}
                
                <p className="text-center mt-4 text-slate-500 text-xs font-sans max-w-xs mx-auto">
                    Price increases by 15% each usurp. The usurping fee is added to the Treasury.
                </p>
            </div>
        </div>
    </div>
  );
};

export default KingOfTheHill;
