
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Coins, RotateCcw, ShieldCheck, HelpCircle, History, Crown } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

const TheVault: React.FC = () => {
  const { setView, setActiveGameId, user, vaultState, submitVaultGuess } = useGame();
  
  const [input, setInput] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);

  const handleKeypad = (num: number) => {
    if (input.length < 5) {
      setInput(prev => prev + num);
    }
  };

  const handleClear = () => setInput("");
  const handleBackspace = () => setInput(prev => prev.slice(0, -1));

  const handleSubmit = async () => {
      if (input.length !== 5) return;
      if (!user) return;
      if (user.credits < 25) {
          setFeedback({ msg: "Not enough credits!", type: 'error' });
          setTimeout(() => setFeedback(null), 2000);
          return;
      }

      setProcessing(true);
      const res = await submitVaultGuess(input);
      setProcessing(false);
      setInput("");

      if (res.success) {
          setFeedback({ msg: `UNLOCKED! Won ${vaultState.jackpot} Credits!`, type: 'success' });
      } else {
          setFeedback({ 
              msg: `${res.result?.matches} Exact, ${res.result?.partial} Partial`, 
              type: 'error' 
          });
          setTimeout(() => setFeedback(null), 3000);
      }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a1014] overflow-hidden relative font-mono text-emerald-500">
        
        {/* CRT Scanline Effect */}
        <div className="absolute inset-0 z-50 pointer-events-none opacity-10" style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}></div>

        {/* Top Nav */}
        <div className="absolute top-6 left-6 z-40 flex items-center gap-2">
            <button 
                onClick={() => { setView('HOME'); setActiveGameId(null); }}
                className="bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 px-4 py-2 rounded-lg backdrop-blur-md flex items-center gap-2 transition-all border border-emerald-800"
            >
                <ArrowLeft size={18} /> ABORT
            </button>
        </div>

        {/* Main Content Container - Added overflow-hidden to prevent layout shift when history grows */}
        <div className="flex-1 flex flex-col md:flex-row items-stretch overflow-hidden">
            
            {/* LEFT: Game Interface */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-y-auto">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#0a1014] to-[#0a1014] pointer-events-none"></div>

                 {/* Jackpot Display */}
                 <div className="mb-10 text-center relative z-10 shrink-0">
                     <div className="text-emerald-500/50 text-xs tracking-[0.5em] mb-2 uppercase">Current Bounty</div>
                     <div className="text-6xl md:text-8xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)] tabular-nums">
                         {vaultState.jackpot.toLocaleString()}
                     </div>
                     <div className="flex items-center justify-center gap-2 mt-4 text-emerald-600">
                         <ShieldCheck size={16} /> <span className="text-xs uppercase">Secure Connection</span>
                     </div>
                 </div>

                 {/* Display Screen */}
                 <div className="bg-[#05080a] border-2 border-emerald-900 rounded-xl p-6 w-full max-w-sm mb-6 shadow-[0_0_30px_rgba(5,150,105,0.1)] relative overflow-hidden shrink-0">
                     {feedback && (
                         <div className={`absolute inset-0 flex items-center justify-center z-20 ${feedback.type === 'success' ? 'bg-emerald-900/90' : 'bg-red-900/90'} transition-opacity`}>
                             <p className={`font-bold text-xl ${feedback.type === 'success' ? 'text-white animate-pulse' : 'text-white'}`}>{feedback.msg}</p>
                         </div>
                     )}
                     
                     <div className="flex justify-center gap-2 md:gap-4">
                         {[0, 1, 2, 3, 4].map(i => (
                             <div key={i} className="w-12 h-16 md:w-14 md:h-20 bg-emerald-900/10 border border-emerald-800 rounded flex items-center justify-center text-3xl md:text-4xl font-bold text-emerald-400">
                                 {input[i] || (processing ? <span className="animate-spin text-lg">X</span> : "_")}
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* Keypad */}
                 <div className="grid grid-cols-3 gap-3 w-full max-w-xs relative z-10 shrink-0">
                     {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                         <button 
                            key={num} 
                            onClick={() => handleKeypad(num)}
                            className="h-16 bg-[#0f191f] border border-emerald-900/50 text-emerald-400 text-2xl font-bold rounded hover:bg-emerald-900/30 hover:border-emerald-500 hover:text-white transition-all active:scale-95 shadow-lg"
                         >
                             {num}
                         </button>
                     ))}
                     <button onClick={handleClear} className="h-16 bg-red-900/10 border border-red-900/30 text-red-400 font-bold rounded hover:bg-red-900/30">C</button>
                     <button onClick={() => handleKeypad(0)} className="h-16 bg-[#0f191f] border border-emerald-900/50 text-emerald-400 text-2xl font-bold rounded hover:bg-emerald-900/30 hover:border-emerald-500 hover:text-white transition-all active:scale-95 shadow-lg">0</button>
                     <button 
                        onClick={handleSubmit} 
                        disabled={input.length !== 5 || processing}
                        className={`h-16 rounded font-bold transition-all shadow-lg flex items-center justify-center gap-2
                             ${input.length === 5 
                                ? 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                                : 'bg-emerald-900/10 border border-emerald-900/30 text-emerald-700 cursor-not-allowed'}
                        `}
                     >
                        <Lock size={20} />
                     </button>
                 </div>

                 <div className="mt-8 text-emerald-800/60 text-xs flex items-center gap-2 shrink-0">
                     <Coins size={12} /> Cost per attempt: 25 Credits
                 </div>
            </div>

            {/* RIGHT: Feed / History */}
            <div className="w-full md:w-96 bg-[#05080a] border-l border-emerald-900/30 flex flex-col z-20 h-1/3 md:h-auto border-t md:border-t-0 border-emerald-900/30">
                <div className="p-4 border-b border-emerald-900/30 bg-emerald-900/5 flex items-center justify-between shrink-0">
                     <h3 className="text-emerald-500 font-bold flex items-center gap-2">
                         <History size={16} /> Access Log
                     </h3>
                     <div className="text-[10px] text-emerald-700 uppercase">Live Feed</div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {vaultState.lastWinner && (
                        <div className="p-3 bg-yellow-900/10 border border-yellow-700/30 rounded mb-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Crown size={14} className="text-yellow-500" />
                                <span className="text-yellow-500 text-xs font-bold uppercase">Last Crack</span>
                            </div>
                            <div className="text-yellow-100 text-sm">
                                <span className="font-bold">{vaultState.lastWinner.username}</span> found <span className="font-mono">{vaultState.lastWinner.code}</span>
                            </div>
                            <div className="text-yellow-500/60 text-xs mt-1">Won {vaultState.lastWinner.amount} Credits</div>
                        </div>
                    )}

                    {vaultState.history.map((entry, i) => (
                        <div key={i} className="p-3 bg-emerald-900/10 border border-emerald-900/20 rounded flex items-center justify-between">
                            <div>
                                <div className="text-emerald-300 text-sm font-bold">{entry.username}</div>
                                <div className="text-emerald-700 text-xs font-mono mt-0.5 tracking-wider">{entry.guess}</div>
                            </div>
                            <div className="flex gap-1.5">
                                {/* Visual Dots for Feedback */}
                                {Array.from({length: 5}).map((_, dotIdx) => {
                                    let colorClass = "bg-emerald-900/40"; // Wrong
                                    // Logic for dots: display 'matches' green dots, then 'partial' yellow dots
                                    if (dotIdx < entry.matches) colorClass = "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]";
                                    else if (dotIdx < entry.matches + entry.partial) colorClass = "bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.8)]";
                                    
                                    return <div key={dotIdx} className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                                })}
                            </div>
                        </div>
                    ))}
                    
                    {vaultState.history.length === 0 && (
                        <div className="text-center text-emerald-900/40 text-sm py-10 italic">
                            No recent attempts. Be the first.
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-emerald-900/30 text-[10px] text-emerald-800 space-y-1 shrink-0">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Correct Number & Position</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Correct Number, Wrong Position</div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TheVault;
