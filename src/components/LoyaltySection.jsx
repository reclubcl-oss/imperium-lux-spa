import { Link } from 'react-router-dom';
import SectionDivider from './SectionDivider';
import LoyaltyWidget from './LoyaltyWidget';
import { useSite } from '../utils/siteContent';

export default function LoyaltySection() {
  const { fidelidad: t } = useSite();
  return (
    <section id="fidelidad" style={{ background: 'var(--cream)', padding: 'clamp(60px,10vw,100px) 16px', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,5vw,48px)' }}>
          <p style={{ color: 'var(--gold-text)', fontSize: '0.72rem', letterSpacing: '0.22em', fontFamily: 'var(--font-sans)', fontWeight: 700, marginBottom: '14px' }}>{t.etiqueta}</p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.8rem)', color: 'var(--ink)', marginBottom: '18px', fontWeight: 400 }}>{t.titulo}</h2>
          <SectionDivider margin="0 auto 16px" />
          <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', fontSize: 'clamp(0.9rem,2vw,1rem)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            {t.texto}
          </p>
        </div>

        <LoyaltyWidget />

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link to="/reservar" style={{ color: 'var(--olive)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
            {t.enlace}
          </Link>
        </div>
      </div>
    </section>
  );
}
