import {
  BOARD_POSITIONS,
  RING_LENGTH,
  CENTER_INDEX,
  SPOKE_CELLS
} from '../../constants/board.js';
import { CATEGORIES, CATEGORIES_BY_ID } from '../../constants/categories.js';

// Tablero del Trivial clásico (calco fiel):
//   - 42 casillas en el anillo exterior (6 sedes + 36 normales)
//   - sedes en los 6 puntos cardinales, más anchas que las casillas normales
//   - 6 brazos rectos con 6 casillas cada uno; los brazos NO se tocan en el centro
//   - centro: círculo crema pequeño y limpio
//   - bordes blancos gruesos, mucho espacio en blanco
//
// Proporciones (viewBox 600×600):
//   ringOuter = 270, ringInner = 220
//   sede outerRadius = ringOuter + 14
//   brazo: x ∈ [60, 220], width = 40
//   centro: r = 55
export default function Board({
  playerPositions = {},
  players = [],
  reachable = [],
  onCellClick,
  renderToken
}) {
  const size = 600;
  const cx = size / 2;
  const cy = size / 2;

  const ringOuter = 270;
  const ringInner = 220;
  const sedeOuter = ringOuter + 14;
  const armInner = 60;            // los brazos empiezan a r=60 (no tocan centro)
  const armOuter = ringInner;     // y acaban donde empieza el anillo
  const armWidth = 40;
  const armCellH = (armOuter - armInner) / SPOKE_CELLS;
  const centerR = 55;

  const reachableSet = new Set(reachable);
  const sliceAngle = (Math.PI * 2) / RING_LENGTH;       // 360/42 ≈ 8.57°
  const halfSlice = sliceAngle / 2;
  const cellPad = sliceAngle * 0.12;                    // gap angular entre casillas
  const sedeHalf = sliceAngle * 0.95;                   // sedes el doble de anchas

  // Path de cuña anular para una casilla (delimita ángulos y radios)
  const wedgePath = (a0, a1, r0, r1) => {
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

  // Casilla normal del anillo (sin sede)
  const normalCellPath = (i) => {
    const center = i * sliceAngle - Math.PI / 2;
    return wedgePath(
      center - halfSlice + cellPad,
      center + halfSlice - cellPad,
      ringInner,
      ringOuter
    );
  };

  // Casilla SEDE: el doble de ancha (angular) y sobresale hacia afuera
  const sedeCellPath = (i) => {
    const center = i * sliceAngle - Math.PI / 2;
    return wedgePath(
      center - sedeHalf,
      center + sedeHalf,
      ringInner,
      sedeOuter
    );
  };

  // Centro de la casilla i del anillo (para fichas)
  const ringCellCenter = (i) => {
    const a = i * sliceAngle - Math.PI / 2;
    const r = (ringInner + (BOARD_POSITIONS[i]?.isHQ ? sedeOuter : ringOuter)) / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  // Ángulo (en grados) del brazo j: 0 (top), 60, 120, 180, 240, 300
  const spokeAngleDeg = (j) => -90 + j * 60;

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
      {/* Fondo del tablero */}
      <circle cx={cx} cy={cy} r={size / 2 - 6} fill="#3a6b8a" />
      <circle
        cx={cx}
        cy={cy}
        r={size / 2 - 6}
        fill="none"
        stroke="#22455c"
        strokeWidth={4}
      />

      {/* Casillas normales del anillo (no sedes) */}
      {BOARD_POSITIONS.map((cell) => {
        if (cell.isHQ) return null;
        const cat = CATEGORIES_BY_ID[cell.category];
        return (
          <path
            key={cell.index}
            d={normalCellPath(cell.index)}
            fill={cat?.color || '#666'}
            stroke="#ffffff"
            strokeWidth={3}
            strokeLinejoin="round"
            onClick={() => onCellClick?.(cell.index)}
          />
        );
      })}

      {/* Brazos: rectángulos que NO tocan el centro */}
      {CATEGORIES.map((cat, j) => {
        const angle = spokeAngleDeg(j);
        return (
          <g key={`spoke-${cat.id}`} transform={`rotate(${angle} ${cx} ${cy})`}>
            {Array.from({ length: SPOKE_CELLS }).map((_, k) => {
              // Pre-rotación: brazo apunta hacia +x.
              // Cell k de [armInner + k*cellH, armInner + (k+1)*cellH]
              const x = cx + armInner + k * armCellH;
              const y = cy - armWidth / 2;
              return (
                <rect
                  key={k}
                  x={x + 2}
                  y={y}
                  width={armCellH - 4}
                  height={armWidth}
                  fill={cat.color}
                  stroke="#ffffff"
                  strokeWidth={3}
                  rx={2}
                />
              );
            })}
          </g>
        );
      })}

      {/* Sedes (encima del resto, más anchas con borde grueso blanco) */}
      {BOARD_POSITIONS.filter((c) => c.isHQ).map((cell) => {
        const cat = CATEGORIES_BY_ID[cell.category];
        const isReachable = reachableSet.has(cell.index);
        return (
          <g key={`hq-${cell.index}`} className={isReachable ? 'is-reachable' : ''}>
            <path
              d={sedeCellPath(cell.index)}
              fill={cat?.color}
              stroke="#ffffff"
              strokeWidth={4}
              strokeLinejoin="round"
              onClick={() => onCellClick?.(cell.index)}
              style={{ cursor: isReachable ? 'pointer' : 'default' }}
            />
          </g>
        );
      })}

      {/* Casillas alcanzables resaltadas */}
      {Array.from(reachableSet).map((idx) => {
        const center = ringCellCenter(idx);
        return (
          <circle
            key={`reach-${idx}`}
            cx={center.x}
            cy={center.y}
            r={16}
            fill="rgba(255,255,150,0.55)"
            stroke="#fff8a0"
            strokeWidth={2.5}
            strokeDasharray="4 3"
            onClick={() => onCellClick?.(idx)}
            style={{ cursor: 'pointer' }}
          />
        );
      })}

      {/* Centro: círculo crema pequeño, limpio */}
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
          strokeWidth={4}
        />
      </g>

      {/* Fichas */}
      {Object.entries(fichasPorCasilla).map(([idxStr, list]) => {
        const idx = Number(idxStr);
        const center = idx === CENTER_INDEX ? { x: cx, y: cy } : ringCellCenter(idx);
        return list.map((p, i) => {
          const offsetX = (i % 2) * 16 - 8;
          const offsetY = Math.floor(i / 2) * 16 - 8;
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
              r={10}
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
