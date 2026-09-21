import { useState, useEffect } from 'react';
import { getReservations } from '../utils/supabase';
import { signIn, signOut, getMyStaffProfile } from '../utils/staffAuth';
import { getAllStaff, updateStaffMember, createStaffMember } from '../utils/staffAdmin';
import AdminCalendarView from '../components/AdminCalendarView';
import AdminFinanceView from '../components/AdminFinanceView';
import AdminServicesView from '../components/AdminServicesView';
import AdminClientsView from '../components/AdminClientsView';
import AdminLinksView from '../components/AdminLinksView';
import AdminNotificationsView from '../components/AdminNotificationsView';
import AdminReservasView from '../components/AdminReservasView';

// ─── Helpers ────────────────────────────────────────────────────────────────

// ─── Login Screen ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');

    const result = await signIn(email, pw);
    if (!result.success) {
      setErr('Credenciales incorrectas');
      setLoading(false);
      return;
    }

    const profile = await getMyStaffProfile();
    if (!profile.success || profile.data.rol !== 'admin') {
      await signOut();
      setErr('Esta cuenta no tiene acceso al panel de administración');
      setLoading(false);
      return;
    }

    onLogin();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--olive)', fontSize: '1.4rem', fontWeight: 400, letterSpacing: '0.02em' }}>IMPERIUM</p>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.65rem', letterSpacing: '0.3em', marginBottom: '40px' }}>CLÍNICA ESTÉTICA · ADMIN</p>

        <form onSubmit={submit} style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '14px', padding: '36px', boxShadow: '0 12px 32px rgba(23,27,22,0.06)' }}>
          <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: '1.3rem', marginBottom: '24px', fontWeight: 400 }}>Panel de Administración</p>
          <div style={{ marginBottom: '16px', textAlign: 'left' }}>
            <label style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@imperiumluxspa.com"
              autoFocus
              style={{
                width: '100%', background: '#FFFFFF',
                border: `1px solid ${err ? '#B3413A' : 'var(--border)'}`,
                borderRadius: '8px', padding: '12px 16px',
                color: 'var(--ink)', fontFamily: 'var(--font-sans)',
                fontSize: '1rem', outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>CONTRASEÑA</label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="••••••••••"
              style={{
                width: '100%', background: '#FFFFFF',
                border: `1px solid ${err ? '#B3413A' : 'var(--border)'}`,
                borderRadius: '8px', padding: '12px 16px',
                color: 'var(--ink)', fontFamily: 'var(--font-sans)',
                fontSize: '1rem', outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
            {err && <p style={{ color: '#B3413A', fontSize: '0.78rem', marginTop: '6px', fontFamily: 'var(--font-sans)' }}>{err}</p>}
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--olive)', color: 'var(--cream)', border: 'none', padding: '13px', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'INGRESANDO...' : 'INGRESAR'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

// ─── Gestión de Equipo ─────────────────────────────────────────────────────────
const actionBtn = {
  background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px',
  padding: '5px 10px', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', cursor: 'pointer', color: 'var(--ink)',
};

function StaffRow({ member, onSaved, variant = 'table' }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nombre: member.nombre, email: member.email || '', especialidad: member.especialidad || '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await updateStaffMember(member.id, form);
    setSaving(false);
    setEditing(false);
    onSaved();
  };

  const toggleActivo = async () => {
    await updateStaffMember(member.id, { activo: !member.activo });
    onSaved();
  };

  const cellStyle = { padding: '12px 16px', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--ink)' };
  const smallInput = { background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 10px', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--ink)', width: '100%' };

  const rolBadge = (
    <span style={{ background: member.rol === 'admin' ? 'rgba(181,146,77,0.15)' : 'var(--border-soft)', color: member.rol === 'admin' ? 'var(--gold-accent)' : 'var(--olive)', padding: '3px 8px', borderRadius: '99px', fontSize: '0.7rem' }}>
      {member.rol === 'admin' ? 'Admin' : 'Profesional'}
    </span>
  );

  const actions = editing ? (
    <>
      <button onClick={save} disabled={saving} style={{ ...actionBtn, background: 'var(--olive)', color: 'var(--cream)', marginRight: '6px' }}>{saving ? '...' : 'Guardar'}</button>
      <button onClick={() => setEditing(false)} style={actionBtn}>Cancelar</button>
    </>
  ) : (
    <>
      <button onClick={() => setEditing(true)} style={{ ...actionBtn, marginRight: '6px' }}>Editar</button>
      <button onClick={toggleActivo} style={{ ...actionBtn, color: member.activo ? '#B3413A' : 'var(--olive)' }}>
        {member.activo ? 'Desactivar' : 'Activar'}
      </button>
    </>
  );

  if (variant === 'card') {
    return (
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-soft)', opacity: member.activo ? 1 : 0.5 }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
            <input style={smallInput} value={form.nombre} onChange={e => setForm(v => ({ ...v, nombre: e.target.value }))} placeholder="Nombre" />
            <input style={smallInput} value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))} placeholder="Email" />
            <input style={smallInput} value={form.especialidad} onChange={e => setForm(v => ({ ...v, especialidad: e.target.value }))} placeholder="Especialidad" />
          </div>
        ) : (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontWeight: 600, fontSize: '0.9rem' }}>{member.nombre}</p>
              {rolBadge}
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.78rem' }}>{member.email || '—'}</p>
            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.78rem' }}>{member.especialidad || 'Sin especialidad'}</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', marginTop: '4px' }}>
              <span style={{ color: member.activo ? 'var(--olive)' : '#B3413A', fontWeight: 600 }}>{member.activo ? 'Activo' : 'Inactivo'}</span>
            </p>
          </div>
        )}
        <div>{actions}</div>
      </div>
    );
  }

  return (
    <tr style={{ borderBottom: '1px solid var(--border-soft)', opacity: member.activo ? 1 : 0.5 }}>
      <td style={cellStyle}>
        {editing ? <input style={smallInput} value={form.nombre} onChange={e => setForm(v => ({ ...v, nombre: e.target.value }))} /> : member.nombre}
      </td>
      <td style={cellStyle}>
        {editing ? <input style={smallInput} value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))} /> : (member.email || '—')}
      </td>
      <td style={cellStyle}>
        {editing ? <input style={smallInput} value={form.especialidad} onChange={e => setForm(v => ({ ...v, especialidad: e.target.value }))} /> : (member.especialidad || '—')}
      </td>
      <td style={cellStyle}>{rolBadge}</td>
      <td style={cellStyle}>
        <span style={{ color: member.activo ? 'var(--olive)' : '#B3413A', fontWeight: 600 }}>{member.activo ? 'Activo' : 'Inactivo'}</span>
      </td>
      <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>{actions}</td>
    </tr>
  );
}

function AddStaffForm({ onCreated }) {
  const [form, setForm] = useState({ nombre: '', email: '', especialidad: '', rol: 'profesional' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    const res = await createStaffMember(form);
    setLoading(false);
    if (!res.success) { setError(res.error); return; }
    setResult({ email: form.email, password: res.password });
    setForm({ nombre: '', email: '', especialidad: '', rol: 'profesional' });
    onCreated();
  };

  const inputStyle = { background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--ink)' };

  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px 28px', marginBottom: '20px' }}>
      <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em', marginBottom: '18px' }}>+ AGREGAR PROFESIONAL</p>

      {result && (
        <div style={{ background: 'rgba(181,146,77,0.1)', border: '1px solid var(--gold-accent)', borderRadius: '8px', padding: '14px 18px', marginBottom: '16px', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--ink)' }}>
          Cuenta creada para <strong>{result.email}</strong>.<br/>
          Contraseña temporal: <strong style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{result.password}</strong>
          <p style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: '6px' }}>Guarda o copia esta contraseña ahora — no se volverá a mostrar. Compártela con la persona por un canal seguro.</p>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(179,65,58,0.06)', border: '1px solid rgba(179,65,58,0.25)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontFamily: 'var(--font-sans)', color: '#B3413A', fontSize: '0.82rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={submit} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 160px' }}>
          <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>NOMBRE</label>
          <input required style={{ ...inputStyle, width: '100%' }} value={form.nombre} onChange={e => setForm(v => ({ ...v, nombre: e.target.value }))} />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>EMAIL</label>
          <input required type="email" style={{ ...inputStyle, width: '100%' }} value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))} />
        </div>
        <div style={{ flex: '1 1 160px' }}>
          <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>ESPECIALIDAD</label>
          <input style={{ ...inputStyle, width: '100%' }} value={form.especialidad} onChange={e => setForm(v => ({ ...v, especialidad: e.target.value }))} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>ROL</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.rol} onChange={e => setForm(v => ({ ...v, rol: e.target.value }))}>
            <option value="profesional">Profesional</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" disabled={loading} style={{ background: 'var(--olive)', color: 'var(--cream)', border: 'none', padding: '10px 20px', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'CREANDO...' : 'CREAR CUENTA'}
        </button>
      </form>
    </div>
  );
}

function StaffManager() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    getAllStaff().then(({ data }) => { setStaff(data || []); setLoading(false); });
  };

  useEffect(() => { reload(); }, []);

  return (
    <div>
      <AddStaffForm onCreated={reload} />

      <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em' }}>EQUIPO ({staff.length})</p>
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Cargando...</div>
        ) : staff.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Aún no hay profesionales. Agrega el primero arriba.</div>
        ) : (
          <>
            <div className="admin-table-desktop" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['NOMBRE', 'EMAIL', 'ESPECIALIDAD', 'ROL', 'ESTADO', ''].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-sans)', color: 'var(--gold-text)', fontSize: '0.62rem', letterSpacing: '0.12em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staff.map(m => <StaffRow key={m.id} member={m} onSaved={reload} variant="table" />)}
                </tbody>
              </table>
            </div>
            <div className="admin-cards-mobile">
              {staff.map(m => <StaffRow key={m.id} member={m} onSaved={reload} variant="card" />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('reservas');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  const handlePrecioSaved = (id, precio) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, precio } : r));
  };

  useEffect(() => {
    getReservations().then(({ success, data, error }) => {
      if (success) setReservations(data);
      else setError(error);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream-soft)', paddingTop: '0' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border)', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--olive)', fontSize: '1.1rem', fontWeight: 400 }}>IMPERIUM</span>
          <span style={{ color: 'var(--border)', fontSize: '1rem' }}>|</span>
          <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.75rem', letterSpacing: '0.15em' }}>PANEL ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.75rem', textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.color = 'var(--olive)'} onMouseLeave={e => e.target.style.color = 'var(--ink-soft)'}>
            VER SITIO
          </a>
          <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--ink-soft)', padding: '6px 14px', borderRadius: '6px', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', cursor: 'pointer' }}>
            SALIR
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(20px,4vw,32px) clamp(12px,3vw,24px)' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '4px', fontWeight: 400 }}>
            {({ reservas: 'Dashboard de Reservas', calendario: 'Calendario', finanzas: 'Finanzas', servicios: 'Tratamientos', clientes: 'Clientes y Fidelidad', enlaces: 'Enlaces', avisos: 'Notificaciones', equipo: 'Gestión de Equipo' })[tab]}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.82rem' }}>
            {(d => d.charAt(0).toUpperCase() + d.slice(1))(new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))}
          </p>
        </div>

        {/* Tabs */}
        <div className="admin-tabs" style={{ display: 'flex', gap: '2px', marginBottom: '28px', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          {[['reservas', 'RESERVAS'], ['calendario', 'CALENDARIO'], ['finanzas', 'FINANZAS'], ['servicios', 'SERVICIOS'], ['clientes', 'CLIENTES'], ['enlaces', 'ENLACES'], ['avisos', 'NOTIFICACIONES'], ['equipo', 'EQUIPO']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: 'transparent',
              color: tab === key ? 'var(--olive)' : 'var(--ink-soft)',
              border: 'none',
              borderBottom: tab === key ? '2px solid var(--olive)' : '2px solid transparent',
              marginBottom: '-1px', padding: '12px 16px', fontFamily: 'var(--font-sans)',
              fontSize: '0.74rem', letterSpacing: '0.08em', fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'color 0.15s, border-color 0.15s',
            }}
              onMouseEnter={e => { if (tab !== key) e.currentTarget.style.color = 'var(--ink)'; }}
              onMouseLeave={e => { if (tab !== key) e.currentTarget.style.color = 'var(--ink-soft)'; }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'equipo' && <StaffManager />}
        {tab === 'calendario' && <AdminCalendarView reservations={reservations} />}
        {tab === 'finanzas' && <AdminFinanceView reservations={reservations} />}
        {tab === 'servicios' && <AdminServicesView />}
        {tab === 'clientes' && <AdminClientsView reservations={reservations} />}
        {tab === 'enlaces' && <AdminLinksView />}
        {tab === 'avisos' && <AdminNotificationsView />}

        {tab === 'reservas' && <AdminReservasView reservations={reservations} loading={loading} error={error} onPrecioSaved={handlePrecioSaved} />}
      </div>

      <style>{`
        select option { background: #FFFFFF; color: var(--ink); }
        .admin-tabs { scrollbar-width: none; }
        .admin-tabs::-webkit-scrollbar { display: none; }
        @media (min-width: 640px) { .admin-cards-mobile { display: none !important; } }
        @media (max-width: 639px) { .admin-table-desktop { display: none !important; } }
      `}</style>
    </div>
  );
}

// ─── Page export ─────────────────────────────────────────────────────────────
export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getMyStaffProfile().then(profile => {
      setAuth(profile.success && profile.data.rol === 'admin');
      setChecking(false);
    });
  }, []);

  const login  = () => setAuth(true);
  const logout = async () => { await signOut(); setAuth(false); };

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--olive)', fontFamily: 'var(--font-sans)' }}>
        Cargando...
      </div>
    );
  }

  return auth ? <Dashboard onLogout={logout} /> : <LoginScreen onLogin={login} />;
}
