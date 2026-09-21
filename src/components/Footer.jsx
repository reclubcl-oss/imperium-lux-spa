import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/brand/logo.png';

export default function Footer() {
  const navigate = useNavigate();

  // Mismo arreglo que en Navbar: los links "/#seccion" deben funcionar parado
  // en cualquier página, sin recargar todo el sitio.
  const handleAnchorClick = (e, to) => {
    if (!to.includes('#')) return;
    e.preventDefault();
    const [path, id] = to.split('#');
    const targetPath = path || '/';
    if (window.location.pathname === targetPath) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', `${targetPath}#${id}`);
    } else {
      navigate(`${targetPath}#${id}`);
    }
  };

  return (
    <footer id="contacto" style={{ background: 'var(--forest)', padding: 'clamp(48px,8vw,72px) 16px 28px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: 'clamp(28px,5vw,48px)', marginBottom: '40px' }}>

          {/* Brand */}
          <div>
            <div style={{ background: 'var(--cream)', borderRadius: '12px', padding: '14px 20px', display: 'inline-block', marginBottom: '18px' }}>
              <img src={logo} alt="Clínica Estética Imperium" style={{ height: '48px', width: 'auto', display: 'block' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,254,251,0.65)', fontSize: '0.85rem', lineHeight: 1.8 }}>
              Estética avanzada con atención personalizada en Viña del Mar.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--cream)', fontSize: '1.05rem', fontWeight: 400, marginBottom: '16px' }}>Enlaces</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[['Inicio','/'],['Servicios','/#servicios'],['Reservar','/reservar'],['Fidelidad','/#fidelidad'],['Ubicación','/#ubicacion'],['Contacto','/#contacto']].map(([label,href]) => (
                <li key={label}>
                  <a href={href} onClick={e => handleAnchorClick(e, href)} style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,254,251,0.65)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--gold-accent)'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,254,251,0.65)'}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--cream)', fontSize: '1.05rem', fontWeight: 400, marginBottom: '16px' }}>Contacto</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: '📍', text: '2 Oriente 124, Viña del Mar' },
                { icon: '📞', text: '+56 9 7149 4060' },
                { icon: '✉️', text: 'contacto@imperiumluxspa.com' },
                { icon: '🕐', text: 'Lun–Vie 9:00–20:00 · Sáb 9:00–18:00' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '0.82rem', flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,254,251,0.65)', fontSize: '0.85rem', lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--cream)', fontSize: '1.05rem', fontWeight: 400, marginBottom: '16px' }}>Redes Sociales</h4>
            <a href="https://www.instagram.com/clinica.estetica.imperium" target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '50%', border: '1px solid rgba(255,254,251,0.3)', color: 'var(--cream)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-accent)'; e.currentTarget.style.color = 'var(--gold-accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,254,251,0.3)'; e.currentTarget.style.color = 'var(--cream)'; }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <div style={{ marginTop: '18px' }}>
              <Link to="/reservar" style={{ display: 'inline-block', background: 'var(--gold-accent)', color: 'var(--forest)', padding: '12px 24px', fontSize: '0.82rem', fontWeight: 700, borderRadius: '8px', textDecoration: 'none', fontFamily: 'var(--font-sans)' }}>
                Reservar ahora
              </Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,254,251,0.12)', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,254,251,0.4)', fontSize: '0.78rem' }}>
            © {new Date().getFullYear()} Clínica Estética Imperium. Todos los derechos reservados.
            {' · '}
            <Link to="/privacidad" style={{ color: 'rgba(255,254,251,0.4)', textDecoration: 'underline' }}>Política de privacidad</Link>
            {' · '}
            <Link to="/creditos" style={{ color: 'rgba(255,254,251,0.4)', textDecoration: 'underline' }}>Créditos de fotografías</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
