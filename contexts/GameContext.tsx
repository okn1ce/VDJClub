
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ViewState, UserProfile, CosmeticItem, UpgradeType, BettingEvent, Bet, BettingOption, Game, KothState, CanvasPixels, VaultState, VaultHistoryEntry, CoreState, CorePlayer, CoreTurret, FactionId, Sector, FactionWarState } from '../types';
import { DEFAULT_CLICKER_UPGRADES, DEFAULT_GAMES, DEFAULT_SHOP_ITEMS, DEFAULT_CORE_TURRETS } from '../constants';
import { db } from '../services/firebase';
import { ref, onValue, set, update, remove, push, get, increment } from 'firebase/database';

interface GameContextType {
  view: ViewState;
  setView: (view: ViewState) => void;
  user: UserProfile | null;
  allUsers: UserProfile[]; // For admin usage
  login: (username: string, password: string) => boolean;
  logout: () => void;
  buyItem: (item: CosmeticItem) => boolean;
  equipItem: (item: CosmeticItem) => void;
  earnCredits: (amount: number) => void;
  updateAvatar: (url: string) => void;
  activeGameId: string | null;
  setActiveGameId: (id: string | null) => void;
  
  // Games Data
  games: Game[];
  adminUpdateGame: (game: Game) => void;

  // Shop Data
  shopItems: CosmeticItem[];
  adminAddShopItem: (item: CosmeticItem) => void;
  adminDeleteShopItem: (id: string) => void;

  // Clicker Game Data
  clickerUpgrades: UpgradeType[];
  
  // PMU Game Data & Functions
  bettingEvents: BettingEvent[];
  bets: Bet[];
  createBettingEvent: (question: string, options: string[]) => void;
  placeBet: (eventId: string, optionId: string, amount: number) => boolean;
  resolveBettingEvent: (eventId: string, winnerOptionId: string) => void;
  
  // King of the Hill Data & Functions
  kothState: KothState | null;
  usurpThrone: () => boolean;

  // Canvas Clash Data & Functions
  canvasPixels: CanvasPixels;
  placePixel: (index: number, color: string) => boolean;
  
  // The Vault Data & Functions
  vaultState: VaultState;
  submitVaultGuess: (guess: string) => Promise<{success: boolean, message: string, result?: {matches: number, partial: number}}>;

  // The Core Data & Functions
  coreState: CoreState | null;
  corePlayers: CorePlayer[];
  buyCoreTurret: (turret: CoreTurret) => boolean;
  adminResetCore: () => void;

  // Faction Wars Data & Functions
  factionSectors: Sector[];
  factionWarState: FactionWarState | null;
  joinFaction: (faction: FactionId) => boolean;
  interactWithSector: (sectorId: string, action: 'attack' | 'reinforce') => { success: boolean, message: string };
  adminResetFactionMap: () => void;

  // Admin functions
  adminCreateUser: (username: string, password: string, credits?: number) => boolean;
  adminUpdateUserBalance: (username: string, newBalance: number) => void;
  adminAddUpgrade: (upgrade: UpgradeType) => void;
  adminUpdateUpgrade: (upgrade: UpgradeType) => void;
  adminDeleteUpgrade: (id: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const STORAGE_KEY_CURRENT = 'nexus_current_user_v1';

const INITIAL_ADMIN: UserProfile = {
  username: "admin",
  password: "1234",
  role: 'admin',
  credits: 99999,
  inventory: ['ti_1', 'ti_2', 'ba_1', 'ba_2', 'ba_3'],
  equipped: {
    avatar: '',
    banner: 'ba_3',
    title: 'ti_2'
  },
  stats: { gamesPlayed: 0, wins: 0, totalEarnings: 0 }
};

const INITIAL_KOTH_STATE: KothState = {
    kingId: null,
    kingName: null,
    kingAvatar: null,
    currentPrice: 50,
    treasury: 1000, // Seed money
    kingSince: 0
};

const INITIAL_VAULT_STATE: VaultState = {
    jackpot: 500,
    isLocked: false,
    history: []
};

const INITIAL_CORE_STATE: CoreState = {
    level: 1,
    hp: 100000,
    maxHp: 100000,
    status: 'ALIVE',
    lastTick: Date.now()
};

// Helper to normalize faction IDs from legacy data
const normalizeFactionId = (faction: string): FactionId | undefined => {
    if (faction === 'gay' || faction === 'Les Gays') return 'gay';
    if (faction === 'halal' || faction === 'Les Halalistes') return 'halal';
    if (faction === 'haram' || faction === 'Les Haramistes') return 'haram';
    return undefined;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [view, setView] = useState<ViewState>('HOME');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  
  // Data synced from Firebase
  const [games, setGames] = useState<Game[]>([]);
  const [shopItems, setShopItems] = useState<CosmeticItem[]>([]);
  const [clickerUpgrades, setClickerUpgrades] = useState<UpgradeType[]>(DEFAULT_CLICKER_UPGRADES);
  const [bettingEvents, setBettingEvents] = useState<BettingEvent[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);

  // KOTH
  const [kothState, setKothState] = useState<KothState | null>(null);

  // Canvas
  const [canvasPixels, setCanvasPixels] = useState<CanvasPixels>({});

  // Vault
  const [vaultState, setVaultState] = useState<VaultState>(INITIAL_VAULT_STATE);

  // Core
  const [coreState, setCoreState] = useState<CoreState | null>(null);
  const [corePlayers, setCorePlayers] = useState<CorePlayer[]>([]);

  // Faction Wars
  const [factionSectors, setFactionSectors] = useState<Sector[]>([]);
  const [factionWarState, setFactionWarState] = useState<FactionWarState | null>(null);

  // 1. Initialize Listeners
  useEffect(() => {
    // Listen to Users
    const usersRef = ref(db, 'users');
    const unsubUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const rawUsers = Object.values(data) as any[];
        // Sanitize users list
        const usersList: UserProfile[] = rawUsers.map(u => ({
            ...u,
            faction: u.faction ? normalizeFactionId(u.faction) : undefined
        }));
        
        setAllUsers(usersList);
        
        // If we are logged in, update our local user state to match the DB
        setUser(prev => {
            if (prev) {
                const updated = usersList.find(u => u.username === prev.username);
                return updated || prev;
            }
            return null;
        });
      } else {
        // Initialize DB with admin if empty
        set(ref(db, `users/${INITIAL_ADMIN.username}`), INITIAL_ADMIN);
      }
    });

    // Listen to Games (Editable titles/images)
    const gamesRef = ref(db, 'games');
    const unsubGames = onValue(gamesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const dbGames = Object.values(data) as Game[];
            setGames(dbGames);
            
            // Auto-seed missing default games (Self-healing for new game additions)
            DEFAULT_GAMES.forEach(defGame => {
                if (!dbGames.find(g => g.id === defGame.id)) {
                    update(ref(db, `games/${defGame.id}`), defGame);
                }
            });

            // CLEANUP: Remove games not in DEFAULT_GAMES (Placeholders removal)
            const defaultIds = DEFAULT_GAMES.map(g => g.id);
            dbGames.forEach(g => {
                if (!defaultIds.includes(g.id)) {
                    remove(ref(db, `games/${g.id}`));
                }
            });
        } else {
            // Seed defaults if totally empty
            const updates: Record<string, Game> = {};
            DEFAULT_GAMES.forEach(g => { updates[g.id] = g; });
            set(ref(db, 'games'), updates);
        }
    });

    // Listen to Shop Items
    const shopRef = ref(db, 'shop_items');
    const unsubShop = onValue(shopRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setShopItems(Object.values(data));
        } else {
            // Seed defaults
            const updates: Record<string, CosmeticItem> = {};
            DEFAULT_SHOP_ITEMS.forEach(item => { updates[item.id] = item; });
            set(ref(db, 'shop_items'), updates);
        }
    });

    // Listen to Clicker Upgrades
    const upgradesRef = ref(db, 'upgrades');
    const unsubUpgrades = onValue(upgradesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setClickerUpgrades(Object.values(data));
        } else {
            // Init default upgrades
            DEFAULT_CLICKER_UPGRADES.forEach(u => {
                set(ref(db, `upgrades/${u.id}`), u);
            });
        }
    });

    // Listen to Events
    const eventsRef = ref(db, 'pmu/events');
    const unsubEvents = onValue(eventsRef, (snapshot) => {
        const data = snapshot.val();
        setBettingEvents(data ? Object.values(data) : []);
    });

    // Listen to Bets
    const betsRef = ref(db, 'pmu/bets');
    const unsubBets = onValue(betsRef, (snapshot) => {
        const data = snapshot.val();
        setBets(data ? Object.values(data) : []);
    });

    // Listen to KOTH
    const kothRef = ref(db, 'koth');
    const unsubKoth = onValue(kothRef, (snapshot) => {
        const data = snapshot.val();
        setKothState(data || INITIAL_KOTH_STATE);
        if(!data) {
             set(ref(db, 'koth'), INITIAL_KOTH_STATE);
        }
    });

    // Listen to Canvas
    const canvasRef = ref(db, 'canvas/pixels');
    const unsubCanvas = onValue(canvasRef, (snapshot) => {
        const data = snapshot.val();
        setCanvasPixels(data || {});
    });

    // Listen to Vault
    const vaultRef = ref(db, 'vault/public');
    const unsubVault = onValue(vaultRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
             // Handle arrays from firebase being objects if indices are sparse (unlikely here but good practice)
             const history = data.history ? Object.values(data.history) : [];
             // Sort history by time descending locally
             history.sort((a: any, b: any) => b.timestamp - a.timestamp);
             setVaultState({ ...data, history });
        } else {
            // Seed
            const seed: VaultState = { ...INITIAL_VAULT_STATE };
            set(ref(db, 'vault/public'), seed);
            set(ref(db, 'vault/private/code'), "12345"); // Default Code (5 digits)
        }
    });

    // Listen to Core State
    const coreStateRef = ref(db, 'core/state');
    const unsubCoreState = onValue(coreStateRef, (snapshot) => {
        const data = snapshot.val();
        setCoreState(data || INITIAL_CORE_STATE);
        if (!data) {
            set(ref(db, 'core/state'), INITIAL_CORE_STATE);
        }
    });

    // Listen to Core Players
    const corePlayersRef = ref(db, 'core/players');
    const unsubCorePlayers = onValue(corePlayersRef, (snapshot) => {
        const data = snapshot.val();
        setCorePlayers(data ? Object.values(data) : []);
    });

    // Listen to Faction Wars Sectors
    const factionsRef = ref(db, 'factions/map');
    const unsubFactions = onValue(factionsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setFactionSectors(Object.values(data));
        } else {
            // Seed 6x6 Map
            const initialSectors: Record<string, Sector> = {};
            for (let x = 0; x < 6; x++) {
                for (let y = 0; y < 6; y++) {
                    const id = `${x}_${y}`;
                    initialSectors[id] = {
                        id,
                        x, y,
                        owner: null,
                        defense: 100,
                        maxDefense: 100
                    };
                }
            }
            set(ref(db, 'factions/map'), initialSectors);
        }
    });

    // Listen to Faction War State (Timer, Pool)
    const factionStateRef = ref(db, 'factions/state');
    const unsubFactionState = onValue(factionStateRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setFactionWarState(data);
        } else {
            // Seed Initial War (3 Days)
            const now = Date.now();
            const threeDays = 3 * 24 * 60 * 60 * 1000;
            const initialState: FactionWarState = {
                seasonId: 1,
                startTime: now,
                endTime: now + threeDays,
                rewardPool: 50000
            };
            set(ref(db, 'factions/state'), initialState);
        }
    });

    return () => {
        unsubUsers();
        unsubGames();
        unsubShop();
        unsubUpgrades();
        unsubEvents();
        unsubBets();
        unsubKoth();
        unsubCanvas();
        unsubVault();
        unsubCoreState();
        unsubCorePlayers();
        unsubFactions();
        unsubFactionState();
    };
  }, []);

  // 2. Auto-login Check
  useEffect(() => {
    const storedCurrent = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (storedCurrent && allUsers.length > 0) {
      const foundUser = allUsers.find(u => u.username === storedCurrent);
      if (foundUser) setUser(foundUser);
    }
  }, [allUsers]); // Re-run when users are loaded

  // 3. KOTH Loop (Host Logic - driven by the King)
  useEffect(() => {
      // Logic runs if:
      // 1. User is logged in
      // 2. Koth state exists and has a king
      // 3. The current user IS the King
      if (!user || !kothState || !kothState.kingId || user.username !== kothState.kingId) return;

      const interval = setInterval(() => {
          // Payout is 1% of Treasury
          const payout = Math.max(1, Math.floor(kothState.treasury * 0.01));
          
          if (payout > 0) {
              const updates: Record<string, any> = {};
              // Use atomic increment so we don't depend on user.credits in dependency array (prevents timer reset)
              updates[`users/${user.username}/credits`] = increment(payout);
              updates[`users/${user.username}/stats/totalEarnings`] = increment(payout);
              // NOTE: We do NOT deduct from treasury. It continues to grow as people usurp.
              // It acts as an index for payout amount.
              
              update(ref(db), updates);
          }
      }, 3000);

      return () => clearInterval(interval);
  }, [user?.username, kothState?.kingId, kothState?.treasury]);


  // 4. The Core Admin Loop (Host Logic)
  useEffect(() => {
    if (!user || user.role !== 'admin' || !coreState) return;
    
    const interval = setInterval(() => {
        // Calculate Total DPS from all players
        const totalDps = corePlayers.reduce((sum, p) => sum + p.dps, 0);

        if (totalDps > 0 && coreState.hp > 0) {
            const updates: Record<string, any> = {};
            const newHp = Math.max(0, coreState.hp - totalDps);
            
            updates['core/state/hp'] = newHp;
            
            // Distribute damage dealt stats to players
            corePlayers.forEach(p => {
                if(p.dps > 0) {
                    updates[`core/players/${p.userId}/damageDealt`] = (p.damageDealt || 0) + p.dps;
                }
            });

            if (newHp === 0) {
                // BOSS DEAD - Distribute Rewards & Respawn
                // Reward Pool = 10% of Max HP (approx 1 credit per 10 dmg)
                
                const ratio = 0.1; // 10 damage = 1 credit
                
                corePlayers.forEach(p => {
                    const reward = Math.floor(p.damageDealt * ratio);
                    if (reward > 0) {
                         const playerUser = allUsers.find(u => u.username === p.userId);
                         if(playerUser) {
                             updates[`users/${p.userId}/credits`] = playerUser.credits + reward;
                             updates[`users/${p.userId}/stats/totalEarnings`] = playerUser.stats.totalEarnings + reward;
                         }
                    }
                    // Reset damage, DPS, and turrets for next round (Prestige/Reset mechanic)
                    updates[`core/players/${p.userId}/damageDealt`] = 0;
                    updates[`core/players/${p.userId}/dps`] = 0;
                    updates[`core/players/${p.userId}/turrets`] = {};
                });

                // Level Up Core
                const nextLevel = coreState.level + 1;
                const nextHp = Math.floor(coreState.maxHp * 1.5);
                updates['core/state/level'] = nextLevel;
                updates['core/state/maxHp'] = nextHp;
                updates['core/state/hp'] = nextHp;
            }

            update(ref(db), updates);
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [user?.role, coreState, corePlayers, allUsers]);

  // --- Auth ---

  const login = (username: string, password: string): boolean => {
    const foundUser = allUsers.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(STORAGE_KEY_CURRENT, username);
      setView('HOME');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_CURRENT);
    setView('HOME');
  };

  // --- Helpers for DB Updates ---
  
  const updateUserInDb = (updatedUser: UserProfile) => {
      // Optimistic update
      setUser(updatedUser);
      // DB Update
      update(ref(db, `users/${updatedUser.username}`), updatedUser);
  };

  // --- Game Actions ---
  
  const adminUpdateGame = (game: Game) => {
      update(ref(db, `games/${game.id}`), game);
  };

  // --- Shop Actions ---
  const adminAddShopItem = (item: CosmeticItem) => {
      set(ref(db, `shop_items/${item.id}`), item);
  };

  const adminDeleteShopItem = (id: string) => {
      remove(ref(db, `shop_items/${id}`));
  };

  const earnCredits = (amount: number) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      credits: user.credits + amount,
      stats: {
        ...user.stats,
        totalEarnings: user.stats.totalEarnings + amount
      }
    };
    updateUserInDb(updated);
  };

  const buyItem = (item: CosmeticItem): boolean => {
    if (!user) return false;
    if (user.inventory.includes(item.id)) return true;
    if (user.credits < item.cost) return false;

    const updated: UserProfile = {
      ...user,
      credits: user.credits - item.cost,
      inventory: [...user.inventory, item.id]
    };
    updateUserInDb(updated);
    return true;
  };

  const equipItem = (item: CosmeticItem) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      equipped: {
        ...user.equipped,
        [item.type]: item.id
      }
    };
    updateUserInDb(updated);
  };

  const updateAvatar = (url: string) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      equipped: {
        ...user.equipped,
        avatar: url
      }
    };
    updateUserInDb(updated);
  };

  // --- PMU Actions ---
  
  const createBettingEvent = (question: string, optionTexts: string[]) => {
      const id = `evt_${Date.now()}`;
      const options: BettingOption[] = optionTexts.map((text, idx) => ({
          id: `opt_${Date.now()}_${idx}`,
          text
      }));
      
      const newEvent: BettingEvent = {
          id,
          question,
          options,
          status: 'OPEN',
          createdAt: Date.now()
      };
      
      set(ref(db, `pmu/events/${id}`), newEvent);
  };

  const placeBet = (eventId: string, optionId: string, amount: number): boolean => {
      if (!user) return false;
      if (user.credits < amount) return false;
      if (amount <= 0) return false;

      // 1. Deduct money immediately
      const updatedUser = { ...user, credits: user.credits - amount };
      updateUserInDb(updatedUser);

      // 2. Record bet
      const betId = `bet_${Date.now()}`;
      const newBet: Bet = {
          id: betId,
          eventId,
          userId: user.username,
          optionId,
          amount,
          timestamp: Date.now()
      };
      set(ref(db, `pmu/bets/${betId}`), newBet);
      
      return true;
  };

  const resolveBettingEvent = async (eventId: string, winnerOptionId: string) => {
      try {
        const updates: Record<string, any> = {};
        updates[`pmu/events/${eventId}/status`] = 'RESOLVED';
        updates[`pmu/events/${eventId}/winnerOptionId`] = winnerOptionId;

        const eventBets = bets.filter(b => b.eventId === eventId);
        const winningBets = eventBets.filter(b => b.optionId === winnerOptionId);
        
        const payoutsByUser: Record<string, { totalPayout: number, totalProfit: number }> = {};

        winningBets.forEach(bet => {
            const payout = bet.amount * 2;
            const profit = payout - bet.amount;

            if (!payoutsByUser[bet.userId]) {
                payoutsByUser[bet.userId] = { totalPayout: 0, totalProfit: 0 };
            }
            payoutsByUser[bet.userId].totalPayout += payout;
            payoutsByUser[bet.userId].totalProfit += profit;
        });

        Object.entries(payoutsByUser).forEach(([username, { totalPayout, totalProfit }]) => {
            const winner = allUsers.find(u => u.username === username);
            if (winner) {
                updates[`users/${username}/credits`] = winner.credits + totalPayout;
                updates[`users/${username}/stats/wins`] = winner.stats.wins + 1;
                updates[`users/${username}/stats/totalEarnings`] = winner.stats.totalEarnings + totalProfit;
            }
        });

        await update(ref(db), updates);
      } catch (error) {
        console.error("Error resolving event:", error);
      }
  };

  // --- King of the Hill Actions ---

  const usurpThrone = (): boolean => {
      if (!user || !kothState) return false;
      if (user.credits < kothState.currentPrice) return false;
      if (user.username === kothState.kingId) return false;

      const cost = kothState.currentPrice;
      const newPrice = Math.floor(cost * 1.15);
      
      const updates: Record<string, any> = {};
      updates[`users/${user.username}/credits`] = user.credits - cost;
      updates[`koth/treasury`] = kothState.treasury + cost;
      updates[`koth/kingId`] = user.username;
      updates[`koth/kingName`] = user.username;
      updates[`koth/kingAvatar`] = user.equipped.avatar;
      updates[`koth/currentPrice`] = newPrice;
      updates[`koth/kingSince`] = Date.now();

      update(ref(db), updates);
      setUser({ ...user, credits: user.credits - cost });
      return true;
  };

  // --- Canvas Clash Actions ---

  const placePixel = (index: number, color: string): boolean => {
      if (!user) return false;
      const COST = 5;
      if (user.credits < COST) return false;

      const updates: Record<string, any> = {};
      updates[`users/${user.username}/credits`] = user.credits - COST;
      updates[`canvas/pixels/${index}`] = color;

      update(ref(db), updates);
      setUser({ ...user, credits: user.credits - COST });
      return true;
  };

  // --- The Vault Actions ---

  const submitVaultGuess = async (guess: string): Promise<{success: boolean, message: string, result?: {matches: number, partial: number}}> => {
      if (!user) return { success: false, message: "Not logged in" };
      // COST: 25 Credits
      if (user.credits < 25) return { success: false, message: "Not enough credits" };

      // 1. Fetch the secret code
      const snapshot = await get(ref(db, 'vault/private/code'));
      let secret = snapshot.val() as string;
      
      // Auto-migrate if length mismatch (Legacy support for 4 digit codes)
      if (!secret || secret.length !== 5) {
          secret = Math.floor(10000 + Math.random() * 90000).toString();
          await set(ref(db, 'vault/private/code'), secret);
      }
      
      // 2. Check Match (5 Digits)
      let matches = 0;
      let partial = 0;
      
      const guessArr = guess.split('');
      const secretArr = secret.split('');
      const secretUsed = Array(5).fill(false);
      const guessUsed = Array(5).fill(false);

      // Exact Matches
      for (let i = 0; i < 5; i++) {
          if (guessArr[i] === secretArr[i]) {
              matches++;
              secretUsed[i] = true;
              guessUsed[i] = true;
          }
      }

      // Partial Matches
      for (let i = 0; i < 5; i++) {
          if (!guessUsed[i]) {
              for (let j = 0; j < 5; j++) {
                  if (!secretUsed[j] && guessArr[i] === secretArr[j]) {
                      partial++;
                      secretUsed[j] = true;
                      break;
                  }
              }
          }
      }

      const updates: Record<string, any> = {};

      if (matches === 5) {
          // WINNER!
          const prize = vaultState.jackpot;
          updates[`users/${user.username}/credits`] = user.credits + prize; 
          updates[`users/${user.username}/stats/totalEarnings`] = user.stats.totalEarnings + prize;
          updates[`users/${user.username}/stats/wins`] = user.stats.wins + 1;
          
          updates[`vault/public/jackpot`] = 500; // Reset
          updates[`vault/public/lastWinner`] = {
              username: user.username,
              amount: prize,
              code: secret,
              timestamp: Date.now()
          };
          
          // New Code (5 Digits)
          const newCode = Math.floor(10000 + Math.random() * 90000).toString();
          updates[`vault/private/code`] = newCode;
          updates[`vault/public/history`] = []; // Reset history for new round

          await update(ref(db), updates);
          // Opt update
          setUser({ ...user, credits: user.credits + prize });
          return { success: true, message: "CODE CRACKED!", result: { matches: 5, partial: 0 } };

      } else {
          // LOSS - Deduct 25
          updates[`users/${user.username}/credits`] = user.credits - 25;
          updates[`vault/public/jackpot`] = vaultState.jackpot + 5;
          
          const entry: VaultHistoryEntry = {
              username: user.username,
              guess,
              matches,
              partial,
              timestamp: Date.now()
          };
          
          const historyRef = push(ref(db, 'vault/public/history'));
          updates[`vault/public/history/${historyRef.key}`] = entry;

          await update(ref(db), updates);
          // Opt update
          setUser({ ...user, credits: user.credits - 25 });
          return { success: false, message: "Incorrect Code", result: { matches, partial } };
      }
  };

  // --- The Core Actions ---
  const buyCoreTurret = (turret: CoreTurret): boolean => {
      if (!user) return false;
      if (user.credits < turret.cost) return false;

      // 1. Get current player state (or create)
      const playerState = corePlayers.find(p => p.userId === user.username) || {
          userId: user.username,
          username: user.username,
          dps: 0,
          damageDealt: 0,
          turrets: {},
          lastActive: Date.now()
      };

      // 2. Calculate New State
      const currentTurrets = playerState.turrets || {};
      const currentCount = currentTurrets[turret.id] || 0;
      const newTurrets = { ...currentTurrets, [turret.id]: currentCount + 1 };
      
      // Recalculate DPS completely from scratch to be safe
      let newDps = 0;
      Object.entries(newTurrets).forEach(([tid, count]) => {
           const t = DEFAULT_CORE_TURRETS.find(dt => dt.id === tid);
           if(t) newDps += t.dps * (count as number);
      });

      // 3. Update DB
      const updates: Record<string, any> = {};
      updates[`users/${user.username}/credits`] = user.credits - turret.cost;
      updates[`core/players/${user.username}`] = {
          ...playerState,
          dps: newDps,
          turrets: newTurrets,
          lastActive: Date.now()
      };

      update(ref(db), updates);
      setUser({ ...user, credits: user.credits - turret.cost });
      return true;
  };

  // Admin Reset Core to Level 1
  const adminResetCore = () => {
      // Reset State
      set(ref(db, 'core/state'), INITIAL_CORE_STATE);
      // Reset Players
      set(ref(db, 'core/players'), {});
  };

  // --- Faction Wars Actions ---
  const joinFaction = (faction: FactionId): boolean => {
      if (!user || user.faction) return false;

      const updates: Record<string, any> = {};
      updates[`users/${user.username}/faction`] = faction;
      
      update(ref(db), updates);
      setUser({ ...user, faction });
      return true;
  };

  const interactWithSector = (sectorId: string, action: 'attack' | 'reinforce'): { success: boolean, message: string } => {
      if (!user || !user.faction) return { success: false, message: "No faction" };
      const COST = 25;
      const POWER = 25;

      if (user.credits < COST) return { success: false, message: "Not enough credits" };

      const sector = factionSectors.find(s => s.id === sectorId);
      if (!sector) return { success: false, message: "Invalid sector" };

      const updates: Record<string, any> = {};
      updates[`users/${user.username}/credits`] = user.credits - COST;
      
      // Calculate new state
      let newDefense = sector.defense;
      // Normalizing current owner: if undefined (missing from DB), treat as null
      const currentOwner = sector.owner ? normalizeFactionId(sector.owner) || null : null;
      const userFactionId = normalizeFactionId(user.faction) || user.faction;
      
      let newOwner = currentOwner;
      let newMax = sector.maxDefense;

      if (action === 'attack') {
          // If unowned or enemy
          if (currentOwner === null) {
               newOwner = userFactionId;
               newDefense = 100; // Claim it
               newMax = 100;
          } else if (currentOwner !== userFactionId) {
               newDefense = sector.defense - POWER;
               if (newDefense <= 0) {
                   newOwner = userFactionId;
                   newDefense = 50; // Capture with some health
                   newMax = 100;
               }
          }
      } else {
          // Reinforce (Must own)
          if (currentOwner === userFactionId) {
              newDefense = sector.defense + POWER;
              if (newDefense > newMax) {
                  newMax = newDefense; // Increase max cap slightly on overflow
              }
          }
      }

      // Ensure we don't pass undefined to firebase
      updates[`factions/map/${sectorId}/owner`] = newOwner === undefined ? null : newOwner;
      updates[`factions/map/${sectorId}/defense`] = newDefense;
      updates[`factions/map/${sectorId}/maxDefense`] = newMax;

      update(ref(db), updates);
      setUser({ ...user, credits: user.credits - COST });

      return { success: true, message: action === 'attack' ? "Attack launched!" : "Sector reinforced!" };
  };

  const adminResetFactionMap = () => {
    remove(ref(db, 'factions/map'));
  };

  // --- Admin Actions ---

  const adminCreateUser = (username: string, password: string, credits: number = 250): boolean => {
    if (allUsers.find(u => u.username === username)) return false;

    const newUser: UserProfile = {
      username,
      password,
      role: 'user',
      credits,
      inventory: ['ti_1', 'ba_1'],
      equipped: { avatar: '', banner: 'ba_1', title: 'ti_1' },
      stats: { gamesPlayed: 0, wins: 0, totalEarnings: 0 }
    };

    set(ref(db, `users/${username}`), newUser);
    return true;
  };

  const adminUpdateUserBalance = (username: string, newBalance: number) => {
    update(ref(db, `users/${username}`), { credits: newBalance });
  };

  const adminAddUpgrade = (upgrade: UpgradeType) => {
    set(ref(db, `upgrades/${upgrade.id}`), upgrade);
  };

  const adminUpdateUpgrade = (upgrade: UpgradeType) => {
    update(ref(db, `upgrades/${upgrade.id}`), upgrade);
  };

  const adminDeleteUpgrade = (id: string) => {
    remove(ref(db, `upgrades/${id}`));
  };

  return (
    <GameContext.Provider value={{ 
      view, 
      setView, 
      user, 
      allUsers,
      login, 
      logout,
      buyItem, 
      equipItem, 
      earnCredits, 
      updateAvatar,
      activeGameId, 
      setActiveGameId,
      games,
      adminUpdateGame,
      shopItems,
      adminAddShopItem,
      adminDeleteShopItem,
      clickerUpgrades,
      bettingEvents,
      bets,
      createBettingEvent,
      placeBet,
      resolveBettingEvent,
      // KOTH
      kothState,
      usurpThrone,
      // Canvas
      canvasPixels,
      placePixel,
      // Vault
      vaultState,
      submitVaultGuess,
      // Core
      coreState,
      corePlayers,
      buyCoreTurret,
      adminResetCore,
      // Factions
      factionSectors,
      factionWarState,
      joinFaction,
      interactWithSector,
      adminResetFactionMap,
      // Admin
      adminCreateUser,
      adminUpdateUserBalance,
      adminAddUpgrade,
      adminUpdateUpgrade,
      adminDeleteUpgrade
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
};
