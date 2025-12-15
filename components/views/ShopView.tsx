
import React, { useState } from 'react';
import { Check, Skull, Music, Palette } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { ICON_MAP, RGB_NAME_COST } from '../../constants';
import { CosmeticItem } from '../../types';

const ShopCard: React.FC<{ item: CosmeticItem }> = ({ item }) => {
  const { user, buyItem, equipItem } = useGame();
  
  const isOwned = user.inventory.includes(item.id);
  const isEquipped = user.equipped[item.type] === item.id;
  const canAfford = user.credits >= item.cost;
  const IconComponent = ICON_MAP[item.icon];

  const handleAction = () => {
    if (isOwned) {
      equipItem(item);
    } else {
      buyItem(item);
    }
  };

  // Resolve background logic
  const bgStyle = item.image 
    ? { backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};
  
  // Resolve class for color vs image
  const bgClass = item.image 
    ? 'w-full h-24 rounded-lg relative overflow-hidden'
    : `w-14 h-14 rounded-lg flex items-center justify-center bg-slate-900 ${item.color} flex-shrink-0`;

  return (
    <div className={`
      relative p-5 rounded-xl border transition-all duration-300 flex flex-col gap-4
      ${isEquipped 
        ? 'bg-indigo-900/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
        : 'bg-slate-800 border-slate-700 hover:border-slate-500'}
    `}>
      {isOwned && (
          <div className="absolute top-3 right-3 text-emerald-400 z-10 bg-black/50 rounded-full p-1">
              <Check size={18} />
          </div>
      )}

      {item.type === 'banner' && item.image ? (
          // Image Banner Layout
          <div className="flex flex-col gap-3">
             <div className="w-full h-24 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden relative">
                 <div className="absolute inset-0" style={bgStyle}></div>
                 {IconComponent && (
                     <div className="absolute bottom-2 left-2 bg-black/60 p-1.5 rounded-md backdrop-blur-sm">
                        <IconComponent size={16} className="text-white" />
                     </div>
                 )}
             </div>
             <div>
                 <h4 className="text-white font-bold">{item.name}</h4>
                 <span className="text-xs text-slate-400 uppercase tracking-wider">{item.type}</span>
             </div>
          </div>
      ) : (
          // Icon/Title/Solid Banner Layout
          <div className="flex items-center gap-4">
             <div className={bgClass}>
                {IconComponent && <IconComponent size={28} className={item.type === 'title' ? item.color : 'text-white'} />}
             </div>
             <div>
                 <h4 className="text-white font-bold">{item.name}</h4>
                 <span className="text-xs text-slate-400 uppercase tracking-wider">{item.type}</span>
             </div>
          </div>
      )}
      
      <p className="text-slate-400 text-sm h-10 line-clamp-2">{item.description}</p>

      <button 
        onClick={handleAction}
        disabled={!isOwned && !canAfford}
        className={`
          w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all mt-auto
          ${isOwned
            ? isEquipped 
                ? 'bg-slate-700 text-slate-400 cursor-default' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            : canAfford 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
        `}
      >
        {isOwned 
          ? (isEquipped ? 'Equipped' : 'Equip') 
          : (
              <>
                {item.cost === 0 ? 'Free' : `${item.cost} Credits`}
              </>
          )
        }
      </button>
    </div>
  );
};

const ShopView: React.FC = () => {
  const { shopItems, user, buyRainbowName } = useGame();
  const [filter, setFilter] = useState<'all' | 'title' | 'banner' | 'black-market'>('all');
  const [notification, setNotification] = useState<string | null>(null);

  const filteredItems = filter === 'all' || filter === 'black-market'
    ? shopItems 
    : shopItems.filter(item => item.type === filter);

  const handleBuyRainbow = () => {
      const res = buyRainbowName();
      setNotification(res.message);
      setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      
      {notification && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-6 py-3 rounded-full text-white font-bold shadow-2xl z-50 animate-fade-in">
              {notification}
          </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Item Shop</h1>
          <p className="text-slate-400">Spend your hard-earned credits on exclusive cosmetics.</p>
        </div>
        
        <div className="flex p-1 bg-slate-800 rounded-lg border border-slate-700">
          {['all', 'title', 'banner', 'black-market'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                filter === f 
                    ? f === 'black-market' ? 'bg-slate-950 text-red-500 shadow-lg border border-red-900/50' : 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
              }`}
            >
              {f === 'black-market' ? 'Black Market' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {filter === 'black-market' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                   <div className="relative z-10 flex flex-col items-center text-center gap-4">
                       <Palette size={48} className="text-white animate-rainbow" />
                       <h3 className="text-2xl font-black text-white animate-rainbow">RGB Username</h3>
                       <p className="text-slate-400">Unlock a rainbow cycling animation for your username across the entire platform.</p>
                       <button 
                           onClick={handleBuyRainbow}
                           disabled={user?.hasRainbowName || user?.credits < RGB_NAME_COST}
                           className={`mt-4 px-8 py-3 rounded-xl font-bold flex items-center gap-2 ${user?.hasRainbowName ? 'bg-slate-800 text-slate-500' : 'bg-white text-black hover:scale-105 transition-transform'}`}
                       >
                           {user?.hasRainbowName ? 'OWNED' : `BUY FOR ${RGB_NAME_COST.toLocaleString()}`}
                       </button>
                   </div>
               </div>

               <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 to-red-900/20 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                   <div className="relative z-10 flex flex-col items-center text-center gap-4">
                       <Music size={48} className="text-pink-500" />
                       <h3 className="text-2xl font-black text-pink-500">Profile Music</h3>
                       <p className="text-slate-400">Upload your own track. Plays automatically when people visit your profile.</p>
                       <p className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">Available in Profile Settings</p>
                       <div className="text-pink-400 font-bold mt-2">
                           Cost: 5,000,000 Credits
                       </div>
                   </div>
               </div>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
            <ShopCard key={item.id} item={item} />
            ))}
        </div>
      )}
    </div>
  );
};

export default ShopView;
