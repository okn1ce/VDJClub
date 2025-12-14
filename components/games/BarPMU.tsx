import React, { useState, useEffect } from 'react';
import { ArrowLeft, Beer, Coins, Trophy, Plus, Check, Crown, AlertTriangle, X } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { BettingEvent } from '../../types';

const BarPMU: React.FC = () => {
  const { setView, setActiveGameId, user, bettingEvents, bets, createBettingEvent, placeBet, resolveBettingEvent } = useGame();
  
  // --- Admin Creation State ---
  const [showCreate, setShowCreate] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['Yes', 'No']);

  // --- Betting State ---
  const [betAmount, setBetAmount] = useState<Record<string, string>>({}); // keyed by eventId

  // --- UI States for Sandbox Compatibility (No native alerts/confirms) ---
  const [notification, setNotification] = useState<{msg: string, type: 'error' | 'success'} | null>(null);
  const [resolutionConfirm, setResolutionConfirm] = useState<{eventId: string, optionId: string, optionText: string} | null>(null);

  // --- Helper Functions ---
  const showNotification = (msg: string, type: 'error' | 'success' = 'error') => {
      setNotification({ msg, type });
      setTimeout(() => setNotification(null), 3000);
  };

  const handleAddOption = () => setNewOptions([...newOptions, '']);
  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...newOptions];
    updated[idx] = val;
    setNewOptions(updated);
  };
  const handleCreateEvent = () => {
      if(!newQuestion || newOptions.some(o => !o.trim())) return;
      createBettingEvent(newQuestion, newOptions);
      setShowCreate(false);
      setNewQuestion('');
      setNewOptions(['Yes', 'No']);
      showNotification("Event created successfully!", 'success');
  };

  const handleBet = (eventId: string, optionId: string) => {
      const amount = parseInt(betAmount[eventId] || '0');
      if (amount <= 0) {
          showNotification("Please enter a valid amount.");
          return;
      }
      if (user && user.credits < amount) {
          showNotification("Not enough credits!");
          return;
      }
      
      const success = placeBet(eventId, optionId, amount);
      if(success) {
          setBetAmount({ ...betAmount, [eventId]: '' });
          showNotification(`Bet placed: ${amount} credits`, 'success');
      }
  };

  const handleResolveConfirm = () => {
      if (resolutionConfirm) {
          resolveBettingEvent(resolutionConfirm.eventId, resolutionConfirm.optionId);
          setResolutionConfirm(null);
          showNotification("Event resolved!", 'success');
      }
  };

  // Sort events: Open first, then Resolved (recent first)
  const sortedEvents = [...bettingEvents].sort((a, b) => {
      if (a.status === 'OPEN' && b.status === 'RESOLVED') return -1;
      if (a.status === 'RESOLVED' && b.status === 'OPEN') return 1;
      return b.createdAt - a.createdAt;
  });

  return (
    <div className="flex h-screen w-full bg-[#1a0f0a] overflow-hidden relative font-sans">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")' }}></div>

        {/* Top Nav */}
        <div className="absolute top-6 left-6 z-50 flex items-center gap-2">
            <button 
                onClick={() => { setView('HOME'); setActiveGameId(null); }}
                className="bg-black/50 hover:bg-black/70 text-amber-100 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all border border-amber-900/50"
            >
                <ArrowLeft size={18} /> Leave Bar
            </button>
        </div>

        {/* Notification Toast */}
        {notification && (
            <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-xl shadow-xl font-bold border animate-fade-in ${
                notification.type === 'error' ? 'bg-red-900/90 text-red-200 border-red-700' : 'bg-emerald-900/90 text-emerald-200 border-emerald-700'
            }`}>
                {notification.msg}
            </div>
        )}

        {/* Custom Confirmation Modal */}
        {resolutionConfirm && (
            <div className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#2a1a12] border border-amber-600/50 p-8 rounded-2xl max-w-md w-full shadow-2xl relative">
                    <h3 className="text-2xl font-black text-amber-100 mb-2">Confirm Winner</h3>
                    <p className="text-amber-200/70 mb-6">
                        Are you sure you want to declare <span className="text-amber-500 font-bold">"{resolutionConfirm.optionText}"</span> as the winner?
                        <br/><br/>
                        <span className="text-sm text-red-400 flex items-center gap-1"><AlertTriangle size={14}/> This will pay out winners immediately and cannot be undone.</span>
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button 
                            onClick={() => setResolutionConfirm(null)}
                            className="px-4 py-2 text-amber-200 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleResolveConfirm}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg"
                        >
                            Confirm Winner
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="w-full max-w-5xl mx-auto p-6 pt-24 h-full flex flex-col relative z-10">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-amber-600/20 rounded-full border-2 border-amber-600/50 text-amber-500">
                        <Beer size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-amber-500 drop-shadow-lg tracking-tight uppercase">Le Bar PMU</h1>
                        <p className="text-amber-800/60 font-medium">Bet on scenarios. Double your money if you win!</p>
                    </div>
                </div>
                
                {user?.role === 'admin' && (
                    <button 
                        onClick={() => setShowCreate(!showCreate)}
                        className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-amber-600/20"
                    >
                        <Plus size={20} /> Create Event
                    </button>
                )}
            </header>

            {/* Creation Form */}
            {showCreate && (
                <div className="bg-[#2a1a12] border border-amber-900/50 p-6 rounded-2xl mb-8 animate-fade-in shadow-xl">
                    <h3 className="text-amber-100 font-bold mb-4">Create New Scenario</h3>
                    <input 
                        className="w-full bg-black/30 border border-amber-900/30 rounded-lg p-3 text-amber-100 mb-4 focus:border-amber-500 outline-none" 
                        placeholder="What are we betting on? (e.g. Will it rain tomorrow?)"
                        value={newQuestion}
                        onChange={e => setNewQuestion(e.target.value)}
                    />
                    <div className="space-y-2 mb-4">
                        {newOptions.map((opt, idx) => (
                            <input 
                                key={idx}
                                className="w-full bg-black/30 border border-amber-900/30 rounded-lg p-2 text-amber-100 text-sm focus:border-amber-500 outline-none" 
                                placeholder={`Option ${idx + 1}`}
                                value={opt}
                                onChange={e => handleOptionChange(idx, e.target.value)}
                            />
                        ))}
                        <button onClick={handleAddOption} className="text-xs text-amber-500 hover:text-amber-400 font-bold uppercase tracking-wide flex items-center gap-1">
                            <Plus size={12} /> Add Option
                        </button>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-amber-800 hover:text-amber-700">Cancel</button>
                        <button onClick={handleCreateEvent} className="px-6 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-500">Post Scenario</button>
                    </div>
                </div>
            )}

            {/* Events List */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {sortedEvents.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <Beer size={64} className="mx-auto text-amber-900 mb-4" />
                        <p className="text-amber-900 text-xl font-bold">No bets active right now.</p>
                    </div>
                ) : (
                    sortedEvents.map(event => {
                        const isResolved = event.status === 'RESOLVED';
                        const myBets = bets.filter(b => b.eventId === event.id && b.userId === user?.username);
                        const myTotalBet = myBets.reduce((sum, b) => sum + b.amount, 0);

                        return (
                            <div key={event.id} className={`relative p-6 rounded-2xl border-2 transition-all ${
                                isResolved 
                                ? 'bg-[#2a1a12]/50 border-amber-900/30 grayscale-[0.3]' 
                                : 'bg-[#2a1a12] border-amber-700 shadow-[0_0_30px_rgba(217,119,6,0.1)]'
                            }`}>
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-xl md:text-2xl font-bold text-amber-100">{event.question}</h3>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-2 text-amber-500 font-mono font-bold bg-black/40 px-3 py-1 rounded-lg border border-amber-900/50">
                                            <Coins size={16} /> Max Payout: 2x
                                        </div>
                                        {myTotalBet > 0 && (
                                            <span className="text-xs text-amber-500/70 mt-1">You bet: {myTotalBet}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {event.options.map(opt => {
                                        const isWinner = event.winnerOptionId === opt.id;
                                        const totalBetsOnOption = bets.filter(b => b.eventId === event.id && b.optionId === opt.id).length;

                                        return (
                                            <div key={opt.id} className={`relative p-4 rounded-xl border-2 transition-all ${
                                                isWinner 
                                                    ? 'bg-emerald-900/30 border-emerald-500' 
                                                    : 'bg-black/20 border-amber-900/30'
                                            }`}>
                                                
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className={`font-bold ${isWinner ? 'text-emerald-400' : 'text-amber-100'}`}>
                                                        {opt.text}
                                                    </span>
                                                    {isResolved ? (
                                                        isWinner && <Crown size={20} className="text-emerald-500" />
                                                    ) : (
                                                        <span className="text-xs text-amber-500 font-mono flex items-center gap-1">
                                                            {totalBetsOnOption} Bets
                                                        </span>
                                                    )}
                                                </div>

                                                {!isResolved && (
                                                    <div className="flex gap-2 mt-3">
                                                        <input 
                                                            type="number" 
                                                            placeholder="Amount"
                                                            className="flex-1 bg-black/40 border border-amber-900/30 rounded px-2 text-amber-100 text-sm focus:border-amber-500 outline-none w-20"
                                                            value={betAmount[event.id] || ''}
                                                            onChange={e => setBetAmount({ ...betAmount, [event.id]: e.target.value })}
                                                        />
                                                        <button 
                                                            onClick={() => handleBet(event.id, opt.id)}
                                                            className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded transition-colors"
                                                        >
                                                            BET
                                                        </button>
                                                    </div>
                                                )}
                                                
                                                {/* Admin Resolve Button */}
                                                {user?.role === 'admin' && !isResolved && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Set state instead of using window.confirm
                                                            setResolutionConfirm({ eventId: event.id, optionId: opt.id, optionText: opt.text });
                                                        }}
                                                        className="mt-2 w-full py-1 text-[10px] uppercase font-bold text-amber-800 hover:text-emerald-500 hover:bg-emerald-900/20 rounded border border-transparent hover:border-emerald-900/50 transition-all"
                                                    >
                                                        Mark as Winner
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    </div>
  );
};

export default BarPMU;
