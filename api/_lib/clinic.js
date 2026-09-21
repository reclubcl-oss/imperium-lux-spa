// Datos y helpers compartidos por los endpoints que envían correos.
export const CLINIC = {
  nombre: 'Clínica Estética Imperium',
  direccion: '2 Oriente 124, Viña del Mar',
  telefono: '+56 9 7149 4060',
  whatsapp: 'https://wa.me/56971494060',
};

export const SITE_URL = 'https://imperium-lux-spa.vercel.app';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
