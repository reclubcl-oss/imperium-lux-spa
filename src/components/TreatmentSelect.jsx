import { useState, useEffect, useRef } from 'react';
import { formatCLP } from '../utils/format';

/**
 * Selector de tratamiento con diseño propio — reemplaza el <select> nativo,
 * que en iPhone/Android se ve con el picker genérico del sistema operativo
 * (letras chicas, sin marca). Esto abre un panel propio (hoja desde abajo
 * en celular, tarjeta centrada en escritorio) con los tratamientos
 * agrupados por categoría, en los mismos colores y tipografía del sitio.
 */
export default function TreatmentSelect({ groupedServices, value, onChange, placeholder = 'Selecciona un tratamiento' }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const selected = groupedServices.flatMap(g => g.items).find(s => s.nombre === value);
  const isOtro = value === 'Otro (indicar en notas)';

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const pick = (nombre) => {
    onChange(nombre);
    setOpen(false);
  };

  const rowStyle = (active) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', width: '100%',
    padding: '13px 14px', borderRadius: '10px', border: 'none', textAlign: 'left', cursor: 'pointer',
    background: active ? 'var(--border-soft)' : 'transparent',
    fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--ink)',
    transition: 'background 0.15s',
  });
  const rowHover = (active) => ({
    onMouseEnter: e => { if (!active) e.currentTarget.style.background = 'var(--cream-soft)'; },
    onMouseLeave: e => { if (!active) e.currentTarget.style.background = 'transparent'; },
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: '100%', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px',
          padding: '13px 18px', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', textAlign: 'left',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', cursor: 'pointer',
          color: selected || isOtro ? 'var(--ink)' : 'var(--ink-soft)',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.nombre : isOtro ? 'Otro (indicar en notas)' : placeholder}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="2" style={{ flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog" aria-modal="true"
          onClick={() => setOpen(false)}
          className="treatment-select-backdrop"
        >
          <div ref={panelRef} onClick={e => e.stopPropagation()} className="treatment-select-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border-soft)' }}>
              <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: '1.1rem', fontWeight: 400 }}>Elige tu tratamiento</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar"
                style={{ background: 'var(--border-soft)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
                ✕
              </button>
            </div>

            <div style={{ padding: '10px 14px 20px', overflowY: 'auto', flex: 1 }}>
              {groupedServices.map(g => (
                <div key={g.categoria} style={{ marginBottom: '14px' }}>
                  <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--gold-accent)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', padding: '10px 10px 6px' }}>
                    {g.categoria.toUpperCase()}
                  </p>
                  {g.items.map(s => (
                    <button key={s.id} type="button" onClick={() => pick(s.nombre)} style={rowStyle(value === s.nombre)} {...rowHover(value === s.nombre)}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nombre}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {s.precio && <span style={{ color: 'var(--olive)', fontWeight: 700, fontSize: '0.8rem' }}>{formatCLP(s.precio)}</span>}
                        {value === s.nombre && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              ))}

              <div style={{ borderTop: '1px solid var(--border-soft)', marginTop: '4px', paddingTop: '10px' }}>
                <button type="button" onClick={() => pick('Otro (indicar en notas)')} style={rowStyle(isOtro)} {...rowHover(isOtro)}>
                  <span>Otro (indicar en notas)</span>
                  {isOtro && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .treatment-select-backdrop {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(23,27,22,0.55);
          display: flex; align-items: center; justify-content: center;
          padding: 20px; animation: tsFadeIn 0.2s ease;
        }
        .treatment-select-panel {
          background: var(--cream); border-radius: 18px;
          width: 100%; max-width: 460px; max-height: 78vh;
          display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 30px 70px rgba(23,27,22,0.3);
          animation: tsPopIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        @media (max-width: 640px) {
          .treatment-select-backdrop { align-items: flex-end; padding: 0; }
          .treatment-select-panel { max-width: 100%; max-height: 82vh; border-radius: 20px 20px 0 0; animation: tsSlideUp 0.25s ease; }
        }
        @keyframes tsFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tsPopIn { from { opacity: 0; transform: scale(0.94) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes tsSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </>
  );
}
