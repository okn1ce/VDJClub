
import React, { useState } from 'react';
import { ArrowLeft, Shield, Zap, Leaf, Factory, Cog, Coins, AlertTriangle, Info, Map as MapIcon, Crosshair } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { FactionId, Sector } from '../../types';

const FactionWars: React.FC = () => {
  const { setView, setActiveGameId, user, joinFaction, factionSectors, interactWithSector } = useGame();
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error') => {
      setNotification({ msg, type });
      setTimeout(() => setNotification(null), 2000);
  };

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
                       
                       {/* Cyber Faction */}
                       <div className="group relative bg-slate-900/50 border border-indigo-500/30 rounded-2xl p-8 hover:bg-indigo-900/20 hover:border-indigo-500 transition-all duration-300">
                           <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                               <Zap size={40} className="text-indigo-400" />
                           </div>
                           <h2 className="text-2xl font-bold text-white mb-2">Cyber Syndicate</h2>
                           <p className="text-sm text-indigo-200/60 mb-8">High-tech dominance. Efficiency, speed, and digital supremacy.</p>
                           <button 
                               onClick={() => handleJoin('cyber')}
                               className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20"
                           >
                               Join Cyber
                           </button>
                       </div>

                       {/* Steampunk Faction */}
                       <div className="group relative bg-slate-900/50 border border-orange-500/30 rounded-2xl p-8 hover:bg-orange-900/20 hover:border-orange-500 transition-all duration-300">
                           <div className="w-20 h-20 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                               <Factory size={40} className="text-orange-400" />
                           </div>
                           <h2 className="text-2xl font-bold text-white mb-2">Steam Union</h2>
                           <p className="text-sm text-orange-200/60 mb-8">Industry and iron. Relentless production and mechanical might.</p>
                           <button 
                               onClick={() => handleJoin('steampunk')}
                               className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20"
                           >
                               Join Union
                           </button>
                       </div>

                       {/* Nature Faction */}
                       <div className="group relative bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-8 hover:bg-emerald-900/20 hover:border-emerald-500 transition-all duration-300">
                           <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                               <Leaf size={40} className="text-emerald-400" />
                           </div>
                           <h2 className="text-2xl font-bold text-white mb-2">Gaia's Wrath</h2>
                           <p className="text-sm text-emerald-200/60 mb-8">Reclaim the earth. Growth, resilience, and organic power.</p>
                           <button 
                               onClick={() => handleJoin('nature')}
                               className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                           >
                               Join Gaia
                           </button>
                       </div>
                   </div>
               </div>
          </div>
      )
  }

  // --- Main Game Interface ---

  // Calculations
  const cyberCount = factionSectors.filter(s => s.owner === 'cyber').length;
  const steamCount = factionSectors.filter(s => s.owner === 'steampunk').length;
  const natureCount = factionSectors.filter(s => s.owner === 'nature').length;
  const totalOwned = cyberCount + steamCount + natureCount; // Note: Neutral sectors exist

  // Color Mapping
  const getFactionColor = (id: FactionId | null) => {
      switch(id) {
          case 'cyber': return 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]';
          case 'steampunk': return 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]';
          case 'nature': return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
          default: return 'bg-slate-800 border-2 border-slate-700';
      }
  };

  const getFactionBorder = (id: FactionId | null) => {
     switch(id) {
         case 'cyber': return 'border-indigo-500 text-indigo-400';
         case 'steampunk': return 'border-orange-500 text-orange-400';
         case 'nature': return 'border-emerald-500 text-emerald-400';
         default: return 'border-slate-700 text-slate-500';
     }
  };

  return (
    <div className="h-screen w-full bg-slate-950 overflow-hidden relative font-sans flex flex-col">
        {/* Nav */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-20">
             <button 
                onClick={() => { setView('HOME'); setActiveGameId(null); }}
                className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-700 hover:text-white transition-all flex items-center gap-2 text-sm font-bold"
            >
                <ArrowLeft size={16} /> HQ
            </button>
            
            <div className="flex gap-4">
                 <div className="flex items-center gap-2 px-3 py-1 bg-indigo-900/20 border border-indigo-500/20 rounded-lg">
                     <Zap size={14} className="text-indigo-400" /> <span className="text-indigo-200 font-mono font-bold">{cyberCount}</span>
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1 bg-orange-900/20 border border-orange-500/20 rounded-lg">
                     <Factory size={14} className="text-orange-400" /> <span className="text-orange-200 font-mono font-bold">{steamCount}</span>
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
                     <Leaf size={14} className="text-emerald-400" /> <span className="text-emerald-200 font-mono font-bold">{natureCount}</span>
                 </div>
            </div>

            <div className={`px-3 py-1 rounded border text-xs font-bold uppercase tracking-wider ${getFactionBorder(user.faction)}`}>
                {user.faction} Operative
            </div>
        </div>
        
        {/* Notification */}
        {notification && (
            <div className={`absolute top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-2 rounded-full font-bold shadow-xl animate-fade-in ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
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
                         return (
                             <button
                                key={sector.id}
                                onClick={() => setSelectedSector(sector)}
                                className={`w-14 h-14 md:w-20 md:h-20 rounded-lg transition-all duration-300 relative flex items-center justify-center
                                    ${getFactionColor(sector.owner)}
                                    ${isSelected ? 'ring-4 ring-white z-10 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}
                                `}
                             >
                                 {/* Health Indicator (Opacity overlay) */}
                                 <div className="absolute inset-0 bg-black rounded-lg transition-opacity" style={{ opacity: 1 - (sector.defense / sector.maxDefense) }}></div>
                                 
                                 {/* Icon Overlay */}
                                 {sector.owner === 'cyber' && <Zap size={20} className="text-white relative z-10 opacity-50" />}
                                 {sector.owner === 'steampunk' && <Factory size={20} className="text-white relative z-10 opacity-50" />}
                                 {sector.owner === 'nature' && <Leaf size={20} className="text-white relative z-10 opacity-50" />}
                                 {!sector.owner && <span className="text-slate-600 text-xs font-mono">{sector.x},{sector.y}</span>}
                             </button>
                         )
                     })}
                 </div>
            </div>

            {/* Sidebar Inspector */}
            <div className="w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col z-20 shadow-2xl">
                {selectedSector ? (
                    <div className="animate-fade-in space-y-6">
                        <div className="pb-4 border-b border-slate-800">
                             <h2 className="text-2xl font-black text-white mb-1">Sector {selectedSector.x}-{selectedSector.y}</h2>
                             <div className={`text-xs font-bold uppercase tracking-widest ${getFactionBorder(selectedSector.owner).split(' ')[1] || 'text-slate-500'}`}>
                                 {selectedSector.owner ? `${selectedSector.owner} Controlled` : 'Unclaimed Territory'}
                             </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Defense Integrity</span>
                                    <span>{Math.floor(selectedSector.defense)} / {selectedSector.maxDefense}</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-500 ${selectedSector.owner ? getFactionBorder(selectedSector.owner).split(' ')[1].replace('text', 'bg') : 'bg-slate-600'}`} 
                                        style={{ width: `${(selectedSector.defense / selectedSector.maxDefense) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 space-y-3">
                             {selectedSector.owner === user.faction ? (
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

                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 mt-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Info size={12}/> Intel</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Sectors generate Points for your faction. If defense drops to 0 during a siege, control flips to the attacker.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center p-4 opacity-50">
                        <MapIcon size={48} className="mb-4 text-slate-700" />
                        <p className="text-sm font-bold">Select a sector to view details and launch operations.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default FactionWars;
