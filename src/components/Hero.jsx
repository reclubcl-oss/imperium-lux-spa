import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section
      id="inicio"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0A0A0A 0%, #111111 50%, #0A0A0A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '64px',
      }}
    >
      {/* Decorative gold lines */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `
          radial-gradient(ellipse 600px 400px at 20% 50%, rgba(201,168,76,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 400px 400px at 80% 20%, rgba(201,168,76,0.04) 0%, transparent 70%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Horizontal gold lines */}
      <div style={{ position: 'absolute', top: '30%', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)' }} />
      <div style={{ position: 'absolute', bottom: '25%', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.1), transparent)' }} />

      <div style={{ textAlign: 'center', padding: '40px 24px', maxWidth: '800px', position: 'relative', zIndex: 1 }}>
        {/* Tag line */}
        <p style={{
          color: '#C9A84C',
          fontSize: '0.7rem',
          letterSpacing: '0.45em',
          fontWeight: 600,
          marginBottom: '28px',
          fontFamily: 'Raleway, sans-serif',
        }}>
          ✦ CLÍNICA ESTÉTICA DE LUJO ✦
        </p>

        {/* Main title */}
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(3rem, 8vw, 6.5rem)',
          fontWeight: 700,
          color: '#F5F0E8',
          lineHeight: 1.05,
          marginBottom: '12px',
          letterSpacing: '-0.01em',
        }}>
          IMPERIUM
        </h1>
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(1.2rem, 3vw, 2rem)',
          fontWeight: 400,
          color: '#C9A84C',
          letterSpacing: '0.5em',
          marginBottom: '32px',
        }}>
          LUX SPA
        </h2>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
          <div style={{ width: '6px', height: '6px', background: '#C9A84C', transform: 'rotate(45deg)' }} />
          <div style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
        </div>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'Raleway, sans-serif',
          fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
          color: 'rgba(245,240,232,0.7)',
          fontWeight: 300,
          letterSpacing: '0.05em',
          lineHeight: 1.8,
          marginBottom: '48px',
          maxWidth: '520px',
          margin: '0 auto 48px',
        }}>
          Descubre el arte del bienestar y la belleza. Tratamientos exclusivos diseñados para realzar tu elegancia natural.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/reservar"
            style={{
              background: '#C9A84C',
              color: '#0A0A0A',
              padding: '16px 40px',
              fontSize: '0.8rem',
              letterSpacing: '0.2em',
              fontWeight: 700,
              borderRadius: '4px',
              textDecoration: 'none',
              fontFamily: 'Raleway, sans-serif',
              transition: 'all 0.3s',
              boxShadow: '0 0 30px rgba(201,168,76,0.2)',
            }}
            onMouseEnter={e => { e.target.style.background = '#E8CC7A'; e.target.style.boxShadow = '0 0 40px rgba(201,168,76,0.4)'; }}
            onMouseLeave={e => { e.target.style.background = '#C9A84C'; e.target.style.boxShadow = '0 0 30px rgba(201,168,76,0.2)'; }}
          >
            RESERVAR VISITA
          </Link>
          <a
            href="#servicios"
            style={{
              background: 'transparent',
              color: '#F5F0E8',
              padding: '16px 40px',
              fontSize: '0.8rem',
              letterSpacing: '0.2em',
              fontWeight: 600,
              borderRadius: '4px',
              textDecoration: 'none',
              fontFamily: 'Raleway, sans-serif',
              border: '1px solid rgba(245,240,232,0.3)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.color = '#C9A84C'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'rgba(245,240,232,0.3)'; e.target.style.color = '#F5F0E8'; }}
          >
            VER SERVICIOS
          </a>
        </div>

        {/* Scroll indicator */}
        <div style={{ marginTop: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <p style={{ color: 'rgba(201,168,76,0.6)', fontSize: '0.65rem', letterSpacing: '0.3em', fontFamily: 'Raleway, sans-serif' }}>SCROLL</p>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(180deg, #C9A84C, transparent)', animation: 'pulse 2s infinite' }} />
        </div>
      </div>
    </section>
  );
}
