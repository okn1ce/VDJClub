
import React, { useState, useRef } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Shield, UserPlus, DollarSign, Search, Users, Gamepad2, Edit2, Save, X, Image as ImageIcon, ShoppingBag, Plus, Trash2, Upload } from 'lucide-react';
import { Game, CosmeticItem } from '../../types';
import { ICON_MAP } from '../../constants';

const AdminView: React.FC = () => {
  const { allUsers, adminCreateUser, adminUpdateUserBalance, games, adminUpdateGame, shopItems, adminAddShopItem, adminDeleteShopItem } = useGame();
  
  // Create User State
  const [newUser, setNewUser] = useState({ username: '', password: '', credits: 250 });
  const [createMsg, setCreateMsg] = useState('');

  // Balance Update State
  const [editBalance, setEditBalance] = useState<{username: string, amount: string} | null>(null);

  // Game Edit State
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // Shop Manager State
  const [newShopItem, setNewShopItem] = useState<Partial<CosmeticItem>>({
      type: 'title',
      name: '',
      description: '',
      cost: 100,
      icon: 'Star',
      color: 'text-slate-400',
      image: ''
  });
  const [isImageBanner, setIsImageBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return;

    const success = adminCreateUser(newUser.username, newUser.password, Number(newUser.credits));
    if (success) {
      setCreateMsg(`User ${newUser.username} created!`);
      setNewUser({ username: '', password: '', credits: 250 });
      setTimeout(() => setCreateMsg(''), 3000);
    } else {
      setCreateMsg('Username already exists.');
    }
  };

  const handleUpdateBalance = (username: string) => {
    if (!editBalance || editBalance.username !== username) return;
    adminUpdateUserBalance(username, Number(editBalance.amount));
    setEditBalance(null);
  };

  const handleSaveGame = () => {
      if (editingGame) {
          adminUpdateGame(editingGame);
          setEditingGame(null);
      }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                  setNewShopItem({ ...newShopItem, image: reader.result });
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAddShopItem = () => {
      if (!newShopItem.name || !newShopItem.description) return;

      // Create object without undefined properties to satisfy Firebase
      const item: CosmeticItem = {
          id: `item_${Date.now()}`,
          name: newShopItem.name || 'New Item',
          description: newShopItem.description || '',
          type: newShopItem.type || 'title',
          cost: Number(newShopItem.cost),
          icon: newShopItem.icon || 'Star',
          color: newShopItem.color || 'text-white'
      };

      if (newShopItem.image) {
          item.image = newShopItem.image;
      }

      adminAddShopItem(item);
      
      // Reset form
      setNewShopItem({
          type: 'title',
          name: '',
          description: '',
          cost: 100,
          icon: 'Star',
          color: 'text-slate-400',
          image: ''
      });
      setIsImageBanner(false);
  };

  const availableIcons = Object.keys(ICON_MAP);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative pb-20">
      <header className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
          <Shield size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
          <p className="text-slate-400">Manage user accounts, games, and the shop.</p>
        </div>
      </header>

      {/* Game Edit Modal */}
      {editingGame && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-fade-in relative">
                  <button onClick={() => setEditingGame(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X /></button>
                  
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Edit2 size={24} className="text-indigo-400" /> Edit Game Details
                  </h2>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Title</label>
                          <input 
                              type="text" 
                              value={editingGame.title}
                              onChange={e => setEditingGame({...editingGame, title: e.target.value})}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
                          />
                      </div>
                      
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                          <textarea 
                              rows={3}
                              value={editingGame.description}
                              onChange={e => setEditingGame({...editingGame, description: e.target.value})}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Thumbnail URL</label>
                          <div className="flex gap-2">
                              <input 
                                  type="text" 
                                  value={editingGame.thumbnail}
                                  onChange={e => setEditingGame({...editingGame, thumbnail: e.target.value})}
                                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500 text-sm"
                              />
                              <div className="w-10 h-10 rounded overflow-hidden bg-slate-950 flex-shrink-0">
                                  <img src={editingGame.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                              </div>
                          </div>
                      </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
                              <select 
                                  value={editingGame.category}
                                  onChange={e => setEditingGame({...editingGame, category: e.target.value as any})}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
                              >
                                  <option value="Strategy">Strategy</option>
                                  <option value="Arcade">Arcade</option>
                                  <option value="Puzzle">Puzzle</option>
                                  <option value="Chance">Chance</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Difficulty</label>
                              <select 
                                  value={editingGame.difficulty}
                                  onChange={e => setEditingGame({...editingGame, difficulty: e.target.value as any})}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
                              >
                                  <option value="Easy">Easy</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Hard">Hard</option>
                              </select>
                          </div>
                       </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                      <button onClick={() => setEditingGame(null)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">Cancel</button>
                      <button onClick={handleSaveGame} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20">Save Changes</button>
                  </div>
              </div>
          </div>
      )}

      {/* Shop Management */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <ShoppingBag className="text-pink-400" /> Shop Management
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Add New Item Form */}
              <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl space-y-4">
                  <h3 className="text-white font-bold text-lg mb-4">Add New Item</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Type</label>
                          <select 
                              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                              value={newShopItem.type}
                              onChange={e => setNewShopItem({...newShopItem, type: e.target.value as any})}
                          >
                              <option value="title">Title</option>
                              <option value="banner">Banner</option>
                          </select>
                      </div>
                      <div>
                           <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cost</label>
                           <input 
                              type="number"
                              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                              value={newShopItem.cost}
                              onChange={e => setNewShopItem({...newShopItem, cost: Number(e.target.value)})}
                           />
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Name</label>
                      <input 
                          type="text" 
                          className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                          value={newShopItem.name}
                          onChange={e => setNewShopItem({...newShopItem, name: e.target.value})}
                          placeholder="e.g. Master Chief"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                      <input 
                          type="text" 
                          className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                          value={newShopItem.description}
                          onChange={e => setNewShopItem({...newShopItem, description: e.target.value})}
                          placeholder="Short flavor text..."
                      />
                  </div>

                  {newShopItem.type === 'title' ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Color Class</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs"
                                    value={newShopItem.color}
                                    onChange={e => setNewShopItem({...newShopItem, color: e.target.value})}
                                    placeholder="text-red-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Icon</label>
                                <select 
                                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs"
                                    value={newShopItem.icon}
                                    onChange={e => setNewShopItem({...newShopItem, icon: e.target.value})}
                                >
                                    {availableIcons.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>
                        </div>
                      </>
                  ) : (
                      <>
                          <div className="flex items-center gap-4 mb-2">
                              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                  <input 
                                      type="radio" 
                                      name="bannerType" 
                                      checked={!isImageBanner} 
                                      onChange={() => setIsImageBanner(false)} 
                                  /> 
                                  Color Banner
                              </label>
                              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                  <input 
                                      type="radio" 
                                      name="bannerType" 
                                      checked={isImageBanner} 
                                      onChange={() => setIsImageBanner(true)} 
                                  /> 
                                  Image Banner
                              </label>
                          </div>

                          {isImageBanner ? (
                              <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Upload Image</label>
                                  <div 
                                      className="w-full h-32 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-colors"
                                      onClick={() => fileInputRef.current?.click()}
                                  >
                                      {newShopItem.image ? (
                                          <img src={newShopItem.image} alt="Preview" className="h-full w-full object-cover rounded-md" />
                                      ) : (
                                          <>
                                              <Upload className="text-slate-500 mb-2" />
                                              <span className="text-xs text-slate-500">Click to upload</span>
                                          </>
                                      )}
                                      <input 
                                          type="file" 
                                          ref={fileInputRef} 
                                          className="hidden" 
                                          accept="image/*"
                                          onChange={handleImageUpload}
                                      />
                                  </div>
                              </div>
                          ) : (
                              <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Color Class</label>
                                  <input 
                                      type="text" 
                                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                                      value={newShopItem.color}
                                      onChange={e => setNewShopItem({...newShopItem, color: e.target.value})}
                                      placeholder="bg-red-500"
                                  />
                              </div>
                          )}
                          
                          {/* Banner also has Icon support in our model */}
                          <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Overlay Icon (Optional)</label>
                                <select 
                                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs"
                                    value={newShopItem.icon}
                                    onChange={e => setNewShopItem({...newShopItem, icon: e.target.value})}
                                >
                                    {availableIcons.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                          </div>
                      </>
                  )}

                  <button 
                      onClick={handleAddShopItem}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center gap-2"
                  >
                      <Plus size={18} /> Add to Shop
                  </button>
              </div>

              {/* Existing Items List */}
              <div className="lg:col-span-2 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  <h3 className="text-white font-bold text-lg sticky top-0 bg-slate-800 py-2 z-10">Current Inventory</h3>
                  {shopItems.map(item => (
                      <div key={item.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex items-center gap-4">
                          {/* Preview */}
                          <div className={`w-12 h-12 rounded flex items-center justify-center overflow-hidden bg-slate-800 shrink-0 ${!item.image ? item.color : ''}`}>
                              {item.image ? (
                                  <img src={item.image} alt="prev" className="w-full h-full object-cover" />
                              ) : (
                                  React.createElement(ICON_MAP[item.icon] || ICON_MAP['Star'], { size: 20, className: item.type === 'title' ? item.color : 'text-white' })
                              )}
                          </div>
                          
                          <div className="flex-1">
                              <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">{item.name}</span>
                                  <span className="text-[10px] uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">{item.type}</span>
                              </div>
                              <p className="text-xs text-slate-500">{item.description} • {item.cost} credits</p>
                          </div>

                          <button 
                              onClick={() => adminDeleteShopItem(item.id)}
                              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                              title="Delete Item"
                          >
                              <Trash2 size={18} />
                          </button>
                      </div>
                  ))}
              </div>

          </div>
      </div>

      {/* Game Management Panel */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-8">
           <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Gamepad2 className="text-yellow-400" /> Game Management
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {games.map(game => (
                   <div key={game.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex gap-4 hover:border-indigo-500 transition-colors">
                       <div className="w-16 h-16 rounded-lg overflow-hidden bg-black flex-shrink-0">
                           <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1 overflow-hidden">
                           <h3 className="font-bold text-white truncate">{game.title}</h3>
                           <p className="text-xs text-slate-400 line-clamp-2">{game.description}</p>
                       </div>
                       <button 
                          onClick={() => setEditingGame(game)}
                          className="self-start p-2 bg-slate-800 hover:bg-indigo-600 rounded-lg text-slate-400 hover:text-white transition-all"
                       >
                           <Edit2 size={16} />
                       </button>
                   </div>
               ))}
           </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create User Panel */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 h-fit">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <UserPlus className="text-indigo-400" /> Create Account
          </h2>
          
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Username</label>
              <input 
                type="text" 
                value={newUser.username}
                onChange={e => setNewUser({...newUser, username: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Password</label>
              <input 
                type="text" 
                value={newUser.password}
                onChange={e => setNewUser({...newUser, password: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Starting Credits</label>
              <input 
                type="number" 
                value={newUser.credits}
                onChange={e => setNewUser({...newUser, credits: Number(e.target.value)})}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
              />
            </div>
            
            <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors">
              Create User
            </button>

            {createMsg && (
              <p className={`text-sm text-center ${createMsg.includes('exists') ? 'text-red-400' : 'text-emerald-400'}`}>
                {createMsg}
              </p>
            )}
          </form>
        </div>

        {/* User List Panel */}
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 p-6">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="text-emerald-400" /> User Database
              </h2>
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2">
                 <Search size={14} className="text-slate-500" />
                 <span className="text-sm text-slate-500">{allUsers.length} users registered</span>
              </div>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                   <th className="py-3 px-4">User</th>
                   <th className="py-3 px-4">Role</th>
                   <th className="py-3 px-4">Balance</th>
                   <th className="py-3 px-4">Action</th>
                 </tr>
               </thead>
               <tbody className="text-sm">
                 {allUsers.map(u => (
                   <tr key={u.username} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                     <td className="py-3 px-4 font-medium text-white">{u.username}</td>
                     <td className="py-3 px-4">
                       <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                         u.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-slate-600/20 text-slate-400'
                       }`}>
                         {u.role}
                       </span>
                     </td>
                     <td className="py-3 px-4 text-emerald-300 font-mono">
                        {editBalance?.username === u.username ? (
                          <div className="flex items-center gap-2">
                             <input 
                                type="number" 
                                value={editBalance.amount}
                                autoFocus
                                onChange={e => setEditBalance({...editBalance, amount: e.target.value})}
                                className="w-24 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white outline-none"
                             />
                             <button onClick={() => handleUpdateBalance(u.username)} className="text-xs bg-emerald-600 px-2 py-1 rounded text-white">Save</button>
                             <button onClick={() => setEditBalance(null)} className="text-xs bg-slate-600 px-2 py-1 rounded text-white">X</button>
                          </div>
                        ) : (
                          u.credits.toLocaleString()
                        )}
                     </td>
                     <td className="py-3 px-4">
                        <button 
                          onClick={() => setEditBalance({ username: u.username, amount: u.credits.toString() })}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                          title="Edit Balance"
                        >
                          <DollarSign size={16} />
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
