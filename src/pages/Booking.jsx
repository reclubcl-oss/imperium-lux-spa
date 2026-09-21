import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import BookingCalendar from '../components/BookingCalendar';
import TreatmentSelect from '../components/TreatmentSelect';
import { sendBookingEmail } from '../utils/emailService';
import { saveReservation } from '../utils/supabase';
import { toLocalISODate, resolveStaffForSlot } from '../utils/schedule';
import { getActiveServices } from '../utils/services';
import { googleCalendarUrl, downloadICS } from '../utils/calendarLink';
import { trackBookingConfirmed } from '../utils/analytics';
import ReminderOptIn from '../components/ReminderOptIn';

// ── Sparkles de confirmación ────────────────────────────────────────────────
function GoldSparkles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#B5924D', '#263A22', '#3A5432', '#D4AF6A', '#171B16'];
    const particles = Array.from({ length: 120 }, () => ({
      x:   Math.random() * canvas.width,
      y:   Math.random() * canvas.height + canvas.height * 0.2,
      vx:  (Math.random() - 0.5) * 2.5,
      vy:  -(Math.random() * 4 + 2),
      size: Math.random() * 5 + 2,
      alpha: 1,
      decay: Math.random() * 0.015 + 0.008,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() > 0.5 ? 'diamond' : 'circle',
      spin:  (Math.random() - 0.5) * 0.2,
      angle: Math.random() * Math.PI * 2,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x     += p.vx;
        p.y     += p.vy;
        p.vy    += 0.06; // gravity
        p.alpha -= p.decay;
        p.angle += p.spin;

        if (p.alpha <= 0) {
          p.x     = Math.random() * canvas.width;
          p.y     = canvas.height + 10;
          p.vy    = -(Math.random() * 4 + 2);
          p.vx    = (Math.random() - 0.5) * 2.5;
          p.alpha = 1;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle   = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        if (p.shape === 'diamond') {
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.6, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.6, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none' }}
    />
  );
}


function formatDateES(date) {
  if (!date) return '';
  return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const inputStyle = {
  width: '100%',
  background: '#FFFFFF',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  padding: '13px 18px',
  color: 'var(--ink)',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s',
};

function StepLabel({ number, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: 'var(--olive)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--cream)', fontSize: '0.9rem', fontWeight: 700 }}>{number}</span>
      </div>
      <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: '1.2rem', fontWeight: 400 }}>{text}</h3>
    </div>
  );
}

export default function Booking() {
  const [searchParams] = useSearchParams();
  const [selection, setSelection] = useState({ date: null, time: null });
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', servicio: searchParams.get('servicio') || '', notas: '' });
  const [accepted, setAccepted] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [emailFailed, setEmailFailed] = useState(false);
  const [services, setServices] = useState([]);

  useEffect(() => {
    getActiveServices().then(({ data }) => setServices(data || []));
  }, []);

  // Agrupados por categoría — con 24 tratamientos en una sola lista plana,
  // encontrar el que buscas (sobre todo en el selector nativo del celular)
  // era más lento; agrupados es como hojear el menú por secciones.
  const groupedServices = useMemo(() => {
    const order = [];
    const map = new Map();
    services.forEach(s => {
      const key = s.categoria || 'Otros tratamientos';
      if (!map.has(key)) { map.set(key, []); order.push(key); }
      map.get(key).push(s);
    });
    return order.map(categoria => ({ categoria, items: map.get(categoria) }));
  }, [services]);

  const handleSelection = ({ date, time }) => setSelection({ date, time });
  const handleInput = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleServicioChange = (nombre) => setForm(prev => ({ ...prev, servicio: nombre }));
  const canSubmit = selection.date && selection.time && form.nombre && form.email && form.telefono && form.servicio && accepted;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('loading');

    // Se asigna el profesional recién ahora (no se le muestra al cliente),
    // así evitamos reservar a alguien que se ocupó mientras llenaba el formulario.
    const assigned = await resolveStaffForSlot(selection.date, selection.time);
    if (!assigned.success) {
      setErrorMsg(assigned.error);
      setStatus('error');
      return;
    }

    // El precio de la reserva se autocompleta en el servidor con el precio
    // del tratamiento (api/create-reservation.js) — el admin lo puede cambiar
    // igual después en Finanzas si ese caso puntual fue distinto.
    const payload = {
      nombre: form.nombre, email: form.email, telefono: form.telefono,
      servicio: form.servicio, fecha: formatDateES(selection.date),
      fechaIso: toLocalISODate(selection.date),
      hora: selection.time, notas: form.notas,
      staffId: assigned.staffId,
    };

    const [emailResult, dbResult] = await Promise.all([
      sendBookingEmail({ ...payload, staffEmail: assigned.staffEmail, staffNombre: assigned.staffNombre }),
      saveReservation(payload),
    ]);

    // La reserva es lo único que de verdad importa (queda agendada en el sistema);
    // el email es solo una notificación de cortesía. Si Supabase falló, la cita
    // NO quedó guardada — hay que mostrar error de verdad. Si el email falló pero
    // la reserva sí se guardó, igual mostramos éxito (si no, el cliente cree que
    // no quedó agendado y puede reservar dos veces, o llamar a preguntar).
    if (!dbResult.success) {
      console.error('Reservation save failed:', dbResult.error);
      setErrorMsg(dbResult.error || 'No pudimos guardar tu reserva. Por favor intenta de nuevo o contáctanos directamente.');
      setStatus('error');
      return;
    }

    if (!emailResult.success) console.warn('Email de confirmación no se pudo enviar:', emailResult.error);

    setErrorMsg('');
    setEmailFailed(!emailResult.success);
    window.scrollTo({ top: 0, behavior: 'instant' });
    setStatus('success');

    trackBookingConfirmed({ servicio: payload.servicio });
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream-soft)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(80px,15vw,100px) 20px 40px', overflow: 'hidden' }}>

        <GoldSparkles />

        {/* Card */}
        <div style={{
          position: 'relative', zIndex: 20, textAlign: 'center',
          width: '100%', maxWidth: '480px',
          background: 'var(--cream)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: 'clamp(32px,6vw,52px) clamp(20px,5vw,40px)',
          boxShadow: '0 24px 60px rgba(23,27,22,0.1)',
          animation: 'successPop 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <div style={{ fontSize: 'clamp(2.5rem,8vw,3.8rem)', marginBottom: '16px' }}>👑</div>

          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--olive)', fontSize: 'clamp(1.5rem,5vw,2rem)', marginBottom: '14px', fontWeight: 400 }}>
            ¡Reserva Confirmada!
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '28px', height: '1px', background: 'var(--gold-accent)' }} />
            <div style={{ width: '4px', height: '4px', background: 'var(--gold-accent)', transform: 'rotate(45deg)' }} />
            <div style={{ width: '28px', height: '1px', background: 'var(--gold-accent)' }} />
          </div>

          <p style={{ color: 'var(--ink-soft)', lineHeight: 1.8, marginBottom: '10px', fontFamily: 'var(--font-sans)', fontSize: 'clamp(0.85rem,2.5vw,0.95rem)' }}>
            Gracias, <strong style={{ color: 'var(--ink)' }}>{form.nombre}</strong>.<br/>Tu cita ha sido agendada para:
          </p>

          <div style={{ background: 'var(--border-soft)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 20px', margin: '16px 0 20px' }}>
            <p style={{ color: 'var(--olive)', fontWeight: 700, fontSize: 'clamp(0.9rem,2.5vw,1rem)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>
              📅 {formatDateES(selection.date)}
            </p>
            <p style={{ color: 'var(--ink)', fontWeight: 700, fontSize: 'clamp(1rem,3vw,1.2rem)', fontFamily: 'var(--font-serif)' }}>
              🕐 {selection.time} hrs
            </p>
          </div>

          {emailFailed ? (
            <p style={{ color: '#B3413A', fontSize: 'clamp(0.75rem,2vw,0.85rem)', marginBottom: '20px', fontFamily: 'var(--font-sans)' }}>
              Tu cita quedó agendada, pero no pudimos enviarte el correo de confirmación a <strong>{form.email}</strong>. ¡Te esperamos igual!
            </p>
          ) : (
            <p style={{ color: 'var(--ink-soft)', fontSize: 'clamp(0.75rem,2vw,0.85rem)', marginBottom: '20px', fontFamily: 'var(--font-sans)' }}>
              Confirmación enviada a <strong style={{ color: 'var(--ink)' }}>{form.email}</strong>
              {import.meta.env.VITE_REMINDERS === 'on' && <><br />Te enviaremos un recordatorio el día antes de tu cita.</>}
            </p>
          )}

          <ReminderOptIn email={form.email} />

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
            <a
              href={googleCalendarUrl({ servicio: form.servicio, date: selection.date, time: selection.time })}
              target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--ink)', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: 'clamp(0.72rem,2vw,0.78rem)', fontFamily: 'var(--font-sans)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="1.6"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
              Google Calendar
            </a>
            <button
              type="button"
              onClick={() => downloadICS({ servicio: form.servicio, date: selection.date, time: selection.time })}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--ink)', padding: '10px 16px', borderRadius: '8px', fontWeight: 600, fontSize: 'clamp(0.72rem,2vw,0.78rem)', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="1.6"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" /></svg>
              Apple / Outlook (.ics)
            </button>
          </div>

          <a href="/" style={{ display: 'inline-block', background: 'var(--olive)', color: 'var(--cream)', padding: 'clamp(12px,3vw,14px) clamp(28px,6vw,40px)', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: 'clamp(0.72rem,2vw,0.8rem)', fontFamily: 'var(--font-sans)' }}>
            VOLVER AL INICIO
          </a>

          <p style={{ marginTop: '18px' }}>
            <Link to="/fidelidad" style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', textDecoration: 'underline' }}>
              Consulta tus visitas de fidelidad
            </Link>
          </p>
        </div>

        <style>{`
          @keyframes successPop {
            from { opacity: 0; transform: scale(0.85) translateY(20px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // ── Main booking page ───────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream-soft)', paddingTop: '110px', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '0 24px 44px' }}>
        <p style={{ color: 'var(--gold-accent)', fontSize: '0.72rem', letterSpacing: '0.22em', fontFamily: 'var(--font-sans)', fontWeight: 700, marginBottom: '14px' }}>
          RESERVA TU VISITA
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: 'var(--ink)', marginBottom: '18px', fontWeight: 400 }}>
          Agenda tu Cita
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.92rem' }}>
          Selecciona la fecha, hora y completa tus datos
        </p>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>

          {/* ── Left: Calendar ─────────────────────────────────── */}
          <div style={{
            background: 'var(--cream)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '32px 28px',
            boxShadow: '0 12px 32px rgba(23,27,22,0.05)',
          }}>
            <StepLabel number="1" text="Elige fecha y hora" />
            <BookingCalendar onSelect={handleSelection} />

            {/* Selection summary */}
            {selection.date && selection.time && (
              <div style={{
                marginTop: '20px',
                background: 'var(--border-soft)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '18px 20px',
                animation: 'fadeIn 0.3s ease',
              }}>
                <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--gold-accent)', fontSize: '0.65rem', letterSpacing: '0.22em', marginBottom: '10px', fontWeight: 700 }}>TU SELECCIÓN</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📅</span> {formatDateES(selection.date)}
                  </p>
                  <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--olive)', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🕐</span> {selection.time} hrs
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Form ────────────────────────────────────── */}
          <div style={{
            background: 'var(--cream)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '32px 28px',
            boxShadow: '0 12px 32px rgba(23,27,22,0.05)',
          }}>
            <StepLabel number="2" text="Completa tus datos" />

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {[
                { name: 'nombre',   label: 'NOMBRE COMPLETO',      type: 'text',  placeholder: 'Tu nombre completo',   required: true },
                { name: 'email',    label: 'CORREO ELECTRÓNICO',    type: 'email', placeholder: 'tu@email.com',          required: true },
                { name: 'telefono', label: 'TELÉFONO',              type: 'tel',   placeholder: '+56 9 XXXX XXXX',      required: true },
              ].map(({ name, label, type, placeholder, required }) => (
                <div key={name}>
                  <label style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em', display: 'block', marginBottom: '7px', fontWeight: 600 }}>
                    {label} {required && <span style={{ color: 'var(--gold-accent)' }}>*</span>}
                  </label>
                  <input
                    type={type} name={name} value={form[name]}
                    onChange={handleInput} placeholder={placeholder} required={required}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'var(--olive)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                  />
                </div>
              ))}

              {/* Servicio */}
              <div>
                <label style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em', display: 'block', marginBottom: '7px', fontWeight: 600 }}>
                  TRATAMIENTO <span style={{ color: 'var(--gold-accent)' }}>*</span>
                </label>
                <TreatmentSelect groupedServices={groupedServices} value={form.servicio} onChange={handleServicioChange} />
              </div>

              {/* Notas */}
              <div>
                <label style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em', display: 'block', marginBottom: '7px', fontWeight: 600 }}>
                  NOTAS ADICIONALES
                </label>
                <textarea name="notas" value={form.notas} onChange={handleInput}
                  placeholder="Cuéntanos sobre tus necesidades..." rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--olive)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                />
              </div>

              {/* Consentimiento */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.78rem', lineHeight: 1.6 }}>
                <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)}
                  style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: 'var(--olive)', flexShrink: 0 }} />
                <span>
                  He leído y acepto la{' '}
                  <Link to="/privacidad" target="_blank" style={{ color: 'var(--olive)', textDecoration: 'underline' }}>Política de Privacidad</Link>
                  {' '}y autorizo el uso de mis datos para gestionar mi reserva.
                </span>
              </label>

              {/* Error */}
              {status === 'error' && (
                <div style={{ fontFamily: 'var(--font-sans)', color: '#B3413A', fontSize: '0.82rem', background: 'rgba(179,65,58,0.06)', border: '1px solid rgba(179,65,58,0.25)', padding: '12px 16px', borderRadius: '10px' }}>
                  <p>⚠️ Error al enviar la reserva:</p>
                  <p style={{ marginTop: '4px', fontSize: '0.78rem', opacity: 0.8 }}>{errorMsg}</p>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={!canSubmit || status === 'loading'}
                style={{
                  background: canSubmit ? 'var(--olive)' : 'var(--border)',
                  color: canSubmit ? 'var(--cream)' : 'var(--ink-soft)',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s',
                  marginTop: '8px',
                }}
              >
                {status === 'loading' ? 'ENVIANDO...' : 'CONFIRMAR RESERVA'}
              </button>

              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.72rem', textAlign: 'center' }}>
                Al confirmar recibirás un email con los detalles de tu cita.
              </p>
            </form>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
