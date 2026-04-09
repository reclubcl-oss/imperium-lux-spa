import { useState } from 'react';
import Calendar from 'react-calendar';

const MORNING_SLOTS   = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
const AFTERNOON_SLOTS = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

const BOOKED = {};

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function TimeSlot({ time, isBooked, isSelected, onSelect }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      disabled={isBooked}
      onClick={() => !isBooked && onSelect(time)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '10px 18px',
        borderRadius: '8px',
        fontFamily: 'Raleway, sans-serif',
        fontSize: '0.85rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
        cursor: isBooked ? 'not-allowed' : 'pointer',
        border: isSelected
          ? '1px solid #C9A84C'
          : isBooked
          ? '1px solid rgba(255,255,255,0.05)'
          : hover
          ? '1px solid rgba(201,168,76,0.6)'
          : '1px solid rgba(201,168,76,0.2)',
        background: isSelected
          ? 'linear-gradient(135deg, #C9A84C, #E8CC7A)'
          : isBooked
          ? 'rgba(255,255,255,0.03)'
          : hover
          ? 'rgba(201,168,76,0.12)'
          : 'rgba(201,168,76,0.05)',
        color: isBooked
          ? 'rgba(255,255,255,0.15)'
          : isSelected
          ? '#0A0A0A'
          : '#F5F0E8',
        transition: 'all 0.2s',
        boxShadow: isSelected ? '0 4px 16px rgba(201,168,76,0.3)' : 'none',
        transform: isSelected ? 'scale(1.04)' : 'scale(1)',
        textDecoration: isBooked ? 'line-through' : 'none',
      }}
    >
      {time}
    </button>
  );
}

export default function BookingCalendar({ onSelect }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    onSelect({ date, time: null });
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    onSelect({ date: selectedDate, time });
  };

  const bookedForDay = selectedDate ? (BOOKED[formatDate(selectedDate)] || []) : [];

  const isDisabled = ({ date }) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today || d.getDay() === 0;
  };

  return (
    <div>
      {/* Calendar wrapper */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '28px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileDisabled={isDisabled}
          minDate={today}
          locale="es-ES"
        />
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div style={{ animation: 'fadeIn 0.35s ease' }}>
          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(201,168,76,0.4), transparent)' }} />
            <p style={{ fontFamily: 'Raleway, sans-serif', color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.35em', fontWeight: 700 }}>
              HORARIOS DISPONIBLES
            </p>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4))' }} />
          </div>

          {/* Morning */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(201,168,76,0.1)',
            borderRadius: '12px',
            padding: '18px 20px',
            marginBottom: '12px',
            backdropFilter: 'blur(8px)',
          }}>
            <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.45)', fontSize: '0.68rem', letterSpacing: '0.2em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>☀️</span> MAÑANA
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {MORNING_SLOTS.map(time => (
                <TimeSlot
                  key={time}
                  time={time}
                  isBooked={bookedForDay.includes(time)}
                  isSelected={selectedTime === time}
                  onSelect={handleTimeSelect}
                />
              ))}
            </div>
          </div>

          {/* Afternoon */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(201,168,76,0.1)',
            borderRadius: '12px',
            padding: '18px 20px',
            backdropFilter: 'blur(8px)',
          }}>
            <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.45)', fontSize: '0.68rem', letterSpacing: '0.2em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🌙</span> TARDE
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {AFTERNOON_SLOTS.map(time => (
                <TimeSlot
                  key={time}
                  time={time}
                  isBooked={bookedForDay.includes(time)}
                  isSelected={selectedTime === time}
                  onSelect={handleTimeSelect}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
