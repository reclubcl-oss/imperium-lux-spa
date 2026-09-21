import { useState } from 'react';
import { detectPlatform, isStandalone, pushSupported, enablePush } from '../utils/push';

// Tarjeta de la pantalla "Reserva confirmada": deja que la clienta reciba el
// recordatorio de su cita como notificación en el teléfono. El recordatorio por
// correo le llega igual; esto es un extra. En iPhone solo aplica si ya instaló
// la app (Apple no permite push desde una pestaña normal de Safari), así que en
// ese caso no se muestra nada para no confundir.
export default function ReminderOptIn({ email }) {
  const [state, setState] = useState('idle'); // idle | working | done | denied | error

  const { ios } = detectPlatform(navigator.userAgent, navigator.maxTouchPoints);
  if (!pushSupported() || (ios && !isStandalone())) return null;

  const activate = async () => {
    setState('working');
    const res = await enablePush({ email });
    setState(res.success ? 'done' : res.error === 'denied' ? 'denied' : res.error === 'default' ? 'idle' : 'error');
  };

  return (
    <div style={{ background: 'var(--cream-soft)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', marginBottom: '22px', textAlign: 'left' }}>
      {state === 'done' ? (
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--olive)', fontSize: '0.82rem', lineHeight: 1.6 }}>
          ✓ Listo. Te avisaremos en este teléfono el día antes de tu cita.
        </p>
      ) : state === 'denied' ? (
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.8rem', lineHeight: 1.6 }}>
          Las notificaciones están bloqueadas en este teléfono. Puedes activarlas en Ajustes.
        </p>
      ) : (
        <>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>🔔 ¿Te recordamos tu cita?</p>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.78rem', lineHeight: 1.6, marginBottom: '10px' }}>
            Recibe un aviso en tu teléfono el día antes.
          </p>
          <button type="button" onClick={activate} disabled={state === 'working'}
            style={{ background: 'var(--olive)', color: 'var(--cream)', border: 'none', padding: '10px 18px', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', opacity: state === 'working' ? 0.6 : 1 }}>
            {state === 'working' ? 'Activando...' : 'Activar aviso'}
          </button>
          {state === 'error' && <p style={{ fontFamily: 'var(--font-sans)', color: '#B3413A', fontSize: '0.74rem', marginTop: '8px' }}>No se pudo activar. Intenta de nuevo.</p>}
        </>
      )}
    </div>
  );
}
