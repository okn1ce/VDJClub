
import React, { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useGame } from '../../contexts/GameContext';
import { Trophy, Clock, Coins, User, Upload, Camera } from 'lucide-react';

const ProfileView: React.FC = () => {
  const { user, updateAvatar, shopItems } = useGame();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resolve equipped items visuals
  const bannerItem = shopItems.find(i => i.id === user.equipped.banner);
  const titleItem = shopItems.find(i => i.id === user.equipped.title);

  // Resolve Banner Style (Color Class or Image URL)
  const bannerStyle = bannerItem?.image 
    ? { backgroundImage: `url(${bannerItem.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};
  
  const bannerClass = bannerItem?.image
    ? 'w-full h-48 rounded-t-3xl relative overflow-hidden bg-slate-800' // Base bg just in case
    : `w-full h-48 rounded-t-3xl relative overflow-hidden ${bannerItem?.color || 'bg-slate-700'}`;


  // Helper to determine if the string is a valid image source (URL or data URI)
  const isCustomAvatar = user.equipped.avatar && user.equipped.avatar.length > 0;

  // Calculate Level based on wins (Simple formula: 1 + (Wins / 5))
  const userLevel = Math.max(1, Math.floor(user.stats.wins / 5) + 1);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
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

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      
      {/* Banner / Header */}
      <div className={bannerClass} style={bannerStyle}>
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="relative px-8 -mt-20 pb-8 border-b border-slate-700">
         <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
            
            {/* Avatar Section */}
            <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-slate-800 border-4 border-slate-900 flex items-center justify-center shadow-2xl overflow-hidden relative">
                    {isCustomAvatar ? (
                        <img src={user.equipped.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User size={64} className="text-slate-500" />
                    )}
                </div>
                
                {/* Upload Overlay */}
                <button 
                    onClick={handleAvatarClick}
                    className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-4 border-transparent text-white"
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
            </div>

            <div className="mb-2">
                <h1 className="text-4xl font-black text-white">{user.username}</h1>
                <div className="flex items-center gap-3 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700`}>
                        Lvl {userLevel}
                    </span>
                    <span className={`text-sm font-medium ${titleItem?.color || 'text-slate-400'}`}>
                        {titleItem?.name || 'Novice'}
                    </span>
                </div>
            </div>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
             <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                <Trophy size={24} />
             </div>
             <div>
                 <p className="text-slate-400 text-sm">Wins</p>
                 <p className="text-2xl font-bold text-white">{user.stats.wins}</p>
             </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
             <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
                <Coins size={24} />
             </div>
             <div>
                 <p className="text-slate-400 text-sm">Total Earnings</p>
                 <p className="text-2xl font-bold text-white">{user.stats.totalEarnings}</p>
             </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
             <div className="p-3 bg-pink-500/20 rounded-lg text-pink-400">
                <Clock size={24} />
             </div>
             <div>
                 <p className="text-slate-400 text-sm">Games Played</p>
                 <p className="text-2xl font-bold text-white">{user.stats.gamesPlayed}</p>
             </div>
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
  );
};

export default ProfileView;
