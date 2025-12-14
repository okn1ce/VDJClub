
import React from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import Sidebar from './components/Sidebar';
import CurrencyDisplay from './components/CurrencyDisplay';
import HomeView from './components/views/HomeView';
import ShopView from './components/views/ShopView';
import ProfileView from './components/views/ProfileView';
import LeaderboardView from './components/views/LeaderboardView';
import GameLobby from './components/views/GameLobby';
import LoginView from './components/views/LoginView';
import AdminView from './components/views/AdminView';

const ContentArea: React.FC = () => {
  const { view, user } = useGame();

  if (!user) {
    return <LoginView />;
  }

  const renderView = () => {
    switch (view) {
      case 'HOME':
        return <HomeView />;
      case 'SHOP':
        return <ShopView />;
      case 'LEADERBOARD':
        return <LeaderboardView />;
      case 'PROFILE':
        return <ProfileView />;
      case 'GAME_LOBBY':
        return <GameLobby />;
      case 'ADMIN':
        return user.role === 'admin' ? <AdminView /> : <HomeView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      {/* 
        SIDEBAR: Fixed position, Width 20 (5rem/80px), Z-index 100 
        Managed entirely within Sidebar.tsx but reserving space here conceptually.
      */}
      <Sidebar />

      {/* 
        MAIN CONTENT: Absolute positioned to the right of the sidebar.
        This creates a hard boundary between navigation and content.
      */}
      <div className="absolute top-0 right-0 bottom-0 left-20 overflow-y-auto custom-scrollbar bg-slate-950">
          <CurrencyDisplay />
          
          <main className="relative min-h-full">
            {/* Background Layers */}
            <div className="fixed inset-0 z-0 pointer-events-none ml-20" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)',
                backgroundSize: '40px 40px',
                opacity: 0.5
            }}></div>
            
            <div className="fixed top-0 left-20 right-0 h-1/2 bg-indigo-900/10 blur-[120px] pointer-events-none z-0"></div>

            {/* View Content */}
            <div className="relative z-10 pt-6 pb-20">
              {renderView()}
            </div>
          </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
       <ContentWrapper />
    </GameProvider>
  );
};

const ContentWrapper: React.FC = () => {
  const { user } = useGame();
  
  if (!user) {
    return <LoginView />;
  }

  return <ContentArea />;
};

export default App;
