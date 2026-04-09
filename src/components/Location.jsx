export default function Location() {
  return (
    <section id="ubicacion" style={{ background: '#0A0A0A', padding: 'clamp(60px,10vw,100px) 16px', borderTop: '1px solid rgba(201,168,76,0.08)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,6vw,52px)' }}>
          <p style={{ fontFamily: 'Raleway, sans-serif', color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', fontWeight: 600, marginBottom: '14px' }}>✦ ENCUÉNTRANOS ✦</p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.6rem,5vw,2.8rem)', color: '#F5F0E8', fontWeight: 700, marginBottom: '18px' }}>Nuestra Ubicación</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '1px', background: '#C9A84C' }} />
            <div style={{ width: '4px', height: '4px', background: '#C9A84C', transform: 'rotate(45deg)' }} />
            <div style={{ width: '36px', height: '1px', background: '#C9A84C' }} />
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 'clamp(20px,4vw,40px)', alignItems: 'start' }}>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Address */}
            <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', padding: 'clamp(16px,3vw,24px)' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', minWidth: '36px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1rem' }}>📍</span>
                </div>
                <div>
                  <p style={{ fontFamily: 'Raleway, sans-serif', color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.2em', fontWeight: 600, marginBottom: '6px' }}>DIRECCIÓN</p>
                  <p style={{ fontFamily: 'Raleway, sans-serif', color: '#F5F0E8', fontSize: '0.9rem', lineHeight: 1.7 }}>
                    2 Oriente 124<br />Viña del Mar, Valparaíso<br />Chile
                  </p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', padding: 'clamp(16px,3vw,24px)' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', minWidth: '36px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1rem' }}>🕐</span>
                </div>
                <div style={{ width: '100%' }}>
                  <p style={{ fontFamily: 'Raleway, sans-serif', color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.2em', fontWeight: 600, marginBottom: '10px' }}>HORARIOS</p>
                  {[
                    { day: 'Lunes – Viernes', hours: '9:00 – 20:00' },
                    { day: 'Sábado',          hours: '9:00 – 18:00' },
                    { day: 'Domingo',         hours: 'Cerrado' },
                  ].map(({ day, hours }) => (
                    <div key={day} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(201,168,76,0.07)', paddingBottom: '7px', marginBottom: '7px' }}>
                      <span style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.6)', fontSize: '0.82rem' }}>{day}</span>
                      <span style={{ fontFamily: 'Raleway, sans-serif', color: hours === 'Cerrado' ? 'rgba(245,240,232,0.3)' : '#F5F0E8', fontSize: '0.82rem', fontWeight: 600 }}>{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <a href="https://www.google.com/maps/place/2+Ote.+124,+2520784+Vi%C3%B1a+del+Mar,+Valpara%C3%ADso" target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'transparent', border: '1px solid #C9A84C', color: '#C9A84C', padding: '13px 20px', borderRadius: '6px', fontFamily: 'Raleway, sans-serif', fontSize: '0.76rem', letterSpacing: '0.15em', fontWeight: 700, textDecoration: 'none', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#C9A84C'; e.currentTarget.style.color = '#0A0A0A'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C9A84C'; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              CÓMO LLEGAR
            </a>
          </div>

          {/* Map */}
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(201,168,76,0.2)', boxShadow: '0 0 40px rgba(201,168,76,0.06)', position: 'relative' }}>
            {[
              { top:0, left:0, borderTop:'2px solid #C9A84C', borderLeft:'2px solid #C9A84C', borderRadius:'16px 0 0 0' },
              { top:0, right:0, borderTop:'2px solid #C9A84C', borderRight:'2px solid #C9A84C', borderRadius:'0 16px 0 0' },
              { bottom:0, left:0, borderBottom:'2px solid #C9A84C', borderLeft:'2px solid #C9A84C', borderRadius:'0 0 0 16px' },
              { bottom:0, right:0, borderBottom:'2px solid #C9A84C', borderRight:'2px solid #C9A84C', borderRadius:'0 0 16px 0' },
            ].map((s, i) => (
              <div key={i} style={{ position:'absolute', width:'22px', height:'22px', zIndex:2, ...s }} />
            ))}
            <iframe
              title="Imperium Lux Spa – Ubicación"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3330.!2d-71.5365!3d-33.0245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9689dddfd649e6c9%3A0xe2034a9dc8967882!2s2%20Ote.%20124%2C%20Vi%C3%B1a%20del%20Mar%2C%20Valpara%C3%ADso!5e0!3m2!1ses!2scl!4v1712600000000!5m2!1ses!2scl"
              width="100%"
              style={{ border: 0, display: 'block', filter: 'grayscale(0.3) contrast(1.1)', aspectRatio: '4/3', minHeight: '280px' }}
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
