
import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Package, User, ShoppingCart, X, Globe, Hammer, Pickaxe, ArrowRight, Zap } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { ResourceType, Planet } from '../../types';
import { PLANETS, RECIPES } from '../../constants';

const RESOURCES: { id: ResourceType; name: string; color: string }[] = [
    { id: 'fuel', name: 'Fuel Cells', color: 'text-blue-400' },
    { id: 'iron', name: 'Iron Plating', color: 'text-slate-400' },
    { id: 'gold', name: 'Raw Gold', color: 'text-yellow-400' },
    { id: 'spice', name: 'Cosmic Spice', color: 'text-pink-400' },
    { id: 'steel', name: 'Hardened Steel', color: 'text-slate-200' },
    { id: 'circuit', name: 'Microchip', color: 'text-green-400' },
    { id: 'engine', name: 'Warp Engine', color: 'text-cyan-400' },
    { id: 'jewelry', name: 'Royal Jewelry', color: 'text-purple-400' },
];

const SpaceTrader: React.FC = () => {
  const { setView, setActiveGameId, user, marketState, buyResource, sellResource, tradeOffers, createTradeOffer, cancelTradeOffer, acceptTradeOffer, travelToPlanet, mineResource, craftItem } = useGame();
  
  const [activeTab, setActiveTab] = useState<'nav' | 'factory' | 'market' | 'p2p'>('nav');
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  
  // Mining State
  const [isMining, setIsMining] = useState(false);
  const [mineProgress, setMineProgress] = useState(0);

  // Trade Form States
  const [tradeAmount, setTradeAmount] = useState<Record<string, string>>({});
  
  // P2P Create Form
  const [p2pResource, setP2pResource] = useState<ResourceType>('fuel');
  const [p2pAmount, setP2pAmount] = useState('10');
  const [p2pPrice, setP2pPrice] = useState('100');

  const currentPlanet = PLANETS.find(p => p.id === user?.currentPlanet) || PLANETS[0];

  const showNotification = (msg: string, type: 'success' | 'error') => {
      setNotification({ msg, type });
      setTimeout(() => setNotification(null), 3000);
  };

  const handleTravel = (planetId: string) => {
      if (planetId === currentPlanet.id) return;
      const success = travelToPlanet(planetId);
      if (success) {
          showNotification(`Warped to ${planetId.toUpperCase()}`, 'success');
      } else {
          showNotification("Insufficient Fuel (Need 1)", 'error');
      }
  };

  const handleMine = () => {
      if (isMining) return;
      setIsMining(true);
      setMineProgress(0);

      const interval = setInterval(() => {
          setMineProgress(prev => {
              if (prev >= 100) {
                  clearInterval(interval);
                  return 100;
              }
              return prev + 5; // 2 seconds total roughly
          });
      }, 100);

      setTimeout(() => {
          clearInterval(interval);
          const res = mineResource();
          setIsMining(false);
          setMineProgress(0);
          if (res.success) {
              const gained = Object.entries(res.yielded).map(([k, v]) => `${v} ${k}`).join(', ');
              showNotification(`Mined: ${gained}`, 'success');
          } else {
              showNotification(res.message, 'error');
          }
      }, 2000);
  };

  const handleCraft = (recipeId: string) => {
      const res = craftItem(recipeId);
      if (res.success) {
          showNotification(res.message, 'success');
      } else {
          showNotification(res.message, 'error');
      }
  };

  const handleTrade = (type: 'buy' | 'sell', resource: ResourceType) => {
      const amount = parseInt(tradeAmount[resource] || '0');
      if (amount <= 0) return;

      let success = false;
      if (type === 'buy') success = buyResource(resource, amount);
      else success = sellResource(resource, amount);

      if (success) {
          showNotification(`Successfully ${type === 'buy' ? 'bought' : 'sold'} ${amount} ${resource}!`, 'success');
          setTradeAmount({ ...tradeAmount, [resource]: '' });
      } else {
          showNotification("Transaction failed (Funds/Cargo issue)", 'error');
      }
  };

  const handleCreateOffer = () => {
      const amount = parseInt(p2pAmount);
      const price = parseInt(p2pPrice);
      if (amount <= 0 || price <= 0) return;

      const res = createTradeOffer(p2pResource, amount, price);
      if (res.success) {
          showNotification("Offer listed on exchange", 'success');
          setP2pAmount('10');
      } else {
          showNotification(res.message, 'error');
      }
  };

  const handleAcceptOffer = (offerId: string) => {
      const res = acceptTradeOffer(offerId);
      if (res.success) showNotification("Trade completed!", 'success');
      else showNotification(res.message, 'error');
  };

  if (!marketState || !user) return <div>Loading Systems...</div>;

  return (
    <div className="flex h-screen w-full bg-[#050b14] overflow-hidden relative font-mono text-cyan-500">
        
        {/* Starfield Background */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '50px 50px', opacity: 0.1 }}></div>

        {/* Top Nav */}
        <div className="absolute top-6 left-6 z-50 flex items-center gap-4">
            <button 
                onClick={() => { setView('HOME'); setActiveGameId(null); }}
                className="bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-400 px-4 py-2 rounded-lg backdrop-blur-md flex items-center gap-2 transition-all border border-cyan-800"
            >
                <ArrowLeft size={18} /> Disconnect
            </button>
            <div className="flex gap-2 p-1 bg-slate-900/80 rounded-lg border border-slate-700">
                <button 
                    onClick={() => setActiveTab('nav')}
                    className={`px-4 py-1.5 rounded text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'nav' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Globe size={14}/> Operations
                </button>
                <button 
                    onClick={() => setActiveTab('factory')}
                    className={`px-4 py-1.5 rounded text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'factory' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Hammer size={14}/> Factory
                </button>
                <button 
                    onClick={() => setActiveTab('market')}
                    className={`px-4 py-1.5 rounded text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'market' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <TrendingUp size={14}/> Market
                </button>
                <button 
                    onClick={() => setActiveTab('p2p')}
                    className={`px-4 py-1.5 rounded text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'p2p' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <User size={14}/> P2P
                </button>
            </div>
        </div>

        {/* Notification */}
        {notification && (
            <div className={`absolute top-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-2 rounded border font-bold animate-fade-in ${notification.type === 'success' ? 'bg-emerald-900/90 border-emerald-500 text-emerald-400' : 'bg-red-900/90 border-red-500 text-red-400'}`}>
                {notification.msg}
            </div>
        )}

        <div className="flex w-full h-full relative z-10 pt-20 pb-8 px-8 gap-8">
            
            {/* LEFT: Player Cargo */}
            <div className="w-64 bg-slate-900/80 border border-slate-700 p-4 flex flex-col gap-4 rounded-xl backdrop-blur-sm overflow-y-auto custom-scrollbar">
                <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2 border-b border-slate-700 pb-2">
                    <Package size={16} /> Cargo Hold
                </h3>
                {RESOURCES.map(res => {
                    const count = user.cargo?.[res.id] || 0;
                    if (count === 0 && !['fuel', 'iron', 'gold'].includes(res.id)) return null; // Hide empty irrelevant items
                    return (
                        <div key={res.id} className="flex justify-between items-center bg-black/40 p-3 rounded border border-slate-800">
                            <div>
                                <div className={`text-xs font-bold ${res.color}`}>{res.name}</div>
                            </div>
                            <div className="text-xl font-bold text-white">
                                {count.toLocaleString()}
                            </div>
                        </div>
                    );
                })}
                <div className="mt-auto pt-4 border-t border-slate-700 text-right">
                    <div className="text-xs text-slate-400">LIQUID CREDITS</div>
                    <div className="text-2xl font-bold text-emerald-400">{user.credits.toLocaleString()}</div>
                </div>
            </div>

            {/* CENTER: Main Interface */}
            <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col relative">
                
                {/* 1. OPERATIONS (Nav & Mine) */}
                {activeTab === 'nav' && (
                    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                        {/* Current Location Header */}
                        <div className="flex items-center justify-between mb-8 p-6 bg-slate-950/80 rounded-2xl border border-cyan-900/30 relative overflow-hidden">
                             <div className={`absolute inset-0 opacity-20 ${currentPlanet.color}`}></div>
                             <div className="relative z-10">
                                 <h2 className="text-4xl font-bold text-white mb-2">{currentPlanet.name} Sector</h2>
                                 <p className="text-slate-400 max-w-lg">{currentPlanet.description}</p>
                                 <div className="flex gap-4 mt-4 text-xs font-bold uppercase tracking-widest text-cyan-300">
                                     {Object.entries(currentPlanet.resourceYield).map(([k, v]) => (
                                         <span key={k} className="bg-black/50 px-2 py-1 rounded border border-cyan-900/50">{k}: High Yield</span>
                                     ))}
                                 </div>
                             </div>
                             
                             <div className="relative z-10 flex flex-col items-center">
                                 <button 
                                    onClick={handleMine}
                                    disabled={isMining}
                                    className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all shadow-[0_0_30px_currentColor] group
                                        ${isMining ? 'border-slate-700 bg-slate-800 text-slate-500' : 'border-cyan-500 bg-cyan-900/20 text-cyan-400 hover:scale-105 hover:bg-cyan-900/40 cursor-pointer'}
                                    `}
                                 >
                                     <Pickaxe size={32} className={`mb-2 ${isMining ? 'animate-bounce' : ''}`} />
                                     <span className="font-bold">{isMining ? 'DRILLING...' : 'MINE'}</span>
                                 </button>
                                 {isMining && (
                                     <div className="w-32 h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
                                         <div className="h-full bg-cyan-500 transition-all duration-100" style={{ width: `${mineProgress}%` }}></div>
                                     </div>
                                 )}
                             </div>
                        </div>

                        {/* Navigation Grid */}
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Globe size={18} /> Galactic Navigation System</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {PLANETS.map(planet => {
                                const isCurrent = planet.id === currentPlanet.id;
                                return (
                                    <button 
                                        key={planet.id}
                                        onClick={() => handleTravel(planet.id)}
                                        disabled={isCurrent}
                                        className={`p-4 rounded-xl border relative overflow-hidden text-left transition-all group
                                            ${isCurrent ? 'bg-slate-800 border-slate-700 opacity-50 cursor-default' : 'bg-slate-900 border-slate-800 hover:border-cyan-500 hover:bg-slate-800'}
                                        `}
                                    >
                                        <div className={`absolute top-0 right-0 p-2 rounded-bl-xl ${planet.color} text-white font-bold text-xs opacity-50`}>
                                            {isCurrent ? 'LOC' : '1 FUEL'}
                                        </div>
                                        <div className={`w-12 h-12 rounded-full mb-3 ${planet.color} opacity-80 group-hover:scale-110 transition-transform`}></div>
                                        <div className="font-bold text-white">{planet.name}</div>
                                        <div className="text-xs text-slate-500 mt-1 line-clamp-2">{planet.description}</div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* 2. FACTORY (Crafting) */}
                {activeTab === 'factory' && (
                    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {RECIPES.map(recipe => {
                                const resultInfo = RESOURCES.find(r => r.id === recipe.result);
                                if (!resultInfo) return null;

                                // Check affordable
                                let canCraft = true;
                                Object.entries(recipe.ingredients).forEach(([id, amt]) => {
                                    if ((user.cargo?.[id] || 0) < amt) canCraft = false;
                                });

                                return (
                                    <div key={recipe.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden">
                                        {/* Result Header */}
                                        <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                                            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                                                <Zap className={resultInfo.color} />
                                            </div>
                                            <div>
                                                <h3 className={`font-bold ${resultInfo.color}`}>{resultInfo.name}</h3>
                                                <p className="text-xs text-slate-500">Tier 2 Component</p>
                                            </div>
                                        </div>

                                        {/* Requirements */}
                                        <div className="space-y-2">
                                            <div className="text-[10px] uppercase font-bold text-slate-500">Requires</div>
                                            {Object.entries(recipe.ingredients).map(([id, amt]) => {
                                                const has = user.cargo?.[id] || 0;
                                                const missing = has < amt;
                                                return (
                                                    <div key={id} className="flex justify-between text-sm">
                                                        <span className={missing ? 'text-red-400' : 'text-slate-300'}>
                                                            {id.charAt(0).toUpperCase() + id.slice(1)}
                                                        </span>
                                                        <span className={missing ? 'text-red-400 font-bold' : 'text-slate-500'}>
                                                            {has}/{amt}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        <button 
                                            onClick={() => handleCraft(recipe.id)}
                                            disabled={!canCraft}
                                            className={`mt-auto w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                                                ${canCraft 
                                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                                                    : 'bg-slate-900 text-slate-600 cursor-not-allowed'}
                                            `}
                                        >
                                            <Hammer size={16} /> Craft
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* 3. SYSTEM MARKET VIEW */}
                {activeTab === 'market' && (
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {RESOURCES.map(res => {
                                const price = marketState.prices[res.id];
                                const trend = marketState.trends[res.id];
                                const sellPrice = Math.floor(price * 0.9);

                                return (
                                    <div key={res.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col gap-4 hover:border-cyan-900/50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className={`text-lg font-bold ${res.color}`}>{res.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-2xl font-mono text-white">{price} CR</span>
                                                    {trend === 'up' && <TrendingUp size={20} className="text-emerald-500" />}
                                                    {trend === 'down' && <TrendingDown size={20} className="text-red-500" />}
                                                    {trend === 'stable' && <Minus size={20} className="text-slate-500" />}
                                                </div>
                                            </div>
                                            <div className="text-right text-xs text-slate-500">
                                                <div>Buy: {price}</div>
                                                <div>Sell: {sellPrice}</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-auto">
                                            <input 
                                                type="number" 
                                                className="w-24 bg-black border border-slate-700 rounded px-2 text-white outline-none focus:border-cyan-500"
                                                placeholder="Qty"
                                                value={tradeAmount[res.id] || ''}
                                                onChange={e => setTradeAmount({ ...tradeAmount, [res.id]: e.target.value })}
                                            />
                                            <button 
                                                onClick={() => handleTrade('buy', res.id)}
                                                className="flex-1 bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-400 border border-emerald-800 rounded font-bold text-sm transition-colors"
                                            >
                                                BUY
                                            </button>
                                            <button 
                                                onClick={() => handleTrade('sell', res.id)}
                                                className="flex-1 bg-red-900/30 hover:bg-red-800/50 text-red-400 border border-red-800 rounded font-bold text-sm transition-colors"
                                            >
                                                SELL
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* 4. P2P EXCHANGE VIEW */}
                {activeTab === 'p2p' && (
                    <div className="flex-1 flex flex-col h-full">
                         {/* Create Offer Header */}
                         <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-wrap gap-4 items-end">
                             <div>
                                 <label className="text-xs text-slate-500 block mb-1">Sell Resource</label>
                                 <select 
                                    className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1.5 outline-none w-32"
                                    value={p2pResource}
                                    onChange={e => setP2pResource(e.target.value as ResourceType)}
                                >
                                     {RESOURCES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                 </select>
                             </div>
                             <div>
                                 <label className="text-xs text-slate-500 block mb-1">Amount</label>
                                 <input 
                                    type="number" 
                                    className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1.5 outline-none w-24"
                                    value={p2pAmount}
                                    onChange={e => setP2pAmount(e.target.value)}
                                 />
                             </div>
                             <div>
                                 <label className="text-xs text-slate-500 block mb-1">Price Per Unit</label>
                                 <input 
                                    type="number" 
                                    className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1.5 outline-none w-24"
                                    value={p2pPrice}
                                    onChange={e => setP2pPrice(e.target.value)}
                                 />
                             </div>
                             <button 
                                onClick={handleCreateOffer}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-1.5 rounded h-fit"
                            >
                                 Create Offer
                             </button>
                         </div>

                         {/* Offers List */}
                         <div className="flex-1 overflow-y-auto p-4 space-y-2">
                             {tradeOffers.length === 0 && (
                                 <div className="text-center text-slate-500 mt-10">No active trade offers. Be the first!</div>
                             )}
                             {tradeOffers.map(offer => {
                                 const isMyOffer = offer.sellerId === user.username;
                                 const resInfo = RESOURCES.find(r => r.id === offer.resource);

                                 return (
                                     <div key={offer.id} className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg flex items-center justify-between hover:bg-slate-800 transition-colors">
                                         <div className="flex items-center gap-4">
                                             <div className="bg-slate-900 p-2 rounded text-slate-300">
                                                 <User size={16} />
                                             </div>
                                             <div>
                                                 <div className="text-sm font-bold text-white flex items-center gap-2">
                                                     {offer.amount} <span className={resInfo?.color}>{resInfo?.name}</span>
                                                     <span className="text-slate-500 text-xs font-normal">from {offer.sellerId}</span>
                                                 </div>
                                                 <div className="text-xs text-slate-400">
                                                     Price: {offer.pricePerUnit} CR/unit
                                                 </div>
                                             </div>
                                         </div>

                                         <div className="flex items-center gap-4">
                                             <div className="text-right">
                                                 <div className="text-emerald-400 font-bold font-mono">{offer.totalPrice} CR</div>
                                                 <div className="text-[10px] text-slate-500">TOTAL</div>
                                             </div>
                                             
                                             {isMyOffer ? (
                                                 <button 
                                                    onClick={() => cancelTradeOffer(offer.id)}
                                                    className="p-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded border border-red-900/30"
                                                    title="Cancel Offer"
                                                >
                                                     <X size={18} />
                                                 </button>
                                             ) : (
                                                 <button 
                                                    onClick={() => handleAcceptOffer(offer.id)}
                                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs flex items-center gap-2"
                                                 >
                                                     <ShoppingCart size={14} /> BUY
                                                 </button>
                                             )}
                                         </div>
                                     </div>
                                 )
                             })}
                         </div>
                    </div>
                )}

            </div>
        </div>
    </div>
  );
};

export default SpaceTrader;
