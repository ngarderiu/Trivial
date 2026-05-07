import { CATEGORIES_BY_ID } from '../../constants/categories.js';

// Rueda de quesitos. Renderiza un círculo con N huecos (4 o 6), cada uno
// vacío (gris) o relleno con el color de la categoría que se ganó en ese
// hueco (los quesitos se colocan en el orden en que se ganan).
//
// Props:
//   - size: diámetro en píxeles
//   - slots: 4 o 6
//   - earned: array de category ids en orden de obtención
//   - rimColor: color del aro exterior (p. ej. el del jugador)
//   - asSvg: si true, devuelve directamente <g>/<circle> para insertarse
//            dentro de otro <svg> (p. ej. el tablero). Si false, devuelve
//            un <svg> autónomo.
export default function QuesitoWheel({
  size = 38,
  slots = 6,
  earned = [],
  rimColor = '#1f1206',
  asSvg = false
}) {
  const r = size / 2;
  const innerR = r * 0.32;
  const segments = Array.from({ length: slots }, (_, i) => earned[i] ?? null);
  const sliceAngle = (Math.PI * 2) / slots;

  const wedge = (i) => {
    const a0 = i * sliceAngle - Math.PI / 2;
    const a1 = (i + 1) * sliceAngle - Math.PI / 2;
    const x0o = r + r * Math.cos(a0);
    const y0o = r + r * Math.sin(a0);
    const x1o = r + r * Math.cos(a1);
    const y1o = r + r * Math.sin(a1);
    const x0i = r + innerR * Math.cos(a0);
    const y0i = r + innerR * Math.sin(a0);
    const x1i = r + innerR * Math.cos(a1);
    const y1i = r + innerR * Math.sin(a1);
    return `M ${x0o} ${y0o} A ${r} ${r} 0 0 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${innerR} ${innerR} 0 0 0 ${x0i} ${y0i} Z`;
  };

  const content = (
    <g>
      {/* aro exterior */}
      <circle cx={r} cy={r} r={r} fill={rimColor} />
      {segments.map((catId, i) => {
        const cat = catId ? CATEGORIES_BY_ID[catId] : null;
        return (
          <path
            key={i}
            d={wedge(i)}
            fill={cat?.color ?? '#3b3b3b'}
            stroke="#ffffff"
            strokeWidth={1.2}
            opacity={cat ? 1 : 0.55}
          />
        );
      })}
      {/* eje central */}
      <circle cx={r} cy={r} r={innerR * 0.85} fill={rimColor} stroke="#ffffff" strokeWidth={1} />
    </g>
  );

  if (asSvg) {
    return <g transform={`translate(${-r} ${-r})`}>{content}</g>;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Rueda de quesitos">
      {content}
    </svg>
  );
}
