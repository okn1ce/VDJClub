
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Gavel, Clock, History, User, Plus, XCircle, AlertTriangle, Gift } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { AuctionItem } from '../../types';

const TheAuctionHouse: React.FC = () => {
  const { setView, setActiveGameId, user, auctionState, placeAuctionBid, adminCreateAuction, adminCancelAuction, claimAuctionReward } = useGame();
  
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  // Create Form State
  const [showCreate, setShowCreate] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  const [newItem, setNewItem] = useState<Partial<AuctionItem>>({
      name: '', description: '', image: '', startingBid: 100, minIncrement: 50, type: 'banner'
  });
  const [auctionDuration, setAuctionDuration] = useState(60); // minutes

  const showNotification = (msg: string, type: 'success' | 'error') => {
      setNotification({ msg, type });
      setTimeout(() => setNotification(null), 3000);
  };

  // Timer Logic
  useEffect(() => {
    if (!auctionState?.activeItem) {
        setTimeLeft("NO AUCTION");
        return;
    }

    const interval = setInterval(() => {
        const now = Date.now();
        const diff = auctionState.activeItem!.endTime - now;

        if (diff <= 0) {
            setTimeLeft("CLOSED");
        } else {
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [auctionState?.activeItem]);

  const handleBid = () => {
      if (!auctionState?.activeItem) return;
      
      const minBid = auctionState.highestBidder 
        ? auctionState.currentBid + auctionState.activeItem.minIncrement 
        : auctionState.activeItem.startingBid;
      
      const res = placeAuctionBid(minBid);
      if (res.success) {
          showNotification(res.message, 'success');
      } else {
          showNotification(res.message, 'error');
      }
  };

  const handleCreate = () => {
      if (!newItem.name || !newItem.startingBid) return;
      
      const item: AuctionItem = {
          id: `auc_${Date.now()}`,
          name: newItem.name || 'Unknown Item',
          description: newItem.description || '',
          image: newItem.image || 'https://via.placeholder.com/400',
          type: newItem.type || 'banner',
          startingBid: Number(newItem.startingBid),
          minIncrement: Number(newItem.minIncrement) || 10,
          endTime: Date.now() + (auctionDuration * 60 * 1000),
          seller: 'SYSTEM'
      };

      adminCreateAuction(item);
      setShowCreate(false);
  };

  const handleCancelConfirm = () => {
      adminCancelAuction();
      showNotification("Auction Cancelled", 'success');
      setShowCancelConfirm(false);
  };

  const handleClaim = () => {
      const res = claimAuctionReward();
      if (res.success) {
          showNotification(res.message, 'success');
      } else {
          showNotification(res.message, 'error');
      }
  };

  return (
    <div className="flex h-screen w-full bg-[#110f0a] overflow-hidden relative font-serif text-amber-500">
        
        {/* Nav */}
        <div className="absolute top-6 left-6 z-50 flex items-center gap-4">
            <button 
                onClick={() => { setView('HOME'); setActiveGameId(null); }}
                className="bg-black/50 hover:bg-amber-900/30 text-amber-200 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all border border-amber-900/50"
            >
                <ArrowLeft size={18} /> Leave Auction
            </button>
            {user?.role === 'admin' && (
                <>
                <button 
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-full font-sans font-bold text-sm shadow-lg"
                >
                    <Plus size={16} /> New Auction
                </button>
                {auctionState?.activeItem && (
                    <button 
                        onClick={() => setShowCancelConfirm(true)}
                        className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-full font-sans font-bold text-sm shadow-lg flex items-center gap-2"
                    >
                        <XCircle size={16} /> Cancel Active
                    </button>
                )}
                </>
            )}
        </div>

        {/* Notification */}
        {notification && (
            <div className={`absolute top-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-2 rounded font-sans font-bold animate-fade-in ${notification.type === 'success' ? 'bg-emerald-900 text-white' : 'bg-red-900 text-white'}`}>
                {notification.msg}
            </div>
        )}

        {/* Create Modal */}
        {showCreate && (
            <div className="absolute inset-0 z-[70] bg-black/90 flex items-center justify-center p-4">
                <div className="bg-[#1a1814] border border-amber-700 p-8 rounded-xl w-full max-w-md space-y-4 font-sans text-amber-100">
                    <h2 className="text-2xl font-bold text-amber-500">List New Item</h2>
                    <input className="w-full bg-black border border-amber-900 p-2 rounded" placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                    <input className="w-full bg-black border border-amber-900 p-2 rounded" placeholder="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                    <input className="w-full bg-black border border-amber-900 p-2 rounded" placeholder="Image URL" value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} />
                    
                    <div>
                        <label className="text-xs text-amber-500 block mb-1">Item Type</label>
                        <select 
                            className="w-full bg-black border border-amber-900 p-2 rounded text-white"
                            value={newItem.type}
                            onChange={e => setNewItem({...newItem, type: e.target.value as any})}
                        >
                            <option value="banner">Banner</option>
                            <option value="title">Title</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" className="bg-black border border-amber-900 p-2 rounded" placeholder="Start Price" value={newItem.startingBid} onChange={e => setNewItem({...newItem, startingBid: Number(e.target.value)})} />
                        <input type="number" className="bg-black border border-amber-900 p-2 rounded" placeholder="Increment" value={newItem.minIncrement} onChange={e => setNewItem({...newItem, minIncrement: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="text-xs text-amber-500">Duration (Minutes)</label>
                        <input type="number" className="w-full bg-black border border-amber-900 p-2 rounded" value={auctionDuration} onChange={e => setAuctionDuration(Number(e.target.value))} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-amber-500">Cancel</button>
                        <button onClick={handleCreate} className="px-6 py-2 bg-amber-600 text-white rounded font-bold">Create Auction</button>
                    </div>
                </div>
            </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
            <div className="absolute inset-0 z-[70] bg-black/90 flex items-center justify-center p-4">
                <div className="bg-[#1a1814] border border-red-700/50 p-8 rounded-xl w-full max-w-sm font-sans">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <AlertTriangle className="text-red-500" /> Cancel Auction?
                    </h3>
                    <p className="text-amber-100/70 mb-6 text-sm">
                        This will immediately stop the auction and refund the current highest bidder. This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => setShowCancelConfirm(false)}
                            className="px-4 py-2 text-amber-500 hover:text-white transition-colors"
                        >
                            Back
                        </button>
                        <button 
                            onClick={handleCancelConfirm}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-bold shadow-lg"
                        >
                            Confirm Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="flex w-full h-full">
            
            {/* LEFT: Item Showcase */}
            <div className="flex-1 relative flex items-center justify-center p-12 bg-gradient-to-br from-[#1a1814] to-black">
                {auctionState?.activeItem ? (
                    <div className="relative max-w-lg w-full">
                        <div className="aspect-square rounded-full border-4 border-amber-600/30 overflow-hidden shadow-[0_0_50px_rgba(217,119,6,0.2)] bg-black relative mb-8">
                             <img src={auctionState.activeItem.image} alt="Auction Item" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                             {/* Overlay Shine */}
                             <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent pointer-events-none"></div>
                        </div>
                        <div className="text-center">
                            <h1 className="text-4xl md:text-5xl font-bold text-amber-100 mb-4">{auctionState.activeItem.name}</h1>
                            <p className="text-amber-700 font-sans italic max-w-md mx-auto">{auctionState.activeItem.description}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center opacity-50">
                        <Gavel size={64} className="mx-auto mb-4" />
                        <h2 className="text-2xl font-bold">No Active Auction</h2>
                        <p>Check back later for rare items.</p>
                    </div>
                )}
            </div>

            {/* RIGHT: Bidding Interface */}
            <div className="w-96 bg-[#0c0a08] border-l border-amber-900/30 flex flex-col relative z-10">
                
                {/* Timer Header */}
                <div className="p-6 border-b border-amber-900/30 bg-[#16120e] text-center">
                    <div className="text-amber-700 text-xs uppercase tracking-[0.2em] mb-1 font-sans font-bold">Time Remaining</div>
                    <div className="text-3xl font-mono text-amber-500 font-bold flex items-center justify-center gap-2">
                        <Clock size={24} /> {timeLeft}
                    </div>
                </div>

                {/* Current Status */}
                <div className="p-8 flex-1 flex flex-col items-center justify-center space-y-8">
                    {auctionState?.activeItem ? (
                        <>
                            <div className="text-center">
                                <div className="text-sm text-amber-600 font-sans font-bold uppercase mb-2">Current Highest Bid</div>
                                <div className="text-5xl font-black text-amber-100 tabular-nums drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                                    {auctionState.currentBid.toLocaleString()}
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <div className="w-16 h-16 rounded-full border-2 border-amber-500/50 bg-black overflow-hidden">
                                    {auctionState.highestBidderAvatar ? (
                                        <img src={auctionState.highestBidderAvatar} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="m-auto mt-4 text-amber-900"/>
                                    )}
                                </div>
                                <div className="text-amber-200 font-bold">{auctionState.highestBidder || 'No Bids Yet'}</div>
                            </div>

                            <div className="w-full px-8">
                                {timeLeft === 'CLOSED' ? (
                                    user?.username === auctionState.highestBidder ? (
                                        <button 
                                            onClick={handleClaim}
                                            className="w-full py-4 rounded-xl font-sans font-black text-lg shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 animate-bounce"
                                        >
                                            <Gift size={20} /> CLAIM REWARD
                                        </button>
                                    ) : (
                                        <button disabled className="w-full py-4 rounded-xl font-sans font-bold bg-slate-800 text-slate-500 cursor-not-allowed">
                                            AUCTION ENDED
                                        </button>
                                    )
                                ) : (
                                    <>
                                        <button 
                                            onClick={handleBid}
                                            className="w-full py-4 rounded-xl font-sans font-black text-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20"
                                        >
                                            BID {(auctionState.highestBidder ? auctionState.currentBid + auctionState.activeItem.minIncrement : auctionState.activeItem.startingBid).toLocaleString()}
                                        </button>
                                        <p className="text-center text-xs text-amber-800 mt-2 font-sans">
                                            Instant refund if outbid.
                                        </p>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-amber-900/50 text-center font-sans">Waiting for next lot...</div>
                    )}
                </div>

                {/* History Feed */}
                <div className="h-1/3 border-t border-amber-900/30 bg-[#0a0907] flex flex-col">
                    <div className="px-4 py-2 bg-[#16120e] text-amber-700 text-xs font-sans font-bold uppercase flex items-center gap-2">
                        <History size={12} /> Bid History
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 font-sans custom-scrollbar">
                        {auctionState?.history.map((entry, i) => (
                            <div key={i} className="flex justify-between items-center text-sm border-b border-amber-900/10 pb-2">
                                <div className="text-amber-300 font-bold">{entry.username}</div>
                                <div className="text-amber-600 font-mono">{entry.amount.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TheAuctionHouse;
