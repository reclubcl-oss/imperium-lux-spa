import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="contacto" style={{ background: '#080808', borderTop: '1px solid rgba(201,168,76,0.15)', padding: 'clamp(40px,8vw,64px) 16px 28px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: 'clamp(28px,5vw,48px)', marginBottom: '40px' }}>

          {/* Brand */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.08em' }}>IMPERIUM</p>
              <p style={{ fontFamily: 'Raleway, sans-serif', color: '#F5F0E8', fontSize: '0.55rem', letterSpacing: '0.38em', fontWeight: 300 }}>LUX SPA</p>
            </div>
            <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.5)', fontSize: '0.82rem', lineHeight: 1.8 }}>
              Clínica estética de lujo donde la ciencia y la belleza se fusionan para revelar tu mejor versión.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontFamily: 'Raleway, sans-serif', color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.28em', fontWeight: 600, marginBottom: '16px' }}>NAVEGACIÓN</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[['Inicio','/'],['Servicios','/#servicios'],['Reservar','/reservar'],['Ubicación','/#ubicacion'],['Contacto','/#contacto']].map(([label,href]) => (
                <li key={label}>
                  <a href={href} style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.6)', fontSize: '0.82rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#C9A84C'}
                    onMouseLeave={e => e.target.style.color = 'rgba(245,240,232,0.6)'}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: 'Raleway, sans-serif', color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.28em', fontWeight: 600, marginBottom: '16px' }}>CONTACTO</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: '📍', text: '2 Oriente 124, Viña del Mar' },
                { icon: '📞', text: '+56 9 XXXX XXXX' },
                { icon: '✉️', text: 'contacto@imperiumluxspa.com' },
                { icon: '🕐', text: 'Lun – Sáb: 9:00 – 20:00' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '0.82rem', flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.6)', fontSize: '0.82rem', lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 style={{ fontFamily: 'Raleway, sans-serif', color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.28em', fontWeight: 600, marginBottom: '16px' }}>REDES SOCIALES</h4>
            <a href="https://www.instagram.com/clinica.estetica.imperium" target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#F5F0E8', padding: '10px 14px', borderRadius: '8px', textDecoration: 'none', fontFamily: 'Raleway, sans-serif', fontSize: '0.78rem', transition: 'all 0.2s', wordBreak: 'break-all' }}
              onMouseEnter={e => { e.currentTarget.style.border = '1px solid #C9A84C'; e.currentTarget.style.color = '#C9A84C'; }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(201,168,76,0.2)'; e.currentTarget.style.color = '#F5F0E8'; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @clinica.estetica.imperium
            </a>
            <div style={{ marginTop: '20px' }}>
              <Link to="/reservar" style={{ display: 'inline-block', background: '#C9A84C', color: '#0A0A0A', padding: '12px 24px', fontSize: '0.72rem', letterSpacing: '0.15em', fontWeight: 700, borderRadius: '4px', textDecoration: 'none', fontFamily: 'Raleway, sans-serif' }}>
                RESERVAR AHORA
              </Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(201,168,76,0.1)', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.3)', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
            © {new Date().getFullYear()} Imperium Lux Spa. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
