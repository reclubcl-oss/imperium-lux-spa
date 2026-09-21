import { useState, useMemo } from 'react';
import { updateReservationPrecio } from '../utils/finance';
import Icon from './icons';

const SERIF = 'var(--font-serif)';
const SANS = 'var(--font-sans)';
const card = { background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '14px' };
const eyebrow = { fontFamily: SANS, color: 'var(--ink-soft)', fontSize: '0.66rem', letterSpacing: '0.14em', fontWeight: 600 };
const fieldStyle = { width: '100%', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', color: 'var(--ink)', fontFamily: SANS, fontSize: '0.84rem', outline: 'none', transition: 'border-color 0.15s' };
const focusOn = e => { e.target.style.borderColor = 'var(--olive)'; };
const focusOff = e => { e.target.style.borderColor = 'var(--border)'; };

// ── Tarjeta de cifra ─────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, compact }) {
  return (
    <div style={{ ...card, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
        <p style={eyebrow}>{label}</p>
        <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(38,58,34,0.07)', color: 'var(--olive)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={16} />
        </span>
      </div>
      <div>
        <p style={{ fontFamily: SERIF, color: 'var(--olive)', fontSize: compact ? '1.3rem' : '2.3rem', lineHeight: compact ? 1.25 : 1, fontWeight: 400, minHeight: compact ? '2.5rem' : undefined }}>{value}</p>
        {sub && <p style={{ fontFamily: SANS, color: 'var(--ink-soft)', fontSize: '0.76rem', marginTop: '8px' }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Servicios más reservados ────────────────────────────────────────────────
function TopServices({ reservations }) {
  const counts = useMemo(() => {
    const map = {};
    reservations.forEach(r => { const s = r.servicio || 'Sin especificar'; map[s] = (map[s] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [reservations]);
  const total = reservations.length || 1;
  const max = counts[0]?.[1] || 1;

  return (
    <div style={{ ...card, padding: '22px 24px' }}>
      <p style={{ ...eyebrow, marginBottom: '20px' }}>SERVICIOS MÁS RESERVADOS</p>
      {counts.length === 0 && <p style={{ color: 'var(--ink-soft)', fontFamily: SANS, fontSize: '0.85rem' }}>Sin datos aún.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {counts.map(([name, count], i) => (
          <div key={name} style={{ display: 'grid', gridTemplateColumns: '22px 1fr auto', columnGap: '12px', alignItems: 'baseline' }}>
            <span style={{ fontFamily: SERIF, color: i === 0 ? 'var(--gold-accent)' : 'var(--ink-soft)', fontSize: '0.95rem' }}>{i + 1}</span>
            <span style={{ fontFamily: SANS, color: 'var(--ink)', fontSize: '0.86rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
            <span style={{ fontFamily: SANS, color: 'var(--ink-soft)', fontSize: '0.78rem' }}>
              <strong style={{ color: 'var(--ink)', fontSize: '0.9rem' }}>{count}</strong> · {Math.round((count / total) * 100)}%
            </span>
            <span />
            <div style={{ gridColumn: '2 / 4', height: '4px', background: 'var(--border-soft)', borderRadius: '99px', overflow: 'hidden', marginTop: '7px' }}>
              <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: i === 0 ? 'var(--olive)' : '#8a9a7a', borderRadius: '99px', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Próximas citas ──────────────────────────────────────────────────────────
function UpcomingList({ reservations }) {
  const upcoming = useMemo(() => {
    const now = new Date();
    const todayIso = now.toLocaleDateString('en-CA');
    const nowHM = now.toTimeString().slice(0, 5);
    return reservations
      .filter(r => r.fecha_iso && (r.fecha_iso > todayIso || (r.fecha_iso === todayIso && (r.hora || '') >= nowHM)))
      .sort((a, b) => (a.fecha_iso + (a.hora || '')).localeCompare(b.fecha_iso + (b.hora || '')))
      .slice(0, 5);
  }, [reservations]);

  const dayLabel = (iso) => {
    const d = new Date(`${iso}T12:00:00`);
    const diff = Math.round((d - new Date(new Date().toLocaleDateString('en-CA') + 'T12:00:00')) / 86400000);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    return d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '');
  };

  return (
    <div style={{ ...card, padding: '22px 24px' }}>
      <p style={{ ...eyebrow, marginBottom: '16px' }}>PRÓXIMAS CITAS</p>
      {upcoming.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontFamily: SANS, fontSize: '0.85rem' }}>No hay citas próximas agendadas.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {upcoming.map((r, i) => (
            <div key={r.id || i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0', borderTop: i ? '1px solid var(--border-soft)' : 'none' }}>
              <div style={{ minWidth: '74px' }}>
                <p style={{ fontFamily: SANS, color: 'var(--olive)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize' }}>{dayLabel(r.fecha_iso)}</p>
                <p style={{ fontFamily: SERIF, color: 'var(--ink)', fontSize: '1.05rem' }}>{r.hora || '—'}</p>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: SANS, color: 'var(--ink)', fontSize: '0.86rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nombre || '—'}</p>
                <p style={{ fontFamily: SANS, color: 'var(--ink-soft)', fontSize: '0.76rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.servicio || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Precio editable ─────────────────────────────────────────────────────────
function PrecioCell({ reservation, onSaved }) {
  const [value, setValue] = useState(reservation.precio ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const num = value === '' ? null : Number(value);
    setSaving(true);
    await updateReservationPrecio(reservation.id, num);
    setSaving(false);
    onSaved(reservation.id, num);
  };

  return (
    <input type="number" min="0" placeholder="—" value={value}
      onChange={e => setValue(e.target.value)} onBlur={e => { focusOff(e); save(); }} onFocus={focusOn} disabled={saving}
      style={{ width: '96px', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', fontFamily: SANS, fontSize: '0.8rem', color: 'var(--ink)', outline: 'none' }} />
  );
}

const th = { padding: '12px 18px', textAlign: 'left', fontFamily: SANS, color: 'var(--ink-soft)', fontSize: '0.62rem', letterSpacing: '0.12em', fontWeight: 600, whiteSpace: 'nowrap', background: 'var(--cream-soft)' };
const td = { padding: '14px 18px', fontFamily: SANS, color: 'var(--ink-soft)', fontSize: '0.83rem', whiteSpace: 'nowrap' };

const Pill = ({ children }) => (
  <span style={{ background: 'rgba(38,58,34,0.07)', color: 'var(--olive)', padding: '4px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600, fontFamily: SANS, whiteSpace: 'nowrap' }}>{children}</span>
);

// ── Vista principal ─────────────────────────────────────────────────────────
export default function AdminReservasView({ reservations, loading, error, onPrecioSaved }) {
  const [filterService, setFilterService] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch] = useState('');

  const thisMonth = useMemo(() => {
    const now = new Date();
    return reservations.filter(r => {
      const d = new Date(r.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [reservations]);
  const today = useMemo(() => {
    const now = new Date();
    return reservations.filter(r => new Date(r.created_at).toDateString() === now.toDateString());
  }, [reservations]);

  const allServices = useMemo(() => [...new Set(reservations.map(r => r.servicio).filter(Boolean))].sort(), [reservations]);

  const top = useMemo(() => {
    const map = {};
    reservations.forEach(r => { if (r.servicio) map[r.servicio] = (map[r.servicio] || 0) + 1; });
    const best = Object.entries(map).sort((a, b) => b[1] - a[1])[0];
    return best ? { name: best[0], count: best[1] } : null;
  }, [reservations]);

  const filtered = useMemo(() => reservations.filter(r => {
    const okService = !filterService || r.servicio === filterService;
    const okDate = !filterDate || (r.fecha && r.fecha.toLowerCase().includes(filterDate.toLowerCase()));
    const q = search.toLowerCase();
    const okSearch = !search || [r.nombre, r.email, r.telefono, r.servicio].some(f => f?.toLowerCase().includes(q));
    return okService && okDate && okSearch;
  }), [reservations, filterService, filterDate, search]);

  const hasFilters = search || filterService || filterDate;
  const clear = () => { setSearch(''); setFilterService(''); setFilterDate(''); };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--olive)', fontFamily: SANS }}>Cargando reservas...</div>;

  return (
    <>
      {error && (
        <div style={{ background: 'rgba(179,65,58,0.06)', border: '1px solid rgba(179,65,58,0.25)', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px', fontFamily: SANS, color: '#B3413A', fontSize: '0.85rem' }}>
          Error al cargar datos: {error}
        </div>
      )}

      {/* Cifras */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: '14px', marginBottom: '20px' }}>
        <StatCard icon="calendar" label="RESERVAS ESTE MES" value={thisMonth.length} sub={`de ${reservations.length} en total`} />
        <StatCard icon="clock" label="RECIBIDAS HOY" value={today.length} sub={today.length === 1 ? 'reserva nueva' : 'reservas nuevas'} />
        <StatCard icon="layers" label="TOTAL DE RESERVAS" value={reservations.length} sub="desde el inicio" />
        <StatCard icon="star" label="SERVICIO ESTRELLA" compact value={top?.name || '—'} sub={top ? `${top.count} reserva${top.count !== 1 ? 's' : ''}` : 'Sin datos aún'} />
      </div>

      {/* Ranking + próximas citas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: '16px', marginBottom: '20px' }}>
        <TopServices reservations={reservations} />
        <UpcomingList reservations={reservations} />
      </div>

      {/* Lista */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px', gap: '12px' }}>
            <p style={{ fontFamily: SERIF, color: 'var(--ink)', fontSize: '1.2rem' }}>Lista de reservas</p>
            <span style={{ fontFamily: SANS, color: 'var(--ink-soft)', fontSize: '0.78rem' }}>
              <strong style={{ color: 'var(--olive)' }}>{filtered.length}</strong> resultado{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '2 1 240px' }}>
              <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-soft)', display: 'flex' }}><Icon name="search" size={15} /></span>
              <input type="text" placeholder="Buscar por nombre, correo o teléfono" value={search} onChange={e => setSearch(e.target.value)} onFocus={focusOn} onBlur={focusOff} style={{ ...fieldStyle, paddingLeft: '38px' }} />
            </div>
            <select value={filterService} onChange={e => setFilterService(e.target.value)} style={{ ...fieldStyle, flex: '1 1 190px', cursor: 'pointer' }}>
              <option value="">Todos los servicios</option>
              {allServices.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="text" placeholder="Fecha (ej: abril, lunes)" value={filterDate} onChange={e => setFilterDate(e.target.value)} onFocus={focusOn} onBlur={focusOff} style={{ ...fieldStyle, flex: '1 1 160px' }} />
            {hasFilters && (
              <button type="button" onClick={clear} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--ink-soft)', padding: '9px 14px', borderRadius: '10px', fontFamily: SANS, fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}>
                <Icon name="x" size={13} /> Limpiar
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--ink-soft)', fontFamily: SANS, fontSize: '0.88rem' }}>
            {reservations.length === 0 ? 'Aún no hay reservas registradas.' : 'No hay resultados con estos filtros.'}
          </div>
        ) : (
          <>
            <div className="admin-table-desktop" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['FECHA', 'HORA', 'NOMBRE', 'SERVICIO', 'PROFESIONAL', 'PRECIO', 'TELÉFONO', 'CORREO'].map(h => <th key={h} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id || i} style={{ borderBottom: '1px solid var(--border-soft)', transition: 'background 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--cream-soft)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <td style={td}>{r.fecha || '—'}</td>
                      <td style={{ ...td, color: 'var(--olive)', fontWeight: 700 }}>{r.hora || '—'}</td>
                      <td style={{ ...td, color: 'var(--ink)', fontWeight: 600 }}>{r.nombre || '—'}</td>
                      <td style={td}><Pill>{r.servicio || '—'}</Pill></td>
                      <td style={td}>{r.staff?.nombre || '—'}</td>
                      <td style={td}><PrecioCell reservation={r} onSaved={onPrecioSaved} /></td>
                      <td style={td}>{r.telefono || '—'}</td>
                      <td style={td}>{r.email || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-cards-mobile">
              {filtered.map((r, i) => (
                <div key={r.id || i} style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-soft)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
                    <p style={{ fontFamily: SANS, color: 'var(--ink)', fontWeight: 600, fontSize: '0.95rem' }}>{r.nombre || '—'}</p>
                    <span style={{ fontFamily: SERIF, color: 'var(--olive)', fontSize: '1.15rem' }}>{r.hora || '—'}</span>
                  </div>
                  <div style={{ marginBottom: '12px' }}><Pill>{r.servicio || '—'}</Pill></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {[
                      ['calendar', r.fecha || '—'],
                      ['user', r.staff?.nombre || 'Sin asignar'],
                      ['phone', r.telefono || '—'],
                      ['mail', r.email || '—'],
                    ].map(([icon, text]) => (
                      <p key={icon} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: SANS, color: 'var(--ink-soft)', fontSize: '0.8rem', minWidth: 0 }}>
                        <Icon name={icon} size={14} style={{ color: 'var(--gold-accent)' }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</span>
                      </p>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon name="tag" size={14} style={{ color: 'var(--gold-accent)' }} />
                      <PrecioCell reservation={r} onSaved={onPrecioSaved} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
