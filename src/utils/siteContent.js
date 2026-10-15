import { createContext, useContext } from 'react';
import { supabase } from './supabase';
import { setWhatsappNumber } from './contact';

// Todo lo que el admin puede editar desde "Sitio web". Si no hay nada guardado
// (o la base de datos no responde) el sitio se ve exactamente con estos valores.
export const DEFAULTS = {
  marca: {
    logoUrl: '',
    tituloPagina: 'Clínica Estética Imperium | Viña del Mar',
  },
  colores: { olive: '#263A22', forest: '#172616', gold: '#B5924D' },
  contacto: {
    whatsapp: '56971494060',
    telefono: '+56 9 7149 4060',
    email: 'clinicaimperiumvina@gmail.com',
    direccionCorta: '2 Oriente 124, Viña del Mar',
    horarioResumen: 'Lun–Vie 9:00–20:00 · Sáb 9:00–18:00',
    instagram: 'https://www.instagram.com/clinica.estetica.imperium',
    mostrarWhatsapp: true,
  },
  hero: {
    etiqueta: 'CLÍNICA ESTÉTICA IMPERIUM',
    titulo: 'Estética avanzada, resultados que se sienten naturales',
    texto: 'Medicina estética con precisión y cuidado. Realzamos tu belleza respetando tu esencia.',
    botonPrincipal: 'Agenda tu evaluación',
    botonSecundario: 'Ver tratamientos',
    nota: 'Clínica autorizada SEREMI de Salud · Ubicados en Viña del Mar',
    imagenUrl: '',
    videoUrl: '',
    fotoLado: 'derecha',
    destacados: [
      { titulo: 'Atención personalizada', texto: 'Orientación pensada según tus necesidades y objetivos.' },
      { titulo: 'Tecnología avanzada', texto: 'Procedimientos y tecnología seleccionados según cada evaluación.' },
      { titulo: 'Evaluación profesional', texto: 'Cada tratamiento comienza con una orientación personalizada.' },
    ],
  },
  servicios: {
    etiqueta: 'NUESTROS SERVICIOS',
    titulo: 'Tratamientos Exclusivos',
    texto: 'Cada tratamiento es una experiencia única, diseñada para revelar tu mejor versión. Toca una foto para ver más.',
  },
  paginaServicios: {
    etiqueta: 'TRATAMIENTOS',
    titulo: 'Todos nuestros tratamientos',
    texto: 'Conoce cada tratamiento y reserva el que necesitas. Toca una foto para ver el detalle, el precio y agendar.',
    ctaTitulo: '¿No sabes cuál elegir?',
    ctaTexto: 'Agenda una evaluación y te orientamos según tus necesidades y objetivos.',
  },
  cifras: {
    mostrarTratamientos: true,
    items: [
      { numero: '6', texto: 'Días de atención a la semana' },
      { numero: '1 a 1', texto: 'Atención personalizada' },
    ],
  },
  fidelidad: {
    etiqueta: 'PROGRAMA DE FIDELIDAD',
    titulo: 'Tarjeta de Fidelidad',
    texto: 'Cada visita suma un sello. Al completar la tarjeta, tienes un beneficio especial en tu siguiente sesión.',
    enlace: 'Agenda tu próxima cita →',
  },
  comunidad: {
    etiqueta: 'NUESTRA COMUNIDAD',
    titulo: 'Gracias por su Confianza',
    texto: 'Cada cliente es parte de nuestra familia. Gracias por acompañarnos y por todas las lindas energías.',
    frase: 'Gracias a cada uno de ustedes por acompañarnos',
    videoUrl: '',
  },
  nosotros: {
    etiqueta: 'NUESTRA FORMA DE CUIDARTE',
    titulo: 'Ciencia, precisión y cuidado',
    parrafo1: 'En Imperium combinamos atención personalizada, tecnología estética y un enfoque cercano para acompañarte en cada etapa de tu tratamiento.',
    parrafo2: 'Cada procedimiento comienza con una evaluación orientada a tus necesidades y objetivos.',
    boton: 'Solicitar evaluación',
    imagenUrl: '',
    fotoLado: 'derecha',
  },
  ubicacion: {
    etiqueta: 'ENCUÉNTRANOS',
    titulo: 'Nuestra Ubicación',
    direccion: '2 Oriente 124\nViña del Mar, Valparaíso\nChile',
    mapaConsulta: '2 Oriente 124, Viña del Mar, Valparaíso, Chile',
    horarios: [
      { dia: 'Lunes – Viernes', horas: '9:00 – 20:00' },
      { dia: 'Sábado', horas: '9:00 – 18:00' },
      { dia: 'Domingo', horas: 'Cerrado' },
    ],
  },
  proceso: {
    etiqueta: 'TU PRIMERA VISITA',
    titulo: 'Así es tu atención en Imperium',
    texto: 'Un camino claro, de la reserva al seguimiento de tu tratamiento.',
    pasos: [
      { titulo: 'Reserva tu hora', texto: 'Agenda online o por WhatsApp, eligiendo el día y la hora que mejor te acomode.' },
      { titulo: 'Evaluación personalizada', texto: 'Cada procedimiento comienza con una evaluación orientada a tus necesidades y objetivos.' },
      { titulo: 'Tu tratamiento', texto: 'Procedimientos y tecnología seleccionados según tu evaluación, con atención 1 a 1.' },
      { titulo: 'Te acompañamos', texto: 'Seguimos contigo en cada etapa, y cada visita suma sellos en tu tarjeta de fidelidad.' },
    ],
  },
  preguntas: {
    etiqueta: 'PREGUNTAS FRECUENTES',
    titulo: 'Resolvemos tus dudas',
    items: [
      { pregunta: '¿Cómo reservo una hora?', respuesta: 'Elige tu tratamiento en la sección Reservar, escoge un día y horario disponible y confirma con tus datos. Recibirás la confirmación por correo.' },
      { pregunta: '¿Puedo cambiar o cancelar mi cita?', respuesta: 'Sí, hasta 24 horas antes desde el enlace de tu confirmación. Si te queda menos tiempo, escríbenos por WhatsApp.' },
      { pregunta: '¿Necesito una evaluación antes del tratamiento?', respuesta: 'Cada procedimiento comienza con una evaluación orientada a tus necesidades y objetivos.' },
      { pregunta: '¿Dónde están y cuál es el horario?', respuesta: 'Estamos en 2 Oriente 124, Viña del Mar. Atendemos de lunes a viernes de 9:00 a 20:00 y los sábados de 9:00 a 18:00.' },
      { pregunta: '¿Cómo funciona el Club de Fidelidad?', respuesta: 'Cada visita suma un sello. Al completar la tarjeta tienes un beneficio especial en tu siguiente sesión.' },
    ],
  },
  footer: { descripcion: 'Estética avanzada con atención personalizada en Viña del Mar.' },
  // Orden y visibilidad de las secciones de la portada (la portada principal siempre va primero).
  secciones: [
    { id: 'servicios', visible: true },
    { id: 'proceso', visible: true },
    { id: 'cifras', visible: true },
    { id: 'fidelidad', visible: true },
    { id: 'comunidad', visible: true },
    { id: 'nosotros', visible: true },
    { id: 'preguntas', visible: true },
    { id: 'ubicacion', visible: true },
  ],
};

export const SECCION_NOMBRES = {
  servicios: 'Tratamientos',
  proceso: 'Primera visita',
  preguntas: 'Preguntas frecuentes',
  cifras: 'Cifras',
  fidelidad: 'Tarjeta de fidelidad',
  comunidad: 'Comunidad (video)',
  nosotros: 'Nosotros',
  ubicacion: 'Ubicación',
};

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

// Los textos guardados pisan a los de fábrica; las listas se reemplazan completas.
function merge(base, over) {
  if (!isObj(base) || !isObj(over)) return over === undefined || over === null ? base : over;
  const out = { ...base };
  for (const k of Object.keys(over)) out[k] = k in base ? merge(base[k], over[k]) : over[k];
  return out;
}

// Garantiza que estén todas las secciones (por si se agrega una nueva más adelante).
function normalizeSecciones(list) {
  const seen = new Set();
  const out = [];
  for (const s of Array.isArray(list) ? list : []) {
    if (s && DEFAULTS.secciones.some(d => d.id === s.id) && !seen.has(s.id)) { seen.add(s.id); out.push({ id: s.id, visible: s.visible !== false }); }
  }
  // Las que falten (por ejemplo una sección nueva) entran en su lugar de fábrica.
  DEFAULTS.secciones.forEach((d, i) => { if (!seen.has(d.id)) out.splice(Math.min(i, out.length), 0, { ...d }); });
  return out;
}

export function buildSite(overrides) {
  const site = merge(DEFAULTS, isObj(overrides) ? overrides : {});
  site.secciones = normalizeSecciones(site.secciones);
  setWhatsappNumber(site.contacto.whatsapp);
  return site;
}

const CACHE_KEY = 'imperium-sitio-v1';

export function readCachedOverrides() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { return null; }
}

function cacheOverrides(valor) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(valor)); } catch { /* sin almacenamiento: no pasa nada */ }
}

/** Lee lo que guardó el admin. Si falla, el sitio sigue con lo último conocido o con los valores de fábrica. */
export async function fetchOverrides() {
  if (!supabase) return { success: false, data: null };
  const { data, error } = await supabase.from('sitio_contenido').select('valor').eq('clave', 'sitio').maybeSingle();
  if (error) return { success: false, error: error.message, data: null };
  const valor = data?.valor ?? null;
  cacheOverrides(valor);
  return { success: true, data: valor };
}

/** Solo el admin puede guardar (lo exige la política de la base de datos). */
export async function saveOverrides(valor) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };
  const { error } = await supabase.from('sitio_contenido').upsert({ clave: 'sitio', valor, updated_at: new Date().toISOString() });
  if (error) {
    const faltaTabla = /sitio_contenido|relation|schema cache/i.test(error.message);
    return { success: false, error: faltaTabla ? 'Falta crear la tabla del editor en Supabase (ver instrucciones).' : error.message };
  }
  cacheOverrides(valor);
  return { success: true };
}

export const SiteContext = createContext({ site: buildSite(null), reload: async () => {} });

// Modo "editar sobre la página" (solo en el admin): cuando `editing` es true, los textos
// y fotos marcados con <E> / <EditableImage> se pueden tocar y cambiar directamente.
export const EditContext = createContext({ editing: false, setValue: () => {}, moveSection: () => {}, dropSection: () => {}, toggleSection: () => {} });

export function useSite() {
  return useContext(SiteContext).site;
}

export function useSiteReload() {
  return useContext(SiteContext).reload;
}

// Aplica los colores elegidos en el admin a las variables CSS del sitio.
export function applyColors(colores) {
  const root = document.documentElement.style;
  const set = (name, value) => { if (/^#[0-9a-f]{6}$/i.test(value || '')) root.setProperty(name, value); };
  set('--olive', colores.olive);
  set('--forest', colores.forest);
  set('--gold-accent', colores.gold);
  if (/^#[0-9a-f]{6}$/i.test(colores.olive || '')) root.setProperty('--olive-light', `color-mix(in srgb, ${colores.olive} 82%, white)`);
}

export const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

export function setPath(obj, path, value) {
  const keys = path.split('.');
  const copy = structuredClone(obj);
  let cur = copy;
  keys.slice(0, -1).forEach(k => { cur = cur[k]; });
  cur[keys[keys.length - 1]] = value;
  return copy;
}
