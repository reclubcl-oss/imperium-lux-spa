import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { getCurrentSubscription, enablePush, disablePush, pushSupported, isStandalone, detectPlatform } from '../utils/push';
import { reportError } from '../utils/reportError';
import ConfirmDialog from './ConfirmDialog';

const inputStyle = { background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--ink)', width: '100%' };
const labelStyle = { display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--ink-soft)', marginBottom: '4px', fontFamily: 'var(--font-sans)', letterSpacing: '0.08em' };
const small = { fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--ink-soft)', lineHeight: 1.6 };

const DESTINOS = [
  { value: '/', label: 'Inicio' },
  { value: '/reservar', label: 'Reservar hora' },
  { value: '/#servicios', label: 'Tratamientos' },
  { value: '/fidelidad', label: 'Club de Fidelidad' },
];

const PUSH_MAX = 180;

async function callApi(path, body) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return { success: false, error: 'No hay sesión activa' };
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok || !json.success) return { success: false, error: json.error || `Error ${res.status}` };
    return json;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

const shorten = (text, max) => (text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`);

function StatusCard({ big, label, note, tone }) {
  return (
    <div style={{ flex: '1 1 220px', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', color: 'var(--olive)' }}>{big}</span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--ink-soft)' }}>{label}</span>
      </div>
      {note && <p style={{ ...small, fontSize: '0.74rem', marginTop: '4px', color: tone === 'warn' ? '#9A6A1F' : 'var(--ink-soft)' }}>{note}</p>}
    </div>
  );
}

function ChannelToggle({ checked, onChange, title, detail, disabled }) {
  return (
    <label style={{ flex: '1 1 220px', display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 14px', borderRadius: '10px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1,
      border: `1px solid ${checked && !disabled ? 'var(--olive)' : 'var(--border)'}`, background: checked && !disabled ? 'rgba(38,58,34,0.05)' : '#fff' }}>
      <input type="checkbox" checked={checked && !disabled} disabled={disabled} onChange={e => onChange(e.target.checked)} style={{ marginTop: '3px', accentColor: 'var(--olive)' }} />
      <span>
        <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.86rem', fontWeight: 700, color: 'var(--ink)' }}>{title}</span>
        <span style={small}>{detail}</span>
      </span>
    </label>
  );
}


// Alertas para administradoras: este dispositivo recibe un aviso cuando entra una
// reserva, se cancela o cambia una cita, o algo falla en el sitio.
function AdminAlertsCard() {
  const [state, setState] = useState('checking'); // checking | off | on | working | denied | error | ios | unsupported | migration
  const [count, setCount] = useState(null);
  const [testSent, setTestSent] = useState(false);

  const refreshCount = () => supabase.from('push_subscriptions').select('id', { count: 'exact', head: true }).eq('es_admin', true)
    .then(({ count: c, error }) => { if (error?.code === '42703') setState('migration'); else setCount(c); });

  useEffect(() => {
    (async () => {
      const { ios } = detectPlatform(navigator.userAgent, navigator.maxTouchPoints);
      if (!pushSupported()) { setState(ios && !isStandalone() ? 'ios' : 'unsupported'); return; }
      if (ios && !isStandalone()) { setState('ios'); return; }
      if (Notification.permission === 'denied') { setState('denied'); }
      else {
        const sub = await getCurrentSubscription();
        setState(sub && localStorage.getItem('imperium_admin_alerts') === '1' ? 'on' : 'off');
      }
      refreshCount();
    })();
  }, []);

  const turnOn = async () => {
    setState('working');
    const { data } = await supabase.auth.getSession();
    const res = await enablePush({ adminToken: data.session?.access_token });
    if (res.success) { localStorage.setItem('imperium_admin_alerts', '1'); setState('on'); refreshCount(); }
    else if (res.error === 'denied') setState('denied');
    else if (/gestion-citas/.test(res.error || '')) setState('migration');
    else setState(res.error === 'default' ? 'off' : 'error');
  };
  const turnOff = async () => { setState('working'); await disablePush(); localStorage.removeItem('imperium_admin_alerts'); setState('off'); refreshCount(); };
  const test = () => { reportError('prueba de alertas', `Alerta de prueba ${new Date().toLocaleTimeString('es-CL')}`); setTestSent(true); setTimeout(() => setTestSent(false), 6000); };

  const text = { fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--ink-soft)', lineHeight: 1.6 };
  const btn = { background: 'var(--olive)', color: 'var(--cream)', border: 'none', padding: '11px 20px', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' };
  const ghostBtn = { ...btn, background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border)' };

  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px', marginBottom: '22px' }}>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '4px' }}>Alertas para administradoras</p>
      <p style={{ ...text, marginBottom: '12px' }}>
        Recibe un aviso en este dispositivo cuando entra una reserva, alguien cancela o cambia su cita, o algo falla en el sitio.
        {count != null && <> Hay <strong style={{ color: 'var(--ink)' }}>{count}</strong> dispositivo{count === 1 ? '' : 's'} con alertas activas.</>}
      </p>
      {state === 'on' ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <span style={{ ...text, color: 'var(--olive)', fontWeight: 600 }}>Activas en este dispositivo</span>
          <button type="button" onClick={test} style={ghostBtn}>Enviar alerta de prueba</button>
          <button type="button" onClick={turnOff} style={ghostBtn}>Desactivar</button>
          {testSent && <span style={text}>Enviada. Debería llegar en unos segundos.</span>}
        </div>
      ) : state === 'off' || state === 'working' || state === 'checking' || state === 'error' ? (
        <>
          <button type="button" onClick={turnOn} disabled={state === 'working' || state === 'checking'} style={{ ...btn, opacity: state === 'working' ? 0.6 : 1 }}>
            {state === 'working' ? 'Activando...' : 'Activar alertas en este dispositivo'}
          </button>
          {state === 'error' && <p style={{ ...text, color: '#B3413A', marginTop: '8px' }}>No se pudo activar. Intenta de nuevo.</p>}
        </>
      ) : (
        <p style={{ ...text, color: state === 'denied' || state === 'migration' ? '#9A6A1F' : 'var(--ink-soft)' }}>
          {{ denied: 'Las notificaciones están bloqueadas en este navegador. Actívalas en su configuración.',
            ios: 'En iPhone, instala primero la app (botón "Instalar app" del sitio), ábrela desde tu pantalla de inicio y vuelve aquí.',
            unsupported: 'Este navegador no permite notificaciones.',
            migration: 'Falta correr supabase-add-gestion-citas.sql en Supabase.' }[state]}
        </p>
      )}
    </div>
  );
}

export default function AdminNotificationsView() {
  const [devices, setDevices] = useState(null);
  const [mail, setMail] = useState({ loading: true });
  const [myEndpoint, setMyEndpoint] = useState(null);
  const [form, setForm] = useState({ title: '', body: '', url: '/' });
  const [channels, setChannels] = useState({ push: true, email: false });
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState(null);
  const [confirmText, setConfirmText] = useState(null);

  const loadCounts = () => {
    supabase.from('push_subscriptions').select('id', { count: 'exact', head: true }).then(({ count, error }) => setDevices(error ? null : count));
    callApi('/api/email-send', { action: 'status' }).then(r => setMail(r.success ? r : { error: r.error }));
  };

  useEffect(() => {
    loadCounts();
    getCurrentSubscription().then(sub => setMyEndpoint(sub?.endpoint || null)).catch(() => {});
  }, []);

  const emailReady = mail.emailConfigured && !mail.needsMigration;
  const useEmail = channels.email && emailReady;
  const usePush = channels.push;
  const ready = form.title.trim() && form.body.trim() && (usePush || useEmail);

  // La confirmación es propia (no window.confirm): los navegadores pueden
  // bloquear los diálogos nativos y el botón parecería no hacer nada.
  const askConfirm = () => {
    if (!ready || busy) return;
    const parts = [];
    if (usePush) parts.push(devices === 1 ? '1 dispositivo (notificación)' : `${devices ?? 'todos los'} dispositivos (notificación)`);
    if (useEmail) parts.push(mail.audience === 1 ? '1 clienta (correo)' : `${mail.audience ?? 0} clientas (correo)`);
    setConfirmText(parts.join(' y '));
  };

  const run = async (test) => {
    if (!ready || busy) return;
    setConfirmText(null);
    setBusy(true);
    setResults(null);
    const out = {};
    if (usePush) {
      out.push = await callApi('/api/push-send', { title: form.title, body: shorten(form.body, PUSH_MAX), url: form.url, onlyEndpoint: test ? myEndpoint : undefined });
      if (test && !myEndpoint) out.push = { success: false, error: 'Este dispositivo no tiene notificaciones activas (usa el botón Instalar app del sitio).' };
    }
    if (useEmail) out.email = await callApi('/api/email-send', { title: form.title, message: form.body, url: form.url, test });
    setResults({ ...out, test });
    setBusy(false);
    if (!test) loadCounts();
  };

  const canSend = ready && !busy;

  return (
    <div style={{ maxWidth: '760px' }}>
      <p style={{ ...small, fontSize: '0.82rem', lineHeight: 1.7, marginBottom: '20px' }}>
        Envía novedades o promociones por <strong style={{ color: 'var(--ink)' }}>notificación al teléfono</strong> (a quienes instalaron la app y la activaron) y por <strong style={{ color: 'var(--ink)' }}>correo</strong> (solo a clientas que aceptaron recibir promociones al reservar).
      </p>

      <AdminAlertsCard />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '22px' }}>
        <StatusCard big={devices ?? '—'} label="dispositivos con notificaciones" />
        <StatusCard
          big={mail.audience ?? '—'} label="clientas aceptaron promociones"
          note={mail.loading ? 'Cargando...' : mail.needsMigration ? 'Falta correr supabase-add-promos.sql en Supabase.' : mail.error ? mail.error : !mail.emailConfigured ? 'Correo sin configurar: falta la contraseña de aplicación de Gmail en Vercel.' : 'Correo listo para enviar.'}
          tone={mail.emailConfigured && !mail.needsMigration ? undefined : 'warn'}
        />
      </div>

      <p style={{ ...labelStyle, marginBottom: '8px' }}>ENVIAR POR</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '22px' }}>
        <ChannelToggle checked={channels.push} onChange={v => setChannels(c => ({ ...c, push: v }))} title="🔔 Notificación al teléfono" detail={`Título y mensaje corto (hasta ${PUSH_MAX} caracteres).`} />
        <ChannelToggle checked={channels.email} onChange={v => setChannels(c => ({ ...c, email: v }))} disabled={!emailReady} title="✉️ Correo" detail={emailReady ? 'Con el diseño de Imperium y enlace para darse de baja.' : 'Aún no disponible (ver aviso arriba).'} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={labelStyle}><span>TÍTULO (asunto del correo)</span><span>{form.title.length}/65</span></label>
          <input style={inputStyle} maxLength={65} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="ej: Promo de la semana ✨" />
        </div>
        <div>
          <label style={labelStyle}><span>MENSAJE</span><span>{form.body.length}/{useEmail ? 1500 : PUSH_MAX}</span></label>
          <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '110px' }} maxLength={useEmail ? 1500 : PUSH_MAX} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="ej: 20% de descuento en limpieza facial este mes. Reserva tu hora." />
          {usePush && useEmail && form.body.length > PUSH_MAX && (
            <p style={{ ...small, fontSize: '0.74rem', color: '#9A6A1F', marginTop: '4px' }}>En la notificación se mostrarán solo los primeros {PUSH_MAX} caracteres; el correo lleva el mensaje completo.</p>
          )}
        </div>
        <div>
          <label style={labelStyle}><span>AL TOCAR, ABRIR</span></label>
          <select style={inputStyle} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}>
            {DESTINOS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', margin: '22px 0' }}>
        {usePush && (
          <div style={{ flex: '1 1 260px', maxWidth: '360px' }}>
            <p style={{ ...labelStyle, marginBottom: '8px' }}>VISTA PREVIA · NOTIFICACIÓN</p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(60,60,67,0.08)', borderRadius: '16px', padding: '12px' }}>
              <img src="/icon-192.png" alt="" width="38" height="38" style={{ borderRadius: '9px', flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)' }}>{form.title || 'Título del aviso'}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--ink-soft)', lineHeight: 1.4, wordBreak: 'break-word' }}>{shorten(form.body || 'Aquí va el mensaje que verá tu clienta.', PUSH_MAX)}</p>
              </div>
            </div>
          </div>
        )}
        {useEmail && (
          <div style={{ flex: '1 1 300px', maxWidth: '420px' }}>
            <p style={{ ...labelStyle, marginBottom: '8px' }}>VISTA PREVIA · CORREO</p>
            <div style={{ background: '#FAF9F5', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ background: '#FFFEFB', border: '1px solid var(--border-soft)', borderRadius: '10px', padding: '16px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', letterSpacing: '0.2em', fontWeight: 700, color: 'var(--gold-accent)', marginBottom: '6px' }}>CLÍNICA ESTÉTICA IMPERIUM</p>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--forest)', marginBottom: '10px' }}>{form.title || 'Asunto del correo'}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--ink-soft)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '10px' }}>Hola María,{'\n\n'}{form.body || 'Aquí va tu mensaje.'}</p>
                <span style={{ display: 'inline-block', background: 'var(--olive)', color: 'var(--cream)', borderRadius: '6px', padding: '7px 14px', fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 700 }}>Ver más</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {['push', 'email'].filter(k => results[k]).map(k => {
            const r = results[k];
            const ok = r.success;
            const name = k === 'push' ? 'Notificación' : 'Correo';
            const detail = !ok ? r.error
              : r.total === 0 || (r.sent === 0 && r.failed === 0) ? 'No hay destinatarias todavía.'
              : `Enviado a ${r.sent}${k === 'push' ? ' dispositivo(s)' : ` de ${r.total}`}${r.failed ? ` · ${r.failed} fallaron` : ''}${r.removed ? ` · ${r.removed} dados de baja por inactivos` : ''}.`;
            return (
              <div key={k} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', padding: '12px 16px', borderRadius: '10px',
                background: ok ? 'rgba(38,58,34,0.07)' : 'rgba(179,65,58,0.06)',
                border: `1px solid ${ok ? 'rgba(38,58,34,0.25)' : 'rgba(179,65,58,0.25)'}`, color: ok ? 'var(--olive)' : '#B3413A' }}>
                {ok ? '✓' : '⚠️'} <strong>{name}{results.test ? ' (prueba)' : ''}:</strong> {detail}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <button type="button" disabled={!canSend} onClick={askConfirm}
          style={{ background: canSend ? 'var(--olive)' : 'var(--border)', color: canSend ? 'var(--cream)' : 'var(--ink-soft)', border: 'none', padding: '13px 26px', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 700, cursor: canSend ? 'pointer' : 'not-allowed' }}>
          {busy ? 'ENVIANDO...' : 'ENVIAR A TODOS'}
        </button>
        <button type="button" disabled={!canSend} onClick={() => run(true)}
          style={{ background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border)', padding: '13px 22px', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 700, cursor: canSend ? 'pointer' : 'not-allowed', opacity: canSend ? 1 : 0.5 }}>
          ENVIAR PRUEBA SOLO A MÍ
        </button>
      </div>
      {!ready && (
        <p style={{ ...small, fontSize: '0.78rem', color: '#9A6A1F', marginTop: '10px' }}>
          Para enviar falta: {[!form.title.trim() && 'el título', !form.body.trim() && 'el mensaje', !(usePush || useEmail) && 'elegir al menos un canal'].filter(Boolean).join(', ')}.
        </p>
      )}

      <ConfirmDialog open={!!confirmText} title="¿Enviar ahora?" confirmLabel="SÍ, ENVIAR" onConfirm={() => run(false)} onCancel={() => setConfirmText(null)}>
        <p>Se enviará a <strong style={{ color: 'var(--ink)' }}>{confirmText}</strong>.</p>
        <p style={{ marginTop: '4px' }}>No se puede deshacer.</p>
      </ConfirmDialog>

      <p style={{ ...small, fontSize: '0.74rem', marginTop: '10px' }}>
        La prueba llega a este dispositivo{usePush ? ' (si activaste las notificaciones aquí)' : ''}{useEmail ? ' y a tu correo de administrador' : ''}. Nadie más la recibe.
      </p>
    </div>
  );
}
