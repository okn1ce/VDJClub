
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Anchor, Fish, Coins, Hammer, ShoppingBag, ArrowRight, User, X, Map, Lock, Info } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { FISH_TYPES, ROD_TYPES, ICON_MAP, GOLD_EXCHANGE_RATE, OCEANS } from '../../constants';

const FishingGame: React.FC = () => {
  const { setView, setActiveGameId, user, fishCast, fishSell, fishBuyRod, fishCraftRod, fishEquipRod, fishExchangeGold, fishCreateListing, fishBuyListing, fishCancelListing, fishingListings, fishUnlockOcean } = useGame();
  
  const [activeTab, setActiveTab] = useState<'fish' | 'shop' | 'inventory' | 'market'>('fish');
  const [currentOceanId, setCurrentOceanId] = useState('starter');
  const [isFishing, setIsFishing] = useState(false);
  const [lastCatch, setLastCatch] = useState<{name: string, rarity: string, gold: number} | null>(null);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error' | 'loot'} | null>(null);
  const [showRates, setShowRates] = useState(false);
  
  // Market Form
  const [sellItemType, setSellItemType] = useState<'fish' | 'rod'>('fish');
  const [sellItemId, setSellItemId] = useState(FISH_TYPES[0].id);
  const [sellAmount, setSellAmount] = useState(1);
  const [sellPrice, setSellPrice] = useState(100);

  const fishingState = user?.fishingState || { 
      gold: 0, 
      inventory: {} as Record<string, number>, 
      rods: ['stick'], 
      equippedRod: 'stick', 
      totalCaught: 0,
      unlockedOceans: ['starter']
  };
  
  const currentRod = ROD_TYPES.find(r => r.id === fishingState.equippedRod) || ROD_TYPES[0];
  const activeOcean = OCEANS.find(o => o.id === currentOceanId) || OCEANS[0];
  const isLocked = !fishingState.unlockedOceans?.includes(currentOceanId);

  const showNotification = (msg: string, type: 'success' | 'error' | 'loot') => {
      setNotification({ msg, type });
      setTimeout(() => setNotification(null), 3000);
  };

  const handleCast = () => {
      if (isFishing) return;
      if (isLocked) {
          showNotification("Unlock this ocean first!", 'error');
          return;
      }

      setIsFishing(true);
      setLastCatch(null);

      // Simulation delay
      setTimeout(() => {
          const res = fishCast(currentOceanId);
          setIsFishing(false);
          if (res.success && res.fish) {
              setLastCatch({ name: res.fish.name, rarity: res.fish.rarity, gold: res.fish.baseValue });
              showNotification(`Caught ${res.fish.name}!`, 'loot');
          } else {
              showNotification(res.message || "The fish got away...", 'error');
          }
      }, 2000 + Math.random() * 2000);
  };

  const handleUnlockOcean = () => {
      const res = fishUnlockOcean(currentOceanId);
      if (res.success) showNotification(res.message, 'success');
      else showNotification(res.message, 'error');
  };

  const handleSellFish = (fishId: string, amount: number) => {
      const res = fishSell(fishId, amount);
      if (res.success) showNotification(res.message, 'success');
      else showNotification(res.message, 'error');
  };

  const handleBuyRod = (rodId: string) => {
      const res = fishBuyRod(rodId);
      if (res.success) showNotification(res.message, 'success');
      else showNotification(res.message, 'error');
  };

  const handleCraftRod = (rodId: string) => {
      const res = fishCraftRod(rodId);
      if (res.success) showNotification(res.message, 'success');
      else showNotification(res.message, 'error');
  };

  const handleEquipRod = (rodId: string) => {
      const res = fishEquipRod(rodId);
      if (res.success) showNotification(res.message, 'success');
  };

  const handleExchange = () => {
      // Exchange all gold in 100k chunks
      if (fishingState.gold < GOLD_EXCHANGE_RATE) {
          showNotification(`Need ${GOLD_EXCHANGE_RATE.toLocaleString()} Gold`, 'error');
          return;
      }
      const amount = Math.floor(fishingState.gold / GOLD_EXCHANGE_RATE) * GOLD_EXCHANGE_RATE;
      const res = fishExchangeGold(amount);
      if (res.success) showNotification(res.message, 'success');
  };

  const handleCreateListing = () => {
      const res = fishCreateListing(sellItemType, sellItemId, Number(sellAmount), Number(sellPrice));
      if (res.success) {
          showNotification(res.message, 'success');
          setActiveTab('market');
      } else {
          showNotification(res.message, 'error');
      }
  };

  const handleBuyListing = (listingId: string) => {
      const res = fishBuyListing(listingId);
      if (res.success) showNotification(res.message, 'success');
      else showNotification(res.message, 'error');
  };

  // Filter fish for current ocean to show rates
  const currentOceanFish = FISH_TYPES.filter(f => f.oceanId === currentOceanId).sort((a,b) => a.baseChance - b.baseChance);

  return (
    <div className="flex h-screen w-full bg-[#0c1821] overflow-hidden relative font-sans text-sky-100">
        
        {/* Ocean Background (Changes per ocean) */}
        <div className={`absolute inset-0 transition-colors duration-1000 ${activeOcean.color}`}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, rgba(255,255,255,0.1) 2px, transparent 0)', backgroundSize: '40px 40px' }}></div>

        {/* Top UI */}
        <div className="absolute top-6 left-6 z-50 flex flex-wrap gap-4 items-center">
            <button 
                onClick={() => { setView('HOME'); setActiveGameId(null); }}
                className="bg-black/40 hover:bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-md flex items-center gap-2 transition-all border border-white/10"
            >
                <ArrowLeft size={18} /> Dock
            </button>
            <div className="bg-slate-900/80 rounded-lg p-1 flex gap-1 border border-slate-700">
                 {[
                     { id: 'fish', label: 'Fishing', icon: Anchor },
                     { id: 'inventory', label: 'Cooler', icon: Fish },
                     { id: 'shop', label: 'Rod Shop', icon: Hammer },
                     { id: 'market', label: 'Market', icon: ShoppingBag },
                 ].map(tab => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-1.5 rounded flex items-center gap-2 text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
                     >
                         <tab.icon size={14} /> {tab.label}
                     </button>
                 ))}
            </div>
            
            <div className="bg-yellow-900/40 border border-yellow-700/50 px-4 py-2 rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                <span className="text-yellow-400 font-bold font-mono">{fishingState.gold.toLocaleString()} Gold</span>
            </div>
        </div>

        {/* Ocean Selector (Travel) */}
        {activeTab === 'fish' && (
            <div className="absolute top-20 left-6 z-40 flex gap-2 overflow-x-auto max-w-[90vw] pb-2 custom-scrollbar">
                {OCEANS.map(ocean => {
                    const isUnlocked = fishingState.unlockedOceans?.includes(ocean.id);
                    return (
                        <button
                            key={ocean.id}
                            onClick={() => setCurrentOceanId(ocean.id)}
                            className={`px-4 py-2 rounded-xl border flex flex-col items-start min-w-[140px] transition-all
                                ${currentOceanId === ocean.id 
                                    ? 'bg-white text-black border-white scale-105 shadow-lg' 
                                    : 'bg-black/40 text-slate-400 border-white/10 hover:bg-black/60'}
                            `}
                        >
                            <div className="flex items-center gap-2 text-xs font-bold uppercase mb-1">
                                {!isUnlocked && <Lock size={10} />}
                                {ocean.name}
                            </div>
                            <div className="text-[10px] opacity-70">
                                {isUnlocked ? 'Travel' : `Locked (${ocean.cost/1000}k)`}
                            </div>
                        </button>
                    )
                })}
            </div>
        )}

        {/* Notification */}
        {notification && (
            <div className={`absolute top-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-2 rounded-full font-bold shadow-xl animate-fade-in flex items-center gap-2
                ${notification.type === 'loot' ? 'bg-yellow-500 text-black shadow-yellow-500/50' : notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}
            `}>
                {notification.msg}
            </div>
        )}

        <div className="relative z-10 w-full h-full flex pt-32 pb-8 px-8 gap-8">
             
             {/* MAIN GAMEPLAY AREA */}
             {activeTab === 'fish' && (
                 <div className="flex-1 flex flex-col items-center justify-center relative">
                      
                      {/* Ocean Info / Rates Toggle */}
                      <div className="absolute top-0 right-0 flex gap-2">
                          <button 
                            onClick={() => setShowRates(!showRates)}
                            className="bg-black/40 text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20 flex items-center gap-2 hover:bg-black/60"
                          >
                              <Info size={14}/> {showRates ? 'Hide' : 'Show'} Fish Rates
                          </button>
                      </div>

                      {/* Locked State Overlay */}
                      {isLocked ? (
                          <div className="text-center bg-black/60 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl max-w-md">
                              <Lock size={48} className="mx-auto text-slate-500 mb-4" />
                              <h2 className="text-3xl font-bold text-white mb-2">{activeOcean.name}</h2>
                              <p className="text-slate-400 mb-6">{activeOcean.description}</p>
                              <div className="flex flex-col gap-4">
                                  <div className="text-yellow-400 font-mono text-xl font-bold">Cost: {activeOcean.cost.toLocaleString()} Gold</div>
                                  <button 
                                    onClick={handleUnlockOcean}
                                    disabled={fishingState.gold < activeOcean.cost}
                                    className={`py-3 px-8 rounded-xl font-bold transition-all
                                        ${fishingState.gold >= activeOcean.cost 
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                                    `}
                                  >
                                      Purchase Expedition
                                  </button>
                              </div>
                          </div>
                      ) : (
                          <>
                            {/* Rod Display */}
                            <div className="mb-8 text-center">
                                <h2 className="text-3xl font-black text-white drop-shadow-md">{currentRod.name}</h2>
                                <div className="text-sky-300 text-sm font-bold uppercase tracking-widest mt-1">
                                    Multiplier: x{currentRod.multiplier}
                                    {currentRod.specialFishId && <span className="text-yellow-400 ml-2">(Specialist)</span>}
                                </div>
                            </div>

                            {/* Cast Button / Animation */}
                            <button
                                onClick={handleCast}
                                disabled={isFishing}
                                className={`w-64 h-64 rounded-full border-8 flex flex-col items-center justify-center transition-all shadow-[0_0_60px_rgba(14,165,233,0.3)] group relative overflow-hidden
                                    ${isFishing ? 'border-sky-800 bg-sky-900 cursor-default' : 'border-sky-400 bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 cursor-pointer'}
                                `}
                            >
                                <div className={`absolute inset-0 bg-sky-400/10 rounded-full ${isFishing ? 'animate-ping' : ''}`}></div>
                                <Anchor size={64} className={`mb-4 text-sky-200 ${isFishing ? 'animate-bounce' : ''}`} />
                                <span className="text-2xl font-black text-white uppercase">{isFishing ? 'Reeling...' : 'CAST LINE'}</span>
                            </button>

                            {/* Last Catch Display */}
                            {lastCatch && !isFishing && (
                                <div className="mt-8 p-6 bg-black/60 backdrop-blur border border-white/10 rounded-2xl text-center animate-fade-in">
                                    <div className="text-slate-400 text-xs uppercase font-bold mb-1">Caught</div>
                                    <div className={`text-2xl font-bold mb-1 ${
                                        lastCatch.rarity === 'Legendary' ? 'text-purple-400' : 
                                        lastCatch.rarity === 'Epic' ? 'text-yellow-400' : 
                                        lastCatch.rarity === 'Rare' ? 'text-pink-400' : 'text-white'
                                    }`}>
                                        {lastCatch.name}
                                    </div>
                                    <div className="text-yellow-500 font-mono">+{lastCatch.gold} Gold Value</div>
                                </div>
                            )}
                          </>
                      )}

                      {/* Drop Rates Panel */}
                      {showRates && !isLocked && (
                          <div className="absolute right-0 top-12 bottom-20 w-64 bg-black/80 backdrop-blur-md border-l border-white/10 p-4 overflow-y-auto custom-scrollbar rounded-l-2xl animate-fade-in">
                              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider border-b border-white/10 pb-2">Native Species</h3>
                              <div className="space-y-3">
                                  {currentOceanFish.map(f => {
                                      // Estimate chance logic for display purposes
                                      const rawChance = Math.min(0.9, f.baseChance * currentRod.multiplier);
                                      const isSpecial = currentRod.specialFishId === f.id;
                                      const finalChance = isSpecial ? Math.min(0.9, rawChance * (currentRod.specialBonus || 1)) : rawChance;
                                      
                                      return (
                                          <div key={f.id} className="flex justify-between items-center text-xs">
                                              <div className={`${f.color} font-bold`}>{f.name}</div>
                                              <div className="text-slate-400 font-mono">
                                                  {(finalChance * 100).toFixed(1)}%
                                                  {isSpecial && <span className="text-yellow-500 ml-1">★</span>}
                                              </div>
                                          </div>
                                      )
                                  })}
                              </div>
                          </div>
                      )}

                      {/* Exchange Prompt */}
                      <div className="absolute bottom-8 right-8">
                          <button 
                            onClick={handleExchange}
                            className="bg-emerald-900/50 hover:bg-emerald-800 border border-emerald-600/50 text-emerald-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                          >
                              <Coins size={18} /> Exchange {GOLD_EXCHANGE_RATE/1000}k Gold → 1 Credit
                          </button>
                      </div>
                 </div>
             )}

             {/* INVENTORY */}
             {activeTab === 'inventory' && (
                 <div className="flex-1 bg-slate-900/80 border border-slate-700 rounded-2xl p-8 overflow-y-auto">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Fish /> Your Cooler</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {Object.entries(fishingState.inventory || {}).map(([fishId, rawCount]) => {
                             const count = rawCount as number;
                             const fish = FISH_TYPES.find(f => f.id === fishId);
                             if(!fish) return null;
                             return (
                                 <div key={fishId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                                     <div>
                                         <div className={`font-bold ${fish.color}`}>{fish.name}</div>
                                         <div className="text-xs text-slate-500">{fish.rarity} • Value: {fish.baseValue}g</div>
                                         <div className="text-lg font-mono text-white mt-1">x{count}</div>
                                     </div>
                                     <button 
                                        onClick={() => handleSellFish(fishId, count)}
                                        className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1.5 rounded text-xs font-bold"
                                    >
                                         Sell All ({count * fish.baseValue}g)
                                     </button>
                                 </div>
                             )
                         })}
                         {Object.keys(fishingState.inventory || {}).length === 0 && (
                             <div className="col-span-3 text-center text-slate-500 py-10">No fish caught yet. Get out there!</div>
                         )}
                     </div>
                 </div>
             )}

             {/* SHOP & CRAFTING */}
             {activeTab === 'shop' && (
                 <div className="flex-1 bg-slate-900/80 border border-slate-700 rounded-2xl p-8 overflow-y-auto">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Hammer /> Rod Workshop</h2>
                     <div className="space-y-4">
                         {ROD_TYPES.map(rod => {
                             const isOwned = fishingState.rods.includes(rod.id);
                             const isEquipped = fishingState.equippedRod === rod.id;
                             const canAfford = fishingState.gold >= rod.cost;
                             
                             return (
                                 <div key={rod.id} className={`p-6 rounded-xl border flex items-center gap-6 ${isEquipped ? 'bg-sky-900/20 border-sky-500' : 'bg-slate-950 border-slate-800'}`}>
                                     <div className="flex-1">
                                         <div className="flex items-center gap-3">
                                             <h3 className="text-xl font-bold text-white">{rod.name}</h3>
                                             {isOwned && <span className="bg-sky-900 text-sky-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold">Owned</span>}
                                         </div>
                                         <div className="text-sky-400 text-sm font-bold mt-1">Multiplier: x{rod.multiplier}</div>
                                         {rod.specialFishId && <div className="text-yellow-500 text-xs mt-1">★ Special Bonus vs {FISH_TYPES.find(f => f.id === rod.specialFishId)?.name}</div>}
                                         
                                         {rod.craftingReq && (
                                             <div className="mt-3 bg-black/40 p-2 rounded text-xs">
                                                 <div className="text-slate-500 uppercase font-bold mb-1">Required Materials</div>
                                                 {Object.entries(rod.craftingReq).map(([reqId, count]) => (
                                                     <div key={reqId} className={`${(fishingState.inventory?.[reqId] || 0) >= count ? 'text-emerald-400' : 'text-red-400'}`}>
                                                         {count}x {FISH_TYPES.find(f => f.id === reqId)?.name || reqId}
                                                     </div>
                                                 ))}
                                             </div>
                                         )}
                                     </div>

                                     <div className="flex flex-col gap-2 items-end">
                                          <div className="text-yellow-500 font-mono font-bold text-lg">{rod.cost > 0 ? `${rod.cost.toLocaleString()} G` : 'Free'}</div>
                                          {isOwned ? (
                                              isEquipped ? (
                                                  <button disabled className="px-6 py-2 bg-slate-700 text-slate-400 rounded-lg font-bold cursor-default">Equipped</button>
                                              ) : (
                                                  <button onClick={() => handleEquipRod(rod.id)} className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold">Equip</button>
                                              )
                                          ) : (
                                              rod.craftingReq ? (
                                                  <button onClick={() => handleCraftRod(rod.id)} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold flex items-center gap-2"><Hammer size={16}/> Craft</button>
                                              ) : (
                                                  <button onClick={() => handleBuyRod(rod.id)} disabled={!canAfford} className={`px-6 py-2 rounded-lg font-bold ${canAfford ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>Buy</button>
                                              )
                                          )}
                                     </div>
                                 </div>
                             )
                         })}
                     </div>
                 </div>
             )}

             {/* MARKET (P2P) */}
             {activeTab === 'market' && (
                 <div className="flex-1 flex flex-col gap-6">
                     {/* Listing Form */}
                     <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-wrap gap-4 items-end">
                         <div>
                             <label className="text-xs text-slate-500 block mb-1">Item Type</label>
                             <select className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none w-32" value={sellItemType} onChange={e => { setSellItemType(e.target.value as any); setSellItemId(e.target.value === 'fish' ? FISH_TYPES[0].id : ROD_TYPES[0].id); }}>
                                 <option value="fish">Fish</option>
                                 <option value="rod">Rod</option>
                             </select>
                         </div>
                         <div>
                             <label className="text-xs text-slate-500 block mb-1">Item</label>
                             <select className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none w-40" value={sellItemId} onChange={e => setSellItemId(e.target.value)}>
                                 {sellItemType === 'fish' 
                                    ? FISH_TYPES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)
                                    : ROD_TYPES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)
                                 }
                             </select>
                         </div>
                         {sellItemType === 'fish' && (
                             <div>
                                <label className="text-xs text-slate-500 block mb-1">Amount</label>
                                <input type="number" className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none w-24" value={sellAmount} onChange={e => setSellAmount(Number(e.target.value))} />
                             </div>
                         )}
                         <div>
                             <label className="text-xs text-slate-500 block mb-1">Price (Global Credits)</label>
                             <input type="number" className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none w-32" value={sellPrice} onChange={e => setSellPrice(Number(e.target.value))} />
                         </div>
                         <button onClick={handleCreateListing} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-lg h-fit">List Item</button>
                     </div>

                     {/* Listings */}
                     <div className="flex-1 bg-slate-900/50 border border-slate-700 rounded-2xl p-6 overflow-y-auto space-y-3">
                         {fishingListings.length === 0 && <div className="text-center text-slate-500 mt-10">No listings found.</div>}
                         {fishingListings.map(listing => {
                             const isMine = listing.sellerId === user?.username;
                             const itemName = listing.itemType === 'fish' ? FISH_TYPES.find(f => f.id === listing.itemId)?.name : ROD_TYPES.find(r => r.id === listing.itemId)?.name;
                             
                             return (
                                 <div key={listing.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center hover:bg-slate-750 transition-colors">
                                     <div className="flex items-center gap-4">
                                         <div className="bg-slate-900 p-2 rounded text-slate-400"><User size={20} /></div>
                                         <div>
                                             <div className="text-white font-bold text-lg flex items-center gap-2">
                                                 {listing.amount}x {itemName}
                                                 {listing.itemType === 'rod' && <Hammer size={12} className="text-purple-400" />}
                                             </div>
                                             <div className="text-xs text-slate-500">Seller: {listing.sellerId}</div>
                                         </div>
                                     </div>
                                     <div className="flex items-center gap-4">
                                         <div className="text-right">
                                             <div className="text-emerald-400 font-bold text-xl">{listing.price} CR</div>
                                             <div className="text-[10px] text-slate-500 uppercase">Global Credits</div>
                                         </div>
                                         {isMine ? (
                                             <button onClick={() => fishCancelListing(listing.id)} className="p-2 bg-red-900/20 text-red-400 rounded hover:bg-red-900/40"><X size={20}/></button>
                                         ) : (
                                             <button onClick={() => handleBuyListing(listing.id)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg">BUY</button>
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
  );
};

export default FishingGame;
