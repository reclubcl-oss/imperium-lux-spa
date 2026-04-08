import { useState } from 'react';
import Calendar from 'react-calendar';

const MORNING_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
const AFTERNOON_SLOTS = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

// Simulated booked slots (in a real app these come from a DB)
const BOOKED = {
  // Example: '2024-04-10': ['10:00', '14:30']
};

function formatDate(date) {
  return date.toISOString().split('T')[0];
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
    // Disable past dates and Sundays
    return d < today || d.getDay() === 0;
  };

  return (
    <div>
      {/* Calendar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
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
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <p style={{ fontFamily: 'Raleway, sans-serif', color: '#C9A84C', fontSize: '0.7rem', letterSpacing: '0.3em', fontWeight: 600, marginBottom: '16px', textAlign: 'center' }}>
            HORARIOS DISPONIBLES
          </p>

          {/* Morning */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.5)', fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '10px' }}>
              ☀️ MAÑANA
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {MORNING_SLOTS.map(time => {
                const isBooked = bookedForDay.includes(time);
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    disabled={isBooked}
                    onClick={() => handleTimeSelect(time)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontFamily: 'Raleway, sans-serif',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: isBooked ? 'not-allowed' : 'pointer',
                      border: isSelected ? '1px solid #C9A84C' : '1px solid rgba(201,168,76,0.25)',
                      background: isBooked ? '#1a1a1a' : isSelected ? '#C9A84C' : 'transparent',
                      color: isBooked ? '#444' : isSelected ? '#0A0A0A' : '#F5F0E8',
                      transition: 'all 0.2s',
                    }}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Afternoon */}
          <div>
            <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.5)', fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '10px' }}>
              🌙 TARDE
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {AFTERNOON_SLOTS.map(time => {
                const isBooked = bookedForDay.includes(time);
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    disabled={isBooked}
                    onClick={() => handleTimeSelect(time)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontFamily: 'Raleway, sans-serif',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: isBooked ? 'not-allowed' : 'pointer',
                      border: isSelected ? '1px solid #C9A84C' : '1px solid rgba(201,168,76,0.25)',
                      background: isBooked ? '#1a1a1a' : isSelected ? '#C9A84C' : 'transparent',
                      color: isBooked ? '#444' : isSelected ? '#0A0A0A' : '#F5F0E8',
                      transition: 'all 0.2s',
                    }}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
