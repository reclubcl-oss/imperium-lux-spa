import { useState, useEffect, useMemo } from 'react';
import { getGastos, addGasto, deleteGasto } from '../utils/finance';
import { formatCLP } from '../utils/format';

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function StatCard({ label, value, tone }) {
  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px 28px' }}>
      <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em', marginBottom: '10px' }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-serif)', color: tone || 'var(--olive)', fontSize: '2rem', fontWeight: 400 }}>{value}</p>
    </div>
  );
}

export default function AdminFinanceView({ reservations }) {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ fecha: '', descripcion: '', monto: '', categoria: '' });
  const [saving, setSaving] = useState(false);

  const reload = () => {
    getGastos().then(({ data }) => { setGastos(data || []); setLoading(false); });
  };

  useEffect(() => { reload(); }, []);

  const monthKey = currentMonthKey();

  const ingresosMes = useMemo(() =>
    reservations
      .filter(r => r.fecha_iso?.startsWith(monthKey) && r.precio)
      .reduce((sum, r) => sum + Number(r.precio), 0),
    [reservations, monthKey]
  );

  const gastosMes = useMemo(() =>
    gastos.filter(g => g.fecha?.startsWith(monthKey)).reduce((sum, g) => sum + Number(g.monto), 0),
    [gastos, monthKey]
  );

  const balanceMes = ingresosMes - gastosMes;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.fecha || !form.descripcion || !form.monto) return;
    setSaving(true);
    await addGasto({ fecha: form.fecha, descripcion: form.descripcion, monto: Number(form.monto), categoria: form.categoria });
    setForm({ fecha: '', descripcion: '', monto: '', categoria: '' });
    setSaving(false);
    reload();
  };

  const handleDelete = async (id) => {
    await deleteGasto(id);
    reload();
  };

  const inputStyle = { background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--ink)' };

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="INGRESOS ESTE MES" value={formatCLP(ingresosMes)} />
        <StatCard label="GASTOS ESTE MES" value={formatCLP(gastosMes)} tone="#B3413A" />
        <StatCard label="BALANCE ESTE MES" value={formatCLP(balanceMes)} tone={balanceMes >= 0 ? 'var(--olive)' : '#B3413A'} />
      </div>
      <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.75rem', marginBottom: '24px' }}>
        Los ingresos se calculan sumando el precio que le pongas a cada reserva en la pestaña "Reservas".
      </p>

      {/* Add expense form */}
      <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px 28px', marginBottom: '20px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em', marginBottom: '18px' }}>+ AGREGAR GASTO</p>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>FECHA</label>
            <input required type="date" style={inputStyle} value={form.fecha} onChange={e => setForm(v => ({ ...v, fecha: e.target.value }))} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>DESCRIPCIÓN</label>
            <input required style={{ ...inputStyle, width: '100%' }} value={form.descripcion} onChange={e => setForm(v => ({ ...v, descripcion: e.target.value }))} placeholder="Arriendo, insumos, sueldo..." />
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>CATEGORÍA (OPCIONAL)</label>
            <input style={{ ...inputStyle, width: '100%' }} value={form.categoria} onChange={e => setForm(v => ({ ...v, categoria: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>MONTO (CLP)</label>
            <input required type="number" min="0" style={{ ...inputStyle, width: '140px' }} value={form.monto} onChange={e => setForm(v => ({ ...v, monto: e.target.value }))} />
          </div>
          <button type="submit" disabled={saving} style={{ background: 'var(--olive)', color: 'var(--cream)', border: 'none', padding: '10px 20px', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'GUARDANDO...' : 'AGREGAR'}
          </button>
        </form>
      </div>

      {/* Gastos table */}
      <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.68rem', letterSpacing: '0.15em' }}>GASTOS ({gastos.length})</p>
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Cargando...</div>
        ) : gastos.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Aún no hay gastos registrados.</div>
        ) : (
          <>
            <div className="admin-table-desktop" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['FECHA', 'DESCRIPCIÓN', 'CATEGORÍA', 'MONTO', ''].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-sans)', color: 'var(--gold-accent)', fontSize: '0.62rem', letterSpacing: '0.12em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gastos.map(g => (
                    <tr key={g.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{g.fecha}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontSize: '0.85rem' }}>{g.descripcion}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.85rem' }}>{g.categoria || '—'}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-sans)', color: '#B3413A', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{formatCLP(g.monto)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => handleDelete(g.id)} style={{ background: 'none', border: 'none', color: '#B3413A', cursor: 'pointer', fontSize: '0.8rem' }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-cards-mobile">
              {gastos.map(g => (
                <div key={g.id} style={{ padding: '16px', borderBottom: '1px solid var(--border-soft)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', fontWeight: 600, fontSize: '0.9rem' }}>{g.descripcion}</p>
                    <p style={{ fontFamily: 'var(--font-sans)', color: '#B3413A', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', marginLeft: '10px' }}>{formatCLP(g.monto)}</p>
                  </div>
                  <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.78rem' }}>{g.fecha} {g.categoria ? `· ${g.categoria}` : ''}</p>
                  <button onClick={() => handleDelete(g.id)} style={{ background: 'none', border: 'none', color: '#B3413A', cursor: 'pointer', fontSize: '0.78rem', padding: 0, marginTop: '8px' }}>Eliminar</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
