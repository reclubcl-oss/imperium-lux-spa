import { useState, useEffect, useCallback } from 'react';
import {
  DIAS_SEMANA, getRecurringBlocks, addRecurringBlock, deleteRecurringBlock,
  getExceptions, upsertException, deleteException,
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

// Horario semanal y excepciones de un profesional. Lo usa la intranet (cada uno el suyo)
// y el admin (el de cualquiera del equipo).
export default function StaffSchedule({ staffId }) {
  const [blocks, setBlocks] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBlock, setNewBlock] = useState({ diaSemana: '1', horaInicio: '09:00', horaFin: '13:00' });
  const [newException, setNewException] = useState({ fecha: '', tipo: 'no_disponible', horaInicio: '10:00', horaFin: '14:00', motivo: '' });

  const reload = useCallback(() => (
    Promise.all([getRecurringBlocks(staffId), getExceptions(staffId)]).then(([b, e]) => {
      setBlocks(b.data || []);
      setExceptions(e.data || []);
      setLoading(false);
    })
  ), [staffId]);

  useEffect(() => { reload(); }, [reload]);

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

