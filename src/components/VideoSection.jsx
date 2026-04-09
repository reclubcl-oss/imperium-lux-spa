import { useRef, useState, useEffect } from 'react';

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
    <section ref={sectionRef} style={{ background: '#0A0A0A', padding: 'clamp(60px,10vw,100px) 16px', borderTop: '1px solid rgba(201,168,76,0.08)' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px,5vw,48px)' }}>
          <p style={{ fontFamily: 'Raleway, sans-serif', color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', fontWeight: 600, marginBottom: '14px' }}>✦ NUESTRA COMUNIDAD ✦</p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.6rem,5vw,2.8rem)', color: '#F5F0E8', fontWeight: 700, marginBottom: '18px' }}>Gracias por su Confianza</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '36px', height: '1px', background: '#C9A84C' }} />
            <div style={{ width: '4px', height: '4px', background: '#C9A84C', transform: 'rotate(45deg)' }} />
            <div style={{ width: '36px', height: '1px', background: '#C9A84C' }} />
          </div>
          <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.55)', fontSize: 'clamp(0.82rem,2vw,0.95rem)', lineHeight: 1.8, maxWidth: '440px', margin: '0 auto' }}>
            Cada cliente es parte de nuestra familia. Gracias por acompañarnos y por todas las lindas energías.
          </p>
        </div>

        {/* Video */}
        <div onClick={toggle} style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(201,168,76,0.2)', boxShadow: '0 0 48px rgba(201,168,76,0.07), 0 20px 48px rgba(0,0,0,0.5)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
          <video ref={videoRef} src="/imperium-video.mp4" playsInline onEnded={() => setPlaying(false)}
            style={{ width: '100%', display: 'block', maxHeight: 'clamp(240px,60vw,520px)', objectFit: 'cover', background: '#000' }} />

          {/* Corners */}
          {[
            { top:0, left:0, borderTop:'2px solid #C9A84C', borderLeft:'2px solid #C9A84C', borderRadius:'14px 0 0 0' },
            { top:0, right:0, borderTop:'2px solid #C9A84C', borderRight:'2px solid #C9A84C', borderRadius:'0 14px 0 0' },
            { bottom:0, left:0, borderBottom:'2px solid #C9A84C', borderLeft:'2px solid #C9A84C', borderRadius:'0 0 0 14px' },
            { bottom:0, right:0, borderBottom:'2px solid #C9A84C', borderRight:'2px solid #C9A84C', borderRadius:'0 0 14px 0' },
          ].map((s, i) => <div key={i} style={{ position:'absolute', width:'24px', height:'24px', ...s }} />)}

          {/* Play overlay */}
          {!playing && (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'linear-gradient(180deg,rgba(10,10,10,0.25) 0%,rgba(10,10,10,0.55) 100%)' }}>
              <div style={{ width:'clamp(56px,12vw,72px)', height:'clamp(56px,12vw,72px)', borderRadius:'50%', background:'rgba(201,168,76,0.15)', border:'2px solid #C9A84C', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)', marginBottom:'12px' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#C9A84C" style={{ marginLeft:'3px' }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p style={{ fontFamily:'Raleway, sans-serif', color:'#F5F0E8', fontSize:'clamp(0.6rem,1.5vw,0.72rem)', letterSpacing:'0.28em', fontWeight:600 }}>REPRODUCIR</p>
            </div>
          )}

          {/* Pause hint */}
          {playing && (
            <div style={{ position:'absolute', bottom:'14px', right:'14px', background:'rgba(10,10,10,0.65)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:'6px', padding:'5px 10px', backdropFilter:'blur(8px)' }}>
              <p style={{ fontFamily:'Raleway, sans-serif', color:'#C9A84C', fontSize:'0.62rem', letterSpacing:'0.2em', margin:0 }}>▐▐ PAUSAR</p>
            </div>
          )}
        </div>

        <p style={{ textAlign:'center', fontFamily:'Playfair Display, serif', color:'rgba(201,168,76,0.5)', fontSize:'clamp(0.85rem,2vw,1rem)', fontStyle:'italic', marginTop:'28px', letterSpacing:'0.03em' }}>
          "Gracias a cada uno de ustedes por acompañarnos"
        </p>
      </div>
    </section>
  );
}
