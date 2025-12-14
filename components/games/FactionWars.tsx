
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Heart, Skull, Info, Map as MapIcon, Crosshair, Clock, Coins, Trophy, HelpCircle } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { FactionId, Sector } from '../../types';

const FactionWars: React.FC = () => {
  const { setView, setActiveGameId, user, joinFaction, factionSectors, interactWithSector, factionWarState } = useGame();
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("--d --h --m");

  const showNotification = (msg: string, type: 'success' | 'error') => {
      setNotification({ msg, type });
      setTimeout(() => setNotification(null), 2000);
  };

  // Timer Effect
  useEffect(() => {
    if (!factionWarState) return;

    const interval = setInterval(() => {
        const now = Date.now();
        const diff = factionWarState.endTime - now;

        if (diff <= 0) {
            setTimeLeft("WAR ENDED");
        } else {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [factionWarState]);

  const handleJoin = (faction: FactionId) => {
      joinFaction(faction);
  };

  const handleAction = (action: 'attack' | 'reinforce') => {
      if (!selectedSector) return;
      
      const res = interactWithSector(selectedSector.id, action);
      if (res.success) {
          showNotification(res.message, 'success');
          // Update selected sector local state immediately (for smooth UI, though context updates will follow)
          // Actually, we rely on context update to re-render selectedSector via find
          setSelectedSector(null);
      } else {
          showNotification(res.message, 'error');
      }
  };

  // Helper to map legacy strings to correct IDs
  const getNormalizedOwner = (owner: string | null): FactionId | null => {
      if (!owner) return null;
      if (owner === 'gay' || owner === 'Les Gays') return 'gay';
      if (owner === 'halal' || owner === 'Les Halalistes') return 'halal';
      if (owner === 'haram' || owner === 'Les Haramistes') return 'haram';
      return null;
  };

  if (!user?.faction) {
      return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950 to-slate-950"></div>
               
               <button 
                  onClick={() => { setView('HOME'); setActiveGameId(null); }}
                  className="absolute top-6 left-6 z-50 bg-slate-800/50 text-slate-400 px-4 py-2 rounded-full hover:bg-slate-700 hover:text-white transition-all flex items-center gap-2"
               >
                  <ArrowLeft size={18} /> Back
               </button>

               <div className="relative z-10 max-w-5xl w-full text-center space-y-12">
                   <div>
                       <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">Choose Your Allegiance</h1>
                       <p className="text-slate-400 max-w-xl mx-auto">The world is divided. Select your faction to access the war map. <br/> <span className="text-red-400 font-bold">This choice is permanent.</span></p>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       
                       {/* Gay Faction */}
                       <div className="group relative bg-slate-900/50 border border-pink-500/30 rounded-2xl p-8 hover:bg-pink-900/20 hover:border-pink-500 transition-all duration-300">
                           <div className="w-20 h-20 bg-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                               <Heart size={40} className="text-pink-400" />
                           </div>
                           <h2 className="text-2xl font-bold text-white mb-2">Les Gays</h2>
                           <p className="text-sm text-pink-200/60 mb-8">LGBTcul friendly.</p>
                           <button 
                               onClick={() => handleJoin('gay')}
                               className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl shadow-lg shadow-pink-500/20"
                           >
                               Rejoindre Les Gays
                           </button>
                       </div>

                       {/* Halal Faction */}
                       <div className="group relative bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-8 hover:bg-emerald-900/20 hover:border-emerald-500 transition-all duration-300">
                           <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                               <Shield size={40} className="text-emerald-400" />
                           </div>
                           <h2 className="text-2xl font-bold text-white mb-2">Les Halalistes</h2>
                           <p className="text-sm text-emerald-200/60 mb-8">Pour le peuple.</p>
                           <button 
                               onClick={() => handleJoin('halal')}
                               className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                           >
                               Rejoindre Les Halalistes
                           </button>
                       </div>

                       {/* Haram Faction */}
                       <div className="group relative bg-slate-900/50 border border-red-500/30 rounded-2xl p-8 hover:bg-red-900/20 hover:border-red-500 transition-all duration-300">
                           <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                               <Skull size={40} className="text-red-400" />
                           </div>
                           <h2 className="text-2xl font-bold text-white mb-2">Les Haramistes</h2>
                           <p className="text-sm text-red-200/60 mb-8">Contre le peuple.</p>
                           <button 
                               onClick={() => handleJoin('haram')}
                               className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/20"
                           >
                               Rejoindre Les Haramistes
                           </button>
                       </div>
                   </div>
               </div>
          </div>
      )
  }

  // --- Main Game Interface ---

  // Calculations using safe normalization
  const gayCount = factionSectors.filter(s => getNormalizedOwner(s.owner) === 'gay').length;
  const halalCount = factionSectors.filter(s => getNormalizedOwner(s.owner) === 'halal').length;
  const haramCount = factionSectors.filter(s => getNormalizedOwner(s.owner) === 'haram').length;

  // Sorting for Leaderboard
  const standings = [
      { id: 'gay', count: gayCount, name: 'Les Gays', icon: Heart, color: 'text-pink-400', border: 'border-pink-500' },
      { id: 'halal', count: halalCount, name: 'Les Halalistes', icon: Shield, color: 'text-emerald-400', border: 'border-emerald-500' },
      { id: 'haram', count: haramCount, name: 'Les Haramistes', icon: Skull, color: 'text-red-400', border: 'border-red-500' }
  ].sort((a, b) => b.count - a.count);

  // Color Mapping
  const getFactionColor = (id: FactionId | null) => {
      switch(id) {
          case 'gay': return 'bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]';
          case 'halal': return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
          case 'haram': return 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]';
          default: return 'bg-slate-800 border-2 border-slate-700';
      }
  };

  const getFactionBorder = (id: FactionId | null) => {
     switch(id) {
         case 'gay': return 'border-pink-500 text-pink-400';
         case 'halal': return 'border-emerald-500 text-emerald-400';
         case 'haram': return 'border-red-600 text-red-500';
         default: return 'border-slate-700 text-slate-500';
     }
  };

  return (
    <div className="h-screen w-full bg-slate-950 overflow-hidden relative font-sans flex flex-col">
        {/* Nav */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-20 shadow-xl">
             <div className="flex items-center gap-4">
                 <button 
                    onClick={() => { setView('HOME'); setActiveGameId(null); }}
                    className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-700 hover:text-white transition-all flex items-center gap-2 text-sm font-bold border border-slate-700"
                >
                    <ArrowLeft size={16} /> HQ
                </button>
                <div className={`px-3 py-1.5 rounded border text-xs font-bold uppercase tracking-wider hidden md:block ${getFactionBorder(user.faction)}`}>
                    {user.faction === 'gay' ? 'Les Gays' : user.faction === 'halal' ? 'Les Halalistes' : 'Les Haramistes'}
                </div>
             </div>
            
            <div className="flex items-center gap-6">
                {/* War Timer */}
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        <Clock size={12} /> War Ends In
                    </div>
                    <div className="text-white font-mono font-bold text-lg tabular-nums leading-none mt-1">
                        {timeLeft}
                    </div>
                </div>

                <div className="w-px h-8 bg-slate-800"></div>

                {/* Reward Pool */}
                <div className="flex flex-col items-end">
                     <div className="flex items-center gap-2 text-yellow-500 text-[10px] uppercase font-bold tracking-wider">
                        <Coins size={12} /> Reward Pool
                    </div>
                    <div className="text-yellow-400 font-bold text-lg tabular-nums leading-none mt-1">
                        {factionWarState?.rewardPool.toLocaleString() || '---'} CR
                    </div>
                </div>
            </div>
        </div>
        
        {/* Notification */}
        {notification && (
            <div className={`absolute top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-2 rounded-full font-bold shadow-xl animate-fade-in ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                {notification.msg}
            </div>
        )}

        <div className="flex-1 flex overflow-hidden">
            {/* Map Area */}
            <div className="flex-1 bg-[#050b14] relative flex items-center justify-center p-8 overflow-auto">
                 {/* Grid Pattern */}
                 <div className="absolute inset-0 opacity-10 pointer-events-none" 
                      style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}>
                 </div>

                 {/* The Grid */}
                 <div className="grid grid-cols-6 gap-3 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-2xl">
                     {factionSectors.map((sector) => {
                         const isSelected = selectedSector?.id === sector.id;
                         // Robustly map any owner string to a valid color ID
                         const validOwner = getNormalizedOwner(sector.owner);
                         
                         // Safe Defense Calc (Handle missing maxDefense in old data)
                         const maxDef = sector.maxDefense || 100;
                         const def = sector.defense || 0;
                         const opacity = 1 - (def / maxDef);

                         return (
                             <button
                                key={sector.id}
                                onClick={() => setSelectedSector(sector)}
                                className={`w-14 h-14 md:w-20 md:h-20 rounded-lg transition-all duration-300 relative flex items-center justify-center overflow-hidden
                                    ${getFactionColor(validOwner)}
                                    ${isSelected ? 'ring-4 ring-white z-10 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}
                                `}
                             >
                                 {/* Health Indicator (Opacity overlay) */}
                                 <div 
                                    className="absolute inset-0 bg-black rounded-lg transition-opacity pointer-events-none" 
                                    style={{ opacity: isNaN(opacity) ? 0 : opacity }}
                                 ></div>
                                 
                                 {/* Icon Overlay */}
                                 {validOwner === 'gay' && <Heart size={20} className="text-white relative z-10 opacity-50" />}
                                 {validOwner === 'halal' && <Shield size={20} className="text-white relative z-10 opacity-50" />}
                                 {validOwner === 'haram' && <Skull size={20} className="text-white relative z-10 opacity-50" />}
                                 {!validOwner && <span className="text-slate-600 text-xs font-mono relative z-10">{sector.x},{sector.y}</span>}
                             </button>
                         )
                     })}
                 </div>
            </div>

            {/* Sidebar Inspector / Global Stats */}
            <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col z-20 shadow-2xl">
                {selectedSector ? (
                    <div className="p-6 animate-fade-in space-y-6">
                        <div className="pb-4 border-b border-slate-800">
                             <div className="flex justify-between items-start">
                                <h2 className="text-2xl font-black text-white mb-1">Sector {selectedSector.x}-{selectedSector.y}</h2>
                                <button onClick={() => setSelectedSector(null)} className="text-slate-500 hover:text-white">Close</button>
                             </div>
                             <div className={`text-xs font-bold uppercase tracking-widest ${getFactionBorder(getNormalizedOwner(selectedSector.owner)).split(' ')[1] || 'text-slate-500'}`}>
                                 {selectedSector.owner ? `${getNormalizedOwner(selectedSector.owner) || selectedSector.owner} Controlled` : 'Unclaimed Territory'}
                             </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Defense Integrity</span>
                                    <span>{Math.floor(selectedSector.defense)} / {selectedSector.maxDefense || 100}</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-500 ${selectedSector.owner ? getFactionBorder(getNormalizedOwner(selectedSector.owner)).split(' ')[1].replace('text', 'bg') : 'bg-slate-600'}`} 
                                        style={{ width: `${(selectedSector.defense / (selectedSector.maxDefense || 100)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 space-y-3">
                             {getNormalizedOwner(selectedSector.owner) === user.faction ? (
                                 <button 
                                    onClick={() => handleAction('reinforce')}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 group"
                                 >
                                     <Shield size={20} className="group-hover:scale-110 transition-transform" />
                                     <div>
                                         <div className="leading-none">Reinforce</div>
                                         <div className="text-[10px] opacity-70 font-medium mt-1">Cost: 25cr • +25 Def</div>
                                     </div>
                                 </button>
                             ) : (
                                 <button 
                                    onClick={() => handleAction('attack')}
                                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 group"
                                 >
                                     <Crosshair size={20} className="group-hover:rotate-90 transition-transform" />
                                     <div>
                                         <div className="leading-none">{selectedSector.owner ? 'Siege Sector' : 'Claim Sector'}</div>
                                         <div className="text-[10px] opacity-70 font-medium mt-1">Cost: 25cr • {selectedSector.owner ? '-25 Enemy Def' : 'Establish Base'}</div>
                                     </div>
                                 </button>
                             )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        {/* Leaderboard Section */}
                        <div className="p-6 border-b border-slate-800">
                             <h2 className="text-white font-bold flex items-center gap-2 mb-4">
                                 <Trophy size={18} className="text-yellow-500" /> Current Standings
                             </h2>
                             <div className="space-y-3">
                                 {standings.map((team, idx) => (
                                     <div key={team.id} className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                                         <div className="font-mono text-slate-500 font-bold w-4">{idx + 1}</div>
                                         <team.icon size={18} className={team.color} />
                                         <div className="flex-1">
                                             <div className="text-sm font-bold text-white">{team.name}</div>
                                             <div className="text-xs text-slate-500">{team.count} Sectors</div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>

                        {/* How To Play Section */}
                        <div className="p-6">
                            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                                <HelpCircle size={14} /> Mission Briefing
                            </h3>
                            <div className="text-sm text-slate-300 space-y-3">
                                <p className="leading-relaxed">
                                    <span className="text-white font-bold">Objective:</span> Control the most territory before the war timer expires to win the <span className="text-yellow-400">{factionWarState?.rewardPool.toLocaleString()} CR</span> reward pool.
                                </p>
                                <ul className="space-y-2 list-disc list-inside text-slate-400 text-xs">
                                    <li>Click a sector to view details.</li>
                                    <li><span className="text-red-400">Attack</span> enemy sectors to lower their defense.</li>
                                    <li>When defense hits 0, you capture the sector.</li>
                                    <li><span className="text-emerald-400">Reinforce</span> your own sectors to prevent capture.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-auto p-6 opacity-30">
                            <MapIcon size={64} className="mx-auto text-slate-700" />
                            <p className="text-center text-xs text-slate-500 mt-2">Select a sector on the map<br/>to launch operations.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default FactionWars;
