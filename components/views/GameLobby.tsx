
import React from 'react';
import { useGame } from '../../contexts/GameContext';
import AbdouClicker from '../games/AbdouClicker';
import BarPMU from '../games/BarPMU';
import KingOfTheHill from '../games/KingOfTheHill';
import CanvasClash from '../games/CanvasClash';
import TheVault from '../games/TheVault';
import FactionWars from '../games/FactionWars';
import TheAuctionHouse from '../games/TheAuctionHouse';

const GameLobby: React.FC = () => {
  const { activeGameId } = useGame();

  if (activeGameId === 'abdou-clicker') {
    return <AbdouClicker />;
  }
  
  if (activeGameId === 'le-bar-pmu') {
      return <BarPMU />;
  }

  if (activeGameId === 'king-of-the-hill') {
      return <KingOfTheHill />;
  }

  if (activeGameId === 'canvas-clash') {
      return <CanvasClash />;
  }

  if (activeGameId === 'the-vault') {
      return <TheVault />;
  }

  if (activeGameId === 'faction-wars') {
      return <FactionWars />;
  }

  if (activeGameId === 'the-auction-house') {
      return <TheAuctionHouse />;
  }

  return (
    <div className="flex items-center justify-center h-screen text-white">
        Game not found.
    </div>
  );
};

export default GameLobby;
