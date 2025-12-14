
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
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
          <CurrencyDisplay />
          <main className="flex-1 h-screen overflow-y-auto bg-slate-950 relative">
            {/* Background Grid Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)',
                backgroundSize: '40px 40px',
                opacity: 0.5
            }}></div>
            
            {/* Ambient Glow */}
            <div className="fixed top-0 left-0 w-full h-1/2 bg-indigo-900/10 blur-[120px] pointer-events-none z-0"></div>

            <div className="relative z-10 pt-6">
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

// Separate wrapper to access context
const ContentWrapper: React.FC = () => {
  const { user } = useGame();
  
  if (!user) {
    return <LoginView />;
  }

  return <ContentArea />;
};

export default App;
