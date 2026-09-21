import { Link } from 'react-router-dom';
import heroPoster from '../assets/brand/hero.jpg';

const FEATURES = [
  {
    title: 'Atención personalizada',
    desc: 'Orientación pensada según tus necesidades y objetivos.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="1.4">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    ),
  },
  {
    title: 'Tecnología avanzada',
    desc: 'Procedimientos y tecnología seleccionados según cada evaluación.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="1.4">
        <circle cx="12" cy="12" r="2.4" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
      </svg>
    ),
  },
  {
    title: 'Evaluación profesional',
    desc: 'Cada tratamiento comienza con una orientación personalizada.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="1.4">
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 3h6v2H9z" />
        <path d="M8.5 12.5l2 2 4-4.5" />
      </svg>
    ),
  },
];

export default function Hero() {
  return (
    <section id="inicio" style={{ background: 'linear-gradient(160deg, var(--cream) 0%, var(--cream) 55%, var(--cream-soft) 100%)', paddingTop: '110px', position: 'relative', overflow: 'hidden' }}>

      {/* Soft decorative glow, puramente atmosférico */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-120px', left: '-140px', width: '440px', height: '440px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(181,146,77,0.14), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: '-100px', right: '-120px', width: '360px', height: '360px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(38,58,34,0.06), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px clamp(50px,8vw,80px)', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(32px,5vw,56px)', alignItems: 'center' }}>

          {/* Text */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ width: '28px', height: '2px', background: 'var(--gold-accent)' }} />
              <p style={{ color: 'var(--gold-accent)', fontSize: '0.72rem', letterSpacing: '0.22em', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>
                CLÍNICA ESTÉTICA IMPERIUM
              </p>
            </div>

            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem,5.5vw,3.4rem)', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.15, marginBottom: '22px' }}>
              Estética avanzada, resultados que se sienten naturales
            </h1>

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', color: 'var(--ink-soft)', lineHeight: 1.8, marginBottom: '32px', maxWidth: '440px' }}>
              Medicina estética con precisión y cuidado. Realzamos tu belleza respetando tu esencia.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/reservar" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--olive)', color: 'var(--cream)', padding: '15px 28px', fontSize: '0.9rem', fontWeight: 600, borderRadius: '8px', textDecoration: 'none', fontFamily: 'var(--font-sans)', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--olive-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--olive)'}>
                Agenda tu evaluación
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
              <a href="#servicios" style={{ display: 'inline-flex', alignItems: 'center', background: 'transparent', color: 'var(--ink)', padding: '15px 28px', fontSize: '0.9rem', fontWeight: 600, borderRadius: '8px', textDecoration: 'none', fontFamily: 'var(--font-sans)', border: '1px solid var(--border)' }}>
                Ver tratamientos
              </a>
            </div>

            <p style={{ marginTop: '28px', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--ink-soft)', letterSpacing: '0.02em' }}>
              Clínica autorizada SEREMI de Salud · Ubicados en Viña del Mar
            </p>
          </div>

          {/* Image */}
          <div style={{ position: 'relative' }}>
            <div aria-hidden="true" style={{
              position: 'absolute', inset: '16px -16px -16px 16px', borderRadius: '20px',
              border: '1.5px solid var(--gold-accent)', zIndex: 0,
            }} />
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(23,27,22,0.14)', zIndex: 1 }}>
              <video autoPlay muted loop playsInline poster={heroPoster} src="/imperium-video.mp4" aria-label="Video de Clínica Estética Imperium"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', aspectRatio: '1/1' }} />
            </div>
          </div>
        </div>

        {/* Features strip */}
        <div style={{ marginTop: 'clamp(48px,8vw,72px)', background: 'var(--border-soft)', borderRadius: '18px', padding: 'clamp(24px,4vw,36px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '28px' }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>{f.title}</p>
                  <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.85rem', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
