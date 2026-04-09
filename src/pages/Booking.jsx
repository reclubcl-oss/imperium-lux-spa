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

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(201,168,76,0.2)',
  borderRadius: '10px',
  padding: '13px 18px',
  color: '#F5F0E8',
  fontFamily: 'Raleway, sans-serif',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s, background 0.2s',
  backdropFilter: 'blur(8px)',
};

function StepLabel({ number, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #C9A84C, #9A7A2E)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(201,168,76,0.3)',
      }}>
        <span style={{ fontFamily: 'Playfair Display, serif', color: '#0A0A0A', fontSize: '0.85rem', fontWeight: 700 }}>{number}</span>
      </div>
      <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontSize: '1.15rem', fontWeight: 600 }}>{text}</h3>
    </div>
  );
}

export default function Booking() {
  const [selection, setSelection] = useState({ date: null, time: null });
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', servicio: '', notas: '' });
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelection = ({ date, time }) => setSelection({ date, time });
  const handleInput = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const canSubmit = selection.date && selection.time && form.nombre && form.email && form.telefono && form.servicio;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('loading');

    const payload = {
      nombre: form.nombre, email: form.email, telefono: form.telefono,
      servicio: form.servicio, fecha: formatDateES(selection.date),
      hora: selection.time, notas: form.notas,
    };

    const [emailResult, dbResult] = await Promise.all([
      sendBookingEmail(payload),
      saveReservation(payload),
    ]);

    if (!dbResult.success) console.warn('Supabase warning:', dbResult.error);

    if (emailResult.success) {
      setErrorMsg('');
      setStatus('success');

      // Zapier webhook — no bloquea ni afecta la confirmación si falla
      fetch('https://hooks.zapier.com/hooks/catch/27149964/u7iu435/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre:   payload.nombre,
          email:    payload.email,
          telefono: payload.telefono,
          servicio: payload.servicio,
          fecha:    payload.fecha,
          hora:     payload.hora,
        }),
      }).catch(err => console.warn('Zapier webhook error:', err));

    } else {
      setErrorMsg(emailResult.error || 'Error desconocido');
      setStatus('error');
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 40px', overflow: 'hidden' }}>
        <video autoPlay muted loop playsInline src="/imperium-video.mp4"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(10px) brightness(0.2) saturate(0.7)', transform: 'scale(1.05)', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.55)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '500px',
          background: 'rgba(17,17,17,0.7)', border: '1px solid rgba(201,168,76,0.25)',
          borderRadius: '20px', padding: '52px 40px', backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>✨</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C', fontSize: '2rem', marginBottom: '16px' }}>¡Reserva Confirmada!</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '30px', height: '1px', background: '#C9A84C' }} />
            <div style={{ width: '4px', height: '4px', background: '#C9A84C', transform: 'rotate(45deg)' }} />
            <div style={{ width: '30px', height: '1px', background: '#C9A84C' }} />
          </div>
          <p style={{ color: 'rgba(245,240,232,0.7)', lineHeight: 1.8, marginBottom: '12px', fontFamily: 'Raleway, sans-serif' }}>
            Gracias, <strong style={{ color: '#F5F0E8' }}>{form.nombre}</strong>. Tu cita ha sido agendada para el
          </p>
          <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '1.05rem', marginBottom: '8px', fontFamily: 'Raleway, sans-serif', letterSpacing: '0.03em' }}>
            {formatDateES(selection.date)} a las {selection.time}
          </p>
          <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: '0.85rem', marginBottom: '36px', fontFamily: 'Raleway, sans-serif' }}>
            Recibirás confirmación en <strong style={{ color: '#F5F0E8' }}>{form.email}</strong>
          </p>
          <a href="/" style={{ background: 'linear-gradient(135deg, #C9A84C, #9A7A2E)', color: '#0A0A0A', padding: '14px 40px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.18em', fontFamily: 'Raleway, sans-serif', boxShadow: '0 6px 20px rgba(201,168,76,0.35)' }}>
            VOLVER AL INICIO
          </a>
        </div>
      </div>
    );
  }

  // ── Main booking page ───────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', position: 'relative', paddingTop: '80px', paddingBottom: '80px', overflow: 'hidden' }}>

      {/* Background video */}
      <video autoPlay muted loop playsInline src="/imperium-video.mp4"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(10px) brightness(0.18) saturate(0.7)', transform: 'scale(1.05)', zIndex: 0 }} />

      {/* Overlay */}
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(160deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.5) 50%, rgba(10,10,10,0.7) 100%)', zIndex: 1 }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', padding: '40px 24px 52px' }}>
          <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.5em', fontFamily: 'Raleway, sans-serif', fontWeight: 700, marginBottom: '14px' }}>
            ✦ RESERVA TU VISITA ✦
          </p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#F5F0E8', marginBottom: '20px', fontWeight: 700 }}>
            Agenda tu Cita
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
            <div style={{ width: '6px', height: '6px', background: '#C9A84C', transform: 'rotate(45deg)', boxShadow: '0 0 8px rgba(201,168,76,0.6)' }} />
            <div style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
          </div>
          <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.5)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
            Selecciona la fecha, hora y completa tus datos
          </p>
        </div>

        {/* Grid */}
        <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>

            {/* ── Left: Calendar ─────────────────────────────────── */}
            <div style={{
              background: 'rgba(10,10,10,0.6)',
              border: '1px solid rgba(201,168,76,0.18)',
              borderRadius: '20px',
              padding: '32px 28px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
            }}>
              <StepLabel number="1" text="Elige fecha y hora" />
              <BookingCalendar onSelect={handleSelection} />

              {/* Selection summary */}
              {selection.date && selection.time && (
                <div style={{
                  marginTop: '20px',
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.06))',
                  border: '1px solid rgba(201,168,76,0.35)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  animation: 'fadeIn 0.3s ease',
                  boxShadow: '0 4px 16px rgba(201,168,76,0.08)',
                }}>
                  <p style={{ fontFamily: 'Raleway, sans-serif', color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.3em', marginBottom: '10px', fontWeight: 700 }}>TU SELECCIÓN</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <p style={{ fontFamily: 'Raleway, sans-serif', color: '#F5F0E8', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📅</span> {formatDateES(selection.date)}
                    </p>
                    <p style={{ fontFamily: 'Raleway, sans-serif', color: '#C9A84C', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🕐</span> {selection.time} hrs
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Form ────────────────────────────────────── */}
            <div style={{
              background: 'rgba(10,10,10,0.6)',
              border: '1px solid rgba(201,168,76,0.18)',
              borderRadius: '20px',
              padding: '32px 28px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
            }}>
              <StepLabel number="2" text="Completa tus datos" />

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {[
                  { name: 'nombre',   label: 'NOMBRE COMPLETO',      type: 'text',  placeholder: 'Tu nombre completo',   required: true },
                  { name: 'email',    label: 'CORREO ELECTRÓNICO',    type: 'email', placeholder: 'tu@email.com',          required: true },
                  { name: 'telefono', label: 'TELÉFONO',              type: 'tel',   placeholder: '+56 9 XXXX XXXX',      required: true },
                ].map(({ name, label, type, placeholder, required }) => (
                  <div key={name}>
                    <label style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(201,168,76,0.7)', fontSize: '0.65rem', letterSpacing: '0.25em', display: 'block', marginBottom: '7px', fontWeight: 600 }}>
                      {label} {required && <span style={{ color: '#C9A84C' }}>*</span>}
                    </label>
                    <input
                      type={type} name={name} value={form[name]}
                      onChange={handleInput} placeholder={placeholder} required={required}
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = 'rgba(201,168,76,0.07)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(201,168,76,0.2)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                    />
                  </div>
                ))}

                {/* Servicio */}
                <div>
                  <label style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(201,168,76,0.7)', fontSize: '0.65rem', letterSpacing: '0.25em', display: 'block', marginBottom: '7px', fontWeight: 600 }}>
                    TRATAMIENTO <span style={{ color: '#C9A84C' }}>*</span>
                  </label>
                  <select name="servicio" value={form.servicio} onChange={handleInput} required
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = 'rgba(201,168,76,0.07)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(201,168,76,0.2)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                  >
                    <option value="" disabled>Selecciona un tratamiento</option>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Notas */}
                <div>
                  <label style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(201,168,76,0.7)', fontSize: '0.65rem', letterSpacing: '0.25em', display: 'block', marginBottom: '7px', fontWeight: 600 }}>
                    NOTAS ADICIONALES
                  </label>
                  <textarea name="notas" value={form.notas} onChange={handleInput}
                    placeholder="Cuéntanos sobre tus necesidades..." rows={3}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                    onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = 'rgba(201,168,76,0.07)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(201,168,76,0.2)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                  />
                </div>

                {/* Error */}
                {status === 'error' && (
                  <div style={{ fontFamily: 'Raleway, sans-serif', color: '#e57373', fontSize: '0.82rem', background: 'rgba(229,115,115,0.08)', border: '1px solid rgba(229,115,115,0.25)', padding: '12px 16px', borderRadius: '10px' }}>
                    <p>⚠️ Error al enviar la reserva:</p>
                    <p style={{ marginTop: '4px', fontSize: '0.78rem', opacity: 0.8 }}>{errorMsg}</p>
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={!canSubmit || status === 'loading'}
                  style={{
                    background: canSubmit
                      ? 'linear-gradient(135deg, #C9A84C, #9A7A2E)'
                      : 'rgba(201,168,76,0.12)',
                    color: canSubmit ? '#0A0A0A' : 'rgba(245,240,232,0.25)',
                    border: 'none',
                    padding: '16px',
                    borderRadius: '10px',
                    fontFamily: 'Raleway, sans-serif',
                    fontSize: '0.82rem',
                    letterSpacing: '0.22em',
                    fontWeight: 700,
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s',
                    marginTop: '8px',
                    boxShadow: canSubmit ? '0 6px 24px rgba(201,168,76,0.3)' : 'none',
                  }}
                >
                  {status === 'loading' ? '⏳ ENVIANDO...' : '✦ CONFIRMAR RESERVA ✦'}
                </button>

                <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.3)', fontSize: '0.72rem', textAlign: 'center', letterSpacing: '0.05em' }}>
                  Al confirmar recibirás un email con los detalles de tu cita.
                </p>
              </form>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        select option { background: #1A1A1A; color: #F5F0E8; }
      `}</style>
    </div>
  );
}
