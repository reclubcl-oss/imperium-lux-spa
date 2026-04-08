import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = [
    { label: 'Inicio', to: '/' },
    { label: 'Servicios', to: '/#servicios' },
    { label: 'Nosotros', to: '/#nosotros' },
    { label: 'Contacto', to: '/#contacto' },
  ];

  return (
    <nav
      style={{ fontFamily: 'Raleway, sans-serif' }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-[#C9A84C]/20"
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex flex-col leading-none">
          <span
            style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.08em' }}
          >
            IMPERIUM
          </span>
          <span
            style={{ color: '#F5F0E8', fontSize: '0.6rem', letterSpacing: '0.35em', fontWeight: 300 }}
          >
            LUX SPA
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.to}
                style={{ color: '#F5F0E8', fontSize: '0.85rem', letterSpacing: '0.1em', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#C9A84C'}
                onMouseLeave={e => e.target.style.color = '#F5F0E8'}
              >
                {l.label.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <Link
          to="/reservar"
          style={{
            display: 'none',
            background: 'transparent',
            border: '1px solid #C9A84C',
            color: '#C9A84C',
            padding: '8px 20px',
            fontSize: '0.78rem',
            letterSpacing: '0.12em',
            fontWeight: 600,
            borderRadius: '4px',
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          className="md:block"
          onMouseEnter={e => { e.target.style.background = '#C9A84C'; e.target.style.color = '#0A0A0A'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#C9A84C'; }}
        >
          RESERVAR
        </Link>
        <Link
          to="/reservar"
          style={{
            background: 'transparent',
            border: '1px solid #C9A84C',
            color: '#C9A84C',
            padding: '8px 20px',
            fontSize: '0.78rem',
            letterSpacing: '0.12em',
            fontWeight: 600,
            borderRadius: '4px',
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          className="hidden md:inline-block"
        >
          RESERVAR
        </Link>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#C9A84C', transition: 'all 0.3s', transform: open ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#C9A84C', transition: 'all 0.3s', opacity: open ? 0 : 1 }} />
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#C9A84C', transition: 'all 0.3s', transform: open ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: '#0A0A0A', borderTop: '1px solid #C9A84C22', padding: '16px 24px' }}>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.to}
              onClick={() => setOpen(false)}
              style={{ display: 'block', color: '#F5F0E8', padding: '10px 0', fontSize: '0.9rem', letterSpacing: '0.1em', borderBottom: '1px solid #C9A84C11', textDecoration: 'none' }}
            >
              {l.label.toUpperCase()}
            </a>
          ))}
          <Link
            to="/reservar"
            onClick={() => setOpen(false)}
            style={{ display: 'block', marginTop: '16px', textAlign: 'center', background: '#C9A84C', color: '#0A0A0A', padding: '12px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.85rem', textDecoration: 'none' }}
          >
            RESERVAR VISITA
          </Link>
        </div>
      )}
    </nav>
  );
}
