import { useState } from 'react';
import BookingCalendar from '../components/BookingCalendar';
import { sendBookingEmail } from '../utils/emailService';
import { saveReservation } from '../utils/supabase';

const SERVICES = [
  'Tratamiento Facial Personalizado',
  'Hidratación Profunda',
  'Peeling Químico',
  'Radiofrecuencia Facial',
  'Mesoterapia',
  'Bótox & Rellenos',
  'Plasma Rico en Plaquetas',
  'Hilos Tensores',
  'Reducción de Medidas',
  'Drenaje Linfático',
  'Cavitación',
  'Láser Depilación',
  'Masaje Terapéutico',
  'Ritual de Oro',
  'Otro (indicar en notas)',
];

function formatDateES(date) {
  if (!date) return '';
  return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Booking() {
  const [selection, setSelection] = useState({ date: null, time: null });
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', servicio: '', notas: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelection = ({ date, time }) => setSelection({ date, time });

  const handleInput = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const canSubmit = selection.date && selection.time && form.nombre && form.email && form.telefono && form.servicio;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('loading');

    const payload = {
      nombre:   form.nombre,
      email:    form.email,
      telefono: form.telefono,
      servicio: form.servicio,
      fecha:    formatDateES(selection.date),
      hora:     selection.time,
      notas:    form.notas,
    };

    // Guardar en Supabase y enviar email en paralelo
    const [emailResult, dbResult] = await Promise.all([
      sendBookingEmail(payload),
      saveReservation(payload),
    ]);

    if (!dbResult.success) console.warn('Supabase warning:', dbResult.error);

    if (emailResult.success) {
      setErrorMsg('');
      setStatus('success');
    } else {
      setErrorMsg(emailResult.error || 'Error desconocido');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 40px', fontFamily: 'Raleway, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>✨</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C', fontSize: '2rem', marginBottom: '16px' }}>¡Reserva Confirmada!</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '30px', height: '1px', background: '#C9A84C' }} />
            <div style={{ width: '4px', height: '4px', background: '#C9A84C', transform: 'rotate(45deg)' }} />
            <div style={{ width: '30px', height: '1px', background: '#C9A84C' }} />
          </div>
          <p style={{ color: 'rgba(245,240,232,0.7)', lineHeight: 1.8, marginBottom: '12px' }}>
            Gracias, <strong style={{ color: '#F5F0E8' }}>{form.nombre}</strong>. Tu cita ha sido agendada para el
          </p>
          <p style={{ color: '#C9A84C', fontWeight: 600, fontSize: '1.05rem', marginBottom: '8px' }}>
            {formatDateES(selection.date)} a las {selection.time}
          </p>
          <p style={{ color: 'rgba(245,240,232,0.6)', fontSize: '0.9rem', marginBottom: '36px' }}>
            Recibirás una confirmación en <strong style={{ color: '#F5F0E8' }}>{form.email}</strong>
          </p>
          <a
            href="/"
            style={{
              background: '#C9A84C',
              color: '#0A0A0A',
              padding: '14px 36px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
            }}
          >
            VOLVER AL INICIO
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', paddingTop: '80px', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '40px 24px 48px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
        <p style={{ color: '#C9A84C', fontSize: '0.68rem', letterSpacing: '0.45em', fontFamily: 'Raleway, sans-serif', fontWeight: 600, marginBottom: '12px' }}>
          ✦ RESERVA TU VISITA ✦
        </p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#F5F0E8', marginBottom: '16px', fontWeight: 700 }}>
          Agenda tu Cita
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '1px', background: '#C9A84C' }} />
          <div style={{ width: '5px', height: '5px', background: '#C9A84C', transform: 'rotate(45deg)' }} />
          <div style={{ width: '40px', height: '1px', background: '#C9A84C' }} />
        </div>
        <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.55)', marginTop: '16px', fontSize: '0.9rem' }}>
          Selecciona la fecha, hora y completa tus datos para confirmar la reserva.
        </p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '48px',
          alignItems: 'start',
        }}>
          {/* Left: Calendar */}
          <div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontSize: '1.2rem', marginBottom: '24px' }}>
              1. Elige fecha y hora
            </h3>
            <BookingCalendar onSelect={handleSelection} />

            {/* Selection summary */}
            {selection.date && selection.time && (
              <div style={{
                marginTop: '24px',
                background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: '8px',
                padding: '16px 20px',
                animation: 'fadeIn 0.3s ease',
              }}>
                <p style={{ fontFamily: 'Raleway, sans-serif', color: '#C9A84C', fontSize: '0.7rem', letterSpacing: '0.2em', marginBottom: '8px' }}>SELECCIÓN</p>
                <p style={{ fontFamily: 'Raleway, sans-serif', color: '#F5F0E8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  📅 {formatDateES(selection.date)}<br/>
                  🕐 {selection.time} hrs
                </p>
              </div>
            )}
          </div>

          {/* Right: Form */}
          <div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontSize: '1.2rem', marginBottom: '24px' }}>
              2. Completa tus datos
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Nombre */}
              <div>
                <label style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.6)', fontSize: '0.72rem', letterSpacing: '0.2em', display: 'block', marginBottom: '6px' }}>
                  NOMBRE COMPLETO *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleInput}
                  placeholder="Tu nombre"
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#C9A84C'}
                  onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.25)'}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.6)', fontSize: '0.72rem', letterSpacing: '0.2em', display: 'block', marginBottom: '6px' }}>
                  CORREO ELECTRÓNICO *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInput}
                  placeholder="tu@email.com"
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#C9A84C'}
                  onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.25)'}
                />
              </div>

              {/* Teléfono */}
              <div>
                <label style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.6)', fontSize: '0.72rem', letterSpacing: '0.2em', display: 'block', marginBottom: '6px' }}>
                  TELÉFONO *
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleInput}
                  placeholder="+XX XXX XXX XXXX"
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#C9A84C'}
                  onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.25)'}
                />
              </div>

              {/* Servicio */}
              <div>
                <label style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.6)', fontSize: '0.72rem', letterSpacing: '0.2em', display: 'block', marginBottom: '6px' }}>
                  TRATAMIENTO DESEADO *
                </label>
                <select
                  name="servicio"
                  value={form.servicio}
                  onChange={handleInput}
                  required
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={e => e.target.style.borderColor = '#C9A84C'}
                  onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.25)'}
                >
                  <option value="" disabled>Selecciona un tratamiento</option>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Notas */}
              <div>
                <label style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.6)', fontSize: '0.72rem', letterSpacing: '0.2em', display: 'block', marginBottom: '6px' }}>
                  NOTAS ADICIONALES
                </label>
                <textarea
                  name="notas"
                  value={form.notas}
                  onChange={handleInput}
                  placeholder="Cuéntanos sobre tus necesidades o consultas..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                  onFocus={e => e.target.style.borderColor = '#C9A84C'}
                  onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.25)'}
                />
              </div>

              {/* Error */}
              {status === 'error' && (
                <div style={{ fontFamily: 'Raleway, sans-serif', color: '#e57373', fontSize: '0.85rem', background: 'rgba(229,115,115,0.08)', border: '1px solid rgba(229,115,115,0.3)', padding: '12px 16px', borderRadius: '6px' }}>
                  <p>⚠️ Error al enviar la reserva:</p>
                  <p style={{ marginTop: '6px', fontSize: '0.8rem', opacity: 0.85 }}>{errorMsg}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit || status === 'loading'}
                style={{
                  background: canSubmit ? '#C9A84C' : 'rgba(201,168,76,0.2)',
                  color: canSubmit ? '#0A0A0A' : 'rgba(245,240,232,0.3)',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '6px',
                  fontFamily: 'Raleway, sans-serif',
                  fontSize: '0.82rem',
                  letterSpacing: '0.2em',
                  fontWeight: 700,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s',
                  marginTop: '8px',
                }}
              >
                {status === 'loading' ? '⏳ ENVIANDO...' : 'CONFIRMAR RESERVA'}
              </button>

              <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.35)', fontSize: '0.75rem', textAlign: 'center' }}>
                * Al confirmar recibirás un email con los detalles de tu cita.
              </p>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        select option { background: #1A1A1A; color: #F5F0E8; }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: '#111111',
  border: '1px solid rgba(201,168,76,0.25)',
  borderRadius: '6px',
  padding: '12px 16px',
  color: '#F5F0E8',
  fontFamily: 'Raleway, sans-serif',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s',
};
