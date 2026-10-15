import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../utils/siteContent';
// Va en public/ (URL fija) para poder precargarla desde index.html: es el elemento
// más grande de la portada y así arranca a bajar antes de que cargue el JavaScript.
const heroPoster = '/hero-poster.webp';

// El video de portada pesa varios MB: si se descargara junto con la página, en
// celular retrasaba todo lo demás (la foto principal aparecía a los ~12 s). Ahora
// la imagen se muestra al instante y el video empieza a bajar recién cuando la
// página terminó de cargar — y solo si la conexión lo permite (no con ahorro de
// datos, ni en 2G/3G, ni si la persona pidió menos movimiento).
// Sin autoplay con ahorro de datos, 2G/3G o "reducir movimiento": ahí el video
// solo arranca si la persona toca el botón de play.
function skipAutoplay() {
  const conn = navigator.connection;
  const slow = conn && (conn.saveData || /(^|-)(2g|3g)$/.test(conn.effectiveType || ''));
  return !!slow || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function HeroVideo({ poster = heroPoster, videoSrc = '/imperium-hero.mp4' }) {
  const videoRef = useRef(null);
  const imgRef = useRef(null);
  const started = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [needsTap, setNeedsTap] = useState(skipAutoplay);

  // Arranca el video (muteado, sin sonido). Si el navegador lo bloquea —por
  // ejemplo el modo de bajo consumo del iPhone— queda la foto con un botón de
  // play para que la persona lo inicie con un toque.
  const start = () => {
    const video = videoRef.current;
    if (!video || started.current) return;
    started.current = true;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', ''); // iOS lo exige como atributo para permitir el autoplay
    video.src = videoSrc;
    video.load();
    video.play().catch(() => setNeedsTap(true));
  };

  useEffect(() => {
    if (skipAutoplay()) return;

    // Espera solo a que la foto de portada esté lista (no a que termine de cargar
    // toda la página, que con el mapa puede tardar varios segundos).
    const timers = [];
    const img = imgRef.current;
    if (img?.complete) timers.push(setTimeout(start, 400));
    else img?.addEventListener('load', () => timers.push(setTimeout(start, 400)), { once: true });
    timers.push(setTimeout(start, 3500)); // por si la imagen tarda demasiado
    return () => timers.forEach(clearTimeout);
  }, []);

  const playNow = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!started.current) { start(); return; }
    video.muted = true;
    video.play().then(() => setNeedsTap(false)).catch(() => {});
  };

  return (
    <div onClick={playNow} style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: 'var(--border-soft)', cursor: playing ? 'default' : 'pointer' }}>
      <img ref={imgRef} src={poster} alt="Clínica Estética Imperium" width="720" height="1280" fetchPriority="high" decoding="async"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <video ref={videoRef} muted loop playsInline preload="none" onPlaying={() => { setPlaying(true); setNeedsTap(false); }} aria-label="Video de Clínica Estética Imperium"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: playing ? 1 : 0, transition: 'opacity 0.6s ease' }} />
      {needsTap && !playing && (
        <button type="button" onClick={e => { e.stopPropagation(); playNow(); }} aria-label="Reproducir video"
          style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '64px', height: '64px', borderRadius: '50%', border: 'none', background: 'rgba(255,254,251,0.92)', boxShadow: '0 8px 24px rgba(23,27,22,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--olive)" style={{ marginLeft: '3px' }}><path d="M8 5v14l11-7z" /></svg>
        </button>
      )}
    </div>
  );
}

const FEATURE_ICONS = [
  (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="1.4">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  ),
  (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="1.4">
      <circle cx="12" cy="12" r="2.4" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
    </svg>
  ),
  (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="1.4">
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 3h6v2H9z" />
      <path d="M8.5 12.5l2 2 4-4.5" />
    </svg>
  ),
];

export default function Hero() {
  const { hero } = useSite();
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
              <p style={{ color: 'var(--gold-text)', fontSize: '0.72rem', letterSpacing: '0.22em', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>
                {hero.etiqueta}
              </p>
            </div>

            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem,5.5vw,3.4rem)', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.15, marginBottom: '22px' }}>
              {hero.titulo}
            </h1>

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', color: 'var(--ink-soft)', lineHeight: 1.8, marginBottom: '32px', maxWidth: '440px' }}>
              {hero.texto}
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/reservar" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--olive)', color: 'var(--cream)', padding: '15px 28px', fontSize: '0.9rem', fontWeight: 600, borderRadius: '8px', textDecoration: 'none', fontFamily: 'var(--font-sans)', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--olive-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--olive)'}>
                {hero.botonPrincipal}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
              <a href="#servicios" style={{ display: 'inline-flex', alignItems: 'center', background: 'transparent', color: 'var(--ink)', padding: '15px 28px', fontSize: '0.9rem', fontWeight: 600, borderRadius: '8px', textDecoration: 'none', fontFamily: 'var(--font-sans)', border: '1px solid var(--border)' }}>
                {hero.botonSecundario}
              </a>
            </div>

            <p style={{ marginTop: '28px', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--ink-soft)', letterSpacing: '0.02em' }}>
              {hero.nota}
            </p>
          </div>

          {/* Image */}
          <div style={{ position: 'relative' }}>
            <div aria-hidden="true" style={{
              position: 'absolute', inset: '16px -16px -16px 16px', borderRadius: '20px',
              border: '1.5px solid var(--gold-accent)', zIndex: 0,
            }} />
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(23,27,22,0.14)', zIndex: 1 }}>
              <HeroVideo key={`${hero.imagenUrl}|${hero.videoUrl}`} poster={hero.imagenUrl || heroPoster} videoSrc={hero.videoUrl || '/imperium-hero.mp4'} />
            </div>
          </div>
        </div>

        {/* Features strip */}
        <div style={{ marginTop: 'clamp(48px,8vw,72px)', background: 'var(--border-soft)', borderRadius: '18px', padding: 'clamp(24px,4vw,36px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '28px' }}>
            {hero.destacados.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0 }}>{FEATURE_ICONS[i % FEATURE_ICONS.length]}</div>
                <div>
                  <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>{f.titulo}</p>
                  <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.85rem', lineHeight: 1.6 }}>{f.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
