import { useState, useEffect, useMemo } from 'react';
import { getReservations } from '../utils/supabase';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'imperium2024';

// ─── Helpers ────────────────────────────────────────────────────────────────
function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function isThisMonth(fechaStr) {
  if (!fechaStr) return false;
  const m = currentMonth();
  // fecha is a Spanish string like "lunes, 14 de abril de 2025"
  // We compare by created_at instead (handled in stats)
  return true; // fallback, real filter uses created_at
}

const SERVICE_COLORS = [
  '#C9A84C', '#E8CC7A', '#9A7A2E', '#F5F0E8',
  '#a78bfa', '#60a5fa', '#34d399', '#f87171',
  '#fb923c', '#e879f9', '#38bdf8', '#4ade80',
];

// ─── Login Screen ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { onLogin(); }
    else { setErr(true); setTimeout(() => setErr(false), 1500); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.08em' }}>IMPERIUM</p>
        <p style={{ fontFamily: 'Raleway, sans-serif', color: '#F5F0E8', fontSize: '0.55rem', letterSpacing: '0.4em', marginBottom: '40px' }}>LUX SPA · ADMIN</p>

        <form onSubmit={submit} style={{ background: '#111', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '12px', padding: '36px' }}>
          <p style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontSize: '1.3rem', marginBottom: '24px' }}>Panel de Administración</p>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.5)', fontSize: '0.68rem', letterSpacing: '0.2em', display: 'block', marginBottom: '6px' }}>CONTRASEÑA</label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="••••••••••"
              autoFocus
              style={{
                width: '100%', background: '#1a1a1a',
                border: `1px solid ${err ? '#e57373' : 'rgba(201,168,76,0.25)'}`,
                borderRadius: '6px', padding: '12px 16px',
                color: '#F5F0E8', fontFamily: 'Raleway, sans-serif',
                fontSize: '1rem', outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
            {err && <p style={{ color: '#e57373', fontSize: '0.78rem', marginTop: '6px', fontFamily: 'Raleway, sans-serif' }}>Contraseña incorrecta</p>}
          </div>
          <button type="submit" style={{ width: '100%', background: '#C9A84C', color: '#0A0A0A', border: 'none', padding: '13px', borderRadius: '6px', fontFamily: 'Raleway, sans-serif', fontSize: '0.8rem', letterSpacing: '0.2em', fontWeight: 700, cursor: 'pointer' }}>
            INGRESAR
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon }) {
  return (
    <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.5)', fontSize: '0.68rem', letterSpacing: '0.2em', marginBottom: '10px' }}>{label}</p>
          <p style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C', fontSize: '2.4rem', fontWeight: 700, lineHeight: 1 }}>{value}</p>
          {sub && <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.4)', fontSize: '0.75rem', marginTop: '6px' }}>{sub}</p>}
        </div>
        <span style={{ fontSize: '1.6rem', opacity: 0.6 }}>{icon}</span>
      </div>
    </div>
  );
}

// ─── Top Services Chart ──────────────────────────────────────────────────────
function TopServices({ reservations }) {
  const counts = useMemo(() => {
    const map = {};
    reservations.forEach(r => {
      const s = r.servicio || 'Sin especificar';
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [reservations]);

  const max = counts[0]?.[1] || 1;

  return (
    <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', padding: '24px 28px' }}>
      <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.5)', fontSize: '0.68rem', letterSpacing: '0.2em', marginBottom: '20px' }}>SERVICIOS MÁS RESERVADOS</p>
      {counts.length === 0 && <p style={{ color: 'rgba(245,240,232,0.3)', fontFamily: 'Raleway, sans-serif', fontSize: '0.85rem' }}>Sin datos aún</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {counts.map(([name, count], i) => (
          <div key={name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'Raleway, sans-serif', color: '#F5F0E8', fontSize: '0.8rem', flex: 1, marginRight: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
              <span style={{ fontFamily: 'Raleway, sans-serif', color: SERVICE_COLORS[i % SERVICE_COLORS.length], fontSize: '0.8rem', fontWeight: 700 }}>{count}</span>
            </div>
            <div style={{ height: '5px', background: '#1a1a1a', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: SERVICE_COLORS[i % SERVICE_COLORS.length], borderRadius: '99px', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
function Dashboard({ onLogout }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterDate, setFilterDate]       = useState('');
  const [search, setSearch]               = useState('');

  useEffect(() => {
    getReservations().then(({ success, data, error }) => {
      if (success) setReservations(data);
      else setError(error);
      setLoading(false);
    });
  }, []);

  // Stats
  const now = new Date();
  const thisMonthReservations = useMemo(() =>
    reservations.filter(r => {
      const d = new Date(r.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }), [reservations]);

  const todayReservations = useMemo(() =>
    reservations.filter(r => {
      const d = new Date(r.created_at);
      return d.toDateString() === now.toDateString();
    }), [reservations]);

  // Unique services for filter
  const allServices = useMemo(() => [...new Set(reservations.map(r => r.servicio).filter(Boolean))].sort(), [reservations]);

  // Filtered table
  const filtered = useMemo(() => reservations.filter(r => {
    const matchService = !filterService || r.servicio === filterService;
    const matchDate    = !filterDate    || (r.fecha && r.fecha.includes(filterDate));
    const matchSearch  = !search        || [r.nombre, r.email, r.telefono, r.servicio].some(f => f?.toLowerCase().includes(search.toLowerCase()));
    return matchService && matchDate && matchSearch;
  }), [reservations, filterService, filterDate, search]);

  // Most popular service
  const topService = useMemo(() => {
    const map = {};
    reservations.forEach(r => { if (r.servicio) map[r.servicio] = (map[r.servicio] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  }, [reservations]);

  const inputStyle = { background: '#1a1a1a', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', padding: '9px 14px', color: '#F5F0E8', fontFamily: 'Raleway, sans-serif', fontSize: '0.82rem', outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', paddingTop: '0' }}>
      {/* Top bar */}
      <div style={{ background: '#0D0D0D', borderBottom: '1px solid rgba(201,168,76,0.12)', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C', fontSize: '1.1rem', fontWeight: 700 }}>IMPERIUM</span>
          <span style={{ color: 'rgba(201,168,76,0.3)', fontSize: '1rem' }}>|</span>
          <span style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.5)', fontSize: '0.75rem', letterSpacing: '0.2em' }}>PANEL ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.4)', fontSize: '0.75rem', textDecoration: 'none', letterSpacing: '0.1em' }}
            onMouseEnter={e => e.target.style.color = '#C9A84C'} onMouseLeave={e => e.target.style.color = 'rgba(245,240,232,0.4)'}>
            VER SITIO
          </a>
          <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.25)', color: 'rgba(245,240,232,0.5)', padding: '6px 14px', borderRadius: '4px', fontFamily: 'Raleway, sans-serif', fontSize: '0.72rem', letterSpacing: '0.1em', cursor: 'pointer' }}>
            SALIR
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(20px,4vw,32px) clamp(12px,3vw,24px)' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '4px' }}>Dashboard de Reservas</h1>
          <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.4)', fontSize: '0.82rem' }}>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px', color: '#C9A84C', fontFamily: 'Raleway, sans-serif' }}>
            Cargando reservas...
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(229,115,115,0.08)', border: '1px solid rgba(229,115,115,0.3)', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px', fontFamily: 'Raleway, sans-serif', color: '#e57373', fontSize: '0.85rem' }}>
            ⚠️ Error al cargar datos: {error}
            <br/><span style={{ opacity: 0.7, fontSize: '0.78rem' }}>Verifica que las credenciales de Supabase estén configuradas en el .env</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,160px),1fr))', gap: '12px', marginBottom: '20px' }}>
              <StatCard icon="📅" label="RESERVAS ESTE MES"   value={thisMonthReservations.length} sub={`de ${reservations.length} en total`} />
              <StatCard icon="✨" label="RESERVAS HOY"        value={todayReservations.length}      sub="nuevas citas" />
              <StatCard icon="💎" label="TOTAL RESERVAS"      value={reservations.length}           sub="desde el inicio" />
              <StatCard icon="🏆" label="SERVICIO ESTRELLA"   value="★" sub={topService} />
            </div>

            {/* Charts + filters row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: '16px', marginBottom: '20px' }}>
              <TopServices reservations={reservations} />

              {/* Filters */}
              <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', padding: '24px 28px' }}>
                <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.5)', fontSize: '0.68rem', letterSpacing: '0.2em', marginBottom: '20px' }}>FILTROS</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.4)', fontSize: '0.68rem', letterSpacing: '0.15em', display: 'block', marginBottom: '5px' }}>BUSCAR</label>
                    <input type="text" placeholder="Nombre, email, teléfono..." value={search} onChange={e => setSearch(e.target.value)}
                      style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.4)', fontSize: '0.68rem', letterSpacing: '0.15em', display: 'block', marginBottom: '5px' }}>SERVICIO</label>
                    <select value={filterService} onChange={e => setFilterService(e.target.value)} style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}>
                      <option value="">Todos los servicios</option>
                      {allServices.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.4)', fontSize: '0.68rem', letterSpacing: '0.15em', display: 'block', marginBottom: '5px' }}>FILTRAR POR TEXTO EN FECHA</label>
                    <input type="text" placeholder="ej: abril, lunes, 2025..." value={filterDate} onChange={e => setFilterDate(e.target.value)}
                      style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <button onClick={() => { setSearch(''); setFilterService(''); setFilterDate(''); }}
                    style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(245,240,232,0.5)', padding: '8px', borderRadius: '6px', fontFamily: 'Raleway, sans-serif', fontSize: '0.72rem', letterSpacing: '0.1em', cursor: 'pointer', marginTop: '4px' }}>
                    LIMPIAR FILTROS
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.5)', fontSize: '0.68rem', letterSpacing: '0.2em' }}>
                  LISTA DE RESERVAS
                </p>
                <span style={{ fontFamily: 'Raleway, sans-serif', color: '#C9A84C', fontSize: '0.75rem', fontWeight: 600 }}>
                  {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {filtered.length === 0 ? (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: 'rgba(245,240,232,0.3)', fontFamily: 'Raleway, sans-serif', fontSize: '0.88rem' }}>
                  {reservations.length === 0 ? 'Aún no hay reservas registradas.' : 'No hay resultados con estos filtros.'}
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="admin-table-desktop" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                          {['FECHA', 'HORA', 'NOMBRE', 'SERVICIO', 'TELÉFONO', 'EMAIL'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'Raleway, sans-serif', color: 'rgba(201,168,76,0.7)', fontSize: '0.62rem', letterSpacing: '0.15em', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((r, i) => (
                          <tr key={r.id || i} style={{ borderBottom: '1px solid rgba(201,168,76,0.05)', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={tdStyle}>{r.fecha || '—'}</td>
                            <td style={{ ...tdStyle, color: '#C9A84C', fontWeight: 700 }}>{r.hora || '—'}</td>
                            <td style={{ ...tdStyle, color: '#F5F0E8', fontWeight: 500 }}>{r.nombre || '—'}</td>
                            <td style={tdStyle}>
                              <span style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', padding: '3px 8px', borderRadius: '99px', fontSize: '0.7rem', fontFamily: 'Raleway, sans-serif', whiteSpace: 'nowrap' }}>
                                {r.servicio || '—'}
                              </span>
                            </td>
                            <td style={tdStyle}>{r.telefono || '—'}</td>
                            <td style={{ ...tdStyle, color: 'rgba(245,240,232,0.5)' }}>{r.email || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="admin-cards-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {filtered.map((r, i) => (
                      <div key={r.id || i} style={{ padding: '16px', borderBottom: '1px solid rgba(201,168,76,0.07)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <p style={{ fontFamily: 'Raleway, sans-serif', color: '#F5F0E8', fontWeight: 600, fontSize: '0.9rem' }}>{r.nombre || '—'}</p>
                          <span style={{ fontFamily: 'Raleway, sans-serif', color: '#C9A84C', fontWeight: 700, fontSize: '0.9rem' }}>{r.hora || '—'}</span>
                        </div>
                        <span style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', padding: '3px 10px', borderRadius: '99px', fontSize: '0.7rem', fontFamily: 'Raleway, sans-serif', display: 'inline-block', marginBottom: '8px' }}>
                          {r.servicio || '—'}
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.5)', fontSize: '0.78rem' }}>📅 {r.fecha || '—'}</p>
                          <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.5)', fontSize: '0.78rem' }}>📞 {r.telefono || '—'}</p>
                          <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.5)', fontSize: '0.78rem' }}>✉️ {r.email || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        select option { background: #1a1a1a; color: #F5F0E8; }
        @media (min-width: 640px) { .admin-cards-mobile { display: none !important; } }
        @media (max-width: 639px) { .admin-table-desktop { display: none !important; } }
      `}</style>
    </div>
  );
}

const tdStyle = {
  padding: '14px 20px',
  fontFamily: 'Raleway, sans-serif',
  color: 'rgba(245,240,232,0.7)',
  fontSize: '0.82rem',
  whiteSpace: 'nowrap',
};

// ─── Page export ─────────────────────────────────────────────────────────────
export default function Admin() {
  const [auth, setAuth] = useState(() => sessionStorage.getItem('imp_admin') === '1');

  const login  = () => { sessionStorage.setItem('imp_admin', '1'); setAuth(true); };
  const logout = () => { sessionStorage.removeItem('imp_admin'); setAuth(false); };

  return auth ? <Dashboard onLogout={logout} /> : <LoginScreen onLogin={login} />;
}
