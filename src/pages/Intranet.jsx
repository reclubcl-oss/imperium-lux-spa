import { useState, useEffect } from 'react';
import { signIn, signOut, getMyStaffProfile } from '../utils/staffAuth';
import {
  DIAS_SEMANA, getRecurringBlocks, addRecurringBlock, deleteRecurringBlock,
  getExceptions, upsertException, deleteException, getMyBookings,
} from '../utils/schedule';

const inputStyle = {
  background: '#FFFFFF', border: '1px solid var(--border)',
  borderRadius: '8px', padding: '9px 12px', color: 'var(--ink)',
  fontFamily: 'var(--font-sans)', fontSize: '0.85rem', outline: 'none',
};

const cardStyle = {
  background: 'var(--cream)', border: '1px solid var(--border)',
  borderRadius: '12px', padding: '20px 24px',
};

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
    if (!profile.success) {
      await signOut();
      setErr('Esta cuenta no está registrada como staff');
      setLoading(false);
      return;
    }

    onLogin(profile.data);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--olive)', fontSize: '1.4rem', fontWeight: 400, letterSpacing: '0.02em' }}>IMPERIUM</p>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.65rem', letterSpacing: '0.3em', marginBottom: '40px' }}>CLÍNICA ESTÉTICA · INTRANET</p>

        <form onSubmit={submit} style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '14px', padding: '36px', boxShadow: '0 12px 32px rgba(23,27,22,0.06)' }}>
          <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: '1.3rem', marginBottom: '24px', fontWeight: 400 }}>Acceso Profesionales</p>
          <div style={{ marginBottom: '16px', textAlign: 'left' }}>
            <label style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@imperiumluxspa.com" autoFocus
              style={{ ...inputStyle, width: '100%', padding: '12px 16px', fontSize: '1rem', border: `1px solid ${err ? '#B3413A' : 'var(--border)'}` }} />
          </div>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>CONTRASEÑA</label>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••••"
              style={{ ...inputStyle, width: '100%', padding: '12px 16px', fontSize: '1rem', border: `1px solid ${err ? '#B3413A' : 'var(--border)'}` }} />
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

// ─── Mi Horario ──────────────────────────────────────────────────────────────
function MiHorario({ staffId }) {
  const [blocks, setBlocks] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBlock, setNewBlock] = useState({ diaSemana: '1', horaInicio: '09:00', horaFin: '13:00' });
  const [newException, setNewException] = useState({ fecha: '', tipo: 'no_disponible', horaInicio: '10:00', horaFin: '14:00', motivo: '' });

  const reload = () => {
    setLoading(true);
    Promise.all([getRecurringBlocks(staffId), getExceptions(staffId)]).then(([b, e]) => {
      setBlocks(b.data || []);
      setExceptions(e.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { reload(); }, [staffId]);

  const handleAddBlock = async (e) => {
    e.preventDefault();
    await addRecurringBlock({ staffId, diaSemana: Number(newBlock.diaSemana), horaInicio: newBlock.horaInicio, horaFin: newBlock.horaFin });
    reload();
  };

  const handleDeleteBlock = async (id) => {
    await deleteRecurringBlock(id);
    reload();
  };

  const handleAddException = async (e) => {
    e.preventDefault();
    if (!newException.fecha) return;
    await upsertException({
      staffId,
      fecha: newException.fecha,
      tipo: newException.tipo,
      horaInicio: newException.tipo === 'horario_especial' ? newException.horaInicio : null,
      horaFin: newException.tipo === 'horario_especial' ? newException.horaFin : null,
      motivo: newException.motivo,
    });
    setNewException({ fecha: '', tipo: 'no_disponible', horaInicio: '10:00', horaFin: '14:00', motivo: '' });
    reload();
  };

  const handleDeleteException = async (id) => {
    await deleteException(id);
    reload();
  };

  if (loading) return <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Cargando horario...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Horario semanal */}
      <div style={cardStyle}>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em', marginBottom: '18px' }}>HORARIO SEMANAL</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {DIAS_SEMANA.map((label, dia) => {
            const dayBlocks = blocks.filter(b => b.dia_semana === dia);
            return (
              <div key={dia} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
                <span style={{ width: '90px', flexShrink: 0, fontFamily: 'var(--font-sans)', color: 'var(--gold-text)', fontSize: '0.8rem', fontWeight: 600 }}>{label}</span>
                {dayBlocks.length === 0 && <span style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem' }}>Día libre</span>}
                {dayBlocks.map(b => (
                  <span key={b.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--border-soft)', color: 'var(--ink)', padding: '4px 10px', borderRadius: '99px', fontSize: '0.78rem', fontFamily: 'var(--font-sans)' }}>
                    {b.hora_inicio.slice(0,5)} – {b.hora_fin.slice(0,5)}
                    <button onClick={() => handleDeleteBlock(b.id)} style={{ background: 'none', border: 'none', color: '#B3413A', cursor: 'pointer', fontSize: '0.85rem', lineHeight: 1, padding: 0 }} aria-label="Eliminar bloque">✕</button>
                  </span>
                ))}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleAddBlock} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>DÍA</label>
            <select value={newBlock.diaSemana} onChange={e => setNewBlock(v => ({ ...v, diaSemana: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
              {DIAS_SEMANA.map((label, i) => <option key={i} value={i}>{label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>DESDE</label>
            <input type="time" value={newBlock.horaInicio} onChange={e => setNewBlock(v => ({ ...v, horaInicio: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>HASTA</label>
            <input type="time" value={newBlock.horaFin} onChange={e => setNewBlock(v => ({ ...v, horaFin: e.target.value }))} style={inputStyle} />
          </div>
          <button type="submit" style={{ background: 'var(--olive)', color: 'var(--cream)', border: 'none', padding: '9px 18px', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
            + AGREGAR BLOQUE
          </button>
        </form>
      </div>

      {/* Excepciones */}
      <div style={cardStyle}>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em', marginBottom: '18px' }}>EXCEPCIONES (VACACIONES, PERMISOS, HORARIO ESPECIAL)</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {exceptions.length === 0 && <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }}>Sin excepciones próximas.</p>}
          {exceptions.map(ex => (
            <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'var(--cream-soft)', borderRadius: '8px' }}>
              <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontSize: '0.82rem', fontWeight: 600 }}>{ex.fecha}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '99px', background: ex.tipo === 'no_disponible' ? 'rgba(179,65,58,0.1)' : 'var(--border-soft)', color: ex.tipo === 'no_disponible' ? '#B3413A' : 'var(--olive)' }}>
                {ex.tipo === 'no_disponible' ? 'No disponible' : `Especial ${ex.hora_inicio?.slice(0,5)}–${ex.hora_fin?.slice(0,5)}`}
              </span>
              {ex.motivo && <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.78rem' }}>{ex.motivo}</span>}
              <button onClick={() => handleDeleteException(ex.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#B3413A', cursor: 'pointer', fontSize: '0.85rem' }} aria-label="Eliminar excepción">✕</button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddException} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>FECHA</label>
            <input type="date" value={newException.fecha} onChange={e => setNewException(v => ({ ...v, fecha: e.target.value }))} style={inputStyle} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>TIPO</label>
            <select value={newException.tipo} onChange={e => setNewException(v => ({ ...v, tipo: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="no_disponible">No disponible</option>
              <option value="horario_especial">Horario especial</option>
            </select>
          </div>
          {newException.tipo === 'horario_especial' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>DESDE</label>
                <input type="time" value={newException.horaInicio} onChange={e => setNewException(v => ({ ...v, horaInicio: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>HASTA</label>
                <input type="time" value={newException.horaFin} onChange={e => setNewException(v => ({ ...v, horaFin: e.target.value }))} style={inputStyle} />
              </div>
            </>
          )}
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>MOTIVO (OPCIONAL)</label>
            <input type="text" value={newException.motivo} onChange={e => setNewException(v => ({ ...v, motivo: e.target.value }))} placeholder="Vacaciones..." style={{ ...inputStyle, width: '100%' }} />
          </div>
          <button type="submit" style={{ background: 'var(--olive)', color: 'var(--cream)', border: 'none', padding: '9px 18px', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
            + AGREGAR
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Mis Citas ───────────────────────────────────────────────────────────────
function MisCitas({ staffId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookings(staffId).then(({ data }) => { setBookings(data || []); setLoading(false); });
  }, [staffId]);

  if (loading) return <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Cargando citas...</p>;

  return (
    <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em' }}>MIS PRÓXIMAS CITAS</p>
      </div>
      {bookings.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Aún no tienes citas agendadas.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['FECHA', 'HORA', 'CLIENTE', 'SERVICIO', 'TELÉFONO'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontFamily: 'var(--font-sans)', color: 'var(--gold-text)', fontSize: '0.62rem', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((r, i) => (
                <tr key={r.id || i} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.82rem' }}>{r.fecha || '—'}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-sans)', color: 'var(--olive)', fontWeight: 700, fontSize: '0.82rem' }}>{r.hora || '—'}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontSize: '0.82rem' }}>{r.nombre || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: 'var(--border-soft)', color: 'var(--olive)', padding: '3px 8px', borderRadius: '99px', fontSize: '0.7rem', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{r.servicio || '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.82rem' }}>{r.telefono || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ profile, onLogout }) {
  const [tab, setTab] = useState('horario');

  const tabStyle = (active) => ({
    background: active ? 'var(--border-soft)' : 'transparent',
    color: active ? 'var(--olive)' : 'var(--ink-soft)',
    border: active ? '1px solid var(--olive)' : '1px solid transparent',
    padding: '8px 16px', borderRadius: '8px', fontFamily: 'var(--font-sans)',
    fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream-soft)' }}>
      <div style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border)', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--olive)', fontSize: '1.1rem', fontWeight: 400 }}>IMPERIUM</span>
          <span style={{ color: 'var(--border)', fontSize: '1rem' }}>|</span>
          <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>INTRANET · {profile.nombre.toUpperCase()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.75rem', textDecoration: 'none' }}>VER SITIO</a>
          <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--ink-soft)', padding: '6px 14px', borderRadius: '6px', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', cursor: 'pointer' }}>SALIR</button>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'clamp(20px,4vw,32px) clamp(12px,3vw,24px)' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', marginBottom: '14px', fontWeight: 400 }}>Hola, {profile.nombre}</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={tabStyle(tab === 'horario')} onClick={() => setTab('horario')}>MI HORARIO</button>
            <button style={tabStyle(tab === 'citas')} onClick={() => setTab('citas')}>MIS CITAS</button>
          </div>
        </div>

        {tab === 'horario' ? <MiHorario staffId={profile.id} /> : <MisCitas staffId={profile.id} />}
      </div>
    </div>
  );
}

// ─── Page export ─────────────────────────────────────────────────────────────
export default function Intranet() {
  const [profile, setProfile] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getMyStaffProfile().then(result => {
      if (result.success) setProfile(result.data);
      setChecking(false);
    });
  }, []);

  const logout = async () => { await signOut(); setProfile(null); };

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--olive)', fontFamily: 'var(--font-sans)' }}>
        Cargando...
      </div>
    );
  }

  return profile ? <Dashboard profile={profile} onLogout={logout} /> : <LoginScreen onLogin={setProfile} />;
}
