import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../utils/useFocusTrap';

// Confirmación con el diseño del sitio, en vez de la ventana nativa del
// navegador (window.confirm), que se ve genérica y Chrome puede bloquear.
// Se renderiza solo cuando `open` es true.
export default function ConfirmDialog({ open, title = '¿Continuar?', children, confirmLabel = 'SÍ, CONTINUAR', cancelLabel = 'CANCELAR', danger = false, onConfirm, onCancel }) {
  const ref = useRef(null);
  useFocusTrap(ref, open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const btn = { padding: '11px 22px', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s' };

  return createPortal(
    <div role="alertdialog" aria-modal="true" aria-label={title} onClick={onCancel}
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(23,27,22,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'cdFade 0.18s ease' }}>
      <div ref={ref} tabIndex={-1} onClick={e => e.stopPropagation()}
        style={{ outline: 'none', background: 'var(--cream)', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '26px', boxShadow: '0 30px 70px rgba(23,27,22,0.3)', animation: 'cdPop 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--ink)', fontWeight: 400, marginBottom: '10px' }}>{title}</p>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: '22px' }}>{children}</div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button type="button" onClick={onCancel}
            style={{ ...btn, background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm}
            style={{ ...btn, background: danger ? '#B3413A' : 'var(--olive)', color: 'var(--cream)', border: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = danger ? '#983530' : 'var(--olive-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = danger ? '#B3413A' : 'var(--olive)'; }}>
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes cdFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cdPop { from { opacity: 0; transform: scale(0.94) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>,
    document.body
  );
}
