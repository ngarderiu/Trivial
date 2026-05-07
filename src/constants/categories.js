// Las 6 categorías clásicas del Trivial Pursuit.
// Colores saturados como los del tablero original.

export const CATEGORIES = [
  {
    id: 'geografia',
    name: 'Geografía',
    color: '#5B9FD4',
    bgColor: '#bbdefb',
    icon: '🌍',
    categoryKey: 'geografia'
  },
  {
    id: 'entretenimiento',
    name: 'Entretenimiento',
    color: '#E8529A',
    bgColor: '#f8bbd0',
    icon: '🎬',
    categoryKey: 'entretenimiento'
  },
  {
    id: 'historia',
    name: 'Historia',
    color: '#F2C94C',
    bgColor: '#fff59d',
    icon: '📜',
    categoryKey: 'historia'
  },
  {
    id: 'arte',
    name: 'Arte y Literatura',
    color: '#9B6FBF',
    bgColor: '#e1bee7',
    icon: '🎨',
    categoryKey: 'arte'
  },
  {
    id: 'ciencia',
    name: 'Ciencia',
    color: '#4CAF82',
    bgColor: '#c8e6c9',
    icon: '🔬',
    categoryKey: 'ciencia'
  },
  {
    id: 'deporte',
    name: 'Deporte',
    color: '#E8873A',
    bgColor: '#ffe0b2',
    icon: '⚽',
    categoryKey: 'deporte'
  }
];

// Acceso rápido por id
export const CATEGORIES_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
