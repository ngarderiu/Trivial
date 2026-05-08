import {
  BOARD_POSITIONS,
  CENTER_INDEX,
  SPOKE_CELLS
} from '../../constants/board.js';
import { CATEGORIES, CATEGORIES_BY_ID, CATEGORY_IDS } from '../../constants/categories.js';

// Tablero del Trivial clásico.
//
// Geometría (viewBox 600×600, centro 300,300):
//   - 36 casillas en el anillo: 6 sedes + 30 normales (5 entre cada par de sedes)
//   - sede = 2 unidades angulares; normal = 1 unidad → 6·2 + 30·1 = 42 unidades
//     → 360º/42 ≈ 8.571º por unidad.
//   - anillo: R_INNER=218, R_OUTER=285
//   - centro: hexágono regular (vértices en los 6 ejes de los brazos),
//     radio (al vértice) 72 px.
//   - brazos: ancho EXACTO igual al ancho de una sede a R_INNER
//     (≈ 2·sin(8.571º)·R_INNER ≈ 65 px).
//   - 6 casillas por brazo entre SP_IN y SP_OUT, gap radial 4 px.
const SIZE = 600;
const CX = 300;
const CY = 300;
const R_OUTER = 285;
const R_INNER = 218;

const TOTAL_UNITS = 42;
const UNIT_RAD = (Math.PI * 2) / TOTAL_UNITS; // 360/42º

// Sede trapezoidal: lados rectos. Inner edge estrecha por un factor.
const SEDE_INNER_FACTOR = 0.92;

// Ancho del brazo = base interior de la sede (cuerda a R_INNER estrechada
// por SEDE_INNER_FACTOR). Así brazo y sede quedan alineados.
const ARM_WIDTH = 2 * R_INNER * Math.sin(UNIT_RAD * SEDE_INNER_FACTOR); // ≈ 60 px

// Hexágono central: lado igual a la base interior de la sede (× 1.4 para
// dar al centro más presencia visual).
const R_HEXAGONO = (ARM_WIDTH / Math.sqrt(3)) * 1.4; // ≈ 48.4

// Brazos: 6 casillas iguales desde R_HEXAGONO+4 hasta R_INNER-4 con gap
// fijo de 4 px entre ellas. Espacio total y altura por casilla derivados
// matemáticamente.
const ARM_CELL_GAP = 4;
const SP_IN = R_HEXAGONO + 4;
const SP_OUT = R_INNER - 4;
const ARM_CELLS = SPOKE_CELLS; // 6
const ARM_CELL_H = (SP_OUT - SP_IN - (ARM_CELLS - 1) * ARM_CELL_GAP) / ARM_CELLS;

const SPOKE_GAP = 6; // sedes cada 6 posiciones (índices 0,6,12,18,24,30)
const DEG = (rad) => (rad * 180) / Math.PI;
const PAD_RAD = (1.5 * Math.PI) / 180; // 1.5º de gap a cada lado

// Devuelve [a0, a1] (radianes) que ocupa una casilla del anillo.
// Sede 0 centrada en -π/2 (arriba). Cada sección = 2 (sede) + 5 normales = 7 unidades.
function cellAngles(index) {
  const cell = BOARD_POSITIONS[index];
  const sedeIdx = Math.floor(index / SPOKE_GAP);
  const offset = index % SPOKE_GAP;
  const sectionStart = sedeIdx * 7;
  let unitStart;
  let unitEnd;
  if (cell.isHQ) {
    unitStart = sectionStart;
    unitEnd = sectionStart + 2;
  } else {
    unitStart = sectionStart + 2 + (offset - 1);
    unitEnd = unitStart + 1;
  }
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
  const r = (R_INNER + R_OUTER) / 2;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a), angle: a };
}

// Brazo j: centrado en el ángulo de la sede j (sede j ↔ index j*SPOKE_GAP)
function spokeAngleDeg(j) {
  const sedeIndex = j * SPOKE_GAP;
  const { angle } = ringCellCenter(sedeIndex);
  return DEG(angle);
}

// Path de un hexágono regular rotado 30º: los lados planos quedan
// perpendiculares a los 6 brazos (vértices entre los brazos).
function hexagonPath(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + Math.PI / 6 + i * (Math.PI / 3);
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return (
    `M ${pts[0][0]} ${pts[0][1]} ` +
    pts.slice(1).map(([x, y]) => `L ${x} ${y}`).join(' ') +
    ' Z'
  );
}

// Path de una sede como TRAPEZOIDE de lados rectos: 4 esquinas, sin arcos.
// Outer edge: cuerda recta de 2 unidades angulares.
// Inner edge: cuerda recta más estrecha (× SEDE_INNER_FACTOR).
function sedeTrapezoidPath(angC) {
  const half = UNIT_RAD; // 1 unidad angular
  const factor = SEDE_INNER_FACTOR;
  const xy = (r, a) => [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  const extL = xy(R_OUTER, angC - half);
  const extR = xy(R_OUTER, angC + half);
  const intR = xy(R_INNER, angC + half * factor);
  const intL = xy(R_INNER, angC - half * factor);
  return `M ${extL[0]} ${extL[1]} L ${extR[0]} ${extR[1]} L ${intR[0]} ${intR[1]} L ${intL[0]} ${intL[1]} Z`;
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
            d={annularWedgePath(a0, a1, R_INNER, R_OUTER)}
            fill={cat.color}
            stroke="#ffffff"
            strokeWidth={1.5}
            strokeLinejoin="round"
            onClick={() => onCellClick?.(cell.index)}
            style={{ cursor: isReachable ? 'pointer' : 'default' }}
          />
        );
      })}

      {/* 6 brazos rectos: cada casilla alterna los 6 colores en secuencia */}
      {CATEGORIES.map((_, j) => {
        const angleDeg = spokeAngleDeg(j);
        return (
          <g key={`spoke-${j}`} transform={`rotate(${angleDeg} ${CX} ${CY})`}>
            {Array.from({ length: ARM_CELLS }).map((_, k) => {
              // Pre-rotación: brazo apunta hacia +x. k=0 más cerca del centro.
              // Cell k ocupa [SP_IN + k*(h+gap), + h], con gap exacto entre vecinos.
              const r0 = SP_IN + k * (ARM_CELL_H + ARM_CELL_GAP);
              const r1 = r0 + ARM_CELL_H;
              const x = CX + r0;
              const y = CY - ARM_WIDTH / 2;
              const cellCat =
                CATEGORIES_BY_ID[CATEGORY_IDS[k % CATEGORY_IDS.length]];
              return (
                <rect
                  key={k}
                  x={x}
                  y={y}
                  width={r1 - r0}
                  height={ARM_WIDTH}
                  fill={cellCat.color}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              );
            })}
          </g>
        );
      })}

      {/* Sedes encima del resto: trapezoides rectos, borde blanco doble */}
      {BOARD_POSITIONS.filter((c) => c.isHQ).map((cell) => {
        const cat = CATEGORIES_BY_ID[cell.category];
        const isReachable = reachableSet.has(cell.index);
        const { angle: angC } = ringCellCenter(cell.index);
        // Centro geométrico aproximado (centroide del trapezoide)
        const center = {
          x: CX + ((R_INNER + R_OUTER) / 2) * Math.cos(angC),
          y: CY + ((R_INNER + R_OUTER) / 2) * Math.sin(angC)
        };
        return (
          <g key={`hq-${cell.index}`} className={isReachable ? 'is-reachable' : ''}>
            {/* Cuerpo coloreado con borde blanco grueso (doble efecto) */}
            <path
              d={sedeTrapezoidPath(angC)}
              fill={cat.color}
              stroke="#ffffff"
              strokeWidth={1.5}
              strokeLinejoin="round"
              onClick={() => onCellClick?.(cell.index)}
              style={{ cursor: isReachable ? 'pointer' : 'default' }}
            />
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

      {/* Casillas alcanzables */}
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

      {/* Centro: hexágono regular */}
      <g
        className="board__center"
        onClick={() => onCellClick?.(CENTER_INDEX)}
        style={{ cursor: 'pointer' }}
      >
        <path
          d={hexagonPath(CX, CY, R_HEXAGONO)}
          fill="#f5f0e8"
          stroke="#ffffff"
          strokeWidth={4}
          strokeLinejoin="round"
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
