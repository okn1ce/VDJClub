
import { CosmeticItem, Game, UpgradeType, CoreTurret } from "./types";
import { 
  User, Shield, Zap, Crown, Ghost, Sword, Skull, Star, Heart, 
  MousePointer2, Factory, TrendingUp, Users, Clock, Coins, Beer, Grid3X3, Castle, Palette,
  ShoppingBag, Tag, Image as ImageIcon, Lock, Key, Crosshair, Target, Cpu, Radio
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
    id: 'the-glitch',
    title: 'The Glitch',
    description: 'Multiplayer Survival. Memorize safe zones, move before the grid corrupts. Last one standing takes the pot.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    playerCount: '2+',
    category: 'Arcade',
    difficulty: 'Hard'
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
  },
  // --- New Ideas ---
  {
    id: 'neon-crash',
    title: 'Neon Crash',
    description: 'The multiplier rises indefinitely... until it crashes. Cash out your bet before it breaks to win big.',
    thumbnail: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1000&auto=format&fit=crop',
    playerCount: 'MMO',
    category: 'Chance',
    difficulty: 'Hard'
  },
  {
    id: 'cyber-blackjack',
    title: 'Cyber Blackjack',
    description: 'Classic 21 against a ruthless AI dealer. High stakes, holographic cards, and massive rewards.',
    thumbnail: 'https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=1000&auto=format&fit=crop',
    playerCount: '1',
    category: 'Chance',
    difficulty: 'Medium'
  },
  {
    id: 'drone-defense',
    title: 'Drone Defense',
    description: 'Tower defense. Deploy automated drones to protect the Nexus server from waves of viruses.',
    thumbnail: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=1000&auto=format&fit=crop',
    playerCount: '1',
    category: 'Strategy',
    difficulty: 'Medium'
  },
  {
    id: 'binary-rain',
    title: 'Binary Rain',
    description: 'Type the falling code snippets before they breach the firewall. A test of typing speed and accuracy.',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop',
    playerCount: '1',
    category: 'Arcade',
    difficulty: 'Hard'
  },
  {
    id: 'quantum-slots',
    title: 'Quantum Slots',
    description: 'Spin the reels of reality. Match symbols across 5 lines for massive payouts.',
    thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=1000&auto=format&fit=crop',
    playerCount: '1',
    category: 'Chance',
    difficulty: 'Easy'
  },
  {
    id: 'memory-matrix',
    title: 'Memory Matrix',
    description: 'Memorize the pattern of flashing nodes. The sequence gets longer with every success.',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
    playerCount: '1',
    category: 'Puzzle',
    difficulty: 'Medium'
  },
  {
    id: 'syntax-sniper',
    title: 'Syntax Sniper',
    description: '1v1 Reaction test. Wait for the signal... SHOOT. Winner takes the bet.',
    thumbnail: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1000&auto=format&fit=crop',
    playerCount: '2',
    category: 'Arcade',
    difficulty: 'Hard'
  },
  {
    id: 'pixel-tycoon',
    title: 'Pixel Tycoon',
    description: 'Buy low, sell high. Trade virtual assets in a fluctuating market simulation