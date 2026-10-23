import { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import { toLocalISODate } from '../utils/schedule';
import { staffColor, SIN_ASIGNAR_COLOR } from '../utils/staffColors';
import ReassignDialog from './ReassignDialog';

export default function AdminCalendarView({ reservations, staff = [], onReload }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState('all'); // 'all' | staffId | 'none'
  const [reassign, setReassign] = useState(null);
  const [msg, setMsg] = useState(null);

  const activeStaff = useMemo(() => staff.filter(m => m.activo), [staff]);

  const visible = useMemo(() => reservations.filter(r => (
    filter === 'all' || (filter === 'none' ? !r.staff_id : r.staff_id === filter)
  )), [reservations, filter]);

  const byDate = useMemo(() => {
    const map = {};
    visible.forEach(r => {
      if (!r.fecha_iso) return;
      (map[r.fecha_iso] ||= []).push(r);
    });
    return map;
  }, [visible]);

  const selectedIso = toLocalISODate(selectedDate);
  const dayReservations = useMemo(() =>
    (byDate[selectedIso] || []).slice().sort((a, b) => (a.hora || '').localeCompare(b.hora || '')),
    [byDate, selectedIso]
  );

  // Columnas del día: una por profesional activo (aunque no tenga citas, así se ve quién está libre).
  const columns = useMemo(() => {
    const cols = (filter === 'all' ? activeStaff : activeStaff.filter(m => m.id === filter))
      .map(m => ({ key: m.id, name: m.nombre, sub: m.especialidad, color: staffColor(staff, m.id), items: dayReservations.filter(r => r.staff_id === m.id) }));
    const orphans = dayReservations.filter(r => !r.staff_id || !activeStaff.some(m => m.id === r.staff_id));
    if (orphans.length && (filter === 'all' || filter === 'none')) cols.push({ key: 'none', name: 'Sin asignar', sub: '', color: SIN_ASIGNAR_COLOR, items: orphans });
    return cols;
  }, [activeStaff, staff, filter, dayReservations]);

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const list = byDate[toLocalISODate(date)];
    if (!list?.length) return null;
    const colors = [...new Set(list.map(r => staffColor(staff, r.staff_id)))].slice(0, 4);
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '3px' }}>
        {colors.map(c => <span key={c} style={{ width: '6px', height: '6px', borderRadius: '50%', background: c }} />)}
      </div>
    );
  };

  const cardStyle = { background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px 28px' };
  const chip = (active, color) => ({
    display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 14px', borderRadius: '99px', cursor: 'pointer',
    border: `1px solid ${active ? (color || 'var(--olive)') : 'var(--border)'}`, background: active ? 'var(--cream)' : 'transparent',
    fontFamily: 'var(--font-sans)', fontSize: '0.76rem', fontWeight: active ? 700 : 500, color: active ? 'var(--ink)' : 'var(--ink-soft)',
    boxShadow: active ? '0 2px 8px rgba(23,27,22,0.08)' : 'none', whiteSpace: 'nowrap',
  });
  const dot = (c) => <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: c }} />;

  return (
    <>
      {/* Filtro por profesional */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <button type="button" onClick={() => setFilter('all')} style={chip(filter === 'all')}>Todo el equipo</button>
        {activeStaff.map(m => (
          <button key={m.id} type="button" onClick={() => setFilter(m.id)} style={chip(filter === m.id, staffColor(staff, m.id))}>
            {dot(staffColor(staff, m.id))}{m.nombre}
          </button>
        ))}
        {reservations.some(r => !r.staff_id) && (
          <button type="button" onClick={() => setFilter('none')} style={chip(filter === 'none', SIN_ASIGNAR_COLOR)}>{dot(SIN_ASIGNAR_COLOR)}Sin asignar</button>
        )}
      </div>

      {msg && (
        <div role="status" style={{ background: msg.ok ? 'rgba(38,58,34,0.08)' : 'rgba(179,65,58,0.08)', border: `1px solid ${msg.ok ? 'rgba(38,58,34,0.25)' : 'rgba(179,65,58,0.3)'}`, color: msg.ok ? 'var(--olive)' : '#B3413A', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontFamily: 'var(--font-sans)', fontSize: '0.84rem' }}>{msg.text}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,320px),1fr))', gap: '20px', alignItems: 'start' }}>
        <div style={cardStyle}>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
            locale="es-ES"
            maxDetail="month"
            minDetail="month"
            navigationLabel={({ date }) =>
              date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())
            }
            prevLabel={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            }
            nextLabel={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            }
          />
        </div>

        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', gridColumn: columns.length > 2 ? '1 / -1' : 'auto' }}>
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em' }}>
              {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()} · {dayReservations.length} {dayReservations.length === 1 ? 'CITA' : 'CITAS'}
            </p>
          </div>
          {columns.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Sin reservas este día.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,230px),1fr))' }}>
              {columns.map(col => (
                <div key={col.key} style={{ borderRight: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)', minWidth: 0 }}>
                  <div style={{ padding: '14px 20px', borderTop: `3px solid ${col.color}`, background: 'var(--cream-soft)' }}>
                    <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontWeight: 700, fontSize: '0.86rem' }}>{col.name}</p>
                    <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.7rem', marginTop: '2px' }}>
                      {col.items.length === 0 ? 'Libre este día' : `${col.items.length} ${col.items.length === 1 ? 'cita' : 'citas'}`}{col.sub ? ` · ${col.sub}` : ''}
                    </p>
                  </div>
                  {col.items.map((r, i) => (
                    <div key={r.id || i} style={{ padding: '14px 20px', borderTop: '1px solid var(--border-soft)', borderLeft: `3px solid ${col.color}`, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--olive)', fontWeight: 700, fontSize: '1rem' }}>{r.hora || '—'}</span>
                        <span style={{ background: 'var(--border-soft)', color: 'var(--olive)', padding: '3px 8px', borderRadius: '99px', fontSize: '0.68rem', fontFamily: 'var(--font-sans)', textAlign: 'right' }}>{r.servicio || '—'}</span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontSize: '0.84rem' }}>{r.nombre || '—'}</p>
                      <button type="button" onClick={() => setReassign(r)}
                        style={{ alignSelf: 'flex-start', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px 10px', fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--olive)', cursor: 'pointer' }}>
                        Reasignar
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {reassign && (
        <ReassignDialog reservation={reassign} staff={staff} onClose={() => setReassign(null)}
          onDone={(res) => {
            setReassign(null);
            setMsg({ ok: true, text: `Cita reasignada a ${res.staffNombre}.${res.staffNotified ? ` Se avisó por correo a ${res.staffNotified} profesional${res.staffNotified > 1 ? 'es' : ''}.` : ''}` });
            onReload?.();
          }} />
      )}
    </>
  );
}
