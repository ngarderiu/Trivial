import {
  BOARD_POSITIONS,
  CENTER_INDEX,
  SPOKE_CELLS
} from '../../constants/board.js';
import { CATEGORIES, CATEGORIES_BY_ID, CATEGORY_IDS } from '../../constants/categories.js';

// Tablero del Trivial clásico.
//
// Geometría (viewBox 600×600, centro 300,300):
//   - 30 casillas en el anillo: 6 sedes + 24 normales (4 entre sedes)
//   - sedes: ancho angular doble (2 unidades), centradas en cada eje del brazo
//   - brazos: 6 brazos rectos de 80 px de ancho, 6 casillas grandes
//             (radios 92..210) con gap de 4 px entre casillas
//   - cada casilla del brazo alterna los 6 colores en secuencia
//   - centro: círculo crema, radio 85
//
// Total angular: 6 · 2 + 24 · 1 = 36 "unidades angulares" = 360º
//   (cada unidad = 360/36 = 10º).
const SIZE = 600;
const CX = 300;
const CY = 300;
const RING_OUTER = 270;
const RING_INNER = 215;
const ARM_INNER_R = 92;
const ARM_OUTER_R = 210;
const ARM_WIDTH = 80;
const ARM_CELLS = SPOKE_CELLS;
const ARM_CELL_H = (ARM_OUTER_R - ARM_INNER_R) / ARM_CELLS; // ≈21.67
const ARM_CELL_GAP = 4;
const CENTER_R = 85;
const SPOKE_GAP = 5; // sedes cada 5 posiciones (índices 0,5,10,15,20,25)

const TOTAL_UNITS = 36;
const UNIT_RAD = (Math.PI * 2) / TOTAL_UNITS;
const DEG = (rad) => (rad * 180) / Math.PI;
const PAD_RAD = (1.5 * Math.PI) / 180; // 1.5º de gap a cada lado

// Devuelve [a0, a1] (radianes) que ocupa una casilla del anillo.
// La sede 0 queda centrada en -π/2 (arriba): unidad 1 = -π/2.
// Cada sección consume 2 + (SPOKE_GAP - 1) = 6 unidades angulares.
function cellAngles(index) {
  const cell = BOARD_POSITIONS[index];
  const sedeIdx = Math.floor(index / SPOKE_GAP);
  const offset = index % SPOKE_GAP;
  const sectionStart = sedeIdx * 6; // 2 (sede) + (SPOKE_GAP-1) normales
  let unitStart;
  let unitEnd;
  if (cell.isHQ) {
    unitStart = sectionStart;
    unitEnd = sectionStart + 2;
  } else {
    unitStart = sectionStart + 2 + (offset - 1);
    unitEnd = unitStart + 1;
  }
  // Desplazamiento para que sede 0 esté centrada arriba
  const a0 = (unitStart - 1) * UNIT_RAD - Math.PI / 2 + PAD_RAD;
  const a1 = (unitEnd - 1) * UNIT_RAD - Math.PI / 2 - PAD_RAD;
  return [a0, a1];
}

function annularWedgePath(a0, a1, r0, r1) {
  const x0o = CX + r1 * Math.cos(a0);
  const y0o = CY + r1 * Math.sin(a0);
  const x1o = CX + r1 * Math.cos(a1);
  const y1o = CY + r1 * Math.sin(a1);
  const x0i = CX + r0 * Math.cos(a0);
  const y0i = CY + r0 * Math.sin(a0);
  const x1i = CX + r0 * Math.cos(a1);
  const y1i = CY + r0 * Math.sin(a1);
  const largeArc = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0o} ${y0o} A ${r1} ${r1} 0 ${largeArc} 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${r0} ${r0} 0 ${largeArc} 0 ${x0i} ${y0i} Z`;
}

function ringCellCenter(index) {
  const [a0, a1] = cellAngles(index);
  const a = (a0 + a1) / 2;
  const r = (RING_INNER + RING_OUTER) / 2;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a), angle: a };
}

// Brazo j: centrado en el ángulo de la sede j (sede j ↔ index j*SPOKE_GAP)
function spokeAngleDeg(j) {
  const sedeIndex = j * SPOKE_GAP;
  const { angle } = ringCellCenter(sedeIndex);
  return DEG(angle); // grados, listos para SVG rotate
}

export default function Board({
  playerPositions = {},
  players = [],
  reachable = [],
  onCellClick,
  renderToken
}) {
  const reachableSet = new Set(reachable);

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
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label="Tablero de Trivial"
    >
      {/* Fondo del tablero */}
      <circle cx={CX} cy={CY} r={SIZE / 2 - 6} fill="#3B6E8C" />
      <circle
        cx={CX}
        cy={CY}
        r={SIZE / 2 - 6}
        fill="none"
        stroke="#22455c"
        strokeWidth={4}
      />

      {/* Anillo exterior: casillas normales */}
      {BOARD_POSITIONS.filter((c) => !c.isHQ).map((cell) => {
        const cat = CATEGORIES_BY_ID[cell.category];
        const [a0, a1] = cellAngles(cell.index);
        const isReachable = reachableSet.has(cell.index);
        return (
          <path
            key={cell.index}
            d={annularWedgePath(a0, a1, RING_INNER, RING_OUTER)}
            fill={cat.color}
            stroke="#ffffff"
            strokeWidth={2}
            strokeLinejoin="round"
            onClick={() => onCellClick?.(cell.index)}
            style={{ cursor: isReachable ? 'pointer' : 'default' }}
          />
        );
      })}

      {/* 6 brazos rectos: cada casilla alterna los 6 colores en secuencia
          (igual que el anillo exterior). Mismo patrón en los 6 brazos. */}
      {CATEGORIES.map((_, j) => {
        const angleDeg = spokeAngleDeg(j);
        return (
          <g key={`spoke-${j}`} transform={`rotate(${angleDeg} ${CX} ${CY})`}>
            {Array.from({ length: ARM_CELLS }).map((_, k) => {
              // Pre-rotación: brazo apunta hacia +x. k=0 más cerca del centro.
              const r0 = ARM_INNER_R + k * ARM_CELL_H + ARM_CELL_GAP / 2;
              const r1 = r0 + ARM_CELL_H - ARM_CELL_GAP;
              const x = CX + r0;
              const y = CY - ARM_WIDTH / 2;
              const cellCat = CATEGORIES_BY_ID[CATEGORY_IDS[k % CATEGORY_IDS.length]];
              return (
                <rect
                  key={k}
                  x={x}
                  y={y}
                  width={r1 - r0}
                  height={ARM_WIDTH}
                  fill={cellCat.color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              );
            })}
          </g>
        );
      })}

      {/* Sedes (encima del resto): mismo color, doble ancho angular,
          borde blanco doble */}
      {BOARD_POSITIONS.filter((c) => c.isHQ).map((cell) => {
        const cat = CATEGORIES_BY_ID[cell.category];
        const [a0, a1] = cellAngles(cell.index);
        const isReachable = reachableSet.has(cell.index);
        const center = ringCellCenter(cell.index);
        return (
          <g key={`hq-${cell.index}`} className={isReachable ? 'is-reachable' : ''}>
            {/* Borde exterior blanco grueso */}
            <path
              d={annularWedgePath(a0, a1, RING_INNER - 2, RING_OUTER + 2)}
              fill="#ffffff"
            />
            {/* Cuerpo coloreado */}
            <path
              d={annularWedgePath(a0, a1, RING_INNER, RING_OUTER)}
              fill={cat.color}
              stroke="#ffffff"
              strokeWidth={2}
              onClick={() => onCellClick?.(cell.index)}
              style={{ cursor: isReachable ? 'pointer' : 'default' }}
            />
            {/* Icono de la categoría */}
            <text
              x={center.x}
              y={center.y + 7}
              textAnchor="middle"
              fontSize={20}
              style={{ pointerEvents: 'none' }}
            >
              {cat.icon}
            </text>
          </g>
        );
      })}

      {/* Casillas alcanzables resaltadas */}
      {Array.from(reachableSet).map((idx) => {
        const c = ringCellCenter(idx);
        return (
          <circle
            key={`reach-${idx}`}
            cx={c.x}
            cy={c.y}
            r={14}
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
        <circle
          cx={CX}
          cy={CY}
          r={CENTER_R}
          fill="#f5f0e8"
          stroke="#ffffff"
          strokeWidth={4}
        />
      </g>

      {/* Fichas */}
      {Object.entries(fichasPorCasilla).map(([idxStr, list]) => {
        const idx = Number(idxStr);
        const center = idx === CENTER_INDEX ? { x: CX, y: CY } : ringCellCenter(idx);
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
