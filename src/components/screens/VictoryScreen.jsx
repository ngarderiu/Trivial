import MiniPodio from '../game/MiniPodio.jsx';

export default function VictoryScreen({ winner, players, quesitos, onPlayAgain }) {
  return (
    <main className="victory">
      <h1 className="victory__title">¡Victoria!</h1>
      <MiniPodio winner={winner} players={players} quesitos={quesitos} />
      <button type="button" className="btn btn--big btn--primary" onClick={onPlayAgain}>
        Jugar otra partida
      </button>
    </main>
  );
}
