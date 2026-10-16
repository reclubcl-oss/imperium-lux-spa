// Copia de los 24 tratamientos para mostrar la sección aunque la base de datos
// no responda (por ejemplo si Supabase pausa el proyecto). Se usa SOLO como
// plan B: cuando la base funciona, manda lo que está en /admin (precios, fotos,
// textos y orden). Aquí no hay precios ni fotos propias: esos datos viven en la
// base. Si agregas o renombras tratamientos en /admin, actualiza esta lista.
const RAW = [
  ['Hidratación Profunda', 'Tratamientos Faciales'],
  ['Peeling Químico', 'Tratamientos Faciales'],
  ['Radiofrecuencia Facial', 'Tratamientos Faciales'],
  ['Mesoterapia', 'Tratamientos Faciales'],
  ['Bótox & Rellenos', 'Medicina Estética'],
  ['Plasma Rico en Plaquetas', 'Medicina Estética'],
  ['Hilos Tensores', 'Medicina Estética'],
  ['Bioestimuladores', 'Medicina Estética'],
  ['Reducción de Medidas', 'Tratamientos Corporales'],
  ['Drenaje Linfático', 'Tratamientos Corporales'],
  ['Cavitación', 'Tratamientos Corporales'],
  ['Presoterapia', 'Tratamientos Corporales'],
  ['Láser Depilación', 'Tecnología Avanzada'],
  ['Ultrasonido Focalizado', 'Tecnología Avanzada'],
  ['Luz Pulsada IPL', 'Tecnología Avanzada'],
  ['Criolipólisis', 'Tecnología Avanzada'],
  ['Masajes Terapéuticos', 'Relajación & Spa'],
  ['Ritual de Oro', 'Relajación & Spa'],
  ['Aromaterapia', 'Relajación & Spa'],
  ['Envoltura Corporal', 'Relajación & Spa'],
  ['Diseño de Cejas', 'Zona Ocular & Labios'],
  ['Pestañas', 'Zona Ocular & Labios'],
  ['Perfilado de Labios', 'Zona Ocular & Labios'],
  ['Contorno de Ojos', 'Zona Ocular & Labios'],
];

export const SERVICIOS_RESPALDO = RAW.map(([nombre, categoria], i) => ({
  id: `respaldo-${i + 1}`,
  nombre,
  categoria,
  descripcion: null,
  precio: null,
  foto_url: null,
  activo: true,
  orden: i + 1,
}));
