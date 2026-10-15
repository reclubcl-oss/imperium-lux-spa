import { Link, useLocation } from 'react-router-dom';
import { whatsappLink } from '../utils/contact';
import { useSite } from '../utils/siteContent';

const WA_PATH = 'M17.6 6.32A8.86 8.86 0 0 0 11.9 4a8.94 8.94 0 0 0-7.75 13.4L3 21l3.7-1.1a8.9 8.9 0 0 0 5.2 1.67h.01a8.94 8.94 0 0 0 8.94-8.93 8.87 8.87 0 0 0-3.25-6.32ZM11.9 20a7.4 7.4 0 0 1-3.79-1.04l-.27-.16-2.24.66.65-2.18-.18-.28A7.44 7.44 0 1 1 19.35 12.6 7.45 7.45 0 0 1 11.9 20Zm4.08-5.58c-.22-.11-1.32-.65-1.53-.72-.2-.08-.35-.11-.5.11-.15.22-.58.72-.71.87-.13.15-.26.16-.48.06-.22-.11-.94-.35-1.79-1.11a6.72 6.72 0 0 1-1.24-1.55c-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.06-.11-.5-1.21-.69-1.66-.18-.43-.36-.37-.5-.38h-.43a.83.83 0 0 0-.6.28 2.5 2.5 0 0 0-.79 1.87c0 1.1.8 2.16.91 2.31.11.15 1.57 2.4 3.8 3.36.53.23.95.37 1.27.47.53.17 1.02.15 1.4.09.43-.06 1.32-.54 1.5-1.06.19-.52.19-.96.13-1.06-.06-.1-.2-.15-.42-.26Z';

// Contacto rápido en todas las páginas públicas: botón flotante de WhatsApp en escritorio y,
// en celular, una barra fija abajo con "Reservar" y "WhatsApp". Queda por debajo de los
// diálogos (z-index 200+) para no taparlos.
export default function WhatsAppFab() {
  const { contacto } = useSite();
  const { pathname } = useLocation();
  const link = whatsappLink('Hola! Me gustaría más información.');
  // En reservar y en la gestión de la cita la barra estorbaría (ya estás en el proceso).
  const showBar = pathname !== '/reservar' && pathname !== '/cita';

  return (
    <>
      {contacto.mostrarWhatsapp && (
        <a href={link} target="_blank" rel="noreferrer"
          aria-label="Escribirnos por WhatsApp" className="whatsapp-fab"
          style={{
            position: 'fixed', right: '16px', bottom: 'calc(16px + env(safe-area-inset-bottom))', zIndex: 60,
            width: '56px', height: '56px', borderRadius: '50%', background: '#25D366', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(23,27,22,0.28)', transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(23,27,22,0.34)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(23,27,22,0.28)'; }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={WA_PATH} /></svg>
        </a>
      )}

      {showBar && (
        <div className="mobile-cta-bar" style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60, display: 'flex', gap: '10px',
          padding: '10px 14px calc(10px + env(safe-area-inset-bottom))', background: 'rgba(255,254,251,0.97)',
          backdropFilter: 'blur(10px)', borderTop: '1px solid var(--border)', boxShadow: '0 -8px 24px rgba(23,27,22,0.08)',
        }}>
          <Link to="/reservar" style={{ flex: 1.3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--olive)', color: 'var(--cream)', borderRadius: '99px', padding: '13px 10px', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>
            Reservar hora
          </Link>
          {contacto.mostrarWhatsapp && (
            <a href={link} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#fff', color: 'var(--ink)', border: '1px solid var(--border)', borderRadius: '99px', padding: '13px 10px', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true"><path d={WA_PATH} /></svg>
              WhatsApp
            </a>
          )}
        </div>
      )}
    </>
  );
}
