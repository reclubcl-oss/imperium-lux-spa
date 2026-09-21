// Fotos e íconos por defecto por categoría — se muestran mientras un tratamiento
// no tenga su propia foto subida desde /admin. Son fotos reales de la clínica
// (las mismas descargadas para el rediseño), reutilizadas por categoría afín.
import faciales from '../assets/brand/faciales.jpg';
import corporales from '../assets/brand/corporales.jpg';
import hero from '../assets/brand/hero.jpg';
import ciencia from '../assets/brand/ciencia.jpg';

export const CATEGORY_DEFAULT_IMAGE = {
  'Tratamientos Faciales':   faciales,
  'Medicina Estética':       hero,
  'Tratamientos Corporales': corporales,
  'Tecnología Avanzada':     ciencia,
  'Relajación & Spa':        corporales,
  'Zona Ocular & Labios':    faciales,
};

export const CATEGORY_ICON = {
  'Tratamientos Faciales':   '✨',
  'Medicina Estética':       '💎',
  'Tratamientos Corporales': '🌿',
  'Tecnología Avanzada':     '⚡',
  'Relajación & Spa':        '💆',
  'Zona Ocular & Labios':    '👁️',
};
