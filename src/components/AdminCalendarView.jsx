import { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import { toLocalISODate } from '../utils/schedule';

export default function AdminCalendarView({ reservations }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const byDate = useMemo(() => {
    const map = {};
    reservations.forEach(r => {
      if (!r.fecha_iso) return;
      (map[r.fecha_iso] ||= []).push(r);
    });
    return map;
  }, [reservations]);

  const selectedIso = toLocalISODate(selectedDate);
  const dayReservations = useMemo(() =>
    (byDate[selectedIso] || []).slice().sort((a, b) => (a.hora || '').localeCompare(b.hora || '')),
    [byDate, selectedIso]
  );

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const count = byDate[toLocalISODate(date)]?.length;
    if (!count) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3px' }}>
        <span style={{
          minWidth: '6px', height: '6px', padding: count > 1 ? '0 3px' : 0,
          borderRadius: '99px', background: 'var(--gold-accent)',
          fontSize: '0.55rem', color: 'var(--forest)', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1,
        }}>
          {count > 1 ? count : ''}
        </span>
      </div>
    );
  };

  const cardStyle = { background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px 28px' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: '20px', alignItems: 'start' }}>
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

      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em' }}>
            RESERVAS DEL {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
          </p>
        </div>
        {dayReservations.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>
            Sin reservas este día.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {dayReservations.map((r, i) => (
              <div key={r.id || i} style={{ padding: '16px 28px', borderBottom: '1px solid var(--border-soft)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--olive)', fontWeight: 700, fontSize: '1rem' }}>{r.hora || '—'}</span>
                  <span style={{ background: 'var(--border-soft)', color: 'var(--olive)', padding: '3px 8px', borderRadius: '99px', fontSize: '0.7rem', fontFamily: 'var(--font-sans)' }}>
                    {r.servicio || '—'}
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontSize: '0.85rem' }}>
                  {r.nombre || '—'} <span style={{ color: 'var(--ink-soft)' }}>con</span> {r.staff?.nombre || 'profesional sin asignar'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
