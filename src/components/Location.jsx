import SectionDivider from './SectionDivider';
import { useSite } from '../utils/siteContent';

export default function Location() {
  const { ubicacion: u } = useSite();
  const q = encodeURIComponent(u.mapaConsulta || u.direccion.replace(/\n/g, ', '));
  return (
    <section id="ubicacion" style={{ background: 'var(--cream-soft)', padding: 'clamp(60px,10vw,100px) 16px', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,6vw,52px)' }}>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--gold-text)', fontSize: '0.72rem', letterSpacing: '0.22em', fontWeight: 700, marginBottom: '14px' }}>{u.etiqueta}</p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.8rem)', color: 'var(--ink)', fontWeight: 400, marginBottom: '18px' }}>{u.titulo}</h2>
          <SectionDivider margin="0 auto" />
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 'clamp(20px,4vw,40px)', alignItems: 'start' }}>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Address */}
            <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '14px', padding: 'clamp(16px,3vw,24px)' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', minWidth: '36px', background: 'var(--border-soft)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1rem' }}>📍</span>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--gold-text)', fontSize: '0.7rem', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '6px' }}>DIRECCIÓN</p>
                  <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontSize: '0.92rem', lineHeight: 1.7 }}>
                    {u.direccion.split('\n').map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}
                  </p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '14px', padding: 'clamp(16px,3vw,24px)' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', minWidth: '36px', background: 'var(--border-soft)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1rem' }}>🕐</span>
                </div>
                <div style={{ width: '100%' }}>
                  <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--gold-text)', fontSize: '0.7rem', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '10px' }}>HORARIOS</p>
                  {u.horarios.map(({ dia: day, horas: hours }) => (
                    <div key={day} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-soft)', paddingBottom: '7px', marginBottom: '7px' }}>
                      <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.85rem' }}>{day}</span>
                      <span style={{ fontFamily: 'var(--font-sans)', color: hours === 'Cerrado' ? 'var(--ink-soft)' : 'var(--ink)', fontSize: '0.85rem', fontWeight: 600 }}>{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <a href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'transparent', border: '1px solid var(--olive)', color: 'var(--olive)', padding: '14px 20px', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--olive)'; e.currentTarget.style.color = 'var(--cream)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--olive)'; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Cómo llegar
            </a>
          </div>

          {/* Map */}
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 12px 32px rgba(23,27,22,0.08)' }}>
            <iframe
              title="Clínica Estética Imperium – Ubicación"
              src={`https://www.google.com/maps?q=${q}&output=embed`}
              width="100%"
              style={{ border: 0, display: 'block', aspectRatio: '4/3', minHeight: '280px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
