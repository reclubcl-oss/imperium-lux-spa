import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section id="inicio" style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', paddingTop: '60px' }}>

      {/* Background video */}
      <video autoPlay muted loop playsInline src="/imperium-video.mp4"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(8px) brightness(0.25) saturate(0.8)', transform: 'scale(1.05)', zIndex: 0 }} />

      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(10,10,10,0.55) 0%,rgba(10,10,10,0.4) 50%,rgba(10,10,10,0.65) 100%)', zIndex: 1 }} />

      {/* Gold radial glow */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(ellipse 60% 40% at 20% 50%,rgba(201,168,76,0.06) 0%,transparent 70%),radial-gradient(ellipse 40% 40% at 80% 20%,rgba(201,168,76,0.04) 0%,transparent 70%)`, pointerEvents: 'none', zIndex: 2 }} />

      {/* Content */}
      <div style={{ textAlign: 'center', padding: '32px 20px', maxWidth: '720px', width: '100%', position: 'relative', zIndex: 3 }}>

        <p style={{ color: '#C9A84C', fontSize: 'clamp(0.55rem,2vw,0.7rem)', letterSpacing: '0.4em', fontWeight: 600, marginBottom: '20px', fontFamily: 'Raleway, sans-serif' }}>
          ✦ CLÍNICA ESTÉTICA DE LUJO ✦
        </p>

        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.8rem,10vw,6.5rem)', fontWeight: 700, color: '#F5F0E8', lineHeight: 1.05, marginBottom: '10px', letterSpacing: '-0.01em' }}>
          IMPERIUM
        </h1>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(0.9rem,3.5vw,2rem)', fontWeight: 400, color: '#C9A84C', letterSpacing: '0.45em', marginBottom: '24px' }}>
          LUX SPA
        </h2>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '1px', background: 'linear-gradient(90deg,transparent,#C9A84C)' }} />
          <div style={{ width: '5px', height: '5px', background: '#C9A84C', transform: 'rotate(45deg)' }} />
          <div style={{ width: '48px', height: '1px', background: 'linear-gradient(90deg,#C9A84C,transparent)' }} />
        </div>

        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(0.85rem,2.5vw,1.05rem)', color: 'rgba(245,240,232,0.7)', fontWeight: 300, letterSpacing: '0.03em', lineHeight: 1.8, marginBottom: '36px', maxWidth: '480px', margin: '0 auto 36px' }}>
          Descubre el arte del bienestar y la belleza. Tratamientos exclusivos diseñados para realzar tu elegancia natural.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', padding: '0 8px' }}>
          <Link to="/reservar" style={{ background: '#C9A84C', color: '#0A0A0A', padding: 'clamp(12px,3vw,16px) clamp(24px,6vw,40px)', fontSize: 'clamp(0.7rem,2vw,0.8rem)', letterSpacing: '0.18em', fontWeight: 700, borderRadius: '4px', textDecoration: 'none', fontFamily: 'Raleway, sans-serif', boxShadow: '0 0 28px rgba(201,168,76,0.2)', transition: 'all 0.3s', display: 'inline-block' }}>
            RESERVAR VISITA
          </Link>
          <a href="#servicios" style={{ background: 'transparent', color: '#F5F0E8', padding: 'clamp(12px,3vw,16px) clamp(24px,6vw,40px)', fontSize: 'clamp(0.7rem,2vw,0.8rem)', letterSpacing: '0.18em', fontWeight: 600, borderRadius: '4px', textDecoration: 'none', fontFamily: 'Raleway, sans-serif', border: '1px solid rgba(245,240,232,0.3)', transition: 'all 0.3s', display: 'inline-block' }}>
            VER SERVICIOS
          </a>
        </div>

        {/* Scroll indicator */}
        <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <p style={{ color: 'rgba(201,168,76,0.6)', fontSize: '0.6rem', letterSpacing: '0.3em', fontFamily: 'Raleway, sans-serif' }}>SCROLL</p>
          <div style={{ width: '1px', height: '32px', background: 'linear-gradient(180deg,#C9A84C,transparent)' }} />
        </div>
      </div>
    </section>
  );
}
