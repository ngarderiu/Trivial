import { BOARD_POSITIONS, RING_LENGTH, CENTER_INDEX } from '../../constants/board.js';
import { CATEGORIES, CATEGORIES_BY_ID } from '../../constants/categories.js';

// Tablero estilo Trivial Pursuit clásico:
//   - anillo exterior con 42 casillas separadas con bordes definidos
//   - 6 brazos radiales que conectan las sedes con el centro
//   - centro con seis sectores ("quesitos de tarta"), uno por categoría
//   - sedes destacadas con borde grueso y halo
//
// Props:
//   - playerPositions: { [playerId]: index } (-1 = centro)
//   - players: [{ id, color, name }]
//   - reachable: number[]
//   - onCellClick: (index) => void
export default function Board({ playerPositions = {}, players = [], reachable = [], onCellClick }) {
  const size = 600;
  const cx = size / 2;
  const cy = size / 2;
  const ringOuter = 285;
  const ringInner = 195;
  const centerR = 110;

  const reachableSet = new Set(reachable);
  const sliceAngle = (Math.PI * 2) / RING_LENGTH;

  // Path de una cuña anular entre dos ángulos
  const wedgePath = (i, padRad = 0) => {
    const a0 = i * sliceAngle - Math.PI / 2 + padRad;
    const a1 = (i + 1) * sliceAngle - Math.PI / 2 - padRad;
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

  // Centro de la casilla i (donde van las fichas)
  const cellCenter = (i) => {
    const a = (i + 0.5) * sliceAngle - Math.PI / 2;
    const r = (ringOuter + ringInner) / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  // Path de un sector del centro (quesito) para cada categoría
  const centerSlicePath = (i) => {
    // Sector i (0..5) centrado en el ángulo de la sede de esa categoría
    const sedeIndex = i * (RING_LENGTH / CATEGORIES.length); // 0,7,14,...
    const aMid = (sedeIndex + 0.5) * sliceAngle - Math.PI / 2;
    const a0 = aMid - Math.PI / CATEGORIES.length;
    const a1 = aMid + Math.PI / CATEGORIES.length;
    const x0 = cx + centerR * Math.cos(a0);
    const y0 = cy + centerR * Math.sin(a0);
    const x1 = cx + centerR * Math.cos(a1);
    const y1 = cy + centerR * Math.sin(a1);
    return `M ${cx} ${cy} L ${x0} ${y0} A ${centerR} ${centerR} 0 0 1 ${x1} ${y1} Z`;
  };

  // Posición del icono dentro del sector central
  const centerIconPos = (i) => {
    const sedeIndex = i * (RING_LENGTH / CATEGORIES.length);
    const aMid = (sedeIndex + 0.5) * sliceAngle - Math.PI / 2;
    const r = centerR * 0.62;
    return { x: cx + r * Math.cos(aMid), y: cy + r * Math.sin(aMid) };
  };

  // Brazo radial: rectángulo desde el borde interno del anillo hasta el centro,
  // pintado con un degradado entre dos colores adyacentes.
  const spokePath = (i) => {
    const sedeIndex = i * (RING_LENGTH / CATEGORIES.length);
    const aMid = (sedeIndex + 0.5) * sliceAngle - Math.PI / 2;
    // Anchura angular del brazo
    const halfWidth = sliceAngle * 0.45;
    const a0 = aMid - halfWidth;
    const a1 = aMid + halfWidth;
    const xOuter0 = cx + ringInner * Math.cos(a0);
    const yOuter0 = cy + ringInner * Math.sin(a0);
    const xOuter1 = cx + ringInner * Math.cos(a1);
    const yOuter1 = cy + ringInner * Math.sin(a1);
    const xInner0 = cx + centerR * Math.cos(a0);
    const yInner0 = cy + centerR * Math.sin(a0);
    const xInner1 = cx + centerR * Math.cos(a1);
    const yInner1 = cy + centerR * Math.sin(a1);
    return `M ${xOuter0} ${yOuter0} L ${xOuter1} ${yOuter1} L ${xInner1} ${yInner1} L ${xInner0} ${yInner0} Z`;
  };

  // Agrupar fichas por casilla para no superponerlas
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
      <defs>
        <radialGradient id="boardBg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fdfaf2" />
          <stop offset="100%" stopColor="#e8dfc9" />
        </radialGradient>
        <filter id="boardShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Fondo circular del tablero */}
      <circle cx={cx} cy={cy} r={ringOuter + 12} fill="url(#boardBg)" filter="url(#boardShadow)" />
      <circle cx={cx} cy={cy} r={ringOuter + 12} fill="none" stroke="#3a2e1c" strokeWidth={4} />

      {/* Brazos radiales (van detrás del anillo y conectan con el centro) */}
      {CATEGORIES.map((cat, i) => (
        <path key={`spoke-${cat.id}`} d={spokePath(i)} fill={cat.bgColor} stroke="#3a2e1c" strokeWidth={2} />
      ))}

      {/* Anillo de casillas */}
      {BOARD_POSITIONS.map((cell) => {
        const cat = CATEGORIES_BY_ID[cell.category];
        const isReachable = reachableSet.has(cell.index);
        const center = cellCenter(cell.index);
        return (
          <g key={cell.index} className={isReachable ? 'is-reachable' : ''}>
            {/* Halo de sede */}
            {cell.isHQ && (
              <path
                d={wedgePath(cell.index, -0.012)}
                fill={cat?.color}
                opacity="0.25"
              />
            )}
            <path
              d={wedgePath(cell.index, 0.012)}
              fill={cell.isHQ ? cat?.color : cat?.bgColor || '#eee'}
              stroke="#3a2e1c"
              strokeWidth={cell.isHQ ? 3 : 1.5}
              onClick={() => onCellClick?.(cell.index)}
              style={{ cursor: isReachable ? 'pointer' : 'default' }}
            />
            {cell.isHQ && (
              <>
                <circle cx={center.x} cy={center.y} r={20} fill="#fff" stroke={cat?.color} strokeWidth={3} />
                <text x={center.x} y={center.y + 7} textAnchor="middle" fontSize="22">
                  {cat?.icon}
                </text>
              </>
            )}
            {isReachable && (
              <circle
                cx={center.x}
                cy={center.y}
                r={22}
                fill="rgba(255,255,200,0.45)"
                stroke="#222"
                strokeWidth={2}
                strokeDasharray="4 3"
                onClick={() => onCellClick?.(cell.index)}
                style={{ cursor: 'pointer' }}
              />
            )}
          </g>
        );
      })}

      {/* Centro: 6 quesitos coloreados como tarta */}
      <g
        className="board__center"
        onClick={() => onCellClick?.(CENTER_INDEX)}
        style={{ cursor: 'pointer' }}
      >
        {CATEGORIES.map((cat, i) => (
          <path
            key={`slice-${cat.id}`}
            d={centerSlicePath(i)}
            fill={cat.color}
            stroke="#3a2e1c"
            strokeWidth={2}
          />
        ))}
        {CATEGORIES.map((cat, i) => {
          const p = centerIconPos(i);
          return (
            <text
              key={`center-icon-${cat.id}`}
              x={p.x}
              y={p.y + 8}
              textAnchor="middle"
              fontSize="22"
              fill="#fff"
              style={{ pointerEvents: 'none' }}
            >
              {cat.icon}
            </text>
          );
        })}
        {/* Disco interior para enmarcar */}
        <circle cx={cx} cy={cy} r={20} fill="#fff" stroke="#3a2e1c" strokeWidth={2} />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#3a2e1c">
          ★
        </text>
      </g>

      {/* Fichas de jugadores */}
      {Object.entries(fichasPorCasilla).map(([idxStr, list]) => {
        const idx = Number(idxStr);
        const center = idx === CENTER_INDEX ? { x: cx, y: cy } : cellCenter(idx);
        return list.map((p, i) => {
          const offsetX = (i % 2) * 14 - 7;
          const offsetY = Math.floor(i / 2) * 14 - 7;
          return (
            <circle
              key={`${p.id}-${idx}`}
              cx={center.x + offsetX}
              cy={center.y + offsetY}
              r={10}
              fill={p.color}
              stroke="#1f1206"
              strokeWidth={2}
              filter="url(#boardShadow)"
            >
              <title>{p.name}</title>
            </circle>
          );
        });
      })}
    </svg>
  );
}
