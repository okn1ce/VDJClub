
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Skull, Crown, AlertTriangle, Users, Coins } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { GlitchPlayer, GlitchState } from '../../types';

// Constants
const GRID_SIZE = 5;
const TILE_COUNT = GRID_SIZE * GRID_SIZE;

const TheGlitch: React.FC = () => {
  const { 
    user, 
    setView, 
    setActiveGameId, 
    glitchState, 
    glitchPlayers, 
    joinGlitchGame, 
    leaveGlitchGame, 
    moveGlitchPlayer,
    adminUpdateGlitchState,
    adminUpdateGlitchPlayer,
    adminResetGlitch,
    earnCredits // For winner payout
  } = useGame();

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
      setNotification(msg);
      setTimeout(() => setNotification(null), 3000);
  };

  // --- HOST LOGIC (Admin Only) ---
  // This effect runs the game loop. It MUST handle cases where the component unmounts.
  useEffect(() => {
    if (!user || user.role !== 'admin' || !glitchState) return;
    if (glitchState.status !== 'PLAYING') return;

    const interval = setInterval(() => {
        const now = Date.now();
        
        // Phase Transition Logic
        if (now >= glitchState.endTime) {
            handlePhaseTransition();
        }

    }, 500);

    return () => clearInterval(interval);
  }, [user?.role, glitchState?.status, glitchState?.phase, glitchState?.endTime]);

  // Separate function to avoid massive dependency array in useEffect
  const handlePhaseTransition = () => {
      if (!glitchState || glitchState.status !== 'PLAYING') return;

      if (glitchState.phase === 'MEMORIZE') {
          // Transition to MOVE
          // Speed up as rounds progress (min 1.5s)
          const newDuration = Math.max(1500, glitchState.difficultySpeed * Math.pow(0.9, glitchState.round - 1));
          
          adminUpdateGlitchState({
              phase: 'MOVE',
              endTime: Date.now() + newDuration,
              difficultySpeed: glitchState.difficultySpeed // Keep base, but we calculate specific round duration
          });

      } else if (glitchState.phase === 'MOVE') {
          // Transition to ELIMINATE (The Glitch happens)
          // 1. Check players on unsafe tiles
          const safeSet = new Set(glitchState.safeTiles);
          const updates: Record<string, any> = {};
          let aliveCount = 0;
          let lastSurvivor: GlitchPlayer | null = null;

          glitchPlayers.forEach(p => {
              if (p.status === 'DEAD') return;
              
              const tileIndex = p.y * GRID_SIZE + p.x;
              if (!safeSet.has(tileIndex)) {
                  // Eliminate
                  adminUpdateGlitchPlayer(p.userId, { status: 'DEAD' });
              } else {
                  aliveCount++;
                  lastSurvivor = p;
              }
          });

          // 2. Set State to ELIMINATE (Show Red)
          adminUpdateGlitchState({
              phase: 'ELIMINATE',
              endTime: Date.now() + 3000 // 3 seconds of showing destruction
          });

      } else if (glitchState.phase === 'ELIMINATE') {
          // Check win condition or New Round
          const alivePlayers = glitchPlayers.filter(p => p.status === 'ALIVE');
          
          if (alivePlayers.length <= 1) {
              // Game Over
              const winner = alivePlayers[0];
              if (winner) {
                  adminUpdateGlitchPlayer(winner.userId, { status: 'WINNER' });
                  // Payout needs to happen. 
                  // In a real app, this should be server side. 
                  // Here, the admin client triggers the payout in the DB.
                  // We can't easily trigger the `earnCredits` for another user without cloud functions 
                  // or direct DB manipulation.
                  // We will rely on the `adminUpdateUserBalance` or similar logic if we had it exposed for arbitrary users.
                  // For now, let's just mark the winner. The prize distribution logic is complex client-side.
              }
              adminUpdateGlitchState({ status: 'ENDED' });
          } else {
              // Next Round
              const newSafeTiles = [];
              // Generate 3-8 safe tiles depending on grid size
              const safeCount = Math.floor(Math.random() * 3) + 3;
              while(newSafeTiles.length < safeCount) {
                  const r = Math.floor(Math.random() * TILE_COUNT);
                  if(!newSafeTiles.includes(r)) newSafeTiles.push(r);
              }

              adminUpdateGlitchState({
                  status: 'PLAYING',
                  phase: 'MEMORIZE',
                  round: glitchState.round + 1,
                  safeTiles: newSafeTiles,
                  endTime: Date.now() + 3000 // 3s to memorize
              });
          }
      }
  };


  // --- USER ACTIONS ---

  const handleJoin = () => {
     const success = joinGlitchGame();
     if(!success) showNotification("Not enough credits or already joined.");
  };

  const handleStartGame = () => {
      // Init Game
      const newSafeTiles: number[] = [];
      const safeCount = 5;
      while(newSafeTiles.length < safeCount) {
          const r = Math.floor(Math.random() * TILE_COUNT);
          if(!newSafeTiles.includes(r)) newSafeTiles.push(r);
      }

      // Reset all players to ALIVE
      glitchPlayers.forEach(p => {
          adminUpdateGlitchPlayer(p.userId, { status: 'ALIVE' });
      });

      adminUpdateGlitchState({
          status: 'PLAYING',
          phase: 'MEMORIZE',
          round: 1,
          safeTiles: newSafeTiles,
          endTime: Date.now() + 3000,
          difficultySpeed: 4000
      });
  };

  const handleTileClick = (index: number) => {
      if (!glitchState || glitchState.status !== 'PLAYING') return;
      if (glitchState.phase === 'ELIMINATE') return; // Frozen during glitch

      const x = index % GRID_SIZE;
      const y = Math.floor(index / GRID_SIZE);
      
      const myPlayer = glitchPlayers.find(p => p.userId === user?.username);
      if (myPlayer && myPlayer.status === 'ALIVE') {
          moveGlitchPlayer(x, y);
      }
  };


  // --- RENDER HELPERS ---

  const getTileStatus = (index: number) => {
      if (!glitchState || glitchState.status !== 'PLAYING') return 'NEUTRAL';
      
      if (glitchState.phase === 'MEMORIZE') {
          return glitchState.safeTiles.includes(index) ? 'SAFE' : 'NEUTRAL';
      }
      if (glitchState.phase === 'MOVE') {
          return 'NEUTRAL'; // Tiles look normal, players must remember!
      }
      if (glitchState.phase === 'ELIMINATE') {
          return glitchState.safeTiles.includes(index) ? 'SAFE' : 'DEAD';
      }
      return 'NEUTRAL';
  };

  const getTimerProgress = () => {
      if (!glitchState || glitchState.endTime === 0) return 0;
      const total = glitchState.phase === 'MEMORIZE' ? 3000 : 
                   glitchState.phase === 'MOVE' ? Math.max(1500, glitchState.difficultySpeed * Math.pow(0.9, glitchState.round - 1)) : 
                   3000;
      const remaining = Math.max(0, glitchState.endTime - Date.now());
      return (remaining / total) * 100;
  };

  if (!glitchState) return <div className="p-10 text-white">Loading...</div>;

  const myPlayer = glitchPlayers.find(p => p.userId === user?.username);
  const amIAlive = myPlayer?.status === 'ALIVE';
  const amIWinner = myPlayer?.status === 'WINNER';

  return (
    <div className="flex flex-col h-screen w-full bg-[#050505] relative overflow-hidden font-mono">
        {/* Grid Background Effect */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(rgba(0, 255, 170, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 170, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        {/* --- TOP BAR --- */}
        <div className="relative z-20 p-6 flex justify-between items-start">
            <button 
                onClick={() => { leaveGlitchGame(); setView('HOME'); setActiveGameId(null); }}
                className="bg-black/50 hover:bg-red-900/30 text-emerald-400 border border-emerald-900/50 px-4 py-2 rounded flex items-center gap-2 transition-all uppercase text-xs tracking-widest"
            >
                <ArrowLeft size={14} /> Jack Out
            </button>

            <div className="flex flex-col items-end">
                <h1 className="text-3xl font-black text-white glitch-text tracking-tighter">THE GLITCH</h1>
                <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm">
                        <Users size={16} /> {glitchPlayers.filter(p => p.status === 'ALIVE').length} Alive
                    </div>
                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <Coins size={16} /> Pot: {glitchState.pot}
                    </div>
                </div>
            </div>
        </div>

        {/* --- NOTIFICATION --- */}
        {notification && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-2 rounded font-bold shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-bounce">
                {notification}
            </div>
        )}

        {/* --- MAIN GAME AREA --- */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-4">
            
            {/* LOBBY VIEW */}
            {glitchState.status === 'LOBBY' && (
                <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)] text-center max-w-md w-full">
                    <AlertTriangle size={48} className="mx-auto text-emerald-500 mb-4 animate-pulse" />
                    <h2 className="text-2xl font-bold text-white mb-2">System Idle</h2>
                    <p className="text-emerald-400/70 mb-8">Waiting for connection...</p>
                    
                    {!myPlayer ? (
                        <button 
                            onClick={handleJoin}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-lg shadow-[0_0_20px_rgba(5,150,105,0.4)] transition-all flex items-center justify-center gap-2"
                        >
                            <Coins size={20} /> Insert 50 Credits
                        </button>
                    ) : (
                        <div className="p-4 border border-emerald-500/50 rounded-lg bg-emerald-900/20 text-emerald-300 font-bold animate-pulse">
                            CONNECTED - AWAITING HOST
                        </div>
                    )}

                    {/* Admin Controls */}
                    {user?.role === 'admin' && (
                        <div className="mt-8 pt-6 border-t border-slate-700">
                            <p className="text-xs text-slate-500 uppercase mb-2">Admin Override</p>
                            <button 
                                onClick={handleStartGame}
                                className="w-full py-2 bg-slate-700 hover:bg-white hover:text-black text-white font-bold rounded transition-colors"
                            >
                                INITIATE PROTOCOL
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* PLAYING VIEW */}
            {glitchState.status === 'PLAYING' && (
                <>
                    {/* Phase Indicator */}
                    <div className="mb-6 text-center">
                         <div className={`text-4xl font-black uppercase tracking-widest drop-shadow-lg
                            ${glitchState.phase === 'MEMORIZE' ? 'text-emerald-400' : 
                              glitchState.phase === 'MOVE' ? 'text-yellow-400' : 'text-red-500'}
                         `}>
                             {glitchState.phase === 'MEMORIZE' && "MEMORIZE"}
                             {glitchState.phase === 'MOVE' && "MOVE"}
                             {glitchState.phase === 'ELIMINATE' && "GLITCH"}
                         </div>
                         <div className="text-slate-500 text-sm font-bold mt-1">ROUND {glitchState.round}</div>
                    </div>

                    {/* Timer Bar */}
                    <div className="w-64 h-2 bg-slate-800 rounded-full mb-8 overflow-hidden border border-slate-700">
                        <div 
                            className={`h-full transition-all duration-100 ease-linear ${
                                glitchState.phase === 'ELIMINATE' ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${getTimerProgress()}%` }}
                        ></div>
                    </div>

                    {/* THE GRID */}
                    <div className="grid grid-cols-5 gap-2 sm:gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800 shadow-2xl relative">
                        {/* Overlay for dead players */}
                        {!amIAlive && !user?.role.includes('admin') && (
                            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
                                <Skull size={64} className="text-red-600 mb-4 animate-pulse" />
                                <h3 className="text-2xl font-bold text-red-500 uppercase tracking-widest">Eliminated</h3>
                            </div>
                        )}

                        {Array.from({ length: TILE_COUNT }).map((_, index) => {
                            const status = getTileStatus(index);
                            const playersHere = glitchPlayers.filter(p => (p.y * GRID_SIZE + p.x) === index && p.status !== 'DEAD');
                            
                            // Visuals
                            let bgClass = "bg-slate-800";
                            if (status === 'SAFE') bgClass = "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] border-emerald-400";
                            if (status === 'DEAD') bgClass = "bg-red-900/50 animate-pulse border-red-600";
                            
                            // Interactive
                            const isClickable = amIAlive && glitchState.phase === 'MOVE';

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleTileClick(index)}
                                    disabled={!isClickable}
                                    className={`
                                        w-12 h-12 sm:w-16 sm:h-16 rounded-md border-2 transition-all duration-200 relative
                                        ${bgClass}
                                        ${status === 'NEUTRAL' ? 'border-slate-700' : ''}
                                        ${isClickable ? 'hover:border-white hover:bg-slate-700 cursor-pointer' : 'cursor-default'}
                                    `}
                                >
                                    {/* Players rendering */}
                                    <div className="absolute inset-0 flex items-center justify-center flex-wrap content-center gap-0.5 p-1">
                                        {playersHere.map(p => (
                                            <div key={p.userId} className="w-3 h-3 rounded-full bg-white shadow-sm" title={p.username}>
                                                {p.userId === user?.username && (
                                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </>
            )}

            {/* ENDED VIEW */}
            {glitchState.status === 'ENDED' && (
                <div className="bg-slate-900/90 backdrop-blur-md p-8 rounded-2xl border border-yellow-500/30 text-center animate-fade-in">
                    <Crown size={64} className="mx-auto text-yellow-500 mb-4" />
                    <h2 className="text-3xl font-black text-white mb-2">GAME OVER</h2>
                    
                    <div className="my-6">
                        <p className="text-slate-400 uppercase text-xs tracking-widest mb-2">Winner</p>
                        {glitchPlayers.find(p => p.status === 'WINNER') ? (
                            <div className="text-2xl font-bold text-yellow-400">
                                {glitchPlayers.find(p => p.status === 'WINNER')?.username}
                            </div>
                        ) : (
                            <div className="text-xl text-red-400 font-bold">NO SURVIVORS</div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={() => { leaveGlitchGame(); setView('HOME'); setActiveGameId(null); }}
                            className="px-6 py-3 border border-slate-600 rounded text-slate-300 hover:text-white"
                        >
                            Leave
                        </button>
                        {user?.role === 'admin' && (
                             <button 
                                onClick={adminResetGlitch}
                                className="px-6 py-3 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-500"
                             >
                                Open Lobby
                             </button>
                        )}
                    </div>
                </div>
            )}
        </div>
        
        {/* CSS Effects */}
        <style>{`
            .glitch-text {
                text-shadow: 2px 0 #ff0000, -2px 0 #00ff00;
                animation: glitch 1s infinite alternate-reverse;
            }
            @keyframes glitch {
                0% { text-shadow: 2px 0 red, -2px 0 blue; transform: skew(0deg); }
                20% { text-shadow: -2px 0 red, 2px 0 blue; transform: skew(10deg); }
                40% { text-shadow: 2px 0 red, -2px 0 blue; transform: skew(-5deg); }
                100% { text-shadow: -2px 0 red, 2px 0 blue; transform: skew(0deg); }
            }
        `}</style>
    </div>
  );
};

export default TheGlitch;
