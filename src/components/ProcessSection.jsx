import SectionDivider from './SectionDivider';
import { E } from './Editable';
import { useSite } from '../utils/siteContent';

export default function ProcessSection() {
  const { proceso } = useSite();
  return (
    <section id="proceso" style={{ background: 'var(--sage)', padding: 'clamp(60px,10vw,96px) 16px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,6vw,52px)' }}>
          <p style={{ color: 'var(--gold-text)', fontSize: '0.72rem', letterSpacing: '0.22em', fontFamily: 'var(--font-sans)', fontWeight: 700, marginBottom: '14px' }}><E path="proceso.etiqueta" /></p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.8rem)', color: 'var(--ink)', marginBottom: '18px', fontWeight: 400 }}><E path="proceso.titulo" /></h2>
          <SectionDivider margin="0 auto 16px" />
          <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', fontSize: 'clamp(0.9rem,2vw,1rem)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}><E path="proceso.texto" /></p>
        </div>

        <ol className="stagger" style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,230px),1fr))', gap: 'clamp(16px,3vw,24px)' }}>
          {proceso.pasos.map((p, i) => (
            <li key={i} style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '16px', padding: '26px 22px', position: 'relative' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'var(--olive)', color: 'var(--cream)', fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '16px' }}>{i + 1}</span>
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: '1.15rem', fontWeight: 400, marginBottom: '8px' }}><E path={`proceso.pasos.${i}.titulo`} /></h3>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.88rem', lineHeight: 1.7 }}><E path={`proceso.pasos.${i}.texto`} /></p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
