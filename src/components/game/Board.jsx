import {
  BOARD_POSITIONS,
  RING_LENGTH,
  CENTER_INDEX,
  SPOKE_CELLS
} from '../../constants/board.js';
import { CATEGORIES, CATEGORIES_BY_ID } from '../../constants/categories.js';

// Tablero estilo Trivial Pursuit clásico:
//   - fondo azul-gris oscuro
//   - 72 casillas en el anillo exterior (12 por sector de categoría)
//   - 6 brazos RECTOS (rectangulares) de 6 casillas cada uno desde el
//     centro hasta el borde, separados 60º
//   - sedes (HQ) en el extremo exterior del brazo, casilla más grande con
//     borde doble
//   - centro pequeño crema/blanco
//
// Props:
//   - playerPositions, players, reachable, onCellClick
//   - renderToken: (player, idx) => ReactNode opcional
export default function Board({
  playerPositions = {},
  players = [],
  reachable = [],
  onCellClick,
  renderToken
}) {
  const size = 760;
  const cx = size / 2;
  const cy = size / 2;

  // Geometría del tablero
  const boardR = 360;          // radio total del disco
  const ringOuter = 360;       // borde exterior del anillo
  const ringInner = 288;       // borde interior del anillo
  const centerR = 50;          // radio del círculo central
  const armWidth = 42;         // anchura de los brazos rectos (≈ ancho de sede)
  const sedeBoost = 30;        // las sedes sobresalen un poco
  const cellH = (ringInner - centerR) / SPOKE_CELLS; // altura de cada casilla del brazo

  const reachableSet = new Set(reachable);
  const sliceAngle = (Math.PI * 2) / RING_LENGTH; // 5º
  const halfSlice = sliceAngle / 2;

  // Cuña anular para una casilla del anillo (centrada en su ángulo)
  const ringCellPath = (i, padRad = 0) => {
    const center = i * sliceAngle - Math.PI / 2;
    const a0 = center - halfSlice + padRad;
    const a1 = center + halfSlice - padRad;
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

  // Sede destacada: igual que ringCellPath pero con radio exterior mayor
  const sedeCellPath = (i, padRad = 0) => {
    const center = i * sliceAngle - Math.PI / 2;
    const a0 = center - halfSlice * 1.4 + padRad;
    const a1 = center + halfSlice * 1.4 - padRad;
    const outer = ringOuter + sedeBoost;
    const x0o = cx + outer * Math.cos(a0);
    const y0o = cy + outer * Math.sin(a0);
    const x1o = cx + outer * Math.cos(a1);
    const y1o = cy + outer * Math.sin(a1);
    const x0i = cx + ringInner * Math.cos(a0);
    const y0i = cy + ringInner * Math.sin(a0);
    const x1i = cx + ringInner * Math.cos(a1);
    const y1i = cy + ringInner * Math.sin(a1);
    return `M ${x0o} ${y0o} A ${outer} ${outer} 0 0 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${ringInner} ${ringInner} 0 0 0 ${x0i} ${y0i} Z`;
  };

  // Centro de una casilla del anillo (para fichas)
  const ringCellCenter = (i) => {
    const a = i * sliceAngle - Math.PI / 2;
    const r = (ringOuter + ringInner) / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  // Ángulo (en grados) del brazo j (0..5) — sede en el extremo
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
      {/* Fondo azul-gris del tablero */}
      <circle cx={cx} cy={cy} r={boardR + 18} fill="#2d5a7b" />
      <circle
        cx={cx}
        cy={cy}
        r={boardR + 18}
        fill="none"
        stroke="#1c3e57"
        strokeWidth={6}
      />

      {/* Anillo exterior: 72 casillas (las sedes se dibujan en otro grupo) */}
      {BOARD_POSITIONS.map((cell) => {
        if (cell.isHQ) return null; // sedes después
        const cat = CATEGORIES_BY_ID[cell.category];
        return (
          <path
            key={cell.index}
            d={ringCellPath(cell.index)}
            fill={cat?.color || '#666'}
            stroke="#ffffff"
            strokeWidth={1.5}
            onClick={() => onCellClick?.(cell.index)}
          />
        );
      })}

      {/* Brazos rectos: 6 brazos × 6 casillas */}
      {CATEGORIES.map((cat, j) => {
        const angle = spokeAngleDeg(j);
        return (
          <g key={`spoke-${cat.id}`} transform={`rotate(${angle} ${cx} ${cy})`}>
            {Array.from({ length: SPOKE_CELLS }).map((_, k) => {
              // Pre-rotación: el brazo apunta hacia la derecha (+x).
              // Cell k ocupa de x = cx + centerR + k*cellH
              const x = cx + centerR + k * cellH;
              const y = cy - armWidth / 2;
              return (
                <rect
                  key={k}
                  x={x}
                  y={y}
                  width={cellH}
                  height={armWidth}
                  fill={cat.color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              );
            })}
          </g>
        );
      })}

      {/* Sedes: por encima del resto, con borde doble */}
      {BOARD_POSITIONS.filter((c) => c.isHQ).map((cell) => {
        const cat = CATEGORIES_BY_ID[cell.category];
        const isReachable = reachableSet.has(cell.index);
        return (
          <g key={`hq-${cell.index}`} className={isReachable ? 'is-reachable' : ''}>
            {/* Halo exterior blanco */}
            <path d={sedeCellPath(cell.index, 0)} fill="#ffffff" />
            {/* Casilla coloreada interior */}
            <path
              d={sedeCellPath(cell.index, 0.025)}
              fill={cat?.color}
              stroke="#ffffff"
              strokeWidth={2}
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
            r={20}
            fill="rgba(255,255,150,0.55)"
            stroke="#fff8a0"
            strokeWidth={2.5}
            strokeDasharray="4 3"
            onClick={() => onCellClick?.(idx)}
            style={{ cursor: 'pointer' }}
          />
        );
      })}

      {/* Centro: círculo crema */}
      <g
        className="board__center"
        onClick={() => onCellClick?.(CENTER_INDEX)}
        style={{ cursor: 'pointer' }}
      >
        <circle cx={cx} cy={cy} r={centerR} fill="#f6efd8" stroke="#ffffff" strokeWidth={3} />
      </g>

      {/* Fichas */}
      {Object.entries(fichasPorCasilla).map(([idxStr, list]) => {
        const idx = Number(idxStr);
        const center = idx === CENTER_INDEX ? { x: cx, y: cy } : ringCellCenter(idx);
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
