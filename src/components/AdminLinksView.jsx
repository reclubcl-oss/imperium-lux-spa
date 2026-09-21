import { useState, useEffect } from 'react';
import { getAllLinks, createLink, updateLink, toggleLinkActivo, deleteLink, moveLink } from '../utils/links';
import ConfirmDialog from './ConfirmDialog';

const inputStyle = { background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--ink)' };

const actionBtn = {
  background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px',
  padding: '5px 10px', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', cursor: 'pointer', color: 'var(--ink)',
};

const arrowBtn = {
  ...actionBtn, padding: '5px 8px', fontSize: '0.8rem', lineHeight: 1,
};

function LinkRow({ link, allLinks, isFirst, isLast, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ titulo: link.titulo, url: link.url });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await updateLink(link.id, form);
    setSaving(false);
    setEditing(false);
    onSaved();
  };

  const toggleActivo = async () => {
    await toggleLinkActivo(link.id, !link.activo);
    onSaved();
  };

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const remove = async () => {
    setConfirmingDelete(false);
    await deleteLink(link.id);
    onSaved();
  };

  const move = async (direction) => {
    await moveLink(allLinks, link.id, direction);
    onSaved();
  };

  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', opacity: link.activo ? 1 : 0.5, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {editing ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <input style={{ ...inputStyle, flex: '1 1 160px' }} value={form.titulo}
            onChange={e => setForm(v => ({ ...v, titulo: e.target.value }))} placeholder="Título" />
          <input style={{ ...inputStyle, flex: '2 1 240px' }} value={form.url}
            onChange={e => setForm(v => ({ ...v, url: e.target.value }))} placeholder="URL (https://... o /ruta)" />
          <button onClick={save} disabled={saving} style={{ ...actionBtn, background: 'var(--olive)', color: 'var(--cream)' }}>{saving ? '...' : 'Guardar'}</button>
          <button onClick={() => setEditing(false)} style={actionBtn}>Cancelar</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontWeight: 600, fontSize: '0.9rem' }}>{link.titulo}</p>
            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</p>
          </div>
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            <button onClick={() => move('up')} disabled={isFirst} style={{ ...arrowBtn, opacity: isFirst ? 0.35 : 1, cursor: isFirst ? 'not-allowed' : 'pointer' }} aria-label="Subir">▲</button>
            <button onClick={() => move('down')} disabled={isLast} style={{ ...arrowBtn, opacity: isLast ? 0.35 : 1, cursor: isLast ? 'not-allowed' : 'pointer' }} aria-label="Bajar">▼</button>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flexShrink: 0 }}>
            <button onClick={() => setEditing(true)} style={actionBtn}>Editar</button>
            <button onClick={toggleActivo} style={{ ...actionBtn, color: link.activo ? '#B3413A' : 'var(--olive)' }}>
              {link.activo ? 'Desactivar' : 'Activar'}
            </button>
            <button onClick={() => setConfirmingDelete(true)} style={{ ...actionBtn, color: '#B3413A' }}>Eliminar</button>
          </div>
        </div>
      )}
      <ConfirmDialog open={confirmingDelete} title="¿Eliminar este enlace?" confirmLabel="SÍ, ELIMINAR" danger onConfirm={remove} onCancel={() => setConfirmingDelete(false)}>
        <p><strong style={{ color: 'var(--ink)' }}>{link.titulo}</strong> dejará de aparecer en tu página de enlaces. No se puede deshacer.</p>
      </ConfirmDialog>
    </div>
  );
}

function AddLinkForm({ onCreated }) {
  const [form, setForm] = useState({ titulo: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await createLink(form);
    setLoading(false);
    if (!res.success) { setError(res.error); return; }
    setForm({ titulo: '', url: '' });
    onCreated();
  };

  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px 28px', marginBottom: '20px' }}>
      <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em', marginBottom: '18px' }}>+ AGREGAR ENLACE</p>

      {error && (
        <div style={{ background: 'rgba(179,65,58,0.06)', border: '1px solid rgba(179,65,58,0.25)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontFamily: 'var(--font-sans)', color: '#B3413A', fontSize: '0.82rem' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={submit} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>TÍTULO</label>
          <input required style={{ ...inputStyle, width: '100%' }} value={form.titulo} onChange={e => setForm(v => ({ ...v, titulo: e.target.value }))} placeholder="ej: WhatsApp" />
        </div>
        <div style={{ flex: '2 1 240px' }}>
          <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>URL</label>
          <input required style={{ ...inputStyle, width: '100%' }} value={form.url} onChange={e => setForm(v => ({ ...v, url: e.target.value }))} placeholder="https://... o /reservar" />
        </div>
        <button type="submit" disabled={loading} style={{ background: 'var(--olive)', color: 'var(--cream)', border: 'none', padding: '10px 20px', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'CREANDO...' : 'AGREGAR'}
        </button>
      </form>
    </div>
  );
}

export default function AdminLinksView() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    getAllLinks().then(({ data }) => { setLinks(data || []); setLoading(false); });
  };

  useEffect(() => { reload(); }, []);

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.82rem', marginBottom: '20px', maxWidth: '560px' }}>
        Estos son los botones que aparecen en <a href="/link" target="_blank" rel="noreferrer" style={{ color: 'var(--ink)', fontWeight: 700 }}>imperium-lux-spa.vercel.app/link</a> — la
        landing para poner en la descripción de Instagram. Solo se muestran los enlaces activos, en este orden.
      </p>

      <AddLinkForm onCreated={reload} />

      {loading ? (
        <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Cargando enlaces...</p>
      ) : links.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Aún no hay enlaces. Agrega el primero arriba.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {links.map((link, i) => (
            <LinkRow key={link.id} link={link} allLinks={links} isFirst={i === 0} isLast={i === links.length - 1} onSaved={reload} />
          ))}
        </div>
      )}
    </div>
  );
}
