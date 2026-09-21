import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { getAvailableSlotsAnyStaff } from '../utils/schedule';

function TimeSlot({ time, isSelected, onSelect }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => onSelect(time)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '10px 18px',
        borderRadius: '8px',
        fontFamily: 'var(--font-sans)',
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
        border: isSelected
          ? '1px solid var(--olive)'
          : hover
          ? '1px solid var(--gold-accent)'
          : '1px solid var(--border)',
        background: isSelected
          ? 'var(--olive)'
          : hover
          ? 'var(--border-soft)'
          : 'var(--cream)',
        color: isSelected ? 'var(--cream)' : 'var(--ink)',
        transition: 'all 0.2s',
      }}
    >
      {time}
    </button>
  );
}

export default function BookingCalendar({ onSelect }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    setError('');
    getAvailableSlotsAnyStaff(selectedDate).then(({ success, data, error }) => {
      if (success) setSlots(data);
      else setError(error);
      setLoading(false);
    });
  }, [selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    onSelect({ date, time: null });
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    onSelect({ date: selectedDate, time });
  };

  const isDisabled = ({ date }) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const morning = slots.filter(t => t < '14:00');
  const afternoon = slots.filter(t => t >= '14:00');

  return (
    <div>
      {/* Calendar wrapper */}
      <div style={{
        background: 'var(--cream)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '22px 20px',
        marginBottom: '28px',
      }}>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileDisabled={isDisabled}
          minDate={today}
          locale="es-ES"
          maxDetail="month"
          minDetail="month"
          navigationLabel={({ date }) =>
            date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
              .replace(/^\w/, c => c.toUpperCase())
          }
          prevLabel={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          }
          nextLabel={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          }
        />
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div style={{ animation: 'fadeIn 0.35s ease' }}>
          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--gold-accent)', fontSize: '0.68rem', letterSpacing: '0.22em', fontWeight: 700 }}>
              HORARIOS DISPONIBLES
            </p>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {loading && (
            <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', textAlign: 'center' }}>
              Buscando disponibilidad...
            </p>
          )}

          {error && (
            <div style={{ background: 'rgba(179,65,58,0.06)', border: '1px solid rgba(179,65,58,0.25)', borderRadius: '8px', padding: '14px 18px', fontFamily: 'var(--font-sans)', color: '#B3413A', fontSize: '0.82rem' }}>
              ⚠️ No se pudo cargar la disponibilidad: {error}
            </div>
          )}

          {!loading && !error && slots.length === 0 && (
            <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', textAlign: 'center', padding: '12px 0' }}>
              No hay horarios disponibles este día. Prueba con otra fecha.
            </p>
          )}

          {!loading && !error && morning.length > 0 && (
            <div style={{
              background: 'var(--cream-soft)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '18px 20px',
              marginBottom: '12px',
            }}>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.7rem', letterSpacing: '0.15em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>☀️</span> MAÑANA
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {morning.map(time => (
                  <TimeSlot key={time} time={time} isSelected={selectedTime === time} onSelect={handleTimeSelect} />
                ))}
              </div>
            </div>
          )}

          {!loading && !error && afternoon.length > 0 && (
            <div style={{
              background: 'var(--cream-soft)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '18px 20px',
            }}>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.7rem', letterSpacing: '0.15em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🌙</span> TARDE
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {afternoon.map(time => (
                  <TimeSlot key={time} time={time} isSelected={selectedTime === time} onSelect={handleTimeSelect} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
