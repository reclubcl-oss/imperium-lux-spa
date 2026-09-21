import { useState, useEffect } from 'react';
import { checkLoyaltyStatus, getLoyaltyThreshold } from '../utils/loyalty';

// Tarjeta visual de sellos — círculos numerados 1..total, rellenos hasta
// `filled`. Sin resultado todavía (`filled` null) se ve vacía, como
// explicación de cómo funciona el programa; con resultado, muestra el
// avance real del cliente dentro del ciclo actual.
function StampCard({ total, filled, subtitle }) {
  const circles = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div style={{ background: 'var(--forest)', borderRadius: '18px', padding: 'clamp(24px,5vw,32px)' }}>
      <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--gold-accent)', fontSize: '0.65rem', letterSpacing: '0.2em', fontWeight: 700, marginBottom: '18px' }}>
        TU TARJETA DE SELLOS
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        {circles.map(n => {
          const isFilled = filled !== null && n <= filled;
          return (
            <div key={n} style={{
              width: '40px', height: '40px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              background: isFilled ? 'var(--gold-accent)' : 'transparent',
              border: `1px solid ${isFilled ? 'var(--gold-accent)' : 'rgba(255,254,251,0.3)'}`,
              transition: 'background 0.3s, border-color 0.3s',
            }}>
              {isFilled ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--forest)" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
              ) : (
                <span style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,254,251,0.5)', fontSize: '0.8rem' }}>{n}</span>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ borderTop: '1px solid rgba(255,254,251,0.15)', paddingTop: '16px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,254,251,0.8)', fontSize: '0.85rem', lineHeight: 1.6 }}>{subtitle}</p>
      </div>
    </div>
  );
}

/**
 * Widget de fidelidad completo (tarjeta de sellos + formulario de consulta) —
 * autocontenido, se usa tanto en la sección de Inicio (LoyaltySection) como
 * en la página standalone /fidelidad (pages/Loyalty.jsx), para no duplicar
 * la lógica en dos lados.
 */
export default function LoyaltyWidget() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [threshold, setThreshold] = useState(5);

  useEffect(() => {
    getLoyaltyThreshold().then(({ value }) => setThreshold(value));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setError('');
    const res = await checkLoyaltyStatus(email.trim());
    if (!res.success) {
      setError(res.error);
      setStatus('error');
      return;
    }
    setResult(res);
    setStatus('done');
  };

  const tienePremio = result && result.visitas > 0 && result.faltanParaPremio === 0;
  // Sellos llenos dentro del ciclo actual — si justo completó la tarjeta,
  // se muestra completa en vez de reiniciada en 0.
  const filledCount = result ? (tienePremio ? threshold : result.visitas % threshold) : null;

  return (
    <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>
      {/* Tarjeta de sellos */}
      <div style={{ marginBottom: '20px' }}>
        <StampCard
          total={threshold}
          filled={status === 'done' ? filledCount : null}
          subtitle={
            status === 'done' && result
              ? (tienePremio
                  ? '¡Tarjeta completa! Tienes un beneficio disponible — coméntaselo al equipo en tu próxima visita.'
                  : `Te ${result.faltanParaPremio === 1 ? 'falta' : 'faltan'} ${result.faltanParaPremio} ${result.faltanParaPremio === 1 ? 'sello' : 'sellos'} para tu próximo beneficio.`)
              : `Al completarla: un beneficio especial en tu siguiente sesión.`
          }
        />
      </div>

      {/* Consulta */}
      <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '20px', padding: 'clamp(28px,5vw,40px)', boxShadow: '0 12px 32px rgba(23,27,22,0.05)' }}>
        <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: '1.15rem', marginBottom: '6px', fontWeight: 400 }}>Consulta tus sellos</p>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.85rem', marginBottom: '20px' }}>Ingresa el email con el que agendas tus citas.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            style={{
              flex: '1 1 200px', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px',
              padding: '13px 18px', color: 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', outline: 'none',
            }}
          />
          <button type="submit" disabled={status === 'loading'} style={{
            background: 'var(--olive)', color: 'var(--cream)', border: 'none', padding: '13px 24px', borderRadius: '10px',
            fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 700, cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          }}>
            {status === 'loading' ? 'BUSCANDO...' : 'CONSULTAR'}
          </button>
        </form>

        {status === 'error' && (
          <div style={{ marginTop: '18px', background: 'rgba(179,65,58,0.06)', border: '1px solid rgba(179,65,58,0.25)', borderRadius: '10px', padding: '14px 18px', fontFamily: 'var(--font-sans)', color: '#B3413A', fontSize: '0.85rem' }}>
            ⚠️ {error}
          </div>
        )}

        {status === 'done' && result && (
          <div style={{ marginTop: '20px', textAlign: 'center', animation: 'fadeIn 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>{tienePremio ? '🎁' : '👑'}</span>
            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontSize: '0.88rem' }}>
              <strong style={{ color: 'var(--olive)', fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>{result.visitas}</strong> {result.visitas === 1 ? 'visita registrada en total' : 'visitas registradas en total'}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
