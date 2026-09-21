import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../utils/useFocusTrap';
import {
  detectPlatform, isStandalone, pushSupported, onInstallAvailable, promptInstall,
  getCurrentSubscription, enablePush, disablePush,
} from '../utils/push';

const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-3px' }}>
    <path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
);

const primaryBtn = { display: 'block', width: '100%', background: 'var(--olive)', color: 'var(--cream)', border: 'none', padding: '14px', borderRadius: '10px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' };
const softBtn = { ...primaryBtn, background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border)' };
const text = { fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.86rem', lineHeight: 1.7 };

function Step({ n, children }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
      <span style={{ flexShrink: 0, width: '26px', height: '26px', borderRadius: '50%', background: 'var(--olive)', color: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
      <p style={{ ...text, color: 'var(--ink)', paddingTop: '2px' }}>{children}</p>
    </div>
  );
}

function NotificationToggle() {
  const [state, setState] = useState('checking'); // checking | off | on | denied | working | error | notconfigured
  useEffect(() => {
    (async () => {
      if (Notification.permission === 'denied') { setState('denied'); return; }
      const sub = await getCurrentSubscription();
      setState(sub && Notification.permission === 'granted' ? 'on' : 'off');
    })();
  }, []);

  const turnOn = async () => {
    setState('working');
    const res = await enablePush();
    if (res.success) setState('on');
    else if (res.error === 'denied') setState('denied');
    else if (res.error === 'not_configured') setState('notconfigured');
    else setState(res.error === 'default' ? 'off' : 'error');
  };
  const turnOff = async () => { setState('working'); await disablePush(); setState('off'); };

  return (
    <div style={{ background: 'var(--cream-soft)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
      <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: '1.05rem', marginBottom: '6px' }}>Notificaciones</p>
      {state === 'on' ? (
        <>
          <p style={{ ...text, marginBottom: '12px' }}>✓ Activadas. Te avisaremos de novedades y promociones de la clínica.</p>
          <button type="button" onClick={turnOff} style={softBtn}>Desactivar notificaciones</button>
        </>
      ) : state === 'denied' ? (
        <p style={text}>Las notificaciones están bloqueadas. Actívalas en <strong>Ajustes → Notificaciones → Imperium</strong> de tu teléfono.</p>
      ) : state === 'notconfigured' ? (
        <p style={text}>Las notificaciones aún no están disponibles. Intenta más tarde.</p>
      ) : (
        <>
          <p style={{ ...text, marginBottom: '12px' }}>Recibe avisos de promociones y novedades directo en tu teléfono.</p>
          <button type="button" onClick={turnOn} disabled={state === 'working' || state === 'checking'} style={{ ...primaryBtn, opacity: state === 'working' ? 0.6 : 1 }}>
            {state === 'working' ? 'Activando...' : 'Activar notificaciones'}
          </button>
          {state === 'error' && <p style={{ ...text, color: '#B3413A', marginTop: '10px' }}>No se pudo activar. Intenta de nuevo.</p>}
        </>
      )}
    </div>
  );
}

function Panel({ onClose }) {
  const panelRef = useRef(null);
  useFocusTrap(panelRef);
  const [canInstall, setCanInstall] = useState(false);
  useEffect(() => onInstallAvailable(setCanInstall), []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKeyDown); };
  }, [onClose]);

  const { ios, inApp } = detectPlatform(navigator.userAgent, navigator.maxTouchPoints);
  const installed = isStandalone();
  const canPush = pushSupported();
  // En iPhone las notificaciones solo funcionan con la app ya instalada.
  const showToggle = canPush && (installed || !ios);

  let body;
  if (installed) {
    body = (
      <>
        <p style={{ ...text, marginBottom: '16px' }}>✓ Ya estás usando la app de Imperium.</p>
        <a href="/prueba-push" style={{ ...text, display: 'block', marginBottom: '16px', color: 'var(--olive)', textDecoration: 'underline' }}>Prueba de notificaciones (temporal)</a>
        {canPush ? <NotificationToggle /> : <p style={text}>Tu teléfono no permite notificaciones. Actualiza iOS a la versión 16.4 o superior.</p>}
      </>
    );
  } else if (inApp) {
    body = (
      <>
        <p style={{ ...text, marginBottom: '14px' }}>Estás en el navegador interno de otra app (Instagram, Facebook…), que no permite instalar. Ábrela en tu navegador:</p>
        <Step n={1}>Toca los <strong>tres puntos</strong> (···) o el ícono de compartir arriba.</Step>
        <Step n={2}>Elige <strong>Abrir en Safari</strong> (o en el navegador).</Step>
        <Step n={3}>Ahí vuelve a tocar <strong>Instalar app</strong>.</Step>
      </>
    );
  } else if (ios) {
    body = (
      <>
        <p style={{ ...text, marginBottom: '14px' }}>Agrégala a tu pantalla de inicio para abrirla como una app y recibir notificaciones:</p>
        <Step n={1}>Abre esta página en <strong>Safari</strong> y toca el botón <strong style={{ whiteSpace: 'nowrap' }}>Compartir <ShareIcon /></strong> (abajo o arriba de la pantalla).</Step>
        <Step n={2}>Baja y elige <strong>“Agregar a pantalla de inicio”</strong>.</Step>
        <Step n={3}>Toca <strong>Agregar</strong>. Verás el ícono de Imperium en tu inicio.</Step>
        <Step n={4}>Ábrela desde ese ícono y entra aquí de nuevo para <strong>activar las notificaciones</strong>.</Step>
      </>
    );
  } else {
    body = (
      <>
        {canInstall ? (
          <button type="button" onClick={async () => { await promptInstall(); }} style={{ ...primaryBtn, marginBottom: '16px' }}>Instalar app</button>
        ) : (
          <p style={{ ...text, marginBottom: '16px' }}>Desde el menú de tu navegador elige <strong>“Instalar app”</strong> o <strong>“Agregar a la pantalla de inicio”</strong>.</p>
        )}
        {showToggle && <NotificationToggle />}
      </>
    );
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Instalar la app de Imperium" onClick={onClose} className="install-backdrop">
      <div ref={panelRef} tabIndex={-1} onClick={e => e.stopPropagation()} className="install-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border-soft)' }}>
          <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: '1.15rem', fontWeight: 400 }}>{installed ? 'Tu app Imperium' : 'Instala la app'}</p>
          <button type="button" onClick={onClose} aria-label="Cerrar" style={{ background: 'var(--border-soft)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', color: 'var(--ink-soft)', fontSize: '0.9rem' }}>✕</button>
        </div>
        <div style={{ padding: '20px', overflowY: 'auto' }}>{body}</div>
      </div>

      <style>{`
        .install-backdrop { position: fixed; inset: 0; z-index: 300; background: rgba(23,27,22,0.55); display: flex; align-items: center; justify-content: center; padding: 20px; animation: instFade 0.2s ease; }
        .install-panel { background: var(--cream); border-radius: 18px; width: 100%; max-width: 440px; max-height: 86vh; display: flex; flex-direction: column; overflow: hidden; outline: none; box-shadow: 0 30px 70px rgba(23,27,22,0.3); animation: instPop 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        @media (max-width: 640px) {
          .install-backdrop { align-items: flex-end; padding: 0; }
          .install-panel { max-width: 100%; border-radius: 20px 20px 0 0; animation: instSlide 0.25s ease; padding-bottom: env(safe-area-inset-bottom); }
        }
        @keyframes instFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes instPop { from { opacity: 0; transform: scale(0.94) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes instSlide { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}

/** Botón que abre la ventana de instalación / notificaciones. `children` = texto del botón. */
export default function InstallApp({ style, children = 'Instalar app', onOpen }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => { onOpen?.(); setOpen(true); }} style={style}>{children}</button>
      {open && createPortal(<Panel onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}
