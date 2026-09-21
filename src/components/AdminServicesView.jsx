import { useState, useEffect } from 'react';
import { getAllServices, createService, updateService, toggleServiceActivo } from '../utils/services';
import { CATEGORY_DEFAULT_IMAGE } from '../utils/categoryDefaults';
import { TREATMENT_DEFAULT_IMAGE } from '../utils/treatmentDefaults';
import { formatCLP } from '../utils/format';

const inputStyle = { background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--ink)' };

const actionBtn = {
  background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px',
  padding: '5px 10px', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', cursor: 'pointer', color: 'var(--ink)',
};

function ServiceCard({ service, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nombre: service.nombre, categoria: service.categoria || '', descripcion: service.descripcion || '', precio: service.precio ?? '' });
  const [fotoFile, setFotoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await updateService(service.id, { ...form, precio: form.precio === '' ? null : Number(form.precio) }, fotoFile);
    setSaving(false);
    setEditing(false);
    setFotoFile(null);
    onSaved();
  };

  const toggleActivo = async () => {
    await toggleServiceActivo(service.id, !service.activo);
    onSaved();
  };

  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', opacity: service.activo ? 1 : 0.5 }}>
      <div style={{ width: '100%', aspectRatio: '4/3', background: 'var(--border-soft)', overflow: 'hidden', position: 'relative' }}>
        {service.foto_url ? (
          <img src={service.foto_url} alt={service.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : TREATMENT_DEFAULT_IMAGE[service.nombre] ? (
          <>
            <img src={TREATMENT_DEFAULT_IMAGE[service.nombre]} alt={service.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <span style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(23,27,22,0.65)', color: 'var(--cream)', padding: '2px 8px', borderRadius: '99px', fontSize: '0.62rem', fontFamily: 'var(--font-sans)' }}>
              Foto predeterminada
            </span>
          </>
        ) : CATEGORY_DEFAULT_IMAGE[service.categoria] ? (
          <>
            <img src={CATEGORY_DEFAULT_IMAGE[service.categoria]} alt={service.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <span style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(23,27,22,0.65)', color: 'var(--cream)', padding: '2px 8px', borderRadius: '99px', fontSize: '0.62rem', fontFamily: 'var(--font-sans)' }}>
              Foto predeterminada de categoría
            </span>
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-accent)', fontFamily: 'var(--font-sans)', fontSize: '0.75rem' }}>Sin foto</div>
        )}
      </div>

      <div style={{ padding: '14px 16px' }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input style={inputStyle} value={form.nombre} onChange={e => setForm(v => ({ ...v, nombre: e.target.value }))} placeholder="Nombre" />
            <input style={inputStyle} value={form.categoria} onChange={e => setForm(v => ({ ...v, categoria: e.target.value }))} placeholder="Categoría" />
            <input type="number" min="0" style={inputStyle} value={form.precio} onChange={e => setForm(v => ({ ...v, precio: e.target.value }))} placeholder="Precio en CLP (opcional)" />
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '50px' }} value={form.descripcion} onChange={e => setForm(v => ({ ...v, descripcion: e.target.value }))} placeholder="Descripción (opcional)" />
            <input type="file" accept="image/*" onChange={e => setFotoFile(e.target.files[0])} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem' }} />
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <button onClick={save} disabled={saving} style={{ ...actionBtn, background: 'var(--olive)', color: 'var(--cream)' }}>{saving ? 'Guardando...' : 'Guardar'}</button>
              <button onClick={() => setEditing(false)} style={actionBtn}>Cancelar</button>
            </div>
          </div>
        ) : (
          <>
            {service.categoria && <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--gold-accent)', fontSize: '0.62rem', letterSpacing: '0.1em', marginBottom: '4px' }}>{service.categoria.toUpperCase()}</p>}
            <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: '1rem' }}>{service.nombre}</p>
            <p style={{ fontFamily: 'var(--font-sans)', color: service.precio ? 'var(--olive)' : 'var(--ink-soft)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '10px' }}>
              {service.precio ? formatCLP(service.precio) : 'Sin precio fijado'}
            </p>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button onClick={() => setEditing(true)} style={actionBtn}>Editar</button>
              <button onClick={toggleActivo} style={{ ...actionBtn, color: service.activo ? '#B3413A' : 'var(--olive)' }}>
                {service.activo ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AddServiceForm({ onCreated }) {
  const [form, setForm] = useState({ nombre: '', categoria: '', descripcion: '', precio: '' });
  const [fotoFile, setFotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await createService({ ...form, precio: form.precio === '' ? null : Number(form.precio), fotoFile });
    setLoading(false);
    if (!res.success) { setError(res.error); return; }
    setForm({ nombre: '', categoria: '', descripcion: '', precio: '' });
    setFotoFile(null);
    onCreated();
  };

  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px 28px', marginBottom: '20px' }}>
      <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em', marginBottom: '18px' }}>+ AGREGAR TRATAMIENTO</p>

      {error && (
        <div style={{ background: 'rgba(179,65,58,0.06)', border: '1px solid rgba(179,65,58,0.25)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontFamily: 'var(--font-sans)', color: '#B3413A', fontSize: '0.82rem' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={submit} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>NOMBRE</label>
          <input required style={{ ...inputStyle, width: '100%' }} value={form.nombre} onChange={e => setForm(v => ({ ...v, nombre: e.target.value }))} />
        </div>
        <div style={{ flex: '1 1 160px' }}>
          <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>CATEGORÍA</label>
          <input style={{ ...inputStyle, width: '100%' }} value={form.categoria} onChange={e => setForm(v => ({ ...v, categoria: e.target.value }))} placeholder="ej: Tratamientos Faciales" />
        </div>
        <div style={{ flex: '1 1 140px' }}>
          <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>PRECIO CLP (OPCIONAL)</label>
          <input type="number" min="0" style={{ ...inputStyle, width: '100%' }} value={form.precio} onChange={e => setForm(v => ({ ...v, precio: e.target.value }))} placeholder="ej: 45000" />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>FOTO (OPCIONAL)</label>
          <input type="file" accept="image/*" onChange={e => setFotoFile(e.target.files[0])} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem' }} />
        </div>
        <button type="submit" disabled={loading} style={{ background: 'var(--olive)', color: 'var(--cream)', border: 'none', padding: '10px 20px', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'CREANDO...' : 'AGREGAR'}
        </button>
      </form>
    </div>
  );
}

export default function AdminServicesView() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    getAllServices().then(({ data }) => { setServices(data || []); setLoading(false); });
  };

  useEffect(() => { reload(); }, []);

  return (
    <div>
      <AddServiceForm onCreated={reload} />

      {loading ? (
        <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Cargando tratamientos...</p>
      ) : services.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Aún no hay tratamientos. Agrega el primero arriba.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
          {services.map(s => <ServiceCard key={s.id} service={s} onSaved={reload} />)}
        </div>
      )}
    </div>
  );
}
