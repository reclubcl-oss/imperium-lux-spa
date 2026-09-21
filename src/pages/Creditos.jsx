import SectionDivider from '../components/SectionDivider';

// Créditos de fotografías con licencia Creative Commons que exigen atribución
// (CC BY / CC BY-SA). Las fotos marcadas CC0 en IMAGE-CREDITS.md no se listan
// acá porque esa licencia no la requiere.
const CREDITS = [
  { treatment: 'Hidratación Profunda', author: 'Zenspa1', license: 'CC BY 2.0' },
  { treatment: 'Bótox & Rellenos', author: 'Dr. Braun (Vancouver, Canadá)', license: 'CC BY-SA 2.0' },
  { treatment: 'Plasma Rico en Plaquetas', author: 'SpicyMilkBoy', license: 'CC BY-SA 2.0' },
  { treatment: 'Bioestimuladores', author: 'ama regen med', license: 'CC BY-SA 2.0' },
  { treatment: 'Reducción de Medidas', author: 'Phil Gradwell', license: 'CC BY 2.0' },
  { treatment: 'Drenaje Linfático', author: 'Tara Angkor Hotel', license: 'CC BY 2.0' },
  { treatment: 'Láser Depilación', author: 'Vancouver Laser & Skincare Centre (Dr. Braun)', license: 'CC BY-SA 2.0' },
  { treatment: 'Ritual de Oro', author: 'Unique Hotels Group', license: 'CC BY-SA 2.0' },
];

export default function Creditos() {
  return (
    <section style={{ background: 'var(--cream-soft)', padding: 'clamp(80px,10vw,120px) 16px clamp(60px,8vw,90px)', minHeight: '60vh' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <p style={{ color: 'var(--gold-accent)', fontSize: '0.72rem', letterSpacing: '0.22em', fontFamily: 'var(--font-sans)', fontWeight: 700, marginBottom: '14px', textAlign: 'center' }}>TRANSPARENCIA</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.4rem)', color: 'var(--ink)', marginBottom: '18px', fontWeight: 400, textAlign: 'center' }}>Créditos de Fotografías</h1>
        <SectionDivider margin="0 auto 24px" />
        <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', fontSize: '0.92rem', lineHeight: 1.8, marginBottom: '36px', textAlign: 'center' }}>
          Algunas fotos de tratamientos que aún no tienen imagen propia usan fotografías de banco
          de licencia libre mientras se reemplazan por fotos reales de la clínica. Las que exigen
          atribución por su licencia Creative Commons están listadas aquí.
        </p>

        <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {CREDITS.map((c, i) => (
            <div key={c.treatment} style={{ padding: '16px 22px', borderBottom: i < CREDITS.length - 1 ? '1px solid var(--border-soft)' : 'none', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: '0.95rem' }}>{c.treatment}</p>
                <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.78rem', marginTop: '2px' }}>Foto: {c.author}</p>
              </div>
              <span style={{ alignSelf: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.68rem', letterSpacing: '0.05em', color: 'var(--gold-accent)', border: '1px solid var(--border)', borderRadius: '99px', padding: '4px 10px', whiteSpace: 'nowrap' }}>
                {c.license}
              </span>
            </div>
          ))}
        </div>

        <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', lineHeight: 1.7, marginTop: '24px', textAlign: 'center' }}>
          Todas obtenidas a través de <a href="https://openverse.org" target="_blank" rel="noreferrer" style={{ color: 'var(--gold-accent)' }}>Openverse</a>.
        </p>
      </div>
    </section>
  );
}
