import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/brand/logo.png';
import heroPoster from '../assets/brand/hero.jpg';
import { getActiveLinks } from '../utils/links';

// Landing tipo "link in bio" para poner en la descripción de Instagram —
// una sola página, sin navbar ni footer: video de fondo difuminado + logo +
// botones. Pensada para abrirse casi siempre desde el celular.
export default function LinkHub() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getActiveLinks().then(({ data }) => { setLinks(data || []); setLoading(false); });
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // Reforzamos el autoplay a mano en vez de confiar solo en los atributos:
    // en varios navegadores de celular (sobre todo el navegador interno de
    // Instagram/apps) el atributo `muted` puesto por React a veces no se
    // aplica a tiempo para que el navegador apruebe el autoplay — seteando
    // la propiedad directo por JS antes de pedir play() es más confiable.
    v.muted = true;
    v.playsInline = true;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();

    // Si el navegador bloqueó el autoplay por política (no por error real),
    // el primer toque del visitante en cualquier parte de la página —
    // altamente probable, ya que toda la página son botones — sí cuenta como
    // gesto del usuario y ahí SIEMPRE se permite reproducir.
    const onFirstTouch = () => { tryPlay(); document.removeEventListener('touchstart', onFirstTouch); document.removeEventListener('click', onFirstTouch); };
    document.addEventListener('touchstart', onFirstTouch, { once: true, passive: true });
    document.addEventListener('click', onFirstTouch, { once: true });
    return () => {
      document.removeEventListener('touchstart', onFirstTouch);
      document.removeEventListener('click', onFirstTouch);
    };
  }, [videoFailed]);

  const handleClick = (e, url) => {
    if (url.startsWith('http')) return; // enlace externo: comportamiento normal (pestaña nueva)
    e.preventDefault();
    if (url.startsWith('/#')) {
      const id = url.slice(2);
      if (window.location.pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', `/#${id}`);
        return;
      }
    }
    navigate(url);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: 'var(--forest)' }}>

      {/* Video de fondo. Usa una versión propia comprimida (~5MB vs. los 18MB
          del original, a 30fps para que el movimiento se vea fluido) — en
          /link se ve borroso igual, así que no hace falta la calidad completa,
          y así carga rápido en celular/datos móviles.
          El difuminado se hace con un `div` de `backdrop-filter` ENCIMA del
          video (no con `filter` directo sobre el <video>): aplicar `filter`
          a un <video> falla en varios navegadores de celular (Safari/WebView
          de iOS, el navegador interno de Instagram) y el video no se ve —
          esa era la causa real de que "no cargara". */}
      {videoFailed ? (
        <img src={heroPoster} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <video
          ref={videoRef}
          autoPlay muted loop playsInline preload="auto" poster={heroPoster} src="/imperium-video-bg.mp4" aria-hidden="true"
          onError={() => setVideoFailed(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(14px) brightness(0.85) saturate(1.15)', WebkitBackdropFilter: 'blur(14px) brightness(0.85) saturate(1.15)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,26,14,0.35) 0%, rgba(15,26,14,0.45) 45%, rgba(15,26,14,0.7) 100%)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', maxWidth: '140vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(181,146,77,0.18), transparent 68%)' }} />

      {/* Contenido */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: 'clamp(56px,12vw,84px) 20px 40px' }}>
        <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center', animation: 'linkHubFadeIn 0.6s ease' }}>

          <div style={{ width: '92px', height: '92px', borderRadius: '50%', background: 'var(--cream)', margin: '0 auto 22px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.35)', border: '1px solid rgba(181,146,77,0.5)' }}>
            <img src={logo} alt="Clínica Estética Imperium" style={{ width: '68px', height: '68px', objectFit: 'contain', display: 'block' }} />
          </div>

          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--gold-accent)', fontSize: '0.68rem', letterSpacing: '0.28em', fontWeight: 700, marginBottom: '10px' }}>
            CLÍNICA ESTÉTICA
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--cream)', fontSize: 'clamp(1.5rem,6vw,1.9rem)', fontWeight: 400, marginBottom: '10px', letterSpacing: '0.01em' }}>
            Imperium
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,254,251,0.68)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '32px' }}>
            Estética avanzada con atención personalizada en Viña del Mar.
          </p>

          {loading ? (
            <p style={{ color: 'rgba(255,254,251,0.6)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem' }}>Cargando...</p>
          ) : links.length === 0 ? (
            <p style={{ color: 'rgba(255,254,251,0.6)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem' }}>Muy pronto vas a encontrar acá nuestros enlaces.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {links.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  onClick={e => handleClick(e, link.url)}
                  target={link.url.startsWith('http') ? '_blank' : undefined}
                  rel={link.url.startsWith('http') ? 'noreferrer' : undefined}
                  className="linkhub-btn"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    background: 'rgba(15,26,14,0.4)',
                    border: '1px solid rgba(255,254,251,0.3)',
                    borderRadius: '99px',
                    padding: '17px 24px',
                    textDecoration: 'none',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--cream)', fontWeight: 600, fontSize: '0.92rem', letterSpacing: '0.01em' }}>{link.titulo}</span>
                </a>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '40px 0 16px' }}>
            <div style={{ width: '28px', height: '1px', background: 'rgba(181,146,77,0.5)' }} />
            <div style={{ width: '4px', height: '4px', background: 'var(--gold-accent)', transform: 'rotate(45deg)' }} />
            <div style={{ width: '28px', height: '1px', background: 'rgba(181,146,77,0.5)' }} />
          </div>

          <p style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,254,251,0.45)', fontSize: '0.7rem' }}>
            © {new Date().getFullYear()} Clínica Estética Imperium
          </p>
        </div>
      </div>

      <style>{`
        @keyframes linkHubFadeIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .linkhub-btn { transition: background 0.25s, border-color 0.25s, transform 0.25s; }
        .linkhub-btn:hover { background: rgba(15,26,14,0.6); border-color: var(--gold-accent); transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
