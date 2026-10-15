import { useState } from 'react';
import { Link } from 'react-router-dom';
import SectionDivider from '../components/SectionDivider';
import { ServiceCard, TreatmentDetailModal } from '../components/Services';
import { useServiceList, useIsMobile, catOf, serviceImage } from '../utils/useServices';
import { useSite } from '../utils/siteContent';
import { whatsappLink } from '../utils/contact';

const slug = (t) => 'cat-' + t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Página con el catálogo completo de tratamientos, agrupado por categoría.
export default function Servicios() {
  const { paginaServicios: t, contacto } = useSite();
  const { services, loading } = useServiceList();
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState(null);

  const categories = [...new Set(services.map(catOf))];
  const goTo = (cat) => document.getElementById(slug(cat))?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      {/* Encabezado de la página */}
      <section style={{ background: 'linear-gradient(160deg, var(--cream) 0%, var(--sage) 100%)', padding: 'clamp(110px,16vw,150px) 16px clamp(36px,6vw,56px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <nav aria-label="Ruta" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--ink-soft)', marginBottom: '20px' }}>
            <Link to="/" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>Inicio</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page" style={{ color: 'var(--ink)', fontWeight: 600 }}>Tratamientos</span>
          </nav>
          <p style={{ color: 'var(--gold-text)', fontSize: '0.72rem', letterSpacing: '0.22em', fontFamily: 'var(--font-sans)', fontWeight: 700, marginBottom: '14px' }}>{t.etiqueta}</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,6vw,3.4rem)', color: 'var(--ink)', marginBottom: '18px', fontWeight: 400, lineHeight: 1.1 }}>{t.titulo}</h1>
          <SectionDivider margin="0 auto 16px" />
          <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', fontSize: 'clamp(0.92rem,2vw,1.02rem)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>{t.texto}</p>
        </div>
      </section>

      {/* Categorías: se quedan fijas al bajar para saltar de una a otra */}
      {categories.length > 1 && (
        <div style={{ position: 'sticky', top: '72px', zIndex: 40, background: 'rgba(255,254,251,0.96)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)' }}>
          <div className="category-chips" style={{ gap: '8px', maxWidth: '1100px', margin: '0 auto', padding: '12px 16px' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => goTo(cat)} style={{ background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '99px', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      <section style={{ background: 'var(--cream-soft)', padding: 'clamp(36px,6vw,64px) 16px clamp(48px,8vw,80px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Cargando tratamientos...</p>
          ) : services.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Pronto vas a encontrar aquí nuestros tratamientos.</p>
          ) : categories.map(cat => {
            const list = services.filter(s => catOf(s) === cat);
            return (
              <div key={cat} id={slug(cat)} style={{ scrollMarginTop: '150px', marginBottom: 'clamp(36px,6vw,60px)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem,4vw,1.9rem)', color: 'var(--ink)', fontWeight: 400 }}>{cat}</h2>
                  <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.78rem' }}>{list.length} {list.length === 1 ? 'tratamiento' : 'tratamientos'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,minmax(0,1fr))' : 'repeat(auto-fill,minmax(min(100%,230px),1fr))', gap: isMobile ? '12px' : '20px' }}>
                  {list.map(s => <ServiceCard key={s.id} service={s} isMobile={isMobile} imageSrc={serviceImage(s)} onOpen={setSelected} />)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cierre */}
      <section style={{ background: 'var(--forest)', padding: 'clamp(48px,8vw,80px) 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,4.5vw,2.4rem)', color: 'var(--cream)', fontWeight: 400, marginBottom: '14px' }}>{t.ctaTitulo}</h2>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,254,251,0.75)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '28px' }}>{t.ctaTexto}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/reservar" style={{ background: 'var(--gold-accent)', color: 'var(--forest)', padding: '15px 32px', fontSize: '0.9rem', fontWeight: 700, borderRadius: '99px', textDecoration: 'none', fontFamily: 'var(--font-sans)' }}>Agendar evaluación</Link>
            {contacto.mostrarWhatsapp && (
              <a href={whatsappLink('Hola! Me gustaría que me orienten sobre qué tratamiento elegir.')} target="_blank" rel="noreferrer"
                style={{ border: '1px solid rgba(255,254,251,0.5)', color: 'var(--cream)', padding: '15px 32px', fontSize: '0.9rem', fontWeight: 600, borderRadius: '99px', textDecoration: 'none', fontFamily: 'var(--font-sans)' }}>Consultar por WhatsApp</a>
            )}
          </div>
        </div>
      </section>

      {selected && <TreatmentDetailModal service={selected} imageSrc={serviceImage(selected)} onClose={() => setSelected(null)} />}

      <style>{`
        .category-chips { display: flex; flex-wrap: wrap; justify-content: center; }
        @media (max-width: 640px) {
          .category-chips { flex-wrap: nowrap; justify-content: flex-start; overflow-x: auto; scrollbar-width: none; }
          .category-chips::-webkit-scrollbar { display: none; }
        }
      `}</style>
    </>
  );
}
