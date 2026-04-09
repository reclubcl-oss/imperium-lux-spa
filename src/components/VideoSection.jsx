import { useRef, useState, useEffect } from 'react';

export default function VideoSection() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);

  // Fade in on scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else          { v.pause(); setPlaying(false); }
  };

  return (
    <section style={{
      background: '#0A0A0A',
      padding: '100px 24px',
      borderTop: '1px solid rgba(201,168,76,0.08)',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <p style={{
            fontFamily: 'Raleway, sans-serif',
            color: '#C9A84C',
            fontSize: '0.68rem',
            letterSpacing: '0.45em',
            fontWeight: 600,
            marginBottom: '16px',
          }}>
            ✦ NUESTRA COMUNIDAD ✦
          </p>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            color: '#F5F0E8',
            fontWeight: 700,
            marginBottom: '20px',
          }}>
            Gracias por su Confianza
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '1px', background: '#C9A84C' }} />
            <div style={{ width: '5px', height: '5px', background: '#C9A84C', transform: 'rotate(45deg)' }} />
            <div style={{ width: '40px', height: '1px', background: '#C9A84C' }} />
          </div>
          <p style={{
            fontFamily: 'Raleway, sans-serif',
            color: 'rgba(245,240,232,0.55)',
            fontSize: '0.95rem',
            lineHeight: 1.8,
            maxWidth: '480px',
            margin: '0 auto',
          }}>
            Cada cliente es parte de nuestra familia. Gracias por acompañarnos y por todas las lindas energías.
          </p>
        </div>

        {/* Video container */}
        <div
          onClick={toggle}
          style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            cursor: 'pointer',
            border: '1px solid rgba(201,168,76,0.25)',
            boxShadow: '0 0 60px rgba(201,168,76,0.08), 0 24px 60px rgba(0,0,0,0.5)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(32px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}
        >
          <video
            ref={videoRef}
            src="/imperium-video.mp4"
            playsInline
            onEnded={() => setPlaying(false)}
            style={{
              width: '100%',
              display: 'block',
              maxHeight: '560px',
              objectFit: 'cover',
              background: '#000',
            }}
          />

          {/* Gold corner accents */}
          {[
            { top: 0, left: 0, borderTop: '2px solid #C9A84C', borderLeft: '2px solid #C9A84C', borderRadius: '16px 0 0 0' },
            { top: 0, right: 0, borderTop: '2px solid #C9A84C', borderRight: '2px solid #C9A84C', borderRadius: '0 16px 0 0' },
            { bottom: 0, left: 0, borderBottom: '2px solid #C9A84C', borderLeft: '2px solid #C9A84C', borderRadius: '0 0 0 16px' },
            { bottom: 0, right: 0, borderBottom: '2px solid #C9A84C', borderRight: '2px solid #C9A84C', borderRadius: '0 0 16px 0' },
          ].map((style, i) => (
            <div key={i} style={{ position: 'absolute', width: '28px', height: '28px', ...style }} />
          ))}

          {/* Play / Pause overlay */}
          {!playing && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.6) 100%)',
            }}>
              {/* Play button */}
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(201,168,76,0.15)',
                border: '2px solid #C9A84C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.3s',
                marginBottom: '16px',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#C9A84C" style={{ marginLeft: '4px' }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p style={{
                fontFamily: 'Raleway, sans-serif',
                color: '#F5F0E8',
                fontSize: '0.72rem',
                letterSpacing: '0.3em',
                fontWeight: 600,
              }}>
                REPRODUCIR
              </p>
            </div>
          )}

          {/* Pause indicator (shows briefly on click) */}
          {playing && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              background: 'rgba(10,10,10,0.6)',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: '6px',
              padding: '6px 12px',
              backdropFilter: 'blur(8px)',
            }}>
              <p style={{
                fontFamily: 'Raleway, sans-serif',
                color: '#C9A84C',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                margin: 0,
              }}>
                ▐▐ PAUSAR
              </p>
            </div>
          )}
        </div>

        {/* Bottom quote */}
        <p style={{
          textAlign: 'center',
          fontFamily: 'Playfair Display, serif',
          color: 'rgba(201,168,76,0.5)',
          fontSize: '1rem',
          fontStyle: 'italic',
          marginTop: '36px',
          letterSpacing: '0.03em',
        }}>
          "Gracias a cada uno de ustedes por acompañarnos"
        </p>
      </div>
    </section>
  );
}
