// Configuración del juego: modos y colores de jugadores.

export const GAME_MODES = {
  CLASSIC: { id: 'classic', label: 'Clásico', quesitosToWin: 6 },
  RAPID: { id: 'rapid', label: 'Rápido', quesitosToWin: 4 }
};

export const DEFAULT_MODE = 'classic';

// Colores de los 4 equipos. Se mantienen estables independientemente
// del nombre que el jugador escriba.
export const PLAYER_COLORS = [
  { id: 'red', label: 'Rojo', value: '#e53935' },
  { id: 'blue', label: 'Azul', value: '#1e88e5' },
  { id: 'green', label: 'Verde', value: '#43a047' },
  { id: 'yellow', label: 'Amarillo', value: '#fdd835' }
];

export const MAX_PLAYERS = 4;
export const MIN_PLAYERS = 2;
