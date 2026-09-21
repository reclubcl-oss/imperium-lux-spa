import { useState, useEffect, useMemo } from 'react';
import { getActiveServices } from '../utils/services';
import { CATEGORY_DEFAULT_IMAGE } from '../utils/categoryDefaults';
import { TREATMENT_DEFAULT_IMAGE } from '../utils/treatmentDefaults';
import { formatCLP } from '../utils/format';
import { generateTreatmentDesign, downloadCanvas, slugify } from '../utils/designGenerator';
import logo from '../assets/brand/logo.png';

const btnStyle = {
  flex: '1 1 auto', background: 'var(--olive)', color: 'var(--cream)', border: 'none',
  borderRadius: '6px', padding: '8px 10px', fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
  fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
};

const fieldStyle = {
  width: '100%', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '6px',
  padding: '6px 9px', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--ink)',
};

function DesignCard({ service }) {
  const defaults = useMemo(() => ({
    categoria: service.categoria || '',
    nombre: service.nombre,
    precioLabel: service.precio ? formatCLP(service.precio) : '',
    cta: 'Agenda tu hora',
  }), [service]);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(defaults);
  const [customPhoto, setCustomPhoto] = useState(null); // { file, url }
  const [generating, setGenerating] = useState(null); // 'post' | 'story' | null
  const [error, setError] = useState('');

  // Si vuelve a cargar el servicio (ej. le cambiaron el precio en Tratamientos), no pisa lo que el admin ya haya editado a mano.
  useEffect(() => { setForm(defaults); }, [defaults]);

  useEffect(() => {
    return () => { if (customPhoto) URL.revokeObjectURL(customPhoto.url); };
  }, [customPhoto]);

  const baseImageSrc = service.foto_url || TREATMENT_DEFAULT_IMAGE[service.nombre] || CATEGORY_DEFAULT_IMAGE[service.categoria];
  const imageSrc = customPhoto?.url || baseImageSrc;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (customPhoto) URL.revokeObjectURL(customPhoto.url);
    setCustomPhoto({ file, url: URL.createObjectURL(file) });
  };

  const reset = () => {
    setForm(defaults);
    if (customPhoto) URL.revokeObjectURL(customPhoto.url);
    setCustomPhoto(null);
  };

  const handleDownload = async (format) => {
    if (!imageSrc || generating) return;
    setGenerating(format);
    setError('');
    try {
      const canvas = await generateTreatmentDesign({
        imageSrc,
        categoria: form.categoria,
        nombre: form.nombre || service.nombre,
        precioLabel: form.precioLabel,
        cta: form.cta,
        format,
      });
      const suffix = format === 'story' ? 'historia' : 'post';
      await downloadCanvas(canvas, `imperium-${slugify(form.nombre || service.nombre)}-${suffix}.png`);
    } catch {
      setError('No se pudo generar la imagen. Si la foto es tuya, puede ser un problema del servidor de fotos — prueba con otra.');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Vista previa aproximada — el PNG final se genera aparte, en alta resolución */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: 'var(--border-soft)' }}>
        {imageSrc && <img src={imageSrc} alt={form.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(23,27,22,0) 42%, rgba(23,27,22,0.9) 100%)' }} />
        <div style={{ position: 'absolute', top: '10px', left: '12px', width: '34px', height: '34px', borderRadius: '8px', background: 'var(--cream)', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
          <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '14px', left: '14px', right: '14px' }}>
          {form.categoria && (
            <p style={{ color: 'var(--gold-accent)', fontFamily: 'var(--font-sans)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '4px' }}>
              {form.categoria.toUpperCase()}
            </p>
          )}
          <p style={{ color: 'var(--cream)', fontFamily: 'var(--font-serif)', fontSize: '1.1rem', lineHeight: 1.15, marginBottom: '8px' }}>{form.nombre}</p>
          {form.precioLabel ? (
            <span style={{ display: 'inline-block', background: 'var(--gold-accent)', color: 'var(--forest)', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.62rem', padding: '3px 9px', borderRadius: '99px', marginBottom: '8px' }}>
              {form.precioLabel}
            </span>
          ) : null}
          {form.cta && (
            <div>
              <span style={{ display: 'inline-block', background: 'var(--cream)', color: 'var(--olive)', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.6rem', padding: '5px 11px', borderRadius: '99px' }}>
                {form.cta.toUpperCase()} →
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontWeight: 600, fontSize: '0.85rem' }}>{service.nombre}</p>
          <button onClick={() => setEditing(v => !v)} style={{ background: 'transparent', border: 'none', color: 'var(--olive)', fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
            {editing ? 'Cerrar' : '✏️ Editar'}
          </button>
        </div>

        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', background: 'var(--cream-soft)', borderRadius: '8px', border: '1px solid var(--border-soft)' }}>
            <div>
              <label style={{ fontSize: '0.62rem', color: 'var(--ink-soft)', display: 'block', marginBottom: '2px' }}>NOMBRE EN EL DISEÑO</label>
              <input style={fieldStyle} value={form.nombre} onChange={e => setForm(v => ({ ...v, nombre: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: '0.62rem', color: 'var(--ink-soft)', display: 'block', marginBottom: '2px' }}>CATEGORÍA</label>
              <input style={fieldStyle} value={form.categoria} onChange={e => setForm(v => ({ ...v, categoria: e.target.value }))} placeholder="(sin categoría)" />
            </div>
            <div>
              <label style={{ fontSize: '0.62rem', color: 'var(--ink-soft)', display: 'block', marginBottom: '2px' }}>PRECIO O PROMO (TEXTO LIBRE)</label>
              <input style={fieldStyle} value={form.precioLabel} onChange={e => setForm(v => ({ ...v, precioLabel: e.target.value }))} placeholder="ej: $45.000, 2x1, Consulta" />
            </div>
            <div>
              <label style={{ fontSize: '0.62rem', color: 'var(--ink-soft)', display: 'block', marginBottom: '2px' }}>TEXTO DEL BOTÓN (VACÍO = SIN BOTÓN)</label>
              <input style={fieldStyle} value={form.cta} onChange={e => setForm(v => ({ ...v, cta: e.target.value }))} placeholder="ej: Agenda tu hora" />
            </div>
            <div>
              <label style={{ fontSize: '0.62rem', color: 'var(--ink-soft)', display: 'block', marginBottom: '2px' }}>FOTO SOLO PARA ESTE DISEÑO (OPCIONAL)</label>
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', width: '100%' }} />
            </div>
            <button onClick={reset} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: '#B3413A', fontFamily: 'var(--font-sans)', fontSize: '0.68rem', cursor: 'pointer', padding: '2px 0' }}>
              Restablecer a los valores del tratamiento
            </button>
          </div>
        )}

        {error && <p style={{ color: '#B3413A', fontFamily: 'var(--font-sans)', fontSize: '0.7rem', lineHeight: 1.4 }}>⚠️ {error}</p>}

        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => handleDownload('post')} disabled={generating !== null} style={{ ...btnStyle, opacity: generating && generating !== 'post' ? 0.6 : 1 }}>
            {generating === 'post' ? 'Generando...' : '⬇ Post 1080×1080'}
          </button>
          <button onClick={() => handleDownload('story')} disabled={generating !== null} style={{ ...btnStyle, background: 'var(--gold-accent)', color: 'var(--forest)', opacity: generating && generating !== 'story' ? 0.6 : 1 }}>
            {generating === 'story' ? 'Generando...' : '⬇ Historia 1080×1920'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDesignView() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveServices().then(({ data }) => { setServices(data || []); setLoading(false); });
  }, []);

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.82rem', marginBottom: '20px', maxWidth: '640px' }}>
        Un diseño listo para publicar por cada tratamiento activo. Cada uno viene con foto, nombre,
        precio y un botón de "Agenda tu hora" — pero puedes tocar <strong style={{ color: 'var(--ink)' }}>✏️ Editar</strong> en
        cualquiera para cambiar el texto, poner una promo, quitar el botón o usar otra foto solo para ese diseño.
      </p>

      {loading ? (
        <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Cargando tratamientos...</p>
      ) : services.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Aún no hay tratamientos activos con foto para generar diseños.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {services.map(s => <DesignCard key={s.id} service={s} />)}
        </div>
      )}
    </div>
  );
}
