const CLINIC_ADDRESS = '2 Oriente 124, Viña del Mar, Chile';
const DEFAULT_DURATION_MIN = 60;

function pad(n) { return String(n).padStart(2, '0'); }

/** YYYYMMDDTHHMMSS en hora local (sin zona horaria) — más simple y suficiente para un solo país. */
function formatLocal(d) {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

function eventRange(date, time) {
  const [h, m] = time.split(':').map(Number);
  const start = new Date(date);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + DEFAULT_DURATION_MIN * 60 * 1000);
  return { start, end };
}

/** Link "Agregar a Google Calendar" — se abre en una pestaña nueva, no requiere login previo. */
export function googleCalendarUrl({ servicio, date, time, manageUrl }) {
  const { start, end } = eventRange(date, time);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Cita en Clínica Estética Imperium — ${servicio}`,
    dates: `${formatLocal(start)}/${formatLocal(end)}`,
    details: `Tratamiento: ${servicio}. Te esperamos en Clínica Estética Imperium.${manageUrl ? ` Cambiar o cancelar: ${manageUrl}` : ''}`,
    location: CLINIC_ADDRESS,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Descarga un .ics — sirve para Apple Calendar, Outlook y la mayoría de apps de calendario. */
export function downloadICS({ servicio, date, time, manageUrl }) {
  const { start, end } = eventRange(date, time);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Imperium Lux Spa//Reservas//ES',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@imperiumluxspa.cl`,
    `DTSTAMP:${formatLocal(new Date())}`,
    `DTSTART:${formatLocal(start)}`,
    `DTEND:${formatLocal(end)}`,
    `SUMMARY:Cita en Clínica Estética Imperium — ${servicio}`,
    `DESCRIPTION:Tratamiento: ${servicio}. Te esperamos en Clínica Estética Imperium.${manageUrl ? ` Cambiar o cancelar: ${manageUrl}` : ''}`,
    `LOCATION:${CLINIC_ADDRESS}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reserva-imperium-lux-spa.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
