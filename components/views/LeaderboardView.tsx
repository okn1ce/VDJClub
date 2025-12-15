
import React from 'react';
import { Trophy, Medal, Coins, User, Crown, ChevronsUp } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

const LeaderboardView: React.FC = () => {
    const { allUsers, user, setViewingProfile, setView } = useGame();

    // Filter out admins and then sort by credits
    const sortedUsers = allUsers
        .filter(u => u.role !== 'admin')
        .sort((a, b) => b.credits - a.credits);

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

    const handleProfileClick = (targetUser: typeof allUsers[0]) => {
        setViewingProfile(targetUser);
        setView('PROFILE');
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                        <Trophy className="text-yellow-500" size={32} /> Global Leaderboard
                    </h1>
                    <p className="text-slate-400">The wealthiest tycoons in Vidio Di Jour Club.</p>
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
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <th className="p-4 w-24 text-center">Rank</th>
                                <th className="p-4">Player</th>
                                <th className="p-4">Wins</th>
                                <th className="p-4 text-right">Net Worth</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUsers.map((u, index) => {
                                const isCurrentUser = user && u.username === user.username;
                                return (
                                    <tr 
                                        key={u.username} 
                                        onClick={() => handleProfileClick(u)}
                                        className={`border-b border-slate-800/50 transition-colors cursor-pointer group ${isCurrentUser ? 'bg-indigo-900/10' : 'hover:bg-slate-800/30'}`}
                                    >
                                        <td className="p-4 text-center">
                                            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border ${getRankStyle(index)}`}>
                                                {getRankIcon(index)}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-indigo-500 transition-colors">
                                                    {u.equipped.avatar ? (
                                                        <img src={u.equipped.avatar} alt={u.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} className="text-slate-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`font-bold ${u.hasRainbowName ? 'animate-rainbow' : isCurrentUser ? 'text-indigo-400' : 'text-white'}`}>
                                                            {u.username}
                                                        </div>
                                                        {u.prestigeRank && (
                                                            <div className="px-1.5 py-0.5 bg-yellow-900/40 text-yellow-500 rounded border border-yellow-700/50 text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                                                                <ChevronsUp size={10} /> {u.prestigeRank}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                                        <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{u.role}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-slate-300">
                                            {u.stats.wins}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-emerald-400 font-mono font-bold">
                                                {u.credits.toLocaleString()}
                                                <Coins size={16} />
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Lifetime: {u.stats.totalEarnings.toLocaleString()}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {sortedUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">
                                        No players found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardView;
