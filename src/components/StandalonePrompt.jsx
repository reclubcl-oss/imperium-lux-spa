import { useEffect, useState } from 'react';
import { isStandalone, pushSupported, enablePush } from '../utils/push';

const KEY = 'imperium_notif_prompt_at';
const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // si dice "Ahora no", no se insiste por 14 días

// Al abrir la app instalada (desde el ícono del inicio) ofrece activar las
// notificaciones con un solo toque. No se puede activar sola: iPhone y Android
// exigen que la persona lo autorice tocando un botón, para evitar spam.
export default function StandalonePrompt() {
  const [show, setShow] = useState(false);
  const [state, setState] = useState('idle'); // idle | working | done | denied

  useEffect(() => {
    if (!isStandalone() || !pushSupported()) return;

    // Ya dio permiso antes: se renueva la suscripción en silencio (no requiere
    // tocar nada) por si expiró o cambió de dispositivo.
    if (Notification.permission === 'granted') { enablePush().catch(() => {}); return; }
    if (Notification.permission !== 'default') return;

    let last = 0;
    try { last = Number(localStorage.getItem(KEY) || 0); } catch { /* sin storage */ }
    if (Date.now() - last < COOLDOWN_MS) return;

    const timer = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    try { localStorage.setItem(KEY, String(Date.now())); } catch { /* sin storage */ }
    setShow(false);
  };

  const activate = async () => {
    setState('working');
    const res = await enablePush();
    if (res.success) { setState('done'); setTimeout(() => setShow(false), 1800); }
    else if (res.error === 'denied') { setState('denied'); setTimeout(close, 2500); }
    else if (res.error === 'default') { setState('idle'); close(); }
    else { setState('idle'); close(); }
  };

  if (!show) return null;

  return (
    <div role="dialog" aria-label="Activar notificaciones" className="standalone-prompt"
      style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 250, display: 'flex', justifyContent: 'center', padding: '0 12px calc(12px + env(safe-area-inset-bottom))', pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto', width: '100%', maxWidth: '460px', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '18px', padding: '20px 20px 18px', boxShadow: '0 20px 60px rgba(23,27,22,0.28)', animation: 'spSlide 0.35s ease' }}>
        {state === 'done' ? (
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--olive)', fontSize: '0.92rem', fontWeight: 600, textAlign: 'center', padding: '6px 0' }}>Listo. Te avisaremos de novedades y promociones.</p>
        ) : state === 'denied' ? (
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.85rem', lineHeight: 1.6 }}>No se activaron. Puedes hacerlo cuando quieras en Ajustes → Notificaciones → Imperium.</p>
        ) : (
          <>
            <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: '1.2rem', marginBottom: '6px' }}>Te damos la bienvenida a la app</p>
            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.85rem', lineHeight: 1.65, marginBottom: '16px' }}>
              Activa las notificaciones para enterarte de promociones y novedades de la clínica. Puedes desactivarlas cuando quieras.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={close} disabled={state === 'working'}
                style={{ flex: '1 1 0', background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border)', padding: '13px', borderRadius: '10px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                Ahora no
              </button>
              <button type="button" onClick={activate} disabled={state === 'working'}
                style={{ flex: '1.4 1 0', background: 'var(--olive)', color: 'var(--cream)', border: 'none', padding: '13px', borderRadius: '10px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', opacity: state === 'working' ? 0.6 : 1 }}>
                {state === 'working' ? 'Activando...' : 'Activar'}
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spSlide { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}
