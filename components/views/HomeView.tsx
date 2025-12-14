import React from 'react';
import { Play, Users, Zap, Star } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

const HomeView: React.FC = () => {
  const { setView, setActiveGameId, earnCredits, games } = useGame();

  // Select a random featured game (fallback if empty)
  const featuredGame = games.length > 0 ? games[0] : null; 

  const handlePlay = (gameId: string) => {
    setActiveGameId(gameId);
    setView('GAME_LOBBY');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      
      {/* Featured Game Hero Section */}
      {featuredGame && (
        <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl group cursor-pointer" onClick={() => handlePlay(featuredGame.id)}>
            <div className="absolute inset-0">
                <img src={featuredGame.thumbnail} alt={featuredGame.title} className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"/>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
            </div>
            
            <div className="relative z-10 p-10 md:p-16 flex flex-col items-start gap-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold border border-emerald-500/20">
                <Star size={14} fill="currentColor" />
                <span>FEATURED GAME</span>
                </div>
                
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
                    {featuredGame.title}
                    </h1>
                    <p className="text-slate-300 text-lg md:text-xl max-w-xl">
                    {featuredGame.description}
                    </p>
                </div>

                <button 
                    onClick={(e) => { e.stopPropagation(); handlePlay(featuredGame.id); }}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 hover:scale-105 transition-all shadow-lg flex items-center gap-2 mt-4"
                >
                    <Play size={20} fill="currentColor" />
                    Play Now
                </button>
            </div>
        </section>
      )}

      {/* Games Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="text-yellow-400" /> All Games
          </h2>
          <div className="flex gap-2">
            {['All', 'Strategy', 'Arcade', 'Puzzle'].map(cat => (
              <button key={cat} className="px-4 py-1.5 text-sm rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <div 
              key={game.id}
              className="group relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={game.thumbnail} 
                  alt={game.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-xs font-semibold text-white border border-white/10 flex items-center gap-1">
                  <Users size={12} /> {game.playerCount}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{game.title}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-1">
                  {game.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                   <span className={`text-xs px-2 py-1 rounded border ${
                       game.difficulty === 'Easy' ? 'border-emerald-500/30 text-emerald-400' :
                       game.difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-400' :
                       'border-red-500/30 text-red-400'
                   }`}>
                       {game.difficulty}
                   </span>
                   <button 
                     onClick={() => handlePlay(game.id)}
                     className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg"
                    >
                       <Play size={18} fill="currentColor" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Quick Play Debug */}
      <section className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
         <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4">Development Tools</h3>
         <button 
            onClick={() => earnCredits(100)}
            className="px-4 py-2 bg-emerald-900/50 text-emerald-400 border border-emerald-800 rounded-lg text-sm hover:bg-emerald-900 transition-colors"
         >
             Add 100 Credits (Debug)
         </button>
      </section>
    </div>
  );
};

export default HomeView;
