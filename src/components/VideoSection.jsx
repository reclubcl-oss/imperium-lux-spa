import { useRef, useState, useEffect } from 'react';
import SectionDivider from './SectionDivider';

export default function VideoSection() {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else          { v.pause(); setPlaying(false); }
  };

  return (
    <section ref={sectionRef} style={{ background: 'var(--cream)', padding: 'clamp(60px,10vw,100px) 16px', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px,5vw,48px)' }}>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--gold-text)', fontSize: '0.72rem', letterSpacing: '0.22em', fontWeight: 700, marginBottom: '14px' }}>NUESTRA COMUNIDAD</p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.8rem)', color: 'var(--ink)', fontWeight: 400, marginBottom: '18px' }}>Gracias por su Confianza</h2>
          <SectionDivider margin="0 auto 14px" />
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: 'clamp(0.9rem,2vw,0.95rem)', lineHeight: 1.8, maxWidth: '440px', margin: '0 auto' }}>
            Cada cliente es parte de nuestra familia. Gracias por acompañarnos y por todas las lindas energías.
          </p>
        </div>

        {/* Video */}
        <div onClick={toggle} style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border)', boxShadow: '0 20px 48px rgba(23,27,22,0.1)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
          <video ref={videoRef} src="/imperium-video-web.mp4" preload="none" playsInline onEnded={() => setPlaying(false)}
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

          {/* Pause hint */}
          {playing && (
            <div style={{ position:'absolute', bottom:'14px', right:'14px', background:'rgba(23,27,22,0.75)', borderRadius:'6px', padding:'5px 10px' }}>
              <p style={{ fontFamily:'var(--font-sans)', color:'var(--cream)', fontSize:'0.65rem', letterSpacing:'0.1em', margin:0 }}>▐▐ PAUSAR</p>
            </div>
          )}
        </div>

        <p style={{ textAlign:'center', fontFamily:'var(--font-serif)', fontStyle: 'italic', color:'var(--ink-soft)', fontSize:'clamp(0.9rem,2vw,1.05rem)', marginTop:'28px' }}>
          "Gracias a cada uno de ustedes por acompañarnos"
        </p>
      </div>
    </section>
  );
}
