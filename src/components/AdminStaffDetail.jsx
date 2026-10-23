import { useState, useEffect } from 'react';
import StaffSchedule from './StaffSchedule';
import { getAllServices } from '../utils/services';
import { getStaffServiceIds, setStaffServices } from '../utils/staffServices';

const SANS = 'var(--font-sans)';
const eyebrow = { fontFamily: SANS, color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em', marginBottom: '14px' };

// Panel de un profesional dentro de Admin > Equipo: qué tratamientos hace y su horario.
export default function AdminStaffDetail({ member }) {
  const [tab, setTab] = useState('tratamientos');
  const tabBtn = (key, label) => (
    <button key={key} type="button" onClick={() => setTab(key)}
      style={{ background: tab === key ? 'var(--olive)' : 'transparent', color: tab === key ? 'var(--cream)' : 'var(--ink)', border: '1px solid var(--border)', borderRadius: '99px', padding: '7px 16px', fontFamily: SANS, fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}>
      {label}
    </button>
  );
  return (
    <div style={{ padding: '18px clamp(12px,3vw,24px) 24px', background: 'var(--cream-soft)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {tabBtn('tratamientos', 'Tratamientos que realiza')}
        {tabBtn('horario', 'Horario y días libres')}
      </div>
      {tab === 'tratamientos' ? <ServicesPicker member={member} /> : <StaffSchedule key={member.id} staffId={member.id} />}
    </div>
  );
}

function ServicesPicker({ member }) {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([getAllServices(), getStaffServiceIds(member.id)]).then(([all, mine]) => {
      if (!alive) return;
      setServices((all.data || []).filter(s => s.activo));
      setSelected(new Set(mine.data || []));
      if (!mine.success) setMsg({ ok: false, text: 'Falta crear la tabla de tratamientos por profesional en Supabase (ver instrucciones).' });
      setLoading(false);
    });
    return () => { alive = false; };
  }, [member.id]);

  const toggle = (id) => setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleCategory = (items) => setSelected(prev => {
    const n = new Set(prev);
    const all = items.every(s => n.has(s.id));
    items.forEach(s => (all ? n.delete(s.id) : n.add(s.id)));
    return n;
  });

  const save = async () => {
    setSaving(true);
    setMsg(null);
    const res = await setStaffServices(member.id, [...selected]);
    setSaving(false);
    setMsg(res.success
      ? { ok: true, text: selected.size === 0 ? 'Guardado: sin tratamientos marcados, hace todos.' : `Guardado: ${selected.size} tratamiento${selected.size > 1 ? 's' : ''}.` }
      : { ok: false, text: res.error });
  };

  if (loading) return <p style={{ color: 'var(--ink-soft)', fontFamily: SANS }}>Cargando…</p>;

  const groups = [];
  const map = new Map();
  services.forEach(s => {
    const key = s.categoria || 'Otros';
    if (!map.has(key)) { map.set(key, []); groups.push(key); }
    map.get(key).push(s);
  });

  return (
    <div>
      <p style={{ ...eyebrow, marginBottom: '6px' }}>TRATAMIENTOS DE {member.nombre.toUpperCase()}</p>
      <p style={{ fontFamily: SANS, fontSize: '0.8rem', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '16px' }}>
        La web solo ofrece horas con {member.nombre} para los tratamientos que marques. Si no marcas ninguno, se entiende que hace todos.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {groups.map(cat => {
          const items = map.get(cat);
          const allOn = items.every(s => selected.has(s.id));
          return (
            <div key={cat}>
              <button type="button" onClick={() => toggleCategory(items)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: SANS, fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--gold-text)', marginBottom: '8px' }}>
                {cat.toUpperCase()} <span style={{ fontWeight: 500, color: 'var(--ink-soft)', letterSpacing: 0 }}>· {allOn ? 'quitar todos' : 'marcar todos'}</span>
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,220px),1fr))', gap: '6px 14px' }}>
                {items.map(s => (
                  <label key={s.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontFamily: SANS, fontSize: '0.82rem', color: 'var(--ink)', cursor: 'pointer', padding: '4px 0' }}>
                    <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} style={{ accentColor: 'var(--olive)' }} />
                    {s.nombre}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '20px', flexWrap: 'wrap' }}>
        <button type="button" onClick={save} disabled={saving} style={{ background: 'var(--olive)', color: 'var(--cream)', border: 'none', padding: '10px 22px', borderRadius: '8px', fontFamily: SANS, fontSize: '0.78rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'GUARDANDO…' : 'GUARDAR TRATAMIENTOS'}
        </button>
        {msg && <span role="status" style={{ fontFamily: SANS, fontSize: '0.8rem', color: msg.ok ? 'var(--olive)' : '#B3413A' }}>{msg.text}</span>}
      </div>
    </div>
  );
}
