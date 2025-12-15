
import React, { useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useGame } from '../../contexts/GameContext';
import { Trophy, Clock, Coins, User, Upload, Camera, Package, Music, ChevronsUp, AlertTriangle } from 'lucide-react';
import { ICON_MAP, PRESTIGE_COST, PRESTIGE_RANKS, PROFILE_MUSIC_COST } from '../../constants';

const ProfileView: React.FC = () => {
  const { user, updateAvatar, shopItems, viewingProfile, prestige, uploadProfileMusic } = useGame();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Determine which profile to show
  const activeProfile = viewingProfile || user;
  const isOwnProfile = user && activeProfile?.username === user.username;

  if (!activeProfile) return <div>Loading...</div>;

  // Resolve equipped items visuals
  const bannerItem = shopItems.find(i => i.id === activeProfile.equipped.banner);
  const titleItem = shopItems.find(i => i.id === activeProfile.equipped.title);

  // Resolve Banner Style (Color Class or Image URL)
  const bannerStyle = bannerItem?.image 
    ? { backgroundImage: `url(${bannerItem.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};
  
  const bannerClass = bannerItem?.image
    ? 'w-full h-48 rounded-t-3xl relative overflow-hidden bg-slate-800' // Base bg just in case
    : `w-full h-48 rounded-t-3xl relative overflow-hidden ${bannerItem?.color || 'bg-slate-700'}`;


  // Helper to determine if the string is a valid image source (URL or data URI)
  const isCustomAvatar = activeProfile.equipped.avatar && activeProfile.equipped.avatar.length > 0;

  // Calculate Level based on wins (Simple formula: 1 + (Wins / 5))
  const userLevel = Math.max(1, Math.floor(activeProfile.stats.wins / 5) + 1);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && isOwnProfile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && isOwnProfile) {
          if (file.size > 5 * 1024 * 1024) {
              setNotification("File too large. Max 5MB.");
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                 const res = uploadProfileMusic(reader.result);
                 setNotification(res.message);
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAvatarClick = () => {
    if(isOwnProfile) fileInputRef.current?.click();
  };

  const handlePrestige = () => {
      if (window.confirm("Are you sure? This will reset your Credits to 0.")) {
          const res = prestige();
          setNotification(res.message);
      }
  };

  // Mock data for chart
  const data = [
    { name: 'Mon', games: 2 },
    { name: 'Tue', games: 5 },
    { name: 'Wed', games: 3 },
    { name: 'Thu', games: 8 },
    { name: 'Fri', games: 12 },
    { name: 'Sat', games: 15 },
    { name: 'Sun', games: 10 },
  ];

  const nextRankIndex = activeProfile.prestigeRank ? PRESTIGE_RANKS.indexOf(activeProfile.prestigeRank) + 1 : 0;
  const nextRankName = PRESTIGE_RANKS[nextRankIndex];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in pb-24">
      
      {notification && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 border border-slate-700 px-6 py-3 rounded-full text-white font-bold shadow-2xl">
              {notification}
          </div>
      )}

      {/* Banner / Header */}
      <div className={bannerClass} style={bannerStyle}>
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="relative px-8 -mt-20 pb-8 border-b border-slate-700">
         <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
            
            {/* Avatar Section */}
            <div className={`relative group ${isOwnProfile ? 'cursor-pointer' : ''}`}>
                <div className="w-32 h-32 rounded-2xl bg-slate-800 border-4 border-slate-900 flex items-center justify-center shadow-2xl overflow-hidden relative">
                    {isCustomAvatar ? (
                        <img src={activeProfile.equipped.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User size={64} className="text-slate-500" />
                    )}
                </div>
                
                {/* Upload Overlay - Only for own profile */}
                {isOwnProfile && (
                    <>
                        <button 
                            onClick={handleAvatarClick}
                            className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-4 border-transparent text-white"
                        >
                            <Camera size={24} className="mb-1" />
                            <span className="text-xs font-bold uppercase">Change</span>
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                    </>
                )}
            </div>

            <div className="mb-2 flex-1">
                <h1 className={`text-4xl font-black text-white ${activeProfile.hasRainbowName ? 'animate-rainbow' : ''}`}>
                    {activeProfile.username}
                </h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700`}>
                        Lvl {userLevel}
                    </span>
                    <span className={`text-sm font-medium ${titleItem?.color || 'text-slate-400'}`}>
                        {titleItem?.name || 'Novice'}
                    </span>
                    {activeProfile.prestigeRank && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-yellow-900/30 text-yellow-500 border border-yellow-700/50 flex items-center gap-1">
                            <ChevronsUp size={12} /> {activeProfile.prestigeRank}
                        </span>
                    )}
                </div>
            </div>

            {/* Profile Music Player */}
            {activeProfile.profileMusic && (
                 <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-full px-4 py-2 flex items-center gap-3">
                     <Music size={16} className="text-pink-500 animate-pulse" />
                     <audio controls src={activeProfile.profileMusic} className="h-8 w-48 opacity-80" />
                 </div>
            )}
         </div>
      </div>

      {/* Prestige Section (Own Profile Only) */}
      {isOwnProfile && nextRankName && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl flex items-center justify-between gap-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors"></div>
              <div className="relative z-10">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <ChevronsUp className="text-yellow-500" /> Prestige Available
                  </h3>
                  <p className="text-slate-400 text-sm mt-1 max-w-md">
                      Reset your balance to 0 in exchange for the <span className="text-yellow-400 font-bold">{nextRankName}</span> rank.
                      Requires <span className="text-white font-bold">{PRESTIGE_COST.toLocaleString()} Credits</span>.
                  </p>
              </div>
              <button 
                  onClick={handlePrestige}
                  disabled={activeProfile.credits < PRESTIGE_COST}
                  className={`relative z-10 px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-all
                     ${activeProfile.credits >= PRESTIGE_COST 
                        ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-900/20' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}
                  `}
              >
                  Promote to {nextRankName}
              </button>
          </div>
      )}

      {/* Music Upload Section (Own Profile Only) */}
      {isOwnProfile && !activeProfile.profileMusic && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
              <div>
                  <h3 className="text-white font-bold flex items-center gap-2"><Music className="text-pink-500"/> Profile Music</h3>
                  <p className="text-sm text-slate-400">Upload a custom track (MP3). Cost: {PROFILE_MUSIC_COST.toLocaleString()} CR</p>
              </div>
              <div>
                  <input type="file" ref={musicInputRef} onChange={handleMusicUpload} accept="audio/*" className="hidden" />
                  <button 
                    onClick={() => musicInputRef.current?.click()}
                    disabled={activeProfile.credits < PROFILE_MUSIC_COST}
                    className={`px-4 py-2 rounded-lg font-bold text-sm ${activeProfile.credits >= PROFILE_MUSIC_COST ? 'bg-pink-600 hover:bg-pink-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                  >
                      Upload Track
                  </button>
              </div>
          </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
             <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                <Trophy size={24} />
             </div>
             <div>
                 <p className="text-slate-400 text-sm">Wins</p>
                 <p className="text-2xl font-bold text-white">{activeProfile.stats.wins}</p>
             </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
             <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
                <Coins size={24} />
             </div>
             <div>
                 <p className="text-slate-400 text-sm">Total Earnings</p>
                 <p className="text-2xl font-bold text-white">{activeProfile.stats.totalEarnings}</p>
             </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
             <div className="p-3 bg-pink-500/20 rounded-lg text-pink-400">
                <Clock size={24} />
             </div>
             <div>
                 <p className="text-slate-400 text-sm">Games Played</p>
                 <p className="text-2xl font-bold text-white">{activeProfile.stats.gamesPlayed}</p>
             </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Inventory Showcase */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 flex flex-col h-full">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Package size={20} className="text-indigo-400" /> Collection
              </h3>
              
              <div className="grid grid-cols-4 gap-3 overflow-y-auto max-h-64 custom-scrollbar pr-2">
                  {activeProfile.inventory && activeProfile.inventory.length > 0 ? (
                      activeProfile.inventory.map((itemId, idx) => {
                          const item = shopItems.find(i => i.id === itemId);
                          if(!item) return null;
                          const Icon = ICON_MAP[item.icon] || ICON_MAP['Star'];
                          const isEquipped = activeProfile.equipped[item.type] === item.id;

                          return (
                              <div key={`${itemId}-${idx}`} className={`aspect-square rounded-xl flex items-center justify-center relative border group ${isEquipped ? 'bg-indigo-900/30 border-indigo-500' : 'bg-slate-900 border-slate-700'}`}>
                                  {item.image ? (
                                      <div className="w-full h-full rounded-xl overflow-hidden relative">
                                          <img src={item.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                  ) : (
                                      <Icon size={24} className={item.type === 'title' ? item.color : 'text-white'} />
                                  )}
                                  
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[150px] bg-black/90 text-white text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-slate-700 text-center">
                                      <div className="font-bold">{item.name}</div>
                                      <div className="text-slate-400">{item.type}</div>
                                  </div>
                              </div>
                          )
                      })
                  ) : (
                      <div className="col-span-4 text-center text-slate-500 text-sm py-10">Inventory Empty</div>
                  )}
              </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-6">Weekly Activity</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12 }} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12 }} 
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                            cursor={{ fill: '#334155', opacity: 0.4 }}
                        />
                        <Bar dataKey="games" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 5 ? '#6366f1' : '#475569'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ProfileView;
