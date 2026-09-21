// Fotos representativas por tratamiento individual — se muestran mientras ese
// tratamiento no tenga su propia foto subida desde /admin. A diferencia de
// categoryDefaults.js (una foto por categoría), acá cada uno de los 24
// tratamientos tiene su propia imagen distinta.
//
// Fuente: bancos de fotos de licencia libre (CC0 / CC BY / CC BY-SA vía
// Openverse — stocksnap, rawpixel, Wikimedia Commons). Créditos y licencia
// de cada una en IMAGE-CREDITS.md (raíz del proyecto). Las fotos con
// licencia CC BY o CC BY-SA requieren atribución visible — por eso el sitio
// enlaza a /creditos desde el pie de página.
//
// 'Peeling Químico' y 'Criolipólisis' no tienen foto propia todavía (no se
// encontró una foto de banco libre que las representara bien sin repetir
// otra ya usada) — caen al default de su categoría (categoryDefaults.js).

import hidratacionProfunda from '../assets/treatments/hidratacion-profunda.webp';
import radiofrecuenciaFacial from '../assets/treatments/radiofrecuencia-facial.webp';
import mesoterapia from '../assets/treatments/mesoterapia.webp';
import botoxRellenos from '../assets/treatments/botox-rellenos.webp';
import plasmaRicoPlaquetas from '../assets/treatments/plasma-rico-plaquetas.webp';
import hilosTensores from '../assets/treatments/hilos-tensores.webp';
import bioestimuladores from '../assets/treatments/bioestimuladores.webp';
import reduccionMedidas from '../assets/treatments/reduccion-medidas.webp';
import drenajeLinfatico from '../assets/treatments/drenaje-linfatico.webp';
import cavitacion from '../assets/treatments/cavitacion.webp';
import presoterapia from '../assets/treatments/presoterapia.webp';
import laserDepilacion from '../assets/treatments/laser-depilacion.webp';
import ultrasonidoFocalizado from '../assets/treatments/ultrasonido-focalizado.webp';
import luzPulsadaIPL from '../assets/treatments/luz-pulsada-ipl.webp';
import masajesTerapeuticos from '../assets/treatments/masajes-terapeuticos.webp';
import ritualDeOro from '../assets/treatments/ritual-de-oro.webp';
import aromaterapia from '../assets/treatments/aromaterapia.webp';
import envolturaCorporal from '../assets/treatments/envoltura-corporal.webp';
import disenoCejas from '../assets/treatments/diseno-cejas.webp';
import pestanas from '../assets/treatments/pestanas.webp';
import perfiladoLabios from '../assets/treatments/perfilado-labios.webp';
import contornoOjos from '../assets/treatments/contorno-ojos.webp';

export const TREATMENT_DEFAULT_IMAGE = {
  'Hidratación Profunda':      hidratacionProfunda,
  'Radiofrecuencia Facial':    radiofrecuenciaFacial,
  'Mesoterapia':                mesoterapia,
  'Bótox & Rellenos':          botoxRellenos,
  'Plasma Rico en Plaquetas':  plasmaRicoPlaquetas,
  'Hilos Tensores':             hilosTensores,
  'Bioestimuladores':           bioestimuladores,
  'Reducción de Medidas':      reduccionMedidas,
  'Drenaje Linfático':          drenajeLinfatico,
  'Cavitación':                 cavitacion,
  'Presoterapia':               presoterapia,
  'Láser Depilación':          laserDepilacion,
  'Ultrasonido Focalizado':    ultrasonidoFocalizado,
  'Luz Pulsada IPL':            luzPulsadaIPL,
  'Masajes Terapéuticos':      masajesTerapeuticos,
  'Ritual de Oro':              ritualDeOro,
  'Aromaterapia':               aromaterapia,
  'Envoltura Corporal':         envolturaCorporal,
  'Diseño de Cejas':            disenoCejas,
  'Pestañas':                   pestanas,
  'Perfilado de Labios':        perfiladoLabios,
  'Contorno de Ojos':           contornoOjos,
};
