import { useGameState } from './hooks/useGameState.js';
import SetupScreen from './components/screens/SetupScreen.jsx';
import GameScreen from './components/screens/GameScreen.jsx';
import VictoryScreen from './components/screens/VictoryScreen.jsx';

import './styles/variables.css';
import './styles/components.css';
import './styles/game.css';
import './styles/animations.css';

export default function App() {
  const game = useGameState();

  if (game.phase === 'setup') {
    return <SetupScreen onStart={(names, mode) => game.startGame(names, mode)} />;
  }
  if (game.phase === 'playing') {
    return <GameScreen game={game} />;
  }
  if (game.phase === 'victory') {
    const winner = game.players.find((p) => p.id === game.winnerId);
    return (
      <VictoryScreen
        winner={winner}
        players={game.players}
        quesitos={game.quesitos}
        mode={game.mode}
        onPlayAgain={game.resetGame}
      />
    );
  }
  return null;
}
