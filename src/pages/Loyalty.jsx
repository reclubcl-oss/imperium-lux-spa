import { Link } from 'react-router-dom';
import SectionDivider from '../components/SectionDivider';
import LoyaltyWidget from '../components/LoyaltyWidget';

export default function Loyalty() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream-soft)', paddingTop: '110px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ color: 'var(--gold-accent)', fontSize: '0.72rem', letterSpacing: '0.22em', fontFamily: 'var(--font-sans)', fontWeight: 700, marginBottom: '14px' }}>
            PROGRAMA DE FIDELIDAD
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', color: 'var(--ink)', marginBottom: '16px', fontWeight: 400 }}>
            Tu Tarjeta de Sellos
          </h1>
          <SectionDivider margin="0 auto 16px" />
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.92rem', lineHeight: 1.7 }}>
            Cada visita suma un sello. Al completar la tarjeta, tienes un beneficio especial en tu siguiente sesión.
          </p>
        </div>

        <LoyaltyWidget />

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link to="/reservar" style={{ color: 'var(--olive)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
            Agenda tu próxima cita →
          </Link>
        </div>
      </div>
    </div>
  );
}
