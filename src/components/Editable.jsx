import { useContext, useRef, useState } from 'react';
import { EditContext, getPath, useSite } from '../utils/siteContent';
import { uploadSiteImage } from '../utils/services';

// Texto del sitio. Fuera del admin es un <span> normal; en modo edición se puede tocar
// y escribir encima, y al salir del campo el cambio queda en el borrador.
export function E({ path, multiline = false }) {
  const { editing, setValue } = useContext(EditContext);
  const site = useSite();
  const value = getPath(site, path) ?? '';
  if (!editing) return <span style={multiline ? { whiteSpace: 'pre-line' } : undefined}>{value}</span>;

  return (
    <span
      data-edit
      contentEditable
      suppressContentEditableWarning
      spellCheck
      role="textbox"
      aria-label="Texto editable"
      style={{ whiteSpace: multiline ? 'pre-line' : undefined, cursor: 'text', overflowWrap: 'anywhere' }}
      onClick={e => e.stopPropagation()}
      onKeyDown={e => {
        if (e.key === 'Enter' && !multiline) { e.preventDefault(); e.currentTarget.blur(); }
        if (e.key === 'Escape') { e.currentTarget.innerText = value; e.currentTarget.blur(); }
      }}
      onPaste={e => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')); }}
      onBlur={e => {
        const next = e.currentTarget.innerText.replace(/\u00a0/g, ' ').trim();
        if (next !== String(value)) setValue(path, next);
      }}
    >
      {value}
    </span>
  );
}

// Envuelve una foto: en modo edición muestra un botón para reemplazarla (el padre debe ser position: relative).
export function EditableImage({ path, nombre, label = 'Cambiar foto', children }) {
  const { editing, setValue } = useContext(EditContext);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const ref = useRef(null);
  const site = useSite();
  if (!editing) return children;

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true); setErr('');
    const res = await uploadSiteImage(file, nombre || 'foto');
    setBusy(false);
    if (res.success) setValue(path, res.url); else setErr(res.error);
  };

  return (
    <>
      {children}
      <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
        <button type="button" onClick={e => { e.stopPropagation(); ref.current?.click(); }} disabled={busy}
          style={{ background: 'var(--cream)', color: 'var(--ink)', border: '1px solid var(--gold-accent)', borderRadius: '8px', padding: '9px 14px', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 18px rgba(23,27,22,0.25)' }}>
          {busy ? 'Subiendo…' : label}
        </button>
        {getPath(site, path) && !busy && (
          <button type="button" onClick={e => { e.stopPropagation(); setValue(path, ''); }}
            style={{ background: 'rgba(255,254,251,0.92)', color: 'var(--ink)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', fontFamily: 'var(--font-sans)', fontSize: '0.7rem', cursor: 'pointer' }}>
            Volver a la original
          </button>
        )}
        {err && <span style={{ background: '#fff', color: '#B3413A', borderRadius: '6px', padding: '4px 8px', fontSize: '0.7rem' }}>{err}</span>}
        <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" onChange={pick} style={{ display: 'none' }} />
      </div>
    </>
  );
}

// Botón para pasar la foto de un lado al otro (solo en modo edición). El padre debe ser position: relative.
export function SideToggle({ path }) {
  const { editing, setValue } = useContext(EditContext);
  const site = useSite();
  if (!editing) return null;
  const izquierda = getPath(site, path) === 'izquierda';
  return (
    <button type="button" onClick={e => { e.stopPropagation(); setValue(path, izquierda ? 'derecha' : 'izquierda'); }}
      style={{ position: 'absolute', bottom: '12px', left: '12px', zIndex: 20, background: 'var(--cream)', color: 'var(--ink)', border: '1px solid var(--gold-accent)', borderRadius: '8px', padding: '9px 14px', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 18px rgba(23,27,22,0.25)' }}>
      ⇄ Foto a la {izquierda ? 'derecha' : 'izquierda'}
    </button>
  );
}
