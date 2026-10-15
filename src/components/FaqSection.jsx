import { useContext, useState } from 'react';
import SectionDivider from './SectionDivider';
import { E } from './Editable';
import { EditContext, useSite } from '../utils/siteContent';

export default function FaqSection() {
  const { preguntas } = useSite();
  const { editing } = useContext(EditContext);
  const [open, setOpen] = useState(0);
  if (!editing && !preguntas.items.length) return null;

  return (
    <section id="preguntas" style={{ background: 'var(--cream)', padding: 'clamp(60px,10vw,96px) 16px', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px,5vw,44px)' }}>
          <p style={{ color: 'var(--gold-text)', fontSize: '0.72rem', letterSpacing: '0.22em', fontFamily: 'var(--font-sans)', fontWeight: 700, marginBottom: '14px' }}><E path="preguntas.etiqueta" /></p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.8rem)', color: 'var(--ink)', marginBottom: '18px', fontWeight: 400 }}><E path="preguntas.titulo" /></h2>
          <SectionDivider margin="0 auto" />
        </div>

        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {preguntas.items.map((it, i) => {
            const isOpen = editing || open === i;
            return (
              <div key={i} style={{ background: 'var(--cream-soft)', border: `1px solid ${isOpen ? 'var(--gold-accent)' : 'var(--border)'}`, borderRadius: '14px', transition: 'border-color 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {editing ? (
                    <h3 style={{ flex: 1, padding: '18px 20px', fontFamily: 'var(--font-sans)', fontSize: '0.98rem', fontWeight: 700, color: 'var(--ink)' }}><E path={`preguntas.items.${i}.pregunta`} /></h3>
                  ) : (
                    <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} aria-controls={`faq-${i}`}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'transparent', border: 'none', padding: '18px 20px', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: '0.98rem', fontWeight: 700, color: 'var(--ink)' }}>
                      {it.pregunta}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                  )}
                </div>
                {isOpen && (
                  <p id={`faq-${i}`} className="faq-answer" style={{ padding: '0 20px 20px', fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.92rem', lineHeight: 1.75 }}><E path={`preguntas.items.${i}.respuesta`} /></p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
