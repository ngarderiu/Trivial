import {
  BOARD_POSITIONS,
  RING_LENGTH,
  CENTER_INDEX,
  SPOKE_CELLS
} from '../../constants/board.js';
import { CATEGORIES, CATEGORIES_BY_ID } from '../../constants/categories.js';

// Tablero estilo Trivial Pursuit clásico:
//   - fondo oscuro
//   - anillo exterior con 42 casillas de colores (separadas por líneas claras)
//   - 6 brazos radiales con 6 casillas cada uno, del color de la categoría
//   - centro pequeño y neutro
//
// Props:
//   - playerPositions: { [playerId]: index }   (-1 = centro)
//   - players: [{ id, color, name }]
//   - reachable: number[]
//   - onCellClick: (index) => void
//   - renderToken: (player, idx) => ReactNode  ficha personalizada
export default function Board({
  playerPositions = {},
  players = [],
  reachable = [],
  onCellClick,
  renderToken
}) {
  const size = 720;
  const cx = size / 2;
  const cy = size / 2;
  const ringOuter = 340;
  const ringInner = 270;
  const centerR = 56;

  const reachableSet = new Set(reachable);
  const sliceAngle = (Math.PI * 2) / RING_LENGTH;
  const segmentLen = (ringInner - centerR) / SPOKE_CELLS;

  // Path de una cuña anular (a0..a1 radianes; r0..r1 radios)
  const wedge = (a0, a1, r0, r1) => {
    const x0o = cx + r1 * Math.cos(a0);
    const y0o = cy + r1 * Math.sin(a0);
    const x1o = cx + r1 * Math.cos(a1);
    const y1o = cy + r1 * Math.sin(a1);
    const x0i = cx + r0 * Math.cos(a0);
    const y0i = cy + r0 * Math.sin(a0);
    const x1i = cx + r0 * Math.cos(a1);
    const y1i = cy + r0 * Math.sin(a1);
    return `M ${x0o} ${y0o} A ${r1} ${r1} 0 0 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${r0} ${r0} 0 0 0 ${x0i} ${y0i} Z`;
  };

  const cellWedgePath = (i, padRad = 0) => {
    const a0 = i * sliceAngle - Math.PI / 2 + padRad;
    const a1 = (i + 1) * sliceAngle - Math.PI / 2 - padRad;
    return wedge(a0, a1, ringInner, ringOuter);
  };

  // Casilla de un brazo (radial). catIdx 0..5; segIdx 0..5 (0=más cerca del centro)
  const spokeCellPath = (catIdx, segIdx) => {
    const sedeIndex = (catIdx * RING_LENGTH) / CATEGORIES.length; // 0,7,14,...
    const a0 = sedeIndex * sliceAngle - Math.PI / 2 + 0.012;
    const a1 = (sedeIndex + 1) * sliceAngle - Math.PI / 2 - 0.012;
    const r0 = centerR + segIdx * segmentLen;
    const r1 = centerR + (segIdx + 1) * segmentLen;
    return wedge(a0, a1, r0, r1);
  };

  const cellCenter = (i) => {
    const a = (i + 0.5) * sliceAngle - Math.PI / 2;
    const r = (ringOuter + ringInner) / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  // Agrupar fichas por casilla
  const fichasPorCasilla = {};
  for (const p of players) {
    const idx = playerPositions[p.id] ?? 0;
    fichasPorCasilla[idx] = fichasPorCasilla[idx] || [];
    fichasPorCasilla[idx].push(p);
  }

  return (
    <svg
      className="board"
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Tablero de Trivial"
    >
      {/* Fondo oscuro del tablero */}
      <circle cx={cx} cy={cy} r={ringOuter + 18} fill="#0d2238" />
      <circle
        cx={cx}
        cy={cy}
        r={ringOuter + 18}
        fill="none"
        stroke="#08172a"
        strokeWidth={6}
      />

      {/* Brazos: 6 categorías × 6 casillas */}
      {CATEGORIES.map((cat, catIdx) => (
        <g key={`spoke-${cat.id}`}>
          {Array.from({ length: SPOKE_CELLS }).map((_, segIdx) => (
            <path
              key={segIdx}
              d={spokeCellPath(catIdx, segIdx)}
              fill={cat.color}
              stroke="#ffffff"
              strokeWidth={2}
            />
          ))}
        </g>
      ))}

      {/* Anillo exterior: 42 casillas */}
      {BOARD_POSITIONS.map((cell) => {
        const cat = CATEGORIES_BY_ID[cell.category];
        const isReachable = reachableSet.has(cell.index);
        const center = cellCenter(cell.index);
        return (
          <g key={cell.index} className={isReachable ? 'is-reachable' : ''}>
            <path
              d={cellWedgePath(cell.index, 0.012)}
              fill={cat?.color || '#777'}
              stroke="#ffffff"
              strokeWidth={2.5}
              onClick={() => onCellClick?.(cell.index)}
              style={{ cursor: isReachable ? 'pointer' : 'default' }}
            />
            {cell.isHQ && (
              <>
                <circle
                  cx={center.x}
                  cy={center.y}
                  r={22}
                  fill="#ffffff"
                  stroke={cat?.color}
                  strokeWidth={3}
                />
                <text
                  x={center.x}
                  y={center.y + 7}
                  textAnchor="middle"
                  fontSize="22"
                  style={{ pointerEvents: 'none' }}
                >
                  {cat?.icon}
                </text>
              </>
            )}
            {isReachable && (
              <circle
                cx={center.x}
                cy={center.y}
                r={20}
                fill="rgba(255,255,200,0.55)"
                stroke="#fff8a0"
                strokeWidth={2}
                strokeDasharray="4 3"
                onClick={() => onCellClick?.(cell.index)}
                style={{ cursor: 'pointer' }}
              />
            )}
          </g>
        );
      })}

      {/* Centro: pequeño círculo neutro */}
      <g
        className="board__center"
        onClick={() => onCellClick?.(CENTER_INDEX)}
        style={{ cursor: 'pointer' }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={centerR}
          fill="#f6efd8"
          stroke="#ffffff"
          strokeWidth={3}
        />
      </g>

      {/* Fichas (renderizadas por el padre con renderToken o círculo simple) */}
      {Object.entries(fichasPorCasilla).map(([idxStr, list]) => {
        const idx = Number(idxStr);
        const center = idx === CENTER_INDEX ? { x: cx, y: cy } : cellCenter(idx);
        return list.map((p, i) => {
          const offsetX = (i % 2) * 18 - 9;
          const offsetY = Math.floor(i / 2) * 18 - 9;
          const tx = center.x + offsetX;
          const ty = center.y + offsetY;
          if (renderToken) {
            return (
              <g key={`${p.id}-${idx}`} transform={`translate(${tx} ${ty})`}>
                {renderToken(p, idx)}
              </g>
            );
          }
          return (
            <circle
              key={`${p.id}-${idx}`}
              cx={tx}
              cy={ty}
              r={11}
              fill={p.color}
              stroke="#0a0a0a"
              strokeWidth={2}
            >
              <title>{p.name}</title>
            </circle>
          );
        });
      })}
    </svg>
  );
}
