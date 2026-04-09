import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { label: 'Inicio',     to: '/' },
    { label: 'Servicios',  to: '/#servicios' },
    { label: 'Nosotros',   to: '/#nosotros' },
    { label: 'Ubicación',  to: '/#ubicacion' },
    { label: 'Contacto',   to: '/#contacto' },
  ];

  return (
    <nav style={{ fontFamily: 'Raleway, sans-serif', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', lineHeight: 1.1 }}>
          <span style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.08em', display: 'block' }}>IMPERIUM</span>
          <span style={{ color: '#F5F0E8', fontSize: '0.5rem', letterSpacing: '0.38em', fontWeight: 300, display: 'block' }}>LUX SPA</span>
        </Link>

        {/* Desktop links */}
        <ul style={{ display: 'flex', alignItems: 'center', gap: '24px', listStyle: 'none', margin: 0, padding: 0 }} className="desktop-nav">
          {links.map(l => (
            <li key={l.label}>
              <a href={l.to} style={{ color: '#F5F0E8', fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#C9A84C'}
                onMouseLeave={e => e.target.style.color = '#F5F0E8'}>
                {l.label.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA desktop */}
        <Link to="/reservar" className="desktop-nav"
          style={{ background: 'transparent', border: '1px solid #C9A84C', color: '#C9A84C', padding: '8px 18px', fontSize: '0.72rem', letterSpacing: '0.12em', fontWeight: 700, borderRadius: '4px', textDecoration: 'none', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.target.style.background = '#C9A84C'; e.target.style.color = '#0A0A0A'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#C9A84C'; }}>
          RESERVAR
        </Link>

        {/* Hamburger */}
        <button onClick={() => setOpen(!open)} className="mobile-nav"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}
          aria-label="Menú">
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#C9A84C', transition: 'all 0.3s', transform: open ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#C9A84C', transition: 'all 0.3s', opacity: open ? 0 : 1 }} />
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#C9A84C', transition: 'all 0.3s', transform: open ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: '#0A0A0A', borderTop: '1px solid rgba(201,168,76,0.15)', padding: '12px 16px 20px' }}>
          {links.map(l => (
            <a key={l.label} href={l.to} onClick={() => setOpen(false)}
              style={{ display: 'block', color: '#F5F0E8', padding: '12px 4px', fontSize: '0.85rem', letterSpacing: '0.1em', borderBottom: '1px solid rgba(201,168,76,0.08)', textDecoration: 'none' }}>
              {l.label.toUpperCase()}
            </a>
          ))}
          <Link to="/reservar" onClick={() => setOpen(false)}
            style={{ display: 'block', marginTop: '14px', textAlign: 'center', background: 'linear-gradient(135deg,#C9A84C,#9A7A2E)', color: '#0A0A0A', padding: '14px', borderRadius: '8px', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.85rem', textDecoration: 'none' }}>
            RESERVAR VISITA
          </Link>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) { .mobile-nav { display: none !important; } }
        @media (max-width: 767px) { .desktop-nav { display: none !important; } }
      `}</style>
    </nav>
  );
}
