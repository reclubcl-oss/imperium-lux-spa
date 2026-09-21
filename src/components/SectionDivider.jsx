/** Línea – hoja – línea, el motivo decorativo del sitio de referencia. */
export default function SectionDivider({ color = 'var(--gold-accent)', margin = '0 0 24px' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin }}>
      <div style={{ width: '48px', height: '1px', background: color }} />
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4">
        <path d="M12 21c0-7 4-12 9-14-1 6-4 11-9 14z" />
        <path d="M12 21c0-7-4-12-9-14 1 6 4 11 9 14z" />
        <path d="M12 21V9" />
      </svg>
      <div style={{ width: '48px', height: '1px', background: color }} />
    </div>
  );
}
