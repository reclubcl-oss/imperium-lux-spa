import { useState } from 'react';
import { isStandalone, pushSupported, subscribeWithoutSaving } from '../utils/push';

// Pantalla TEMPORAL para probar notificaciones mientras la base de datos no
// está disponible. Genera un código de suscripción que se le entrega a quien
// envía el push de prueba. Se elimina después de la prueba.
export default function PruebaPush() {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setMsg('Generando...');
    try {
      const res = await subscribeWithoutSaving();
      if (res.success) { setCode(JSON.stringify(res.subscription)); setMsg(''); }
      else setMsg(res.error === 'denied' ? 'Bloqueaste las notificaciones. Actívalas en Ajustes → Notificaciones → Imperium.' : `No se pudo (${res.error}).`);
    } catch (e) { setMsg(`Error: ${e.message}`); }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); } catch { setMsg('Mantén presionado el código, elige “Seleccionar todo” y “Copiar”.'); }
  };

  const box = { fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.7 };
  return (
    <section style={{ background: 'var(--cream-soft)', padding: '110px 16px 80px', minHeight: '70vh' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto', ...box }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.8rem', marginBottom: '14px' }}>Prueba de notificaciones</h1>
        <p style={{ marginBottom: '6px' }}>App instalada: <strong>{isStandalone() ? 'sí ✓' : 'no (ábrela desde el ícono de tu inicio)'}</strong></p>
        <p style={{ marginBottom: '18px' }}>Notificaciones compatibles: <strong>{pushSupported() ? 'sí ✓' : 'no'}</strong></p>
        <button type="button" onClick={generate} style={{ display: 'block', width: '100%', background: 'var(--olive)', color: 'var(--cream)', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem' }}>
          1. Activar y generar código
        </button>
        {msg && <p style={{ marginTop: '12px', color: '#B3413A' }}>{msg}</p>}
        {code && (
          <>
            <p style={{ margin: '18px 0 8px' }}>2. Copia este código y pégalo en el chat:</p>
            <textarea readOnly value={code} onFocus={e => e.target.select()} rows={7} style={{ width: '100%', fontSize: '0.7rem', fontFamily: 'monospace', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff' }} />
            <button type="button" onClick={copy} style={{ marginTop: '10px', width: '100%', background: 'transparent', border: '1px solid var(--border)', padding: '12px', borderRadius: '10px', fontWeight: 700 }}>
              {copied ? '✓ Copiado' : 'Copiar código'}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
