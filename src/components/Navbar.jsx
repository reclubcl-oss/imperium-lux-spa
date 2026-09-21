import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/brand/logo.png';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { label: 'Inicio',     to: '/' },
    { label: 'Servicios',  to: '/#servicios' },
    { label: 'Nosotros',   to: '/#nosotros' },
    { label: 'Contacto',   to: '/#contacto' },
  ];

  // Los links "/#seccion" deben funcionar igual de bien parado en Home que
  // desde cualquier otra página, sin recargar todo el sitio (evita, entre
  // otras cosas, que el video del Hero se reinicie por nada).
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
    <nav style={{ fontFamily: 'var(--font-sans)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(255,254,251,0.97)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Clínica Estética Imperium" style={{ height: '52px', width: 'auto', display: 'block' }} />
        </Link>

        {/* Desktop links */}
        <ul style={{ display: 'flex', alignItems: 'center', gap: '28px', listStyle: 'none', margin: 0, padding: 0 }} className="desktop-nav">
          {links.map(l => (
            <li key={l.label}>
              <a href={l.to} onClick={e => handleAnchorClick(e, l.to)} style={{ color: 'var(--ink)', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--olive)'}
                onMouseLeave={e => e.target.style.color = 'var(--ink)'}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA desktop */}
        <Link to="/reservar" className="desktop-nav"
          style={{ background: 'var(--olive)', border: '1px solid var(--olive)', color: 'var(--cream)', padding: '10px 22px', fontSize: '0.82rem', fontWeight: 600, borderRadius: '8px', textDecoration: 'none', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.target.style.background = 'var(--olive-light)'; }}
          onMouseLeave={e => { e.target.style.background = 'var(--olive)'; }}>
          Reservar
        </Link>

        {/* Hamburger */}
        <button onClick={() => setOpen(!open)} className="mobile-nav"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}
          aria-label="Menú">
          <span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--ink)', transition: 'all 0.3s', transform: open ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
          <span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--ink)', transition: 'all 0.3s', opacity: open ? 0 : 1 }} />
          <span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--ink)', transition: 'all 0.3s', transform: open ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: 'var(--cream)', borderTop: '1px solid var(--border)', padding: '12px 16px 20px' }}>
          {links.map(l => (
            <a key={l.label} href={l.to} onClick={e => { setOpen(false); handleAnchorClick(e, l.to); }}
              style={{ display: 'block', color: 'var(--ink)', padding: '12px 4px', fontSize: '0.9rem', borderBottom: '1px solid var(--border-soft)', textDecoration: 'none' }}>
              {l.label}
            </a>
          ))}
          <Link to="/reservar" onClick={() => setOpen(false)}
            style={{ display: 'block', marginTop: '14px', textAlign: 'center', background: 'var(--olive)', color: 'var(--cream)', padding: '14px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
            Reservar visita
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
