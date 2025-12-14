
export type ViewState = 'HOME' | 'SHOP' | 'PROFILE' | 'GAME_LOBBY' | 'ADMIN' | 'LEADERBOARD';

export type UserRole = 'user' | 'admin';

export interface DailyChallenge {
  title: string;
  description: string;
  reward: number;
  gameId: string;
}

export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  type: 'banner' | 'title';
  cost: number;
  icon: string; // Lucide icon name or emoji
  color: string; // Tailwind color class or Hex code
  image?: string; // Optional URL/DataURI for image banners
}

export interface UpgradeType {
  id: string;
  name: string;
  type: 'click' | 'auto';
  baseCost: number;
  basePower: number;
  icon: string; // key of ICON_MAP
  color: string;
}

export type FactionId = 'cyber' | 'steampunk' | 'nature';

export interface UserProfile {
  username: string;
  password?: string; // Optional because we might not want to expose it in UI often, but used for auth
  role: UserRole;
  credits: number;
  faction?: FactionId; // New field for Faction Wars
  inventory: string[]; // Array of CosmeticItem IDs
  equipped: {
    avatar: string;
    banner: string;
    title: string;
  };
  stats: {
    gamesPlayed: number;
    wins: number;
    totalEarnings: number;
  };
}

export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  playerCount: string;
  category: 'Strategy' | 'Arcade' | 'Puzzle' | 'Chance' | 'Creative';
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

// --- PMU Types ---
export interface BettingOption {
  id: string;
  text: string;
}

export interface BettingEvent {
  id: string;
  question: string;
  options: BettingOption[];
  status: 'OPEN' | 'RESOLVED';
  winnerOptionId?: string;
  createdAt: number;
}

export interface Bet {
  id: string;
  eventId: string;
  userId: string;
  optionId: string;
  amount: number;
  timestamp: number;
}

// --- King of the Hill Types ---
export interface KothState {
  kingId: string | null;
  kingName: string | null;
  kingAvatar: string | null;
  currentPrice: number;
  treasury: number;
  kingSince: number;
}

// --- Canvas Clash Types ---
export type CanvasPixels = Record<string, string>; // Key is index "0" to "2499", value is Hex Color

// --- The Vault Types ---
export interface VaultHistoryEntry {
  username: string;
  guess: string;
  matches: number; // Correct Number, Correct Position
  partial: number; // Correct Number, Wrong Position
  timestamp: number;
}

export interface VaultState {
  jackpot: number;
  isLocked: boolean; // Just in case we need to pause it
  history: VaultHistoryEntry[];
  lastWinner?: {
    username: string;
    amount: number;
    code: string;
    timestamp: number;
  };
}

// --- The Core Types ---
export interface CoreTurret {
  id: string;
  name: string;
  cost: number;
  dps: number;
  icon: string;
  color: string;
}

export interface CorePlayer {
  userId: string;
  username: string;
  dps: number;
  damageDealt: number;
  turrets: Record<string, number>; // turretId -> count
  lastActive: number;
}

export interface CoreState {
  level: number;
  hp: number;
  maxHp: number;
  status: 'ALIVE' | 'DEAD';
  lastTick: number;
}

// --- Faction Wars Types ---
export interface Sector {
  id: string; // "x_y"
  x: number;
  y: number;
  owner: FactionId | null;
  defense: number;
  maxDefense: number;
}
