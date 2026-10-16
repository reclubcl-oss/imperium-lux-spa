import { Link } from 'react-router-dom';
import { E } from './Editable';

const icon = (d) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);

const ITEMS = [
  { path: 'contacto.horarioResumen', titulo: 'Horario', svg: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> },
  { path: 'contacto.direccionCorta', titulo: 'Dónde estamos', svg: <><path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></> },
  { path: 'contacto.telefono', titulo: 'Llámanos o escríbenos', svg: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /> },
];

// Franja de datos prácticos bajo la portada, como en cualquier clínica: horario, dirección, teléfono y reservar.
export default function InfoStrip() {
  return (
    <section aria-label="Información de contacto" style={{ background: 'var(--cream)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '22px 16px' }}>
      <div className="stagger" style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,230px),1fr))', gap: '18px 28px', alignItems: 'center' }}>
        {ITEMS.map(it => (
          <div key={it.path} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon(it.svg)}</div>
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '2px' }}>{it.titulo.toUpperCase()}</p>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.4 }}><E path={it.path} /></p>
            </div>
          </div>
        ))}
        <Link to="/reservar" style={{ justifySelf: 'start', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--olive)', color: 'var(--cream)', padding: '14px 26px', borderRadius: '99px', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none' }}>
          Reservar online
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </Link>
      </div>
    </section>
  );
}
