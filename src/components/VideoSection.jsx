import { useRef, useState, useEffect } from 'react';
import SectionDivider from './SectionDivider';
import { useSite } from '../utils/siteContent';
import { E } from './Editable';

// Sin autoplay con ahorro de datos, 2G/3G o "reducir movimiento": ahí solo arranca si la persona toca play.
function skipAutoplay() {
  const conn = navigator.connection;
  const slow = conn && (conn.saveData || /(^|-)(2g|3g)$/.test(conn.effectiveType || ''));
  return !!slow || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function VideoSection() {
  const { comunidad: t } = useSite();
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [visible, setVisible] = useState(false);

  // El video arranca solo, sin sonido, cuando la sección aparece en pantalla, y se pausa al salir
  // (así no gasta datos ni batería de fondo). Si el navegador lo bloquea, queda el botón de play.
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    const auto = !skipAutoplay();
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        if (auto && !userPaused.current) {
          video.muted = true;
          video.play().catch(() => {});
        }
      } else if (!video.paused) {
        video.pause();
      }
    }, { threshold: 0.35 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { userPaused.current = false; v.play().catch(() => {}); }
    else          { userPaused.current = true; v.pause(); }
  };

  const toggleSound = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  // Pantalla completa: en iPhone solo el propio video puede ir a pantalla completa (webkitEnterFullscreen).
  const goFullscreen = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    setMuted(false);
    v.play().catch(() => {});
    const box = v.parentElement;
    if (box.requestFullscreen) box.requestFullscreen().catch(() => v.webkitEnterFullscreen?.());
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    else if (box.webkitRequestFullscreen) box.webkitRequestFullscreen();
  };

  return (
    <section ref={sectionRef} style={{ background: 'var(--cream)', padding: 'clamp(60px,10vw,100px) 16px', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px,5vw,48px)' }}>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--gold-text)', fontSize: '0.72rem', letterSpacing: '0.22em', fontWeight: 700, marginBottom: '14px' }}><E path="comunidad.etiqueta" /></p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.8rem)', color: 'var(--ink)', fontWeight: 400, marginBottom: '18px' }}><E path="comunidad.titulo" /></h2>
          <SectionDivider margin="0 auto 14px" />
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: 'clamp(0.9rem,2vw,0.95rem)', lineHeight: 1.8, maxWidth: '440px', margin: '0 auto' }}>
            <E path="comunidad.texto" />
          </p>
        </div>

        {/* Video */}
        <div className="vid-box" onClick={toggle} style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border)', boxShadow: '0 20px 48px rgba(23,27,22,0.1)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
          <video ref={videoRef} src={t.videoUrl || "/imperium-video-web.mp4"} preload="metadata" muted loop playsInline aria-label="Video de agradecimiento a nuestra comunidad" onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)}
            style={{ width: '100%', display: 'block', maxHeight: 'clamp(240px,60vw,520px)', objectFit: 'cover', background: 'var(--forest)' }} />

          {/* Play overlay */}
          {!playing && (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'linear-gradient(180deg,rgba(23,27,22,0.1) 0%,rgba(23,27,22,0.45) 100%)' }}>
              <div style={{ width:'clamp(56px,12vw,72px)', height:'clamp(56px,12vw,72px)', borderRadius:'50%', background:'rgba(255,254,251,0.9)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--olive)" style={{ marginLeft:'3px' }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p style={{ fontFamily:'var(--font-sans)', color:'var(--cream)', fontSize:'clamp(0.65rem,1.5vw,0.75rem)', letterSpacing:'0.2em', fontWeight:600 }}>REPRODUCIR</p>
            </div>
          )}

          {/* Sonido: arranca silenciado; la persona puede activarlo */}
          {playing && (
            <button type="button" onClick={toggleSound} aria-label={muted ? 'Activar sonido' : 'Silenciar'}
              style={{ position:'absolute', bottom:'14px', left:'14px', background:'rgba(23,27,22,0.75)', border:'none', borderRadius:'6px', padding:'6px 12px', cursor:'pointer', color:'var(--cream)', fontFamily:'var(--font-sans)', fontSize:'0.65rem', letterSpacing:'0.1em' }}>
              {muted ? '🔇 ACTIVAR SONIDO' : '🔊 SILENCIAR'}
            </button>
          )}

          <button type="button" onClick={goFullscreen} aria-label="Ver en pantalla completa"
            style={{ position:'absolute', top:'14px', right:'14px', background:'rgba(23,27,22,0.75)', border:'none', borderRadius:'6px', padding:'6px 12px', cursor:'pointer', color:'var(--cream)', fontFamily:'var(--font-sans)', fontSize:'0.65rem', letterSpacing:'0.1em' }}>
            ⛶ PANTALLA COMPLETA
          </button>

          {/* Pause hint */}
          {playing && (
            <div style={{ position:'absolute', bottom:'14px', right:'14px', background:'rgba(23,27,22,0.75)', borderRadius:'6px', padding:'5px 10px' }}>
              <p style={{ fontFamily:'var(--font-sans)', color:'var(--cream)', fontSize:'0.65rem', letterSpacing:'0.1em', margin:0 }}>▐▐ PAUSAR</p>
            </div>
          )}
        </div>

        <p style={{ textAlign:'center', fontFamily:'var(--font-serif)', fontStyle: 'italic', color:'var(--ink-soft)', fontSize:'clamp(0.9rem,2vw,1.05rem)', marginTop:'28px' }}>
          "<E path="comunidad.frase" />"
        </p>
      </div>
    </section>
  );
}
