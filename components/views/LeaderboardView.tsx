
import React from 'react';
import { Trophy, Medal, Coins, User, Crown } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

const LeaderboardView: React.FC = () => {
    const { allUsers, user } = useGame();

    const sortedUsers = [...allUsers].sort((a, b) => b.credits - a.credits);

    const getRankStyle = (index: number) => {
        switch (index) {
            case 0: return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]'; // Gold
            case 1: return 'bg-slate-300/20 border-slate-300/50 text-slate-300'; // Silver
            case 2: return 'bg-amber-700/20 border-amber-700/50 text-amber-600'; // Bronze
            default: return 'bg-slate-800/50 border-slate-700 text-slate-500';
        }
    };

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown size={20} className="text-yellow-400" fill="currentColor" />;
            case 1: return <Medal size={20} className="text-slate-300" />;
            case 2: return <Medal size={20} className="text-amber-600" />;
            default: return <span className="font-mono font-bold text-slate-500">#{index + 1}</span>;
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                        <Trophy className="text-yellow-500" size={32} /> Global Leaderboard
                    </h1>
                    <p className="text-slate-400">The wealthiest tycoons in Nexus Arcade.</p>
                </div>
                
                {user && (
                    <div className="bg-indigo-900/30 border border-indigo-500/30 px-6 py-3 rounded-xl flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Your Rank</div>
                            <div className="text-xl font-bold text-white">
                                #{sortedUsers.findIndex(u => u.username === user.username) + 1}
                            </div>
                        </div>
                        <div className="h-8 w-px bg-indigo-500/30"></div>
                        <div className="text-right">
                            <div className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Balance</div>
                            <div className="text-xl font-bold text-emerald-400 tabular-nums">
                                {user.credits.toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800 bg-slate-950/50 text-xs font-bold uppercase text-slate-500 tracking-wider">
                    <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                    <div className="col-span-6 md:col-span-5">Player</div>
                    <div className="col-span-4 md:col-span-3 text-right">Net Worth</div>
                    <div className="hidden md:block col-span-3 text-right">Victories</div>
                </div>

                <div className="divide-y divide-slate-800/50 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {sortedUsers.map((u, index) => {
                        const isMe = u.username === user?.username;
                        return (
                            <div 
                                key={u.username}
                                className={`grid grid-cols-12 gap-4 p-4 items-center transition-all duration-300
                                    ${isMe ? 'bg-indigo-600/10 hover:bg-indigo-600/20 border-l-2 border-indigo-500' : 'hover:bg-slate-800/50 border-l-2 border-transparent'}
                                `}
                            >
                                <div className="col-span-2 md:col-span-1 flex justify-center">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner ${getRankStyle(index)}`}>
                                        {getRankIcon(index)}
                                    </div>
                                </div>
                                
                                <div className="col-span-6 md:col-span-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-slate-700 shadow-sm relative group">
                                        {u.equipped.avatar ? (
                                            <img src={u.equipped.avatar} alt={u.username} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-600"><User size={20} /></div>
                                        )}
                                        {index === 0 && <div className="absolute inset-0 border-2 border-yellow-500/50 rounded-lg"></div>}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className={`font-bold truncate text-base flex items-center gap-2 ${isMe ? 'text-indigo-400' : 'text-white'}`}>
                                            {u.username} 
                                            {isMe && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20">YOU</span>}
                                        </div>
                                        <div className="text-xs text-slate-500 capitalize flex items-center gap-1">
                                            {u.role}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-span-4 md:col-span-3 text-right">
                                    <div className="flex items-center justify-end gap-2 font-mono font-bold text-emerald-400 text-lg">
                                        {u.credits.toLocaleString()} <Coins size={14} className="text-emerald-500" />
                                    </div>
                                </div>
                                
                                <div className="hidden md:block col-span-3 text-right">
                                    <div className="font-mono text-slate-400 font-medium">
                                        {u.stats.wins} Wins
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
export default LeaderboardView;
