import { BOARD_POSITIONS, RING_LENGTH, CENTER_INDEX } from '../../constants/board.js';
import { CATEGORIES_BY_ID } from '../../constants/categories.js';

// Tablero SVG circular: anillo de 42 casillas + centro.
// Recibe posiciones de jugadores y, opcionalmente, casillas alcanzables
// resaltadas para que el jugador haga clic en una.
//
// Props:
//   - playerPositions: { [playerId]: index } (-1 = centro)
//   - players: [{ id, color, name }]
//   - reachable: number[]    índices destacables
//   - onCellClick: (index) => void
export default function Board({ playerPositions = {}, players = [], reachable = [], onCellClick }) {
  const size = 540;
  const cx = size / 2;
  const cy = size / 2;
  const ringOuter = 250;
  const ringInner = 170;
  const centerR = 90;
  const reachableSet = new Set(reachable);

  // Genera el path de cuña entre dos ángulos (en radianes)
  const wedgePath = (i) => {
    const a0 = (i / RING_LENGTH) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / RING_LENGTH) * Math.PI * 2 - Math.PI / 2;
    const x0o = cx + ringOuter * Math.cos(a0);
    const y0o = cy + ringOuter * Math.sin(a0);
    const x1o = cx + ringOuter * Math.cos(a1);
    const y1o = cy + ringOuter * Math.sin(a1);
    const x0i = cx + ringInner * Math.cos(a0);
    const y0i = cy + ringInner * Math.sin(a0);
    const x1i = cx + ringInner * Math.cos(a1);
    const y1i = cy + ringInner * Math.sin(a1);
    return `M ${x0o} ${y0o} A ${ringOuter} ${ringOuter} 0 0 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${ringInner} ${ringInner} 0 0 0 ${x0i} ${y0i} Z`;
  };

  // Coordenada media de una casilla (para colocar las fichas)
  const cellCenter = (i) => {
    const a = ((i + 0.5) / RING_LENGTH) * Math.PI * 2 - Math.PI / 2;
    const r = (ringOuter + ringInner) / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  // Agrupar fichas por casilla para no superponerlas
  const fichasPorCasilla = {};
  for (const p of players) {
    const idx = playerPositions[p.id] ?? 0;
    fichasPorCasilla[idx] = fichasPorCasilla[idx] || [];
    fichasPorCasilla[idx].push(p);
  }

  return (
    <svg className="board" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Tablero de Trivial">
      {/* Anillo de casillas */}
      {BOARD_POSITIONS.map((cell) => {
        const cat = CATEGORIES_BY_ID[cell.category];
        const isReachable = reachableSet.has(cell.index);
        return (
          <g key={cell.index} className={isReachable ? 'is-reachable' : ''}>
            <path
              d={wedgePath(cell.index)}
              fill={cat?.bgColor || '#eee'}
              stroke={cell.isHQ ? cat?.color : '#fff'}
              strokeWidth={cell.isHQ ? 4 : 1.5}
              onClick={() => onCellClick?.(cell.index)}
              style={{ cursor: isReachable ? 'pointer' : 'default' }}
            />
            {cell.isHQ && (
              <text
                x={cellCenter(cell.index).x}
                y={cellCenter(cell.index).y + 5}
                textAnchor="middle"
                fontSize="22"
              >
                {cat?.icon}
              </text>
            )}
            {isReachable && (
              <circle
                cx={cellCenter(cell.index).x}
                cy={cellCenter(cell.index).y}
                r={20}
                fill="rgba(0,0,0,0.05)"
                stroke="#222"
                strokeDasharray="3 3"
                onClick={() => onCellClick?.(cell.index)}
                style={{ cursor: 'pointer' }}
              />
            )}
          </g>
        );
      })}

      {/* Centro */}
      <circle
        cx={cx}
        cy={cy}
        r={centerR}
        fill="#fff"
        stroke="#222"
        strokeWidth={3}
        onClick={() => onCellClick?.(CENTER_INDEX)}
      />
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="22" fontWeight="700">
        CENTRO
      </text>

      {/* Fichas de jugadores */}
      {Object.entries(fichasPorCasilla).map(([idxStr, list]) => {
        const idx = Number(idxStr);
        const center = idx === CENTER_INDEX ? { x: cx, y: cy } : cellCenter(idx);
        return list.map((p, i) => {
          // Distribuir hasta 4 fichas en mini cuadrícula 2x2
          const offsetX = (i % 2) * 14 - 7;
          const offsetY = Math.floor(i / 2) * 14 - 7;
          return (
            <circle
              key={`${p.id}-${idx}`}
              cx={center.x + offsetX}
              cy={center.y + offsetY}
              r={9}
              fill={p.color}
              stroke="#222"
              strokeWidth={1.5}
            >
              <title>{p.name}</title>
            </circle>
          );
        });
      })}
    </svg>
  );
}
