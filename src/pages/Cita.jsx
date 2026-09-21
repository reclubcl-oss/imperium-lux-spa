import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import BookingCalendar from '../components/BookingCalendar';
import ConfirmDialog from '../components/ConfirmDialog';
import SectionDivider from '../components/SectionDivider';
import { resolveStaffForSlot, toLocalISODate, formatDateES } from '../utils/schedule';
import { reportError } from '../utils/reportError';

const WHATSAPP = 'https://wa.me/56971494060';
const SANS = 'var(--font-sans)';
const primary = { display: 'block', width: '100%', textAlign: 'center', background: 'var(--olive)', color: 'var(--cream)', border: 'none', padding: '14px', borderRadius: '10px', fontFamily: SANS, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'none' };
const ghost = { ...primary, background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border)' };
const body = { fontFamily: SANS, color: 'var(--ink-soft)', fontSize: '0.9rem', lineHeight: 1.75 };

async function api(payload) {
  try {
    const res = await fetch('/api/appointment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json();
    return res.ok && json.success ? json : { success: false, error: json.error || 'No pudimos completar la acción.' };
  } catch {
    return { success: false, error: 'No pudimos conectarnos. Revisa tu internet e intenta de nuevo.' };
  }
}

// Página privada a la que llega la clienta desde el enlace de su correo
// (/cita?t=<token>): ver su cita, cambiar la hora o cancelarla.
export default function Cita() {
  const [params] = useSearchParams();
  const token = params.get('t') || '';

  const [state, setState] = useState(token ? 'loading' : 'error'); // loading | ready | rescheduling | done | cancelled | error
  const [appt, setAppt] = useState(null);
  const [message, setMessage] = useState(token ? '' : 'Este enlace no es válido.');
  const [selection, setSelection] = useState({ date: null, time: null });
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [newSlot, setNewSlot] = useState(null);

  useEffect(() => {
    if (!token) return;
    api({ action: 'get', token }).then(res => {
      if (res.success) { setAppt(res.appointment); setState('ready'); }
      else { setMessage(res.error); setState('error'); }
    });
  }, [token]);

  const cancel = async () => {
    setConfirmCancel(false);
    setBusy(true);
    const res = await api({ action: 'cancel', token });
    setBusy(false);
    if (res.success) setState('cancelled');
    else { setMessage(res.error); }
  };

  const reschedule = async () => {
    if (!selection.date || !selection.time) return;
    setBusy(true);
    setMessage('');
    const assigned = await resolveStaffForSlot(selection.date, selection.time);
    if (!assigned.success) { setBusy(false); setMessage(assigned.error || 'Ese horario ya no está disponible. Elige otro.'); return; }
    const res = await api({
      action: 'reschedule', token, fechaIso: toLocalISODate(selection.date), hora: selection.time,
      fecha: formatDateES(selection.date), staffId: assigned.staffId,
    });
    setBusy(false);
    if (res.success) { setNewSlot({ fecha: res.fecha, hora: res.hora }); setState('done'); }
    else {
      setMessage(res.error);
      if (!/ocup|horario/i.test(res.error || '')) reportError('cambio de cita', res.error);
    }
  };

  const card = (children) => (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '18px', padding: 'clamp(24px,5vw,40px)', boxShadow: '0 20px 50px rgba(23,27,22,0.07)' }}>{children}</div>
  );

  const detailBox = (fecha, hora, servicio) => (
    <div style={{ background: 'var(--border-soft)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', margin: '18px 0 22px' }}>
      <p style={{ fontFamily: SANS, color: 'var(--ink-soft)', fontSize: '0.66rem', letterSpacing: '0.14em', fontWeight: 600, marginBottom: '6px' }}>{servicio?.toUpperCase()}</p>
      <p style={{ fontFamily: SANS, color: 'var(--olive)', fontWeight: 700, fontSize: '0.95rem', textTransform: 'capitalize' }}>{fecha}</p>
      <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: '1.5rem' }}>{hora} hrs</p>
    </div>
  );

  let content;
  if (state === 'loading') {
    content = <p style={{ ...body, textAlign: 'center' }}>Cargando tu cita...</p>;
  } else if (state === 'error') {
    content = card(<>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.6rem', color: 'var(--ink)', marginBottom: '12px' }}>No pudimos abrir tu cita</h1>
      <p style={{ ...body, marginBottom: '20px' }}>{message}</p>
      <a href={WHATSAPP} target="_blank" rel="noreferrer" style={primary}>Escribirnos por WhatsApp</a>
    </>);
  } else if (state === 'cancelled') {
    content = card(<>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.6rem', color: 'var(--ink)', marginBottom: '12px' }}>Tu cita fue cancelada</h1>
      <p style={{ ...body, marginBottom: '22px' }}>Gracias por avisarnos. Cuando quieras, puedes agendar una nueva hora.</p>
      <Link to="/reservar" style={primary}>Agendar otra hora</Link>
    </>);
  } else if (state === 'done') {
    content = card(<>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.6rem', color: 'var(--olive)', marginBottom: '6px' }}>Listo, cambiamos tu hora</h1>
      {detailBox(newSlot.fecha, newSlot.hora, appt.servicio)}
      <p style={{ ...body, marginBottom: '20px' }}>Te esperamos en 2 Oriente 124, Viña del Mar.</p>
      <Link to="/" style={primary}>Volver al inicio</Link>
    </>);
  } else if (state === 'rescheduling') {
    content = (
      <>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(1.5rem,4vw,1.9rem)', color: 'var(--ink)', marginBottom: '6px', textAlign: 'center' }}>Elige tu nueva hora</h1>
        <p style={{ ...body, textAlign: 'center', marginBottom: '22px' }}>Hoy tienes: <strong style={{ color: 'var(--ink)' }}>{appt.fecha}, {appt.hora} hrs</strong></p>
        <BookingCalendar onSelect={setSelection} />
        {message && <p style={{ fontFamily: SANS, color: '#B3413A', fontSize: '0.84rem', margin: '16px 0 0', textAlign: 'center' }}>{message}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '22px' }}>
          <button type="button" onClick={reschedule} disabled={!selection.date || !selection.time || busy}
            style={{ ...primary, opacity: !selection.date || !selection.time || busy ? 0.5 : 1, cursor: !selection.date || !selection.time || busy ? 'not-allowed' : 'pointer' }}>
            {busy ? 'Guardando...' : selection.time ? `Confirmar ${selection.time} hrs` : 'Elige una fecha y una hora'}
          </button>
          <button type="button" onClick={() => { setState('ready'); setMessage(''); }} style={ghost}>Volver</button>
        </div>
      </>
    );
  } else {
    content = card(<>
      <p style={{ color: 'var(--gold-text)', fontSize: '0.7rem', letterSpacing: '0.2em', fontFamily: SANS, fontWeight: 700, marginBottom: '10px' }}>TU CITA</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(1.5rem,4vw,1.9rem)', color: 'var(--ink)' }}>Hola, {appt.nombre}</h1>
      {detailBox(appt.fecha, appt.hora, appt.servicio)}
      {appt.past ? (
        <p style={{ ...body, marginBottom: '18px' }}>Esta cita ya pasó.</p>
      ) : appt.canModify ? (
        <>
          <p style={{ ...body, marginBottom: '16px' }}>Puedes cambiar la hora o cancelar hasta {appt.minHours} horas antes de tu cita.</p>
          {message && <p style={{ fontFamily: SANS, color: '#B3413A', fontSize: '0.84rem', marginBottom: '12px' }}>{message}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button type="button" onClick={() => { setMessage(''); setSelection({ date: null, time: null }); setState('rescheduling'); }} style={primary}>Cambiar la hora</button>
            <button type="button" onClick={() => setConfirmCancel(true)} disabled={busy}
              style={{ ...ghost, color: '#B3413A', borderColor: 'rgba(179,65,58,0.35)' }}>{busy ? 'Cancelando...' : 'Cancelar mi cita'}</button>
          </div>
        </>
      ) : (
        <>
          <p style={{ ...body, marginBottom: '16px' }}>Tu cita es en menos de {appt.minHours} horas, así que ya no se puede cambiar desde aquí. Escríbenos y lo resolvemos.</p>
          <a href={WHATSAPP} target="_blank" rel="noreferrer" style={primary}>Escribirnos por WhatsApp</a>
        </>
      )}
    </>);
  }

  return (
    <section style={{ background: 'var(--cream-soft)', minHeight: '80vh', padding: 'clamp(96px,12vw,130px) 16px 70px' }}>
      <div style={{ maxWidth: state === 'rescheduling' ? '640px' : '480px', margin: '0 auto' }}>
        {state !== 'rescheduling' && <SectionDivider margin="0 auto 26px" />}
        {content}
      </div>
      <ConfirmDialog open={confirmCancel} title="¿Cancelar tu cita?" confirmLabel="SÍ, CANCELAR" cancelLabel="NO, MANTENERLA" danger onConfirm={cancel} onCancel={() => setConfirmCancel(false)}>
        <p>Se liberará tu hora de <strong style={{ color: 'var(--ink)' }}>{appt?.fecha}, {appt?.hora} hrs</strong>. Esta acción no se puede deshacer.</p>
      </ConfirmDialog>
    </section>
  );
}
