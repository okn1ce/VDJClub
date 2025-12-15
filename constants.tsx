import { CosmeticItem, Game, UpgradeType, CoreTurret, Planet, Recipe, FishType, RodType, Ocean } from "./types";
import { 
  User, Shield, Zap, Crown, Ghost, Sword, Skull, Star, Heart, 
  MousePointer2, Factory, TrendingUp, Users, Clock, Coins, Beer, Grid3X3, Castle, Palette,
  ShoppingBag, Tag, Image as ImageIcon, Lock, Key, Crosshair, Target, Cpu, Radio, Bitcoin, Briefcase,
  Leaf, Cog, Hexagon, Hammer, Rocket, Globe, Fish, Anchor, Droplets, Flame, Gem, Mic, MessageCircle
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

// --- FISHING GAME CONSTANTS ---
export const GOLD_EXCHANGE_RATE = 10000; // 10k Gold = 1 Credit

export const OCEANS: Ocean[] = [
    { 
        id: 'starter', 
        name: 'The Shallows', 
        cost: 0, 
        description: 'Calm waters near the dock. Perfect for beginners.', 
        color: 'bg-[#1e3a52]' 
    },
    { 
        id: 'hlilux', 
        name: "L'Ocean Hlilux", 
        cost: 50000, 
        description: 'A chaotic, tropical paradise where the fish are as loud as the waves.', 
        color: 'bg-teal-900' 
    },
    { 
        id: 'salim', 
        name: "L'Ocean Salim", 
        cost: 250000, 
        description: 'Dark, industrial waters filled with heavy metal and protein.', 
        color: 'bg-slate-900' 
    },
    { 
        id: 'zwamels', 
        name: "L'Ocean Zwamels", 
        cost: 1000000, 
        description: 'A mystical, rainbow-colored abyss. The strangest creatures live here.', 
        color: 'bg-fuchsia-950' 
    }
];

export const FISH_TYPES: FishType[] = [
    // --- The Shallows (Starter) ---
    { id: 'guppy', name: 'Guppy', rarity: 'Common', baseValue: 10, baseChance: 0.45, icon: 'Fish', color: 'text-slate-400', oceanId: 'starter' },
    { id: 'clown', name: 'Clownfish', rarity: 'Common', baseValue: 25, baseChance: 0.35, icon: 'Fish', color: 'text-orange-400', oceanId: 'starter' },
    { id: 'trout', name: 'River Trout', rarity: 'Uncommon', baseValue: 50, baseChance: 0.25, icon: 'Fish', color: 'text-green-400', oceanId: 'starter' },
    { id: 'puffer', name: 'Pufferfish', rarity: 'Uncommon', baseValue: 80, baseChance: 0.15, icon: 'Anchor', color: 'text-yellow-200', oceanId: 'starter' },
    { id: 'salmon', name: 'King Salmon', rarity: 'Rare', baseValue: 150, baseChance: 0.10, icon: 'Fish', color: 'text-pink-400', oceanId: 'starter' },
    { id: 'eel', name: 'Electric Eel', rarity: 'Rare', baseValue: 350, baseChance: 0.05, icon: 'Zap', color: 'text-yellow-400', oceanId: 'starter' },
    { id: 'koi', name: 'Golden Koi', rarity: 'Epic', baseValue: 500, baseChance: 0.03, icon: 'Fish', color: 'text-yellow-500', oceanId: 'starter' },
    { id: 'sword', name: 'Swordfish', rarity: 'Epic', baseValue: 900, baseChance: 0.02, icon: 'Sword', color: 'text-cyan-300', oceanId: 'starter' },
    { id: 'shark', name: 'Reef Shark', rarity: 'Epic', baseValue: 1500, baseChance: 0.01, icon: 'Skull', color: 'text-red-500', oceanId: 'starter' },
    { id: 'kraken', name: 'Baby Kraken', rarity: 'Legendary', baseValue: 5000, baseChance: 0.005, icon: 'Ghost', color: 'text-purple-500', oceanId: 'starter' },
    { id: 'leviathan', name: 'The Leviathan', rarity: 'Legendary', baseValue: 15000, baseChance: 0.001, icon: 'Crown', color: 'text-indigo-400 animate-pulse', oceanId: 'starter' },

    // --- L'Ocean Hlilux (50k) ---
    { id: 'shisha_crab', name: 'Shisha Crab', rarity: 'Common', baseValue: 60, baseChance: 0.40, icon: 'Star', color: 'text-emerald-300', oceanId: 'hlilux' },
    { id: 'lacoste_trout', name: 'Lacoste Trout', rarity: 'Common', baseValue: 80, baseChance: 0.35, icon: 'Fish', color: 'text-green-600', oceanId: 'hlilux' },
    { id: 'zbi_fish', name: 'Zbi Fish', rarity: 'Uncommon', baseValue: 150, baseChance: 0.25, icon: 'Fish', color: 'text-red-400', oceanId: 'hlilux' },
    { id: 'tn_barracuda', name: 'TN Barracuda', rarity: 'Uncommon', baseValue: 200, baseChance: 0.20, icon: 'Sword', color: 'text-slate-300', oceanId: 'hlilux' },
    { id: 'raï_ray', name: 'Raï Ray', rarity: 'Rare', baseValue: 400, baseChance: 0.12, icon: 'Zap', color: 'text-yellow-600', oceanId: 'hlilux' },
    { id: 'marseille_grouper', name: 'Marseille Grouper', rarity: 'Rare', baseValue: 550, baseChance: 0.08, icon: 'Fish', color: 'text-blue-400', oceanId: 'hlilux' },
    { id: 'jul_jelly', name: 'Jul Jellyfish', rarity: 'Epic', baseValue: 1000, baseChance: 0.04, icon: 'Ghost', color: 'text-purple-400', oceanId: 'hlilux' },
    { id: 'tmax_shark', name: 'T-Max Shark', rarity: 'Epic', baseValue: 2000, baseChance: 0.02, icon: 'Rocket', color: 'text-zinc-400', oceanId: 'hlilux' },
    { id: 'neon_shrimp', name: 'Neon Shrimp', rarity: 'Legendary', baseValue: 6000, baseChance: 0.005, icon: 'Zap', color: 'text-pink-500', oceanId: 'hlilux' },
    { id: 'solar_whale', name: 'Solar Whale', rarity: 'Legendary', baseValue: 20000, baseChance: 0.001, icon: 'Globe', color: 'text-orange-500 animate-pulse', oceanId: 'hlilux' },

    // --- L'Ocean Salim (250k) ---
    { id: 'bolt_fish', name: 'Rusty Bolt', rarity: 'Common', baseValue: 200, baseChance: 0.45, icon: 'Cog', color: 'text-orange-900', oceanId: 'salim' },
    { id: 'protein_guppy', name: 'Protein Guppy', rarity: 'Common', baseValue: 250, baseChance: 0.35, icon: 'Fish', color: 'text-slate-200', oceanId: 'salim' },
    { id: 'dumbbell_crab', name: 'Dumbbell Crab', rarity: 'Uncommon', baseValue: 450, baseChance: 0.25, icon: 'Hammer', color: 'text-gray-400', oceanId: 'salim' },
    { id: 'bench_press_bass', name: 'Bench Press Bass', rarity: 'Uncommon', baseValue: 500, baseChance: 0.20, icon: 'Fish', color: 'text-red-700', oceanId: 'salim' },
    { id: 'steroid_shark', name: 'Roid Shark', rarity: 'Rare', baseValue: 900, baseChance: 0.10, icon: 'Skull', color: 'text-red-500', oceanId: 'salim' },
    { id: 'oil_slick_eel', name: 'Oil Slick Eel', rarity: 'Rare', baseValue: 1200, baseChance: 0.08, icon: 'Droplets', color: 'text-black', oceanId: 'salim' },
    { id: 'mechanic_marlin', name: 'Mechanic Marlin', rarity: 'Epic', baseValue: 2500, baseChance: 0.04, icon: 'Sword', color: 'text-blue-900', oceanId: 'salim' },
    { id: 'iron_lung', name: 'Iron Lung', rarity: 'Epic', baseValue: 3500, baseChance: 0.02, icon: 'Heart', color: 'text-zinc-500', oceanId: 'salim' },
    { id: 'bmw_m5_fish', name: 'The M5-Fish', rarity: 'Legendary', baseValue: 10000, baseChance: 0.005, icon: 'Rocket', color: 'text-blue-600', oceanId: 'salim' },
    { id: 'gigachad_whale', name: 'GigaChad Whale', rarity: 'Legendary', baseValue: 35000, baseChance: 0.001, icon: 'Crown', color: 'text-slate-100 animate-pulse', oceanId: 'salim' },

    // --- L'Ocean Zwamels (1M) ---
    { id: 'glitter_guppy', name: 'Glitter Guppy', rarity: 'Common', baseValue: 1000, baseChance: 0.40, icon: 'Star', color: 'text-pink-300', oceanId: 'zwamels' },
    { id: 'yas_queen_clam', name: 'Yaaas Clam', rarity: 'Common', baseValue: 1200, baseChance: 0.35, icon: 'Gem', color: 'text-purple-300', oceanId: 'zwamels' },
    { id: 'rainbow_trout', name: 'Rainbow Trout', rarity: 'Uncommon', baseValue: 2500, baseChance: 0.25, icon: 'Fish', color: 'text-red-500 animate-rainbow', oceanId: 'zwamels' },
    { id: 'lgtv_ray', name: 'LGTV Ray', rarity: 'Uncommon', baseValue: 3000, baseChance: 0.20, icon: 'Radio', color: 'text-cyan-400', oceanId: 'zwamels' },
    { id: 'unicorn_fish', name: 'Unicorn Fish', rarity: 'Rare', baseValue: 5000, baseChance: 0.12, icon: 'Zap', color: 'text-white', oceanId: 'zwamels' },
    { id: 'drama_dolphin', name: 'Drama Dolphin', rarity: 'Rare', baseValue: 6500, baseChance: 0.08, icon: 'MessageCircle', color: 'text-fuchsia-500', oceanId: 'zwamels' },
    { id: 'pop_star_puffer', name: 'Pop Star Puffer', rarity: 'Epic', baseValue: 12000, baseChance: 0.04, icon: 'Mic', color: 'text-rose-400', oceanId: 'zwamels' },
    { id: 'slay_shark', name: 'Slay Shark', rarity: 'Epic', baseValue: 15000, baseChance: 0.02, icon: 'Skull', color: 'text-violet-500', oceanId: 'zwamels' },
    { id: 'zwamel_king', name: 'The Zwamel King', rarity: 'Legendary', baseValue: 50000, baseChance: 0.005, icon: 'Crown', color: 'text-yellow-400', oceanId: 'zwamels' },
    { id: 'lady_gaga', name: 'Mother Monster', rarity: 'Legendary', baseValue: 100000, baseChance: 0.001, icon: 'Sparkles', color: 'text-white animate-pulse', oceanId: 'zwamels' },
];

export const ROD_TYPES: RodType[] = [
    { id: 'stick', name: 'Stick & String', multiplier: 1, cost: 0, currency: 'gold' },
    { id: 'bamboo', name: 'Bamboo Pole', multiplier: 1.3, cost: 500, currency: 'gold' },
    { id: 'fiberglass', name: 'Fiberglass Rod', multiplier: 1.8, cost: 5000, currency: 'gold' },
    { id: 'steel', name: 'Steel Reinforced', multiplier: 2.2, cost: 15000, currency: 'gold' },
    { id: 'carbon', name: 'Carbon Fiber', multiplier: 3.0, cost: 50000, currency: 'gold' },
    { id: 'lucky', name: 'Lucky Striker', multiplier: 2.5, cost: 0, currency: 'gold', specialFishId: 'koi', specialBonus: 5, craftingReq: { koi: 5 } },
    { id: 'shock', name: 'Shock Caster', multiplier: 3.5, cost: 5000, currency: 'gold', specialFishId: 'eel', specialBonus: 3, craftingReq: { eel: 3 } },
    { id: 'titanium', name: 'Titanium Pro', multiplier: 4.5, cost: 250000, currency: 'gold' },
    { id: 'excalibur', name: 'Excalibur', multiplier: 5.5, cost: 50000, currency: 'gold', specialFishId: 'sword', specialBonus: 3, craftingReq: { sword: 1 } },
    { id: 'harpoon', name: 'The Harpoon', multiplier: 7.0, cost: 100000, currency: 'gold', specialFishId: 'shark', specialBonus: 3, craftingReq: { shark: 3 } },
    { id: 'neptune', name: 'Trident of Neptune', multiplier: 20, cost: 0, currency: 'gold', craftingReq: { kraken: 1, leviathan: 1 } },
];

export const DEFAULT_GAMES: Game[] = [
  {
    id: 'fishing-game',
    title: 'Reel Fortune',
    description: 'Relax, catch fish, craft powerful rods, and play the market. Exchange Gold for Credits.',
    thumbnail: 'https://images.unsplash.com/photo-1517823933093-64478833486c?q=80&w=1000&auto=format&fit=crop',
    playerCount: 'MMO',
    category: 'Arcade',
    difficulty: 'Easy'
  },
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
  Hammer, Rocket, Globe, Fish, Anchor, Droplets, Flame, Gem,
  Mic,
  MessageCircle
};
