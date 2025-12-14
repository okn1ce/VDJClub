import React, { useState, useEffect } from 'react';
import { ArrowLeft, Coins, MousePointer2, Clock, Factory, Settings, Plus, Trash2, Edit2, Save, X, AlertTriangle } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { ICON_MAP } from '../../constants';
import { UpgradeType } from '../../types';

// Game Configuration
const EXCHANGE_RATE = 10000; // 10000 Abdous = 1 Credit
const ABDOU_IMAGE = "https://i.ibb.co/rR1rgc2c/image-1.png";

const AbdouClicker: React.FC = () => {
  const { activeGameId, setView, setActiveGameId, earnCredits, user, clickerUpgrades, adminAddUpgrade, adminUpdateUpgrade, adminDeleteUpgrade, games } = useGame();
  
  // --- Game State ---
  const [abdous, setAbdous] = useState(0); 
  const [clickPower, setClickPower] = useState(1);
  const [autoPerSec, setAutoPerSec] = useState(0);
  
  const [inventory, setInventory] = useState<Record<string, number>>({});

  // --- Visuals ---
  const [scale, setScale] = useState(1);
  const [floatingTexts, setFloatingTexts] = useState<{id: number, x: number, y: number, text: string}[]>([]);
  
  // --- Admin State ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUpgrade, setEditingUpgrade] = useState<Partial<UpgradeType> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // --- Notification State ---
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  const game = games.find(g => g.id === activeGameId);

  // --- Initialization ---
  useEffect(() => {
    setAbdous(0);
    setClickPower(1);
    setAutoPerSec(0);
    const initialInv: Record<string, number> = {};
    clickerUpgrades.forEach(u => initialInv[u.id] = 0);
    setInventory(initialInv);
  }, [activeGameId, clickerUpgrades]);

  // --- Game Loop ---
  useEffect(() => {
    if (autoPerSec === 0) return;
    const interval = setInterval(() => {
      setAbdous(prev => prev + autoPerSec);
    }, 1000);
    return () => clearInterval(interval);
  }, [autoPerSec]);

  if (!game) return <div className="text-white">Game not found</div>;

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
      setNotification({ msg, type });
      setTimeout(() => setNotification(null), 3000);
  };

  // --- Mechanics ---
  const calculateCost = (baseCost: number, quantity: number) => {
    return Math.floor(baseCost * Math.pow(1.15, quantity));
  };

  const handleBuyUpgrade = (upgrade: UpgradeType) => {
    const currentQty = inventory[upgrade.id] || 0;
    const cost = calculateCost(upgrade.baseCost, currentQty);

    if (abdous >= cost) {
      setAbdous(prev => prev - cost);
      setInventory(prev => ({ ...prev, [upgrade.id]: currentQty + 1 }));

      if (upgrade.type === 'click') {
        setClickPower(prev => prev + upgrade.basePower);
      } else {
        setAutoPerSec(prev => prev + upgrade.basePower);
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAbdous(prev => prev + clickPower);
    setScale(0.95);
    setTimeout(() => setScale(1), 100);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + (Math.random() * 40 - 20); 
    const y = e.clientY - rect.top + (Math.random() * 40 - 20);
    
    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, x, y, text: `+${clickPower}` }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 1000);
  };

  const handleCashOut = () => {
    const creditsToEarn = Math.floor(abdous / EXCHANGE_RATE);
    if (creditsToEarn > 0) {
        earnCredits(creditsToEarn);
        // Replace alert
        // alert(`Converted ${creditsToEarn * EXCHANGE_RATE} Abdous into ${creditsToEarn} Credits!`);
        showNotification(`Cashed out ${creditsToEarn} Credits!`, 'success');
        setTimeout(() => {
            setView('HOME');
            setActiveGameId(null);
        }, 1500);
    } else {
        // Replace alert
        // alert(`You need at least ${EXCHANGE_RATE} Abdous to cash out 1 Credit.`);
        showNotification(`Need ${EXCHANGE_RATE} Abdous for 1 Credit`, 'error');
    }
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

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden relative">
        {/* Top Controls */}
        <div className="absolute top-6 left-6 z-50 flex items-center gap-2">
            <button 
                onClick={() => { setView('HOME'); setActiveGameId(null); }}
                className="bg-slate-900/50 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all"
            >
                <ArrowLeft size={18} /> Exit
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
                notification.type === 'error' ? 'bg-red-900/90 text-red-200 border-red-700' : 'bg-emerald-900/90 text-emerald-200 border-emerald-700'
            }`}>
                {notification.msg}
            </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
            <div className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                 <div className="bg-slate-900 border border-red-500/50 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-2">Delete Upgrade?</h3>
                    <p className="text-slate-400 mb-6">This action cannot be undone.</p>
                    <div className="flex gap-3 justify-end">
                        <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                        <button onClick={handleDeleteUpgrade} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold">Delete</button>
                    </div>
                 </div>
            </div>
        )}

        <div className="flex w-full h-full">
            
            {/* LEFT: Game Zone (Fixed Layout) */}
            <div className="w-full lg:w-7/12 flex flex-col items-center justify-center p-4 gap-8 relative overflow-y-auto">
                
                {/* Stats Header (In Flow) */}
                <div className="text-center mt-12 z-10 shrink-0">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Balance</span>
                      <div className="text-5xl font-black text-white drop-shadow-lg tabular-nums">
                        {Math.floor(abdous).toLocaleString()} <span className="text-2xl text-indigo-400">Abdous</span>
                      </div>
                </div>

                <div className="flex gap-6 text-sm font-medium text-slate-400 bg-slate-900/50 px-6 py-2 rounded-full border border-slate-800 shrink-0">
                    <div className="flex items-center gap-2">
                        <MousePointer2 size={14} className="text-blue-400" />
                        <span>{clickPower} / click</span>
                    </div>
                    <div className="w-px h-4 bg-slate-700"></div>
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-yellow-400" />
                        <span>{autoPerSec} / sec</span>
                    </div>
                </div>

                {/* The Clicker */}
                <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[80px] animate-pulse"></div>
                    <button 
                        onMouseDown={handleClick}
                        className="relative z-10 w-64 h-64 md:w-80 md:h-80 rounded-full shadow-2xl transition-transform cursor-pointer hover:shadow-[0_0_60px_rgba(99,102,241,0.4)] border-8 border-indigo-500/10 bg-slate-800 overflow-hidden group select-none outline-none active:scale-95"
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
                </div>

                {/* Cash Out Section */}
                <div className="mt-auto mb-4 bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700 w-full max-w-md shrink-0">
                    <div className="flex justify-between items-center mb-4 text-sm text-slate-400">
                        <span>Exchange Rate</span>
                        <span className="font-mono text-emerald-400">{EXCHANGE_RATE} Abdous = 1 Credit</span>
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

            {/* RIGHT: Upgrade Shop */}
            <div className="hidden lg:flex w-5/12 bg-slate-900 border-l border-slate-800 flex-col relative">
                <div className="p-6 border-b border-slate-800 bg-slate-900/50 z-10 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          <Factory className="text-indigo-400" /> Upgrades
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

                {/* Editor Modal Overlay (Simple inline approach for now) */}
                {editingUpgrade && (
                  <div className="absolute inset-0 bg-slate-950/90 z-50 p-6 flex flex-col gap-4 overflow-y-auto">
                      <h3 className="text-white font-bold text-lg">Edit Upgrade</h3>
                      
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
                                          ? 'bg-slate-800 border-slate-700 hover:border-indigo-500 hover:bg-slate-700' 
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
                              
                              {/* Edit Controls Overlay */}
                              {isEditMode && (
                                <div className="absolute right-2 top-2 flex gap-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setEditingUpgrade(upgrade); }}
                                    className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-500"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        // Replace confirm
                                        setDeleteConfirmId(upgrade.id);
                                    }}
                                    className="p-1.5 bg-red-600 text-white rounded hover:bg-red-500"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                        );
                    })}
                </div>
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
