import { useState, useEffect, useMemo } from 'react';
import { getLoyaltyThreshold, setLoyaltyThreshold } from '../utils/loyalty';

const inputStyle = { background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--ink)' };

export default function AdminClientsView({ reservations }) {
  const [threshold, setThreshold] = useState(5);
  const [thresholdInput, setThresholdInput] = useState('5');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getLoyaltyThreshold().then(({ value }) => {
      setThreshold(value);
      setThresholdInput(String(value));
    });
  }, []);

  const saveThreshold = async () => {
    const num = Number(thresholdInput);
    if (!num || num < 1) return;
    setSaving(true);
    await setLoyaltyThreshold(num);
    setThreshold(num);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clients = useMemo(() => {
    const map = {};
    reservations.forEach(r => {
      if (!r.email) return;
      const key = r.email.trim().toLowerCase();
      if (!map[key]) {
        map[key] = { email: r.email, nombre: r.nombre, telefono: r.telefono, visitas: 0, masReciente: r.created_at };
      }
      map[key].visitas += 1;
      if (r.created_at && (!map[key].masReciente || new Date(r.created_at) > new Date(map[key].masReciente))) {
        map[key].nombre = r.nombre;
        map[key].telefono = r.telefono;
        map[key].masReciente = r.created_at;
      }
    });
    return Object.values(map).sort((a, b) => b.visitas - a.visitas);
  }, [reservations]);

  return (
    <div>
      {/* Umbral de fidelidad */}
      <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px 28px', marginBottom: '20px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em', marginBottom: '14px' }}>VISITAS PARA UN BENEFICIO</p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="number" min="1" value={thresholdInput} onChange={e => setThresholdInput(e.target.value)} style={{ ...inputStyle, width: '100px' }} />
          <button onClick={saveThreshold} disabled={saving} style={{ background: 'var(--olive)', color: 'var(--cream)', border: 'none', padding: '9px 18px', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          {saved && <span style={{ color: 'var(--olive)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }}>✓ Guardado</span>}
        </div>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.78rem', marginTop: '10px' }}>
          Cada <strong style={{ color: 'var(--ink)' }}>{threshold}</strong> visitas, el cliente tiene un beneficio disponible (tú decides cuál dárselo).
        </p>
      </div>

      {/* Tabla de clientes */}
      <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em' }}>CLIENTES ({clients.length})</p>
        </div>
        {clients.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Aún no hay reservas registradas.</div>
        ) : (
          <>
            <div className="admin-table-desktop" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['NOMBRE', 'EMAIL', 'TELÉFONO', 'VISITAS', 'ESTADO'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-sans)', color: 'var(--gold-accent)', fontSize: '0.62rem', letterSpacing: '0.12em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map(c => {
                    const tienePremio = c.visitas > 0 && c.visitas % threshold === 0;
                    return (
                      <tr key={c.email} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontSize: '0.85rem' }}>{c.nombre || '—'}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.85rem' }}>{c.email}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.85rem' }}>{c.telefono || '—'}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'var(--font-serif)', color: 'var(--olive)', fontWeight: 700, fontSize: '0.95rem' }}>{c.visitas}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {tienePremio ? (
                            <span style={{ background: 'rgba(181,146,77,0.15)', color: 'var(--gold-accent)', padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontFamily: 'var(--font-sans)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              🎁 Beneficio disponible
                            </span>
                          ) : (
                            <span style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem' }}>
                              Faltan {threshold - (c.visitas % threshold)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="admin-cards-mobile">
              {clients.map(c => {
                const tienePremio = c.visitas > 0 && c.visitas % threshold === 0;
                return (
                  <div key={c.email} style={{ padding: '16px', borderBottom: '1px solid var(--border-soft)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontWeight: 600, fontSize: '0.9rem' }}>{c.nombre || '—'}</p>
                      <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--olive)', fontWeight: 700, fontSize: '1rem' }}>{c.visitas}</p>
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.78rem' }}>{c.email}</p>
                    <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.78rem', marginBottom: '8px' }}>{c.telefono || '—'}</p>
                    {tienePremio ? (
                      <span style={{ background: 'rgba(181,146,77,0.15)', color: 'var(--gold-accent)', padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                        🎁 Beneficio disponible
                      </span>
                    ) : (
                      <span style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem' }}>
                        Faltan {threshold - (c.visitas % threshold)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
