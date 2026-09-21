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

import hidratacionProfunda from '../assets/treatments/hidratacion-profunda.jpg';
import radiofrecuenciaFacial from '../assets/treatments/radiofrecuencia-facial.jpg';
import mesoterapia from '../assets/treatments/mesoterapia.jpg';
import botoxRellenos from '../assets/treatments/botox-rellenos.jpg';
import plasmaRicoPlaquetas from '../assets/treatments/plasma-rico-plaquetas.jpg';
import hilosTensores from '../assets/treatments/hilos-tensores.jpg';
import bioestimuladores from '../assets/treatments/bioestimuladores.jpg';
import reduccionMedidas from '../assets/treatments/reduccion-medidas.jpg';
import drenajeLinfatico from '../assets/treatments/drenaje-linfatico.jpg';
import cavitacion from '../assets/treatments/cavitacion.jpg';
import presoterapia from '../assets/treatments/presoterapia.jpg';
import laserDepilacion from '../assets/treatments/laser-depilacion.jpg';
import ultrasonidoFocalizado from '../assets/treatments/ultrasonido-focalizado.jpg';
import luzPulsadaIPL from '../assets/treatments/luz-pulsada-ipl.jpg';
import masajesTerapeuticos from '../assets/treatments/masajes-terapeuticos.jpg';
import ritualDeOro from '../assets/treatments/ritual-de-oro.jpg';
import aromaterapia from '../assets/treatments/aromaterapia.jpg';
import envolturaCorporal from '../assets/treatments/envoltura-corporal.jpg';
import disenoCejas from '../assets/treatments/diseno-cejas.jpg';
import pestanas from '../assets/treatments/pestanas.jpg';
import perfiladoLabios from '../assets/treatments/perfilado-labios.jpg';
import contornoOjos from '../assets/treatments/contorno-ojos.jpg';

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
