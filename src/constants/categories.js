// Las 6 categorías clásicas del Trivial Pursuit.
// `id` es la clave usada en JSON de preguntas y para colorear casillas.

export const CATEGORIES = [
  {
    id: 'geografia',
    name: 'Geografía',
    color: '#1565c0',
    bgColor: '#bbdefb',
    icon: '🌍',
    categoryKey: 'geografia'
  },
  {
    id: 'entretenimiento',
    name: 'Entretenimiento',
    color: '#ec407a',
    bgColor: '#f8bbd0',
    icon: '🎬',
    categoryKey: 'entretenimiento'
  },
  {
    id: 'historia',
    name: 'Historia',
    color: '#fbc02d',
    bgColor: '#fff59d',
    icon: '📜',
    categoryKey: 'historia'
  },
  {
    id: 'arte',
    name: 'Arte y Literatura',
    color: '#6a1b9a',
    bgColor: '#e1bee7',
    icon: '🎨',
    categoryKey: 'arte'
  },
  {
    id: 'ciencia',
    name: 'Ciencia',
    color: '#2e7d32',
    bgColor: '#c8e6c9',
    icon: '🔬',
    categoryKey: 'ciencia'
  },
  {
    id: 'deporte',
    name: 'Deporte',
    color: '#e65100',
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
