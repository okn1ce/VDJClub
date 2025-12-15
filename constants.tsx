
import { CosmeticItem, Game, UpgradeType, CoreTurret, Planet, Recipe } from "./types";
import { 
  User, Shield, Zap, Crown, Ghost, Sword, Skull, Star, Heart, 
  MousePointer2, Factory, TrendingUp, Users, Clock, Coins, Beer, Grid3X3, Castle, Palette,
  ShoppingBag, Tag, Image as ImageIcon, Lock, Key, Crosshair, Target, Cpu, Radio, Bitcoin, Briefcase,
  Leaf, Cog, Hexagon, Hammer, Rocket, Globe
} from "lucide-react";

export const PRESTIGE_RANKS = [
    "VDJPRO I",
    "VDJPRO II",
    "VDJPRO III",
    "GOONER I",
    "GOONER II",
    "GOONER III",
    "GOONER MASTER"
];

export const PRESTIGE_COST = 1000000; // 1 Million to prestige
export const RGB_NAME_COST = 500000;
export const PROFILE_MUSIC_COST = 5000000;

export const DEFAULT_GAMES: Game[] = [
  {
    id: 'abdou-clicker',
    title: 'Abdou Clicker',
    description: 'The empire building idle game. Generate "Abdous", buy upgrades to increase production, and convert your wealth into Credits.',
    thumbnail: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Abdou', 
    playerCount: '1',
    category: 'Strategy',
    difficulty: 'Easy'
  },
  {
    id: 'the-auction-house',
    title: 'The Auction House',
    description: 'Bid on exclusive items against other players. Highest bidder wins. Money is refunded if you are outbid.',
    thumbnail: 'https://images.unsplash.com/photo-1569388330292-79cc1ec6eb13?q=80&w=1000&auto=format&fit=crop',
    playerCount: 'MMO',
    category: 'Chance',
    difficulty: 'Medium'
  },
  {
    id: 'faction-wars',
    title: 'Faction Wars',
    description: 'Join a faction (Les Gays, Les Halalistes, or Les Haramistes) and battle for territory control on a global map.',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
    playerCount: 'MMO',
    category: 'Strategy',
    difficulty: 'Medium'
  },
  {
    id: 'the-vault',
    title: 'The Vault',
    description: 'Crack the 5-digit code to win the Jackpot. Every wrong guess increases the prize pool. Mastermind style logic.',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop', 
    playerCount: 'MMO',
    category: 'Puzzle',
    difficulty: 'Hard'
  },
  {
    id: 'le-bar-pmu',
    title: 'Le Bar PMU',
    description: 'Bet on community scenarios created by Admins. Winners split the pot!',
    thumbnail: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000&auto=format&fit=crop',
    playerCount: 'MMO',
    category: 'Chance',
    difficulty: 'Medium'
  },
  {
    id: 'king-of-the-hill',
    title: 'King of the Hill',
    description: 'Seize the throne and drain the treasury. Pay more than the current king to usurp them. The longer you sit, the more you earn.',
    thumbnail: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=1000&auto=format&fit=crop',
    playerCount: 'MMO',
    category: 'Strategy',
    difficulty: 'Medium'
  },
  {
    id: 'canvas-clash',
    title: 'Canvas Clash',
    description: 'A 50x50 shared canvas. Leave your mark, one pixel at a time. Total creative freedom (or chaos).',
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb39279c23?q=80&w=1000&auto=format&fit=crop',
    playerCount: 'MMO',
    category: 'Creative',
    difficulty: 'Easy'
  }
];

export const DEFAULT_SHOP_ITEMS: CosmeticItem[] = [
  { id: 'ti_1', name: 'Novice', description: 'Just getting started.', type: 'title', cost: 0, icon: 'User', color: 'text-slate-400' },
  { id: 'ti_2', name: 'High Roller', description: 'For those with deep pockets.', type: 'title', cost: 500, icon: 'Coins', color: 'text-emerald-400' },
  { id: 'ba_1', name: 'Slate Basic', description: 'Clean and simple.', type: 'banner', cost: 0, icon: 'Shield', color: 'bg-slate-700' },
  { id: 'ba_2', name: 'Royal Velvet', description: 'Luxurious purple.', type: 'banner', cost: 750, icon: 'Crown', color: 'bg-purple-900' },
  { id: 'ba_3', name: 'Cyber Grid', description: 'Digital aesthetic.', type: 'banner', cost: 1200, icon: 'Grid3X3', color: 'bg-indigo-900' },
];

export const DEFAULT_CLICKER_UPGRADES: UpgradeType[] = [
  { id: 'up_1', name: 'Cursor Upgrade', type: 'click', baseCost: 15, basePower: 1, icon: 'MousePointer2', color: 'bg-blue-500' },
  { id: 'up_2', name: 'Auto Clicker', type: 'auto', baseCost: 100, basePower: 5, icon: 'Clock', color: 'bg-emerald-500' },
  { id: 'up_3', name: 'Click Farm', type: 'auto', baseCost: 1000, basePower: 50, icon: 'Factory', color: 'bg-orange-500' },
  { id: 'up_4', name: 'AI Manager', type: 'auto', baseCost: 5000, basePower: 200, icon: 'Cpu', color: 'bg-pink-500' },
];

export const DEFAULT_CORE_TURRETS: CoreTurret[] = [
    { id: 'tur_1', name: 'Pea Shooter', cost: 100, dps: 5, icon: 'Crosshair', color: 'text-slate-400' },
    { id: 'tur_2', name: 'Blaster', cost: 500, dps: 30, icon: 'Target', color: 'text-blue-400' },
    { id: 'tur_3', name: 'Laser Beam', cost: 2500, dps: 150, icon: 'Zap', color: 'text-yellow-400' },
    { id: 'tur_4', name: 'Plasma Cannon', cost: 10000, dps: 800, icon: 'Cpu', color: 'text-purple-400' },
];

export const PLANETS: Planet[] = [
  {
    id: 'hydro',
    name: 'Hydro Prime',
    description: 'A water-rich world teeming with life and fuel sources.',
    resourceYield: { fuel: 2, spice: 0.5 },
    color: 'bg-blue-600'
  },
  {
    id: 'forge',
    name: 'Iron Forge',
    description: 'A desolate wasteland rich in minerals and metals.',
    resourceYield: { iron: 2, gold: 0.2 },
    color: 'bg-orange-700'
  },
  {
    id: 'cyber',
    name: 'Cyberon',
    description: 'A technological hub. Resources are scarce, but demand is high.',
    resourceYield: { circuit: 0.1 },
    color: 'bg-purple-600'
  },
  {
    id: 'eden',
    name: 'New Eden',
    description: 'A paradise planet. Ideal for luxury goods.',
    resourceYield: { spice: 1, gold: 0.5 },
    color: 'bg-emerald-600'
  }
];

export const RECIPES: Recipe[] = [
  {
    id: 'craft_steel',
    result: 'steel',
    ingredients: { iron: 5, fuel: 2 },
    craftTime: 5000
  },
  {
    id: 'craft_circuit',
    result: 'circuit',
    ingredients: { gold: 2, iron: 2 },
    craftTime: 10000
  },
  {
    id: 'craft_engine',
    result: 'engine',
    ingredients: { steel: 5, circuit: 2, fuel: 10 },
    craftTime: 30000
  },
  {
    id: 'craft_jewelry',
    result: 'jewelry',
    ingredients: { gold: 5, spice: 5 },
    craftTime: 15000
  }
];

export const ICON_MAP: Record<string, any> = {
  User, Shield, Zap, Crown, Ghost, Sword, Skull, Star, Heart, 
  MousePointer2, Factory, TrendingUp, Users, Clock, Coins, Beer, 
  Grid3X3, Castle, Palette, ShoppingBag, Tag, ImageIcon, Lock, Key,
  Crosshair, Target, Cpu, Radio, Bitcoin, Briefcase, Leaf, Cog, Hexagon,
  Hammer, Rocket, Globe
};
