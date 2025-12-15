
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Coins, MousePointer2, Clock, Factory, Settings, Plus, Trash2, Edit2, Save, X, AlertTriangle, Briefcase, TrendingUp, Sparkles, Trophy, User } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { ICON_MAP } from '../../constants';
import { UpgradeType } from '../../types';

// Game Configuration
const EXCHANGE_RATE = 100000; // 100000 Abdous = 1 Credit
const ABDOU_IMAGE = "https://i.ibb.co/rR1rgc2c/image-1.png";
const PRESTIGE_THRESHOLD = 5000000; // 5 Million to get first share (Harder)
const PRESTIGE_BASE = 5000000; // Divisor for share calculation
const SHARE_BONUS = 0.05; // 5% per share

const AbdouClicker: React.FC = () => {
  const { activeGameId, setView, setActiveGameId, earnCredits, user, allUsers, clickerUpgrades, saveClickerProgress, adminAddUpgrade, adminUpdateUpgrade, adminDeleteUpgrade, games } = useGame();
  
  // --- Game State ---
  const [abdous, setAbdous] = useState(0); 
  const [shares, setShares] = useState(0); // Prestige Currency
  const [lifetimeAbdous, setLifetimeAbdous] = useState(0);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  
  // Derived State
  const [clickPower, setClickPower] = useState(1);
  const [autoPerSec, setAutoPerSec] = useState(0);

  // --- Visuals ---
  const [scale, setScale] = useState(1);
  const [floatingTexts, setFloatingTexts] = useState<{id: number, x: number, y: number, text: string}[]>([]);
  const [activeTab, setActiveTab] = useState<'upgrades' | 'leaderboard'>('upgrades');
  
  // --- Events ---
  const [goldenAbdou, setGoldenAbdou] = useState<{x: number, y: number, id: number} | null>(null);
  const [frenzyMode, setFrenzyMode] = useState(false);
  const [frenzyTimer, setFrenzyTimer] = useState(0);

  // --- Admin State ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUpgrade, setEditingUpgrade] = useState<Partial<UpgradeType> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);

  // --- Notification State ---
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error' | 'gold'} | null>(null);
  
  const game = games.find(g => g.id === activeGameId);
  const saveIntervalRef = useRef<number | null>(null);

  // --- 1. Initialization (Load from Persistence) ---
  useEffect(() => {
    if (user?.abdouClickerState) {
        setAbdous(user.abdouClickerState.savedAbdous || 0);
        setShares(user.abdouClickerState.shares || 0);
        setLifetimeAbdous(user.abdouClickerState.lifetimeAbdous || 0);
        setInventory(user.abdouClickerState.inventory || {});
    } else {
        const initialInv: Record<string, number> = {};
        clickerUpgrades.forEach(u => initialInv[u.id] = 0);
        setInventory(initialInv);
    }
  }, [user?.username]); 

  // --- 2. Calculate Stats (Power & Auto) ---
  useEffect(() => {
      let cPower = 1;
      let aPower = 0;

      clickerUpgrades.forEach(u => {
          const count = inventory[u.id] || 0;
          if (count > 0) {
              if (u.type === 'click') cPower += (u.basePower * count);
              else aPower += (u.basePower * count);
          }
      });

      // Apply Prestige Multiplier (Shares)
      // New: Each Share = +5% (Harder)
      const multiplier = 1 + (shares * SHARE_BONUS);
      
      setClickPower(Math.floor(cPower * multiplier));
      setAutoPerSec(Math.floor(aPower * multiplier));

  }, [inventory, clickerUpgrades, shares]);

  // --- 3. Game Loop ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoPerSec > 0) {
          const finalAuto = frenzyMode ? autoPerSec * 7 : autoPerSec;
          
          setAbdous(prev => prev + finalAuto);
          setLifetimeAbdous(prev => prev + finalAuto);
      }

      if (frenzyMode) {
          setFrenzyTimer(prev => {
              if (prev <= 1) {
                  setFrenzyMode(false);
                  return 0;
              }
              return prev - 1;
          });
      }

      if (!goldenAbdou && !frenzyMode && Math.random() < 0.05) {
          setGoldenAbdou({
              id: Date.now(),
              x: 10 + Math.random() * 80, 
              y: 10 + Math.random() * 80
          });
      }

    }, 1000);

    saveIntervalRef.current = window.setInterval(() => {
        saveClickerProgress(abdous, inventory, shares, lifetimeAbdous);
    }, 10000);

    return () => {
        clearInterval(interval);
        if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, [autoPerSec, frenzyMode, goldenAbdou, abdous, inventory, shares, lifetimeAbdous]);

  // Save on Unmount
  useEffect(() => {
      return () => {
          saveClickerProgress(abdous, inventory, shares, lifetimeAbdous);
      };
  }, [abdous, inventory, shares, lifetimeAbdous]);

  if (!game) return <div className="text-white">Game not found</div>;

  const showNotification = (msg: string, type: 'success' | 'error' | 'gold' = 'success') => {
      setNotification({ msg, type });
      setTimeout(() => setNotification(null), 3000);
  };

  // --- Mechanics ---
  const calculateCost = (baseCost: number, quantity: number) => {
    // Increased difficulty: Exponent 1.15 -> 1.25
    return Math.floor(baseCost * Math.pow(1.25, quantity));
  };

  const handleBuyUpgrade = (upgrade: UpgradeType) => {
    const currentQty = inventory[upgrade.id] || 0;
    const cost = calculateCost(upgrade.baseCost, currentQty);

    if (abdous >= cost) {
      setAbdous(prev => prev - cost);
      setInventory(prev => ({ ...prev, [upgrade.id]: currentQty + 1 }));
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const amount = frenzyMode ? clickPower * 7 : clickPower;
    
    setAbdous(prev => prev + amount);
    setLifetimeAbdous(prev => prev + amount);
    
    setScale(0.95);
    setTimeout(() => setScale(1), 100);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + (Math.random() * 40 - 20); 
    const y = e.clientY - rect.top + (Math.random() * 40 - 20);
    
    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, x, y, text: `+${amount}` }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 1000);
  };

  const handleGoldenClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setGoldenAbdou(null);
      setFrenzyMode(true);
      setFrenzyTimer(20); // 20 seconds
      showNotification("STONKS MODE ACTIVATED! (x7 Production)", "gold");
  };

  const handleCashOut = () => {
    const creditsToEarn = Math.floor(abdous / EXCHANGE_RATE);
    if (creditsToEarn > 0) {
        earnCredits(creditsToEarn);
        setAbdous(prev => prev - (creditsToEarn * EXCHANGE_RATE));
        showNotification(`Cashed out ${creditsToEarn} Credits!`, 'success');
        saveClickerProgress(abdous - (creditsToEarn * EXCHANGE_RATE), inventory, shares, lifetimeAbdous);
    } else {
        showNotification(`Need ${EXCHANGE_RATE.toLocaleString()} Abdous for 1 Credit`, 'error');
    }
  };

  const calculatePendingShares = () => {
      // New Harder Formula: Sqrt(Lifetime / 5,000,000)
      const potentialShares = Math.floor(Math.sqrt(lifetimeAbdous / PRESTIGE_BASE));
      return Math.max(0, potentialShares - shares);
  };

  const pendingShares = calculatePendingShares();

  const handlePrestige = () => {
      if (pendingShares <= 0) {
          showNotification("Need more lifetime earnings to gain shares!", 'error');
          return;
      }

      setShares(prev => prev + pendingShares);
      setAbdous(0);
      setInventory({}); 
      showNotification(`Corporate Takeover Complete! +${Math.round(pendingShares * SHARE_BONUS * 100)}% Bonus!`, 'gold');
      setShowPrestigeModal(false);
      saveClickerProgress(0, {}, shares + pendingShares, lifetimeAbdous);
  };

  // --- Admin Handlers ---
  const handleSaveUpgrade = () => {
    if (!editingUpgrade || !editingUpgrade.name || !editingUpgrade.baseCost) return;
    
    const finalUpgrade = {
      id: editingUpgrade.id || Date.now().toString(),
      name: editingUpgrade.name,
      type: editingUpgrade.type || 'click',
      baseCost: Number(editingUpgrade.baseCost),
      basePower: Number(editingUpgrade.basePower) || 1,
      icon: editingUpgrade.icon || 'Star',
      color: editingUpgrade.color || 'text-white'
    } as UpgradeType;

    if (editingUpgrade.id) {
      adminUpdateUpgrade(finalUpgrade);
    } else {
      adminAddUpgrade(finalUpgrade);
    }
    setEditingUpgrade(null);
  };

  const handleDeleteUpgrade = () => {
      if(deleteConfirmId) {
          adminDeleteUpgrade(deleteConfirmId);
          setDeleteConfirmId(null);
      }
  };

  const AVAILABLE_ICONS = ['MousePointer2', 'Zap', 'Users', 'Factory', 'TrendingUp', 'Star', 'Ghost', 'Sword', 'Crown'];
  const AVAILABLE_COLORS = ['text-blue-400', 'text-yellow-400', 'text-purple-400', 'text-orange-400', 'text-emerald-400', 'text-red-400', 'text-pink-400'];

  // --- Leaderboard Data ---
  const clickerLeaderboard = allUsers
      .filter(u => u.role !== 'admin') // Remove admins from leaderboard
      .map(u => ({
          username: u.username,
          avatar: u.equipped.avatar,
          lifetime: u.abdouClickerState?.lifetimeAbdous || 0,
          shares: u.abdouClickerState?.shares || 0
      }))
      .sort((a, b) => b.lifetime - a.lifetime)
      .slice(0, 50); // Top 50

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden relative">
        {/* Top Controls */}
        <div className="absolute top-6 left-6 z-50 flex items-center gap-2">
            <button 
                onClick={() => { setView('HOME'); setActiveGameId(null); saveClickerProgress(abdous, inventory, shares, lifetimeAbdous); }}
                className="bg-slate-900/50 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all"
            >
                <ArrowLeft size={18} /> Exit & Save
            </button>
            
            {user?.role === 'admin' && (
              <button 
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`px-3 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all ${isEditMode ? 'bg-indigo-600 text-white' : 'bg-slate-900/50 text-slate-400 hover:text-white'}`}
              >
                  <Settings size={18} /> {isEditMode ? 'Editing' : 'Edit Game'}
              </button>
            )}
        </div>

        {/* Notifications */}
        {notification && (
            <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-2 rounded-full shadow-lg font-bold border animate-fade-in ${
                notification.type === 'error' ? 'bg-red-900/90 text-red-200 border-red-700' :
                notification.type === 'gold' ? 'bg-yellow-600 text-white border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 
                'bg-emerald-900/90 text-emerald-200 border-emerald-700'
            }`}>
                {notification.msg}
            </div>
        )}

        {/* Frenzy Indicator */}
        {frenzyMode && (
             <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[55] pointer-events-none">
                 <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-500 animate-pulse drop-shadow-xl italic">
                     STONKS MODE: {frenzyTimer}s
                 </div>
             </div>
        )}

        <div className="flex w-full h-full">
            
            {/* LEFT: Game Zone */}
            <div className="w-full lg:w-7/12 flex flex-col items-center justify-center p-4 gap-8 relative overflow-y-auto">
                
                {/* Stats Header */}
                <div className="text-center mt-12 z-10 shrink-0">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Balance</span>
                      <div className="text-5xl font-black text-white drop-shadow-lg tabular-nums">
                        {Math.floor(abdous).toLocaleString()} <span className="text-2xl text-indigo-400">Abdous</span>
                      </div>
                      {shares > 0 && (
                          <div className="text-yellow-500 text-xs font-bold mt-2 flex items-center justify-center gap-1">
                              <Briefcase size={12} /> {shares} Corporate Shares (+{Math.round(shares * SHARE_BONUS * 100)}% Bonus)
                          </div>
                      )}
                </div>

                <div className="flex gap-6 text-sm font-medium text-slate-400 bg-slate-900/50 px-6 py-2 rounded-full border border-slate-800 shrink-0">
                    <div className="flex items-center gap-2">
                        <MousePointer2 size={14} className="text-blue-400" />
                        <span>{frenzyMode ? clickPower * 7 : clickPower} / click</span>
                    </div>
                    <div className="w-px h-4 bg-slate-700"></div>
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-yellow-400" />
                        <span>{frenzyMode ? autoPerSec * 7 : autoPerSec} / sec</span>
                    </div>
                </div>

                {/* The Clicker */}
                <div className="relative shrink-0 w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                    <div className={`absolute inset-0 rounded-full blur-[80px] animate-pulse transition-colors duration-500 ${frenzyMode ? 'bg-yellow-500/40' : 'bg-indigo-500/20'}`}></div>
                    
                    <button 
                        onMouseDown={handleClick}
                        className={`relative z-10 w-full h-full rounded-full shadow-2xl transition-transform cursor-pointer hover:shadow-[0_0_60px_rgba(99,102,241,0.4)] border-8 bg-slate-800 overflow-hidden group select-none outline-none active:scale-95
                           ${frenzyMode ? 'border-yellow-500 shadow-[0_0_80px_rgba(234,179,8,0.5)]' : 'border-indigo-500/10'}
                        `}
                        style={{ transform: `scale(${scale})` }}
                    >
                        <img 
                            src={ABDOU_IMAGE}
                            alt="Click Target" 
                            className="w-full h-full object-cover pointer-events-none group-hover:scale-110 transition-transform duration-500"
                        />
                        
                        {floatingTexts.map(ft => (
                            <div 
                                key={ft.id}
                                className="absolute pointer-events-none text-3xl font-black text-white text-stroke-2 animate-[floatUp_0.8s_ease-out_forwards]"
                                style={{ left: ft.x, top: ft.y }}
                            >
                                +{ft.text}
                            </div>
                        ))}
                    </button>

                    {/* Golden Abdou Spawn */}
                    {goldenAbdou && (
                        <button 
                            onClick={handleGoldenClick}
                            className="absolute z-20 w-16 h-16 rounded-full bg-yellow-400 shadow-[0_0_30px_rgba(250,204,21,1)] animate-bounce border-4 border-white overflow-hidden cursor-pointer hover:scale-110 transition-transform"
                            style={{ left: `${goldenAbdou.x}%`, top: `${goldenAbdou.y}%` }}
                        >
                            <img src={ABDOU_IMAGE} className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 bg-yellow-500/30"></div>
                        </button>
                    )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-auto mb-4 w-full max-w-md shrink-0 flex flex-col gap-3">
                    
                    {/* Prestige Button */}
                    {(lifetimeAbdous > PRESTIGE_THRESHOLD / 2 || shares > 0) && (
                        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 flex items-center justify-between">
                            <div>
                                <div className="text-xs text-slate-400 uppercase font-bold flex items-center gap-1">
                                    <Briefcase size={12} className="text-blue-400"/> Corporate Takeover
                                </div>
                                <div className="text-xs text-slate-500">
                                    Lifetime: {Math.floor(lifetimeAbdous).toLocaleString()}
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowPrestigeModal(true)}
                                className={`px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2
                                    ${pendingShares > 0 ? 'bg-blue-600 hover:bg-blue-500 text-white animate-pulse' : 'bg-slate-800 text-slate-500'}
                                `}
                            >
                                {pendingShares > 0 ? `Claim ${pendingShares} Shares` : 'No Shares Pending'}
                            </button>
                        </div>
                    )}

                    {/* Cash Out */}
                    <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-center mb-4 text-sm text-slate-400">
                            <span>Exchange Rate</span>
                            <span className="font-mono text-emerald-400">{EXCHANGE_RATE.toLocaleString()} Abdous = 1 Credit</span>
                        </div>
                        <button 
                            onClick={handleCashOut}
                            disabled={abdous < EXCHANGE_RATE}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                                ${abdous >= EXCHANGE_RATE 
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                            `}
                        >
                            <Coins size={18} />
                            Cash Out {Math.floor(abdous / EXCHANGE_RATE)} Credits
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT: Panel (Upgrades & Leaderboard) */}
            <div className="hidden lg:flex w-5/12 bg-slate-900 border-l border-slate-800 flex-col relative">
                
                {/* Panel Tab Nav */}
                <div className="flex border-b border-slate-800">
                    <button 
                        onClick={() => setActiveTab('upgrades')}
                        className={`flex-1 py-4 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:bg-slate-800/50 transition-colors ${activeTab === 'upgrades' ? 'bg-slate-800 text-white border-b-2 border-indigo-500' : 'text-slate-500'}`}
                    >
                        <Factory size={16} /> Upgrades
                    </button>
                    <button 
                        onClick={() => setActiveTab('leaderboard')}
                        className={`flex-1 py-4 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:bg-slate-800/50 transition-colors ${activeTab === 'leaderboard' ? 'bg-slate-800 text-white border-b-2 border-yellow-500' : 'text-slate-500'}`}
                    >
                        <Trophy size={16} /> Leaderboard
                    </button>
                </div>

                {/* --- UPGRADES TAB --- */}
                {activeTab === 'upgrades' && (
                    <div className="flex-1 flex flex-col">
                        <div className="p-6 border-b border-slate-800 bg-slate-900/50 z-10 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Factory className="text-indigo-400" /> Production
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Spend Abdous to earn faster.</p>
                            </div>
                            {isEditMode && (
                                <button 
                                    onClick={() => setEditingUpgrade({ name: 'New Upgrade', type: 'click', baseCost: 100, basePower: 5, icon: 'Star', color: 'text-white' })}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg"
                                    title="Add Upgrade"
                                >
                                    <Plus size={20} />
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {clickerUpgrades.map((upgrade) => {
                                const quantity = inventory[upgrade.id] || 0;
                                const cost = calculateCost(upgrade.baseCost, quantity);
                                const canAfford = abdous >= cost;
                                const Icon = ICON_MAP[upgrade.icon] || ICON_MAP['Star'];

                                return (
                                    <div key={upgrade.id} className="relative group">
                                    <button
                                        onClick={() => !isEditMode && handleBuyUpgrade(upgrade)}
                                        disabled={!isEditMode && !canAfford}
                                        className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all text-left relative overflow-hidden
                                            ${!isEditMode && canAfford 
                                                ? 'bg-slate-800 border-slate-700 hover:border-indigo-500 hover:bg-slate-750' 
                                                : 'bg-slate-900 border-slate-800 opacity-80'}
                                            ${isEditMode ? 'opacity-100 cursor-default border-dashed border-slate-600' : ''}
                                        `}
                                    >
                                        <div className={`p-3 rounded-lg bg-slate-950 ${upgrade.color}`}>
                                            <Icon size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-white">{upgrade.name}</span>
                                                {!isEditMode && (
                                                    <span className="text-xs font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-400">
                                                        Lvl {quantity}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                {upgrade.type === 'click' ? '+' : '+'}
                                                <span className="text-white font-medium">{upgrade.basePower}</span>
                                                {upgrade.type === 'click' ? 'click power' : ' / sec'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`font-mono font-bold ${canAfford || isEditMode ? 'text-indigo-300' : 'text-slate-500'}`}>
                                                {cost.toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-slate-500 uppercase">Abdous</span>
                                        </div>
                                    </button>
                                    
                                    {isEditMode && (
                                        <div className="absolute right-2 top-2 flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setEditingUpgrade(upgrade); }} className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-500"><Edit2 size={14} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(upgrade.id); }} className="p-1.5 bg-red-600 text-white rounded hover:bg-red-500"><Trash2 size={14} /></button>
                                        </div>
                                    )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- LEADERBOARD TAB --- */}
                {activeTab === 'leaderboard' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Trophy className="text-yellow-400" /> Empire Rankings
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">Top producers by Lifetime Abdous.</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs font-bold text-slate-500 uppercase border-b border-slate-800">
                                        <th className="pb-3 pl-2">#</th>
                                        <th className="pb-3">Player</th>
                                        <th className="pb-3 text-right">Lifetime</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {clickerLeaderboard.map((u, index) => {
                                        const isMe = u.username === user?.username;
                                        return (
                                            <tr key={u.username} className={`border-b border-slate-800/50 ${isMe ? 'bg-indigo-900/20' : ''}`}>
                                                <td className="py-3 pl-2 font-mono text-slate-500 w-8">{index + 1}</td>
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded bg-slate-800 overflow-hidden">
                                                            {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <User size={16} className="text-slate-500 m-auto mt-1" />}
                                                        </div>
                                                        <span className={isMe ? 'text-indigo-300 font-bold' : 'text-slate-300'}>{u.username}</span>
                                                        {u.shares > 0 && <span className="text-[10px] bg-yellow-900/30 text-yellow-500 px-1 rounded border border-yellow-700/30 flex items-center gap-0.5"><Briefcase size={8} />{u.shares}</span>}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-right font-mono text-slate-300">
                                                    {Math.floor(u.lifetime).toLocaleString()}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Editor Modal Overlay */}
                {editingUpgrade && (
                  <div className="absolute inset-0 bg-slate-950/90 z-50 p-6 flex flex-col gap-4 overflow-y-auto">
                      <h3 className="text-white font-bold text-lg">Edit Upgrade</h3>
                      {/* ... Editor Form Fields (Same as before) ... */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-slate-400 uppercase">Name</label>
                          <input className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white" value={editingUpgrade.name} onChange={e => setEditingUpgrade({...editingUpgrade, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs text-slate-400 uppercase">Type</label>
                              <select className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white" value={editingUpgrade.type} onChange={e => setEditingUpgrade({...editingUpgrade, type: e.target.value as any})}>
                                <option value="click">Click</option>
                                <option value="auto">Auto</option>
                              </select>
                           </div>
                           <div>
                              <label className="text-xs text-slate-400 uppercase">Base Cost</label>
                              <input type="number" className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white" value={editingUpgrade.baseCost} onChange={e => setEditingUpgrade({...editingUpgrade, baseCost: Number(e.target.value)})} />
                           </div>
                           <div>
                              <label className="text-xs text-slate-400 uppercase">Power</label>
                              <input type="number" className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white" value={editingUpgrade.basePower} onChange={e => setEditingUpgrade({...editingUpgrade, basePower: Number(e.target.value)})} />
                           </div>
                        </div>
                        <div>
                           <label className="text-xs text-slate-400 uppercase mb-2 block">Icon</label>
                           <div className="flex flex-wrap gap-2">
                              {AVAILABLE_ICONS.map(icon => (
                                <button key={icon} onClick={() => setEditingUpgrade({...editingUpgrade, icon})} className={`p-2 rounded border ${editingUpgrade.icon === icon ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-slate-700'}`}>
                                   {React.createElement(ICON_MAP[icon], { size: 16, className: 'text-white' })}
                                </button>
                              ))}
                           </div>
                        </div>
                        <div>
                           <label className="text-xs text-slate-400 uppercase mb-2 block">Color</label>
                           <div className="flex flex-wrap gap-2">
                              {AVAILABLE_COLORS.map(color => (
                                <button key={color} onClick={() => setEditingUpgrade({...editingUpgrade, color})} className={`w-6 h-6 rounded-full border-2 ${color.replace('text', 'bg')} ${editingUpgrade.color === color ? 'border-white' : 'border-transparent'}`} />
                              ))}
                           </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button onClick={handleSaveUpgrade} className="flex-1 bg-emerald-600 text-white py-2 rounded font-bold flex items-center justify-center gap-2"><Save size={16}/> Save</button>
                        <button onClick={() => setEditingUpgrade(null)} className="flex-1 bg-slate-700 text-white py-2 rounded font-bold flex items-center justify-center gap-2"><X size={16}/> Cancel</button>
                      </div>
                  </div>
                )}
                
                {/* Prestige Modal */}
                {showPrestigeModal && (
                    <div className="absolute inset-0 bg-slate-950/95 z-40 p-8 flex flex-col items-center justify-center text-center">
                         <Briefcase size={64} className="text-blue-400 mb-6" />
                         <h2 className="text-3xl font-black text-white mb-2">Corporate Takeover</h2>
                         <p className="text-slate-400 max-w-sm mb-6">
                             Sell your current empire. You will lose all Upgrades and current Abdous.
                             <br/><br/>
                             You will gain <span className="text-blue-400 font-bold text-xl">{pendingShares} Shares</span>.
                             <br/>
                             Current Bonus: <span className="text-emerald-400">{Math.round(shares * SHARE_BONUS * 100)}%</span>
                             <br/>
                             New Bonus: <span className="text-emerald-400">{Math.round((shares + pendingShares) * SHARE_BONUS * 100)}%</span>
                         </p>
                         <div className="flex gap-4">
                             <button onClick={() => setShowPrestigeModal(false)} className="px-6 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white">Cancel</button>
                             <button onClick={handlePrestige} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20">Sign The Papers</button>
                         </div>
                    </div>
                )}
            </div>
        </div>

        {/* CSS for animations */}
        <style>{`
            @keyframes floatUp {
                0% { opacity: 1; transform: translateY(0) scale(1); }
                100% { opacity: 0; transform: translateY(-80px) scale(1.2); }
            }
            .text-stroke-2 {
                -webkit-text-stroke: 1px black;
                text-shadow: 2px 2px 0 #000;
            }
        `}</style>
    </div>
  );
};

export default AbdouClicker;
