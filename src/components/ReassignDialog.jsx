import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../utils/useFocusTrap';
import { getAvailableSlots } from '../utils/schedule';
import { getStaffServiceMap, canDo } from '../utils/staffServices';
import { adminReservaAction } from '../utils/adminReservas';
import { staffColor } from '../utils/staffColors';

const SANS = 'var(--font-sans)';

// Pasa una cita (misma fecha y hora) a otro profesional. Muestra quién está libre a esa hora.
export default function ReassignDialog({ reservation: r, staff, onClose, onDone }) {
  const panelRef = useRef(null);
  useFocusTrap(panelRef);
  const [options, setOptions] = useState(null); // [{ member, free, doesService }]
  const [chosen, setChosen] = useState('');
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    const date = new Date(`${r.fecha_iso}T12:00:00`);
    (async () => {
      const map = await getStaffServiceMap();
      const others = staff.filter(m => m.activo && m.id !== r.staff_id);
      const list = await Promise.all(others.map(async member => {
        const res = await getAvailableSlots(member.id, date);
        return { member, free: res.success && res.data.includes(r.hora), doesService: canDo(map, member.id, r.servicio) };
      }));
      if (alive) setOptions(list);
    })();
    return () => { alive = false; };
  }, [r, staff]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const submit = async () => {
    if (!chosen || busy) return;
    setBusy(true);
    setError('');
    const res = await adminReservaAction({ action: 'reassign', id: r.id, staffId: chosen, notify });
    setBusy(false);
    if (!res.success) { setError(res.error); return; }
    onDone(res);
  };

  const current = staff.find(m => m.id === r.staff_id);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Reasignar cita" onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(23,27,22,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 12px', overflowY: 'auto' }}>
      <div ref={panelRef} tabIndex={-1} onClick={e => e.stopPropagation()}
        style={{ outline: 'none', background: 'var(--cream)', borderRadius: '18px', width: '100%', maxWidth: '460px', margin: 'auto', padding: 'clamp(20px,4vw,28px)', boxShadow: '0 30px 70px rgba(23,27,22,0.3)' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--ink)' }}>Reasignar cita</p>
        <p style={{ fontFamily: SANS, fontSize: '0.82rem', color: 'var(--ink-soft)', margin: '6px 0 18px', lineHeight: 1.6 }}>
          {r.nombre} · {r.servicio}<br />
          <strong style={{ color: 'var(--ink)' }}>{r.fecha}, {r.hora} hrs</strong><br />
          Hoy con: {current?.nombre || 'sin asignar'}
        </p>

        {options === null ? (
          <p style={{ fontFamily: SANS, color: 'var(--ink-soft)', fontSize: '0.84rem' }}>Revisando quién está libre…</p>
        ) : options.length === 0 ? (
          <p style={{ fontFamily: SANS, color: 'var(--ink-soft)', fontSize: '0.84rem' }}>No hay otros profesionales activos.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {options.map(({ member, free, doesService }) => (
              <label key={member.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 14px', border: `1px solid ${chosen === member.id ? 'var(--olive)' : 'var(--border)'}`, borderRadius: '10px', background: chosen === member.id ? 'rgba(38,58,34,0.05)' : '#fff', opacity: free ? 1 : 0.5, cursor: free ? 'pointer' : 'not-allowed' }}>
                <input type="radio" name="reassign" disabled={!free} checked={chosen === member.id} onChange={() => setChosen(member.id)} style={{ accentColor: 'var(--olive)' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: staffColor(staff, member.id), flexShrink: 0 }} />
                <span style={{ fontFamily: SANS, fontSize: '0.86rem', color: 'var(--ink)', flex: 1 }}>
                  {member.nombre}
                  <span style={{ display: 'block', fontSize: '0.72rem', color: free ? 'var(--olive)' : '#B3413A', marginTop: '2px' }}>
                    {free ? 'Libre a esa hora' : 'Ocupado o fuera de su horario'}
                    {free && !doesService && <span style={{ color: '#B5924D' }}> · no tiene asignado este tratamiento</span>}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}

        <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', margin: '18px 0', fontFamily: SANS, fontSize: '0.82rem', color: 'var(--ink-soft)', lineHeight: 1.6, cursor: 'pointer' }}>
          <input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} style={{ marginTop: '3px', accentColor: 'var(--olive)' }} />
          <span>Avisar por correo a los profesionales <span style={{ opacity: 0.85 }}>(al que recibe y al que la tenía, si tienen correo)</span></span>
        </label>

        {error && <p style={{ fontFamily: SANS, color: '#B3413A', fontSize: '0.84rem', marginBottom: '12px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--ink)', padding: '12px 22px', borderRadius: '8px', fontFamily: SANS, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>CANCELAR</button>
          <button type="button" onClick={submit} disabled={!chosen || busy}
            style={{ background: chosen && !busy ? 'var(--olive)' : 'var(--border)', color: chosen && !busy ? 'var(--cream)' : 'var(--ink-soft)', border: 'none', padding: '12px 26px', borderRadius: '8px', fontFamily: SANS, fontSize: '0.8rem', fontWeight: 700, cursor: chosen && !busy ? 'pointer' : 'not-allowed' }}>
            {busy ? 'GUARDANDO...' : 'REASIGNAR'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
