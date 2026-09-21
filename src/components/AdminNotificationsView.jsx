import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { getCurrentSubscription } from '../utils/push';

const inputStyle = { background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--ink)', width: '100%' };
const labelStyle = { display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--ink-soft)', marginBottom: '4px', fontFamily: 'var(--font-sans)', letterSpacing: '0.08em' };

const DESTINOS = [
  { value: '/', label: 'Inicio' },
  { value: '/reservar', label: 'Reservar hora' },
  { value: '/#servicios', label: 'Tratamientos' },
  { value: '/fidelidad', label: 'Club de Fidelidad' },
];

async function sendPush({ title, body, url, onlyEndpoint }) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return { success: false, error: 'No hay sesión activa' };
  try {
    const res = await fetch('/api/push-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, body, url, onlyEndpoint }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) return { success: false, error: json.error || `Error ${res.status}` };
    return json;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export default function AdminNotificationsView() {
  const [count, setCount] = useState(null);
  const [myEndpoint, setMyEndpoint] = useState(null);
  const [form, setForm] = useState({ title: '', body: '', url: '/' });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    supabase.from('push_subscriptions').select('id', { count: 'exact', head: true })
      .then(({ count: c, error }) => setCount(error ? null : c));
    getCurrentSubscription().then(sub => setMyEndpoint(sub?.endpoint || null)).catch(() => {});
  }, []);

  const ready = form.title.trim() && form.body.trim();

  const send = async (onlyEndpoint) => {
    if (!ready || busy) return;
    if (!onlyEndpoint && !window.confirm(`¿Enviar esta notificación a ${count ?? 'todas las'} personas suscritas? No se puede deshacer.`)) return;
    setBusy(true);
    setResult(null);
    const res = await sendPush({ ...form, onlyEndpoint });
    setResult(res);
    setBusy(false);
    if (res.success && !onlyEndpoint) {
      supabase.from('push_subscriptions').select('id', { count: 'exact', head: true }).then(({ count: c }) => setCount(c));
    }
  };

  return (
    <div style={{ maxWidth: '720px' }}>
      <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.82rem', marginBottom: '20px', lineHeight: 1.7 }}>
        Envía un aviso al teléfono de quienes instalaron la app y activaron las notificaciones (botón <strong style={{ color: 'var(--ink)' }}>Instalar app</strong> del sitio).
        En iPhone solo llegan a quienes la agregaron a su pantalla de inicio.
      </p>

      <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', marginBottom: '22px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--olive)' }}>{count ?? '—'}</span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--ink-soft)' }}>dispositivos suscritos</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={labelStyle}><span>TÍTULO</span><span>{form.title.length}/65</span></label>
          <input style={inputStyle} maxLength={65} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="ej: Promo de la semana ✨" />
        </div>
        <div>
          <label style={labelStyle}><span>MENSAJE</span><span>{form.body.length}/180</span></label>
          <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} maxLength={180} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="ej: 20% de descuento en limpieza facial este mes. Reserva tu hora." />
        </div>
        <div>
          <label style={labelStyle}><span>AL TOCAR, ABRIR</span></label>
          <select style={inputStyle} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}>
            {DESTINOS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
      </div>

      {/* Vista previa */}
      <div style={{ margin: '22px 0', maxWidth: '380px' }}>
        <p style={{ ...labelStyle, marginBottom: '8px' }}>VISTA PREVIA</p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(60,60,67,0.08)', borderRadius: '16px', padding: '12px' }}>
          <img src="/icon-192.png" alt="" width="38" height="38" style={{ borderRadius: '9px', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)' }}>{form.title || 'Título del aviso'}</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--ink-soft)', lineHeight: 1.4, wordBreak: 'break-word' }}>{form.body || 'Aquí va el mensaje que verá tu clienta.'}</p>
          </div>
        </div>
      </div>

      {result && (
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
          background: result.success ? 'rgba(38,58,34,0.07)' : 'rgba(179,65,58,0.06)',
          border: `1px solid ${result.success ? 'rgba(38,58,34,0.25)' : 'rgba(179,65,58,0.25)'}`,
          color: result.success ? 'var(--olive)' : '#B3413A' }}>
          {result.success
            ? (result.sent === 0 && result.failed === 0
                ? 'No hay dispositivos suscritos todavía.'
                : `✓ Enviado a ${result.sent} dispositivo(s).${result.failed ? ` ${result.failed} fallaron` : ''}${result.removed ? ` (${result.removed} dados de baja por estar inactivos)` : ''}`)
            : `⚠️ ${result.error}`}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <button type="button" disabled={!ready || busy} onClick={() => send(null)}
          style={{ background: ready ? 'var(--olive)' : 'var(--border)', color: ready ? 'var(--cream)' : 'var(--ink-soft)', border: 'none', padding: '13px 26px', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 700, cursor: ready && !busy ? 'pointer' : 'not-allowed' }}>
          {busy ? 'ENVIANDO...' : 'ENVIAR A TODOS'}
        </button>
        <button type="button" disabled={!ready || busy || !myEndpoint} onClick={() => send(myEndpoint)}
          title={myEndpoint ? '' : 'Activa las notificaciones en este dispositivo (botón Instalar app del sitio) para poder probar'}
          style={{ background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border)', padding: '13px 22px', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 700, cursor: ready && myEndpoint && !busy ? 'pointer' : 'not-allowed', opacity: myEndpoint ? 1 : 0.5 }}>
          ENVIAR PRUEBA A ESTE DISPOSITIVO
        </button>
      </div>
      {!myEndpoint && (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.74rem', color: 'var(--ink-soft)', marginTop: '10px' }}>
          Para probar: instala la app en tu teléfono, actívale las notificaciones y entra a este panel desde ahí.
        </p>
      )}
    </div>
  );
}
