import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import BookingCalendar from './BookingCalendar';
import { useFocusTrap } from '../utils/useFocusTrap';
import { resolveStaffForSlot, toLocalISODate, formatDateES } from '../utils/schedule';
import { adminReservaAction } from '../utils/adminReservas';

const SANS = 'var(--font-sans)';
const field = { width: '100%', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', color: 'var(--ink)', fontFamily: SANS, fontSize: '0.86rem', outline: 'none' };
const label = { display: 'block', fontFamily: SANS, fontSize: '0.64rem', letterSpacing: '0.12em', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '5px' };

// Diálogo del panel: crear una reserva a mano (mode="create") o cambiar la hora
// de una existente (mode="reschedule").
export default function AdminReservaDialog({ mode, reservation, services = [], onClose, onDone }) {
  const panelRef = useRef(null);
  useFocusTrap(panelRef);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', servicio: '', notas: '' });
  const [selection, setSelection] = useState({ date: null, time: null });
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const isCreate = mode === 'create';
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const ready = selection.date && selection.time && (!isCreate || (form.nombre.trim() && form.email.trim() && form.telefono.trim() && form.servicio));

  const submit = async () => {
    if (!ready || busy) return;
    setBusy(true);
    setError('');
    const assigned = await resolveStaffForSlot(selection.date, selection.time);
    if (!assigned.success) { setBusy(false); setError(assigned.error || 'Ese horario ya no está disponible. Elige otro.'); return; }

    const slot = { fecha: formatDateES(selection.date), fechaIso: toLocalISODate(selection.date), hora: selection.time, staffId: assigned.staffId, notify };
    const res = isCreate
      ? await adminReservaAction({ action: 'create', ...form, ...slot })
      : await adminReservaAction({ action: 'reschedule', id: reservation.id, ...slot });
    setBusy(false);
    if (!res.success) { setError(res.error); return; }
    onDone(res);
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={isCreate ? 'Nueva reserva' : 'Cambiar la hora'} onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(23,27,22,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 12px', overflowY: 'auto' }}>
      <div ref={panelRef} tabIndex={-1} onClick={e => e.stopPropagation()}
        style={{ outline: 'none', background: 'var(--cream)', borderRadius: '18px', width: '100%', maxWidth: '620px', margin: 'auto', padding: 'clamp(20px,4vw,30px)', boxShadow: '0 30px 70px rgba(23,27,22,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '18px' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--ink)' }}>{isCreate ? 'Nueva reserva' : 'Cambiar la hora'}</p>
            {!isCreate && (
              <p style={{ fontFamily: SANS, fontSize: '0.82rem', color: 'var(--ink-soft)', marginTop: '4px' }}>
                {reservation.nombre} · {reservation.servicio}<br />Hoy: <strong style={{ color: 'var(--ink)' }}>{reservation.fecha}, {reservation.hora}</strong>
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" style={{ background: 'var(--border-soft)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: 'var(--ink-soft)', flexShrink: 0 }}>✕</button>
        </div>

        {isCreate && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: '12px', marginBottom: '20px' }}>
            <div><label style={label}>NOMBRE</label><input style={field} value={form.nombre} onChange={set('nombre')} maxLength={120} /></div>
            <div><label style={label}>TELÉFONO</label><input style={field} value={form.telefono} onChange={set('telefono')} maxLength={40} placeholder="+56 9 ..." /></div>
            <div><label style={label}>CORREO</label><input style={field} type="email" value={form.email} onChange={set('email')} maxLength={160} placeholder="para su tarjeta de fidelidad y recordatorios" /></div>
            <div>
              <label style={label}>TRATAMIENTO</label>
              <select style={{ ...field, cursor: 'pointer' }} value={form.servicio} onChange={set('servicio')}>
                <option value="">Elige un tratamiento</option>
                {services.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}><label style={label}>NOTAS (OPCIONAL)</label><input style={field} value={form.notas} onChange={set('notas')} maxLength={1000} /></div>
          </div>
        )}

        <p style={{ ...label, marginBottom: '10px' }}>{isCreate ? 'FECHA Y HORA' : 'NUEVA FECHA Y HORA'}</p>
        <BookingCalendar onSelect={setSelection} />

        <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', margin: '18px 0', fontFamily: SANS, fontSize: '0.82rem', color: 'var(--ink-soft)', lineHeight: 1.6, cursor: 'pointer' }}>
          <input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} style={{ marginTop: '3px', accentColor: 'var(--olive)' }} />
          <span>Avisar a la clienta por correo <span style={{ opacity: 0.85 }}>(solo sale si el correo de la clínica está configurado)</span></span>
        </label>

        {error && <p style={{ fontFamily: SANS, color: '#B3413A', fontSize: '0.84rem', marginBottom: '12px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--ink)', padding: '12px 22px', borderRadius: '8px', fontFamily: SANS, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>CANCELAR</button>
          <button type="button" onClick={submit} disabled={!ready || busy}
            style={{ background: ready && !busy ? 'var(--olive)' : 'var(--border)', color: ready && !busy ? 'var(--cream)' : 'var(--ink-soft)', border: 'none', padding: '12px 26px', borderRadius: '8px', fontFamily: SANS, fontSize: '0.8rem', fontWeight: 700, cursor: ready && !busy ? 'pointer' : 'not-allowed' }}>
            {busy ? 'GUARDANDO...' : isCreate ? 'GUARDAR RESERVA' : selection.time ? `CAMBIAR A ${selection.time} HRS` : 'ELIGE FECHA Y HORA'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
