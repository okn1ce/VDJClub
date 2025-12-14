
import { CosmeticItem, Game, UpgradeType, CoreTurret } from "./types";
import { 
  User, Shield, Zap, Crown, Ghost, Sword, Skull, Star, Heart, 
  MousePointer2, Factory, TrendingUp, Users, Clock, Coins, Beer, Grid3X3, Castle, Palette,
  ShoppingBag, Tag, Image as ImageIcon, Lock, Key, Crosshair, Target, Cpu, Radio, Bitcoin, Briefcase,
  Leaf, Cog, Hexagon
} from "lucide-react";

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
    id: 'faction-wars',
    title: 'Faction Wars',
    description: 'Join a faction (Les Gays, Les Halalistes, or Les Haramistes) and battle for territory control on a global map.',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
    playerCount: 'MMO',
    category: 'Strategy',
    difficulty: 'Medium'
  },
  {
    id: 'the-core',
    title: 'The Core',
    description: 'Co-op Boss Raid. Build turrets, combine DPS with the community, and destroy the Core for massive payouts.',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000&auto=format&fit=crop',
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

export const ICON_MAP: Record<string, any> = {
  User, Shield, Zap, Crown, Ghost, Sword, Skull, Star, Heart, 
  MousePointer2, Factory, TrendingUp, Users, Clock, Coins, Beer, 
  Grid3X3, Castle, Palette, ShoppingBag, Tag, ImageIcon, Lock, Key,
  Crosshair, Target, Cpu, Radio, Bitcoin, Briefcase, Leaf, Cog, Hexagon
};