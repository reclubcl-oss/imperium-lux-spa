import { Link } from 'react-router-dom';
import SectionDivider from '../components/SectionDivider';

const CONTACT_EMAIL = 'clinicaimperiumvina@gmail.com';

const SECTIONS = [
  {
    title: '1. Quién es responsable de tus datos',
    body: [
      'Clínica Estética Imperium, ubicada en 2 Oriente 124, Viña del Mar, Región de Valparaíso, Chile, es la responsable del tratamiento de los datos personales que nos entregas a través de este sitio web.',
      `Puedes escribirnos para cualquier consulta sobre tus datos a ${CONTACT_EMAIL}.`,
    ],
  },
  {
    title: '2. Qué datos recopilamos',
    list: [
      'Al reservar una hora: nombre, correo electrónico, teléfono, tratamiento elegido, fecha y hora, y las notas que decidas escribir.',
      'Al consultar tu Club de Fidelidad: el correo electrónico con el que agendas tus citas.',
      'Datos de navegación (páginas visitadas, tipo de dispositivo) si están activas las herramientas de medición descritas más abajo.',
    ],
    note: 'En el campo de notas escribe solo lo necesario para tu atención. Si incluyes información de salud (por ejemplo alergias o condiciones médicas), la trataremos con reserva y solo para preparar tu tratamiento.',
  },
  {
    title: '3. Para qué usamos tus datos',
    list: [
      'Agendar, confirmar y gestionar tu cita, y contactarte si hay algún cambio.',
      'Enviarte el correo de confirmación de tu reserva y un recordatorio el día antes de tu cita.',
      'Enviarte promociones y novedades por correo o notificación, solo si lo aceptas expresamente (casilla opcional al reservar, o al activar las notificaciones). Puedes darte de baja cuando quieras con el enlace de cada correo, o escribiéndonos.',
      'Calcular tus visitas y beneficios en el Club de Fidelidad.',
      'Llevar el control interno de la clínica (agenda y finanzas).',
      'Entender cómo se usa el sitio para mejorarlo.',
    ],
    note: 'No vendemos tus datos ni los usamos para fines distintos a los indicados sin pedirte antes tu autorización.',
  },
  {
    title: '4. Con quién compartimos tus datos',
    body: ['Para que el sitio funcione usamos proveedores que procesan datos por encargo nuestro:'],
    list: [
      'Supabase: almacenamiento de las reservas y clientes.',
      'Vercel: alojamiento del sitio web.',
      'EmailJS y Google (Gmail): envío de los correos de confirmación.',
      'Zapier: automatización de avisos internos de nuevas reservas.',
      'Google Maps: mapa de ubicación incrustado en el sitio.',
      'Google Analytics y Meta Pixel: medición de visitas, cuando estén activos.',
    ],
    note: 'Algunos de estos proveedores pueden almacenar datos en servidores fuera de Chile.',
  },
  {
    title: '5. Cuánto tiempo guardamos tus datos',
    body: ['Conservamos tus datos mientras mantengas una relación con la clínica (por ejemplo, si sigues agendando citas) y por el tiempo necesario para cumplir obligaciones legales y contables. Cuando ya no sean necesarios, los eliminamos o anonimizamos.'],
  },
  {
    title: '6. Tus derechos',
    body: [
      'De acuerdo con la Ley N° 19.628 sobre protección de la vida privada, puedes solicitar en cualquier momento acceso a tus datos, su rectificación, su eliminación (cancelación) o bloqueo, y oponerte a su uso.',
      `Para ejercer estos derechos escríbenos a ${CONTACT_EMAIL} indicando el correo o teléfono con el que reservaste, y te responderemos a la brevedad.`,
    ],
  },
  {
    title: '7. Cookies y medición',
    body: ['Este sitio puede usar cookies o tecnologías similares de Google Analytics y Meta Pixel para medir visitas y evaluar campañas. No las usamos para identificarte por nombre. Puedes bloquearlas desde la configuración de tu navegador.'],
  },
  {
    title: '8. Cambios a esta política',
    body: ['Podemos actualizar esta política cuando cambie el funcionamiento del sitio. La fecha de la última actualización aparece al inicio de esta página.'],
  },
];

const bodyText = { fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.9rem', lineHeight: 1.85 };

export default function Privacidad() {
  return (
    <section style={{ background: 'var(--cream-soft)', padding: 'clamp(80px,10vw,120px) 16px clamp(60px,8vw,90px)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <p style={{ color: 'var(--gold-accent)', fontSize: '0.72rem', letterSpacing: '0.22em', fontFamily: 'var(--font-sans)', fontWeight: 700, marginBottom: '14px', textAlign: 'center' }}>TUS DATOS, CON CUIDADO</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.4rem)', color: 'var(--ink)', marginBottom: '18px', fontWeight: 400, textAlign: 'center' }}>Política de Privacidad</h1>
        <SectionDivider margin="0 auto 20px" />
        <p style={{ ...bodyText, fontSize: '0.78rem', textAlign: 'center', marginBottom: '36px' }}>Última actualización: 21 de septiembre de 2026</p>

        <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '14px', padding: 'clamp(22px,5vw,40px)' }}>
          {SECTIONS.map((s, i) => (
            <div key={s.title} style={{ marginBottom: i < SECTIONS.length - 1 ? '30px' : 0 }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: '1.15rem', fontWeight: 400, marginBottom: '10px' }}>{s.title}</h2>
              {s.body?.map(p => <p key={p} style={{ ...bodyText, marginBottom: '10px' }}>{p}</p>)}
              {s.list && (
                <ul style={{ ...bodyText, paddingLeft: '20px', marginBottom: '10px', listStyle: 'disc' }}>
                  {s.list.map(item => <li key={item} style={{ marginBottom: '6px' }}>{item}</li>)}
                </ul>
              )}
              {s.note && <p style={{ ...bodyText, fontSize: '0.84rem', fontStyle: 'italic' }}>{s.note}</p>}
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: '28px' }}>
          <Link to="/reservar" style={{ fontFamily: 'var(--font-sans)', color: 'var(--gold-accent)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>Volver a reservar →</Link>
        </p>
      </div>
    </section>
  );
}
