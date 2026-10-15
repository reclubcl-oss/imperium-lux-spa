import { useState, useRef, useEffect, useMemo } from 'react';
import { DEFAULTS, SECCION_NOMBRES, EditContext, SiteContext, applyColors, buildSite, getPath, saveOverrides, setPath, useSite, useSiteReload } from '../utils/siteContent';
import Home from '../pages/Home';
import Footer from './Footer';
import { uploadSiteImage } from '../utils/services';
import ConfirmDialog from './ConfirmDialog';

const input = { width: '100%', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--ink)' };
const label = { fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.66rem', letterSpacing: '0.12em', fontWeight: 700, display: 'block', marginBottom: '5px' };
const btn = { background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 11px', fontFamily: 'var(--font-sans)', fontSize: '0.74rem', cursor: 'pointer', color: 'var(--ink)' };
const btnMain = { ...btn, background: 'var(--olive)', color: 'var(--cream)', border: '1px solid var(--olive)', fontWeight: 700 };
const hint = { fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.74rem', lineHeight: 1.5, marginTop: '4px' };

// Qué se puede editar en cada bloque. `path` apunta al valor dentro del contenido del sitio.
const BLOQUES = [
  { id: 'hero', titulo: 'Portada', ayuda: 'Lo primero que ve la persona al entrar.', campos: [
    { path: 'hero.etiqueta', label: 'TEXTO PEQUEÑO SUPERIOR' },
    { path: 'hero.titulo', label: 'TÍTULO', tipo: 'area' },
    { path: 'hero.texto', label: 'DESCRIPCIÓN', tipo: 'area' },
    { path: 'hero.botonPrincipal', label: 'BOTÓN PRINCIPAL (lleva a reservar)' },
    { path: 'hero.botonSecundario', label: 'BOTÓN SECUNDARIO (baja a tratamientos)' },
    { path: 'hero.nota', label: 'NOTA BAJO LOS BOTONES' },
    { path: 'hero.imagenUrl', label: 'FOTO DE PORTADA', tipo: 'imagen', nombre: 'portada', ayuda: 'Se ve mientras carga el video y cuando el video no puede reproducirse.' },
    { path: 'hero.videoUrl', label: 'VIDEO DE PORTADA (enlace .mp4)', ayuda: 'Déjalo vacío para usar el video actual.' },
    { path: 'hero.fotoLado', label: 'POSICIÓN DE LA FOTO', tipo: 'select', opciones: [['derecha', 'A la derecha'], ['izquierda', 'A la izquierda']] },
    { path: 'hero.destacados', label: 'LOS 3 DESTACADOS', tipo: 'lista', fija: true, items: [{ k: 'titulo', label: 'Título' }, { k: 'texto', label: 'Texto' }] },
  ] },
  { id: 'servicios', titulo: 'Encabezado de tratamientos', ayuda: 'Los tratamientos en sí se editan en la pestaña Servicios.', campos: [
    { path: 'servicios.etiqueta', label: 'TEXTO PEQUEÑO' },
    { path: 'servicios.titulo', label: 'TÍTULO' },
    { path: 'servicios.texto', label: 'DESCRIPCIÓN', tipo: 'area' },
  ] },
  { id: 'paginaServicios', titulo: 'Página de tratamientos (/servicios)', ayuda: 'Los tratamientos en sí (nombre, precio, foto) se editan en la pestaña Servicios.', campos: [
    { path: 'paginaServicios.etiqueta', label: 'TEXTO PEQUEÑO' },
    { path: 'paginaServicios.titulo', label: 'TÍTULO' },
    { path: 'paginaServicios.texto', label: 'DESCRIPCIÓN', tipo: 'area' },
    { path: 'paginaServicios.ctaTitulo', label: 'TÍTULO DEL CIERRE' },
    { path: 'paginaServicios.ctaTexto', label: 'TEXTO DEL CIERRE', tipo: 'area' },
  ] },
  { id: 'cifras', titulo: 'Cifras', ayuda: 'Los números destacados bajo los tratamientos. Solo pon datos reales.', campos: [
    { path: 'cifras.mostrarTratamientos', label: 'Mostrar la cantidad de tratamientos (se calcula sola)', tipo: 'bool' },
    { path: 'cifras.items', label: 'CIFRAS', tipo: 'lista', items: [{ k: 'numero', label: 'Número (ej. 6, 1 a 1)' }, { k: 'texto', label: 'Texto' }], nuevo: { numero: '', texto: '' } },
  ] },
  { id: 'fidelidad', titulo: 'Tarjeta de fidelidad', campos: [
    { path: 'fidelidad.etiqueta', label: 'TEXTO PEQUEÑO' },
    { path: 'fidelidad.titulo', label: 'TÍTULO' },
    { path: 'fidelidad.texto', label: 'DESCRIPCIÓN', tipo: 'area' },
    { path: 'fidelidad.enlace', label: 'TEXTO DEL ENLACE' },
  ] },
  { id: 'comunidad', titulo: 'Comunidad (video de agradecimiento)', campos: [
    { path: 'comunidad.etiqueta', label: 'TEXTO PEQUEÑO' },
    { path: 'comunidad.titulo', label: 'TÍTULO' },
    { path: 'comunidad.texto', label: 'DESCRIPCIÓN', tipo: 'area' },
    { path: 'comunidad.frase', label: 'FRASE BAJO EL VIDEO' },
    { path: 'comunidad.videoUrl', label: 'VIDEO (enlace .mp4)', ayuda: 'Déjalo vacío para usar el video actual.' },
  ] },
  { id: 'nosotros', titulo: 'Nosotros', campos: [
    { path: 'nosotros.etiqueta', label: 'TEXTO PEQUEÑO' },
    { path: 'nosotros.titulo', label: 'TÍTULO' },
    { path: 'nosotros.parrafo1', label: 'PÁRRAFO 1', tipo: 'area' },
    { path: 'nosotros.parrafo2', label: 'PÁRRAFO 2', tipo: 'area' },
    { path: 'nosotros.boton', label: 'BOTÓN' },
    { path: 'nosotros.imagenUrl', label: 'FOTO', tipo: 'imagen', nombre: 'nosotros' },
    { path: 'nosotros.fotoLado', label: 'POSICIÓN DE LA FOTO', tipo: 'select', opciones: [['derecha', 'A la derecha'], ['izquierda', 'A la izquierda']] },
  ] },
  { id: 'ubicacion', titulo: 'Ubicación y horarios', campos: [
    { path: 'ubicacion.etiqueta', label: 'TEXTO PEQUEÑO' },
    { path: 'ubicacion.titulo', label: 'TÍTULO' },
    { path: 'ubicacion.direccion', label: 'DIRECCIÓN (una línea por renglón)', tipo: 'area' },
    { path: 'ubicacion.mapaConsulta', label: 'DIRECCIÓN PARA EL MAPA', ayuda: 'Así la busca Google Maps. Ej: 2 Oriente 124, Viña del Mar, Chile.' },
    { path: 'ubicacion.horarios', label: 'HORARIOS', tipo: 'lista', items: [{ k: 'dia', label: 'Día' }, { k: 'horas', label: 'Horario' }], nuevo: { dia: '', horas: '' } },
  ] },
  { id: 'contacto', titulo: 'Contacto y redes', ayuda: 'Se usa en el pie de página y en los botones de WhatsApp.', campos: [
    { path: 'contacto.whatsapp', label: 'WHATSAPP (con código de país, solo números)', ayuda: 'Ej: 56971494060' },
    { path: 'contacto.mostrarWhatsapp', label: 'Mostrar el botón flotante de WhatsApp', tipo: 'bool' },
    { path: 'contacto.telefono', label: 'TELÉFONO (como se muestra)' },
    { path: 'contacto.email', label: 'CORREO (como se muestra)' },
    { path: 'contacto.direccionCorta', label: 'DIRECCIÓN CORTA' },
    { path: 'contacto.horarioResumen', label: 'HORARIO RESUMIDO' },
    { path: 'contacto.instagram', label: 'ENLACE DE INSTAGRAM' },
    { path: 'footer.descripcion', label: 'FRASE DEL PIE DE PÁGINA', tipo: 'area' },
  ] },
  { id: 'marca', titulo: 'Marca, colores y título', campos: [
    { path: 'marca.logoUrl', label: 'LOGO', tipo: 'imagen', nombre: 'logo', ayuda: 'Fondo transparente funciona mejor.' },
    { path: 'marca.tituloPagina', label: 'TÍTULO EN GOOGLE Y EN LA PESTAÑA' },
    { path: 'colores.olive', label: 'COLOR PRINCIPAL (botones, textos de acento)', tipo: 'color' },
    { path: 'colores.forest', label: 'COLOR OSCURO (fondos oscuros y pie de página)', tipo: 'color' },
    { path: 'colores.gold', label: 'COLOR DORADO (detalles)', tipo: 'color' },
  ] },
];

const get = getPath;
const setIn = setPath;

function ImageField({ value, onChange, nombre }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const ref = useRef(null);
  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true); setErr('');
    const res = await uploadSiteImage(file, nombre);
    setBusy(false);
    if (res.success) onChange(res.url); else setErr(res.error);
  };
  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        {value
          ? <img src={value} alt="" style={{ width: '120px', height: '72px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--border-soft)' }} />
          : <div style={{ width: '120px', height: '72px', borderRadius: '8px', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...hint, margin: 0 }}>Imagen actual</div>}
        <button type="button" style={btn} onClick={() => ref.current?.click()} disabled={busy}>{busy ? 'Subiendo…' : 'Subir foto'}</button>
        {value && <button type="button" style={btn} onClick={() => onChange('')}>Volver a la original</button>}
        <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" onChange={pick} style={{ display: 'none' }} />
      </div>
      {err && <p style={{ ...hint, color: '#B3413A' }}>{err}</p>}
    </div>
  );
}

function ListField({ campo, value, onChange }) {
  const list = Array.isArray(value) ? value : [];
  const upd = (i, k, v) => onChange(list.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {list.map((it, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', background: 'var(--cream-soft)', border: '1px solid var(--border-soft)', borderRadius: '8px', padding: '8px' }}>
          {campo.items.map(f => (
            <input key={f.k} style={{ ...input, flex: '1 1 150px', width: 'auto' }} placeholder={f.label} aria-label={f.label} value={it[f.k] ?? ''} onChange={e => upd(i, f.k, e.target.value)} />
          ))}
          {!campo.fija && <button type="button" style={btn} onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label="Quitar">Quitar</button>}
        </div>
      ))}
      {!campo.fija && <button type="button" style={{ ...btn, alignSelf: 'flex-start' }} onClick={() => onChange([...list, { ...campo.nuevo }])}>+ Agregar</button>}
    </div>
  );
}

function Campo({ campo, form, setForm }) {
  const value = get(form, campo.path);
  const onChange = (v) => setForm(f => setIn(f, campo.path, v));
  if (campo.tipo === 'bool') {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--ink)', cursor: 'pointer' }}>
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} /> {campo.label}
      </label>
    );
  }
  return (
    <div>
      <span style={label}>{campo.label}</span>
      {campo.tipo === 'select' && (
        <select style={input} value={value ?? ''} onChange={e => onChange(e.target.value)}>
          {campo.opciones.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select>
      )}
      {campo.tipo === 'area' && <textarea style={{ ...input, minHeight: '78px', resize: 'vertical' }} value={value ?? ''} onChange={e => onChange(e.target.value)} />}
      {campo.tipo === 'imagen' && <ImageField value={value} onChange={onChange} nombre={campo.nombre} />}
      {campo.tipo === 'lista' && <ListField campo={campo} value={value} onChange={onChange} />}
      {campo.tipo === 'color' && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'} onChange={e => onChange(e.target.value)} style={{ width: '44px', height: '36px', border: '1px solid var(--border)', borderRadius: '6px', padding: 2, background: '#fff', cursor: 'pointer' }} />
          <input style={{ ...input, width: '120px' }} value={value ?? ''} onChange={e => onChange(e.target.value)} />
          <button type="button" style={btn} onClick={() => onChange(get(DEFAULTS, campo.path))}>Original</button>
        </div>
      )}
      {!campo.tipo && <input style={input} value={value ?? ''} onChange={e => onChange(e.target.value)} />}
      {campo.ayuda && <p style={hint}>{campo.ayuda}</p>}
    </div>
  );
}

function SeccionesOrden({ form, setForm }) {
  const list = form.secciones;
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    setForm(f => ({ ...f, secciones: next }));
  };
  const toggle = (i) => setForm(f => ({ ...f, secciones: f.secciones.map((s, j) => (j === i ? { ...s, visible: !s.visible } : s)) }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <p style={{ ...hint, marginTop: 0 }}>La portada siempre va primero. Ordena el resto y oculta lo que no quieras mostrar. También puedes arrastrarlas directo en la página.</p>
      {list.map((s, i) => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--cream-soft)', border: '1px solid var(--border-soft)', borderRadius: '8px', padding: '8px 10px', opacity: s.visible ? 1 : 0.55 }}>
          <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--ink)' }}>{SECCION_NOMBRES[s.id]}</span>
          <button type="button" style={btn} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir">↑</button>
          <button type="button" style={btn} onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label="Bajar">↓</button>
          <button type="button" style={btn} onClick={() => toggle(i)}>{s.visible ? 'Ocultar' : 'Mostrar'}</button>
        </div>
      ))}
    </div>
  );
}

export default function AdminSiteView() {
  const current = useSite();
  const reload = useSiteReload();
  const [form, setForm] = useState(() => structuredClone(current));
  const [modo, setModo] = useState('pagina'); // 'pagina' = editar tocando la página · 'formulario' = lista de campos
  const [openId, setOpenId] = useState('hero');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(current);

  // Los colores del borrador se ven al instante; al salir se vuelven a los guardados.
  useEffect(() => {
    applyColors(form.colores);
    return () => applyColors(current.colores);
  }, [form.colores, current.colores]);

  // Avisa si intentas cerrar la pestaña con cambios sin guardar.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = async (valor, okText) => {
    setSaving(true); setMsg(null);
    const res = await saveOverrides(valor);
    if (res.success) {
      await reload();
      setPreviewKey(k => k + 1);
      setMsg({ ok: true, text: okText });
    } else {
      setMsg({ ok: false, text: res.error });
    }
    setSaving(false);
  };

  const resetAll = async () => {
    setConfirmReset(false);
    await save({}, 'Se restauró el sitio original.');
    setForm(structuredClone(buildSite(null)));
  };

  const discard = () => { setForm(structuredClone(current)); setMsg(null); };

  const editCtx = useMemo(() => {
    const setSecciones = (fn) => setForm(f => ({ ...f, secciones: fn(f.secciones) }));
    return {
      editing: true,
      setValue: (path, v) => setForm(f => setIn(f, path, v)),
      moveSection: (id, d) => setSecciones(list => {
        const i = list.findIndex(s => s.id === id);
        const j = i + d;
        if (i < 0 || j < 0 || j >= list.length) return list;
        const next = [...list];
        [next[i], next[j]] = [next[j], next[i]];
        return next;
      }),
      // Soltar una sección sobre otra: queda en el lugar de esa (las demás se corren).
      dropSection: (fromId, toId) => setSecciones(list => {
        const from = list.findIndex(s => s.id === fromId);
        const to = list.findIndex(s => s.id === toId);
        if (from < 0 || to < 0 || from === to) return list;
        const next = [...list];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      }),
      toggleSection: (id) => setSecciones(list => list.map(s => (s.id === id ? { ...s, visible: !s.visible } : s))),
    };
  }, []);
  const draftCtx = useMemo(() => ({ site: form, reload: async () => {} }), [form]);

  const renderBloque = (b) => {
    const open = openId === b.id;
    return (
      <div key={b.id} style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <button type="button" onClick={() => setOpenId(open ? null : b.id)} aria-expanded={open}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', padding: '14px 18px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', textAlign: 'left' }}>
          {b.titulo}
          <span style={{ color: 'var(--ink-soft)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
        </button>
        {open && (
          <div style={{ padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {b.ayuda && <p style={{ ...hint, marginTop: 0 }}>{b.ayuda}</p>}
            {b.campos.map(c => <Campo key={c.path} campo={c} form={form} setForm={setForm} />)}
          </div>
        )}
      </div>
    );
  };

  const tabBtn = (id, text) => (
    <button type="button" onClick={() => setModo(id)} aria-pressed={modo === id}
      style={{ ...btn, background: modo === id ? 'var(--olive)' : 'transparent', color: modo === id ? 'var(--cream)' : 'var(--ink)', borderColor: modo === id ? 'var(--olive)' : 'var(--border)', fontWeight: 700 }}>{text}</button>
  );

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {tabBtn('pagina', 'Editar en la página')}
          {tabBtn('formulario', 'Más ajustes')}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" style={btn} onClick={() => setConfirmReset(true)} disabled={saving}>Restaurar sitio original</button>
          <button type="button" style={{ ...btn, opacity: dirty ? 1 : 0.5 }} onClick={discard} disabled={saving || !dirty}>Descartar cambios</button>
          <button type="button" style={{ ...btnMain, opacity: dirty ? 1 : 0.55 }} disabled={saving || !dirty} onClick={() => save(form, 'Cambios guardados. Ya están en el sitio.')}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
        </div>
      </div>

      {msg && (
        <p role="status" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', background: msg.ok ? 'rgba(38,58,34,0.08)' : 'rgba(179,65,58,0.1)', color: msg.ok ? 'var(--olive)' : '#B3413A' }}>{msg.text}</p>
      )}
      {dirty && !msg && <p style={{ ...hint, marginTop: 0, marginBottom: '12px', color: 'var(--gold-text)' }}>Tienes cambios sin guardar.</p>}

      {modo === 'pagina' ? (
        <>
          <p style={{ ...hint, marginTop: 0, marginBottom: '12px' }}>
            Toca cualquier texto con borde punteado y escríbelo de nuevo. En las fotos aparece un botón para cambiarlas o pasarlas al otro lado. Arrastra la barra oscura de cada sección (⠿) para moverla: la página se acomoda sola. Cuando termines, toca <strong>Guardar cambios</strong>.
            Para colores, WhatsApp o videos usa <strong>Más ajustes</strong>.
          </p>
          <SiteContext.Provider value={draftCtx}>
            <EditContext.Provider value={editCtx}>
              <div className="site-canvas"
                onClickCapture={e => { if (e.target.closest?.('a')) e.preventDefault(); }}
                style={{ border: '2px solid var(--gold-accent)', borderRadius: '12px', overflow: 'hidden', background: 'var(--cream)', position: 'relative', isolation: 'isolate', maxHeight: '78vh', overflowY: 'auto' }}>
                <Home />
                <Footer />
              </div>
            </EditContext.Provider>
          </SiteContext.Provider>
          <style>{`
            .site-canvas [data-edit] { outline: 1.5px dashed rgba(181,146,77,0.75); outline-offset: 3px; border-radius: 3px; transition: background 0.15s; }
            .site-canvas [data-edit]:hover { background: rgba(181,146,77,0.14); }
            .site-canvas [data-edit]:focus { outline: 2px solid var(--gold-accent); background: rgba(181,146,77,0.18); }
          `}</style>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            <button type="button" style={btn} onClick={() => setShowPreview(v => !v)}>{showPreview ? 'Ocultar vista previa' : 'Ver vista previa'}</button>
          </div>
          <div className="site-editor" style={{ display: 'grid', gridTemplateColumns: showPreview ? 'minmax(0,1fr) minmax(0,1fr)' : 'minmax(0,1fr)', gap: '20px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '10px' }}>Orden de las secciones</p>
                <SeccionesOrden form={form} setForm={setForm} />
              </div>
              {BLOQUES.map(renderBloque)}
            </div>

            {showPreview && (
              <div className="site-preview" style={{ position: 'sticky', top: '12px', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...label, margin: 0 }}>VISTA PREVIA (lo guardado)</span>
                  <a href="/" target="_blank" rel="noreferrer" style={{ ...hint, margin: 0, color: 'var(--olive)' }}>Abrir el sitio ↗</a>
                </div>
                <iframe key={previewKey} title="Vista previa del sitio" src="/" style={{ width: '100%', height: 'min(78vh, 760px)', border: 0, display: 'block' }} />
              </div>
            )}
          </div>
          <style>{`@media (max-width: 900px) { .site-editor { grid-template-columns: minmax(0,1fr) !important; } .site-preview { position: static !important; } }`}</style>
        </>
      )}

      <ConfirmDialog open={confirmReset} title="¿Restaurar el sitio original?" confirmLabel="SÍ, RESTAURAR" danger onConfirm={resetAll} onCancel={() => setConfirmReset(false)}>
        Se borran todos los textos, fotos y colores que cambiaste desde aquí y el sitio vuelve a como estaba al inicio. Los tratamientos y las reservas no se tocan.
      </ConfirmDialog>
    </div>
  );
}
