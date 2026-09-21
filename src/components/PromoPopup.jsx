import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DISMISS_KEY = 'imperium_promo_dismissed';

export default function PromoPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try { dismissed = sessionStorage.getItem(DISMISS_KEY) === '1'; } catch { /* localStorage puede estar bloqueado */ }
    if (dismissed) return;

    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setVisible(false);
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignorar */ }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Club de Beneficios"
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(23,27,22,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', animation: 'promoFadeIn 0.3s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', width: '100%', maxWidth: '420px',
          background: 'var(--cream)', borderRadius: '20px',
          border: '1px solid var(--border)',
          boxShadow: '0 30px 70px rgba(23,27,22,0.3)',
          padding: 'clamp(32px,6vw,44px) clamp(24px,5vw,36px)',
          textAlign: 'center',
          animation: 'promoPop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <button
          onClick={close}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: '14px', right: '14px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--ink-soft)', fontSize: '1.1rem', lineHeight: 1, padding: '6px',
          }}
        >
          ✕
        </button>

        <div style={{ fontSize: '2.4rem', marginBottom: '14px' }}>🎁</div>

        <p style={{ color: 'var(--gold-text)', fontSize: '0.68rem', letterSpacing: '0.2em', fontFamily: 'var(--font-sans)', fontWeight: 700, marginBottom: '12px' }}>
          CLUB DE BENEFICIOS
        </p>

        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem,4vw,1.7rem)', color: 'var(--ink)', fontWeight: 400, lineHeight: 1.25, marginBottom: '14px' }}>
          Reserva tu servicio y únete al Club de Beneficios
        </h3>

        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '26px' }}>
          Cada visita suma. Agenda tu tratamiento y acumula beneficios exclusivos en Clínica Estética Imperium.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a href="#servicios" onClick={close} style={{
            background: 'var(--olive)', color: 'var(--cream)', padding: '14px', borderRadius: '10px',
            textDecoration: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 700,
          }}>
            Ver tratamientos
          </a>
          <Link to="/fidelidad" onClick={close} style={{
            color: 'var(--ink-soft)', padding: '6px', textDecoration: 'underline',
            fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
          }}>
            Conocer el Club de Beneficios
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes promoFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes promoPop { from { opacity: 0; transform: scale(0.92) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
}
