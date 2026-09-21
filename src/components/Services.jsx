import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import SectionDivider from './SectionDivider';
import { getActiveServices } from '../utils/services';
import { CATEGORY_DEFAULT_IMAGE } from '../utils/categoryDefaults';
import { TREATMENT_DEFAULT_IMAGE } from '../utils/treatmentDefaults';
import { formatCLP } from '../utils/format';
import { useFocusTrap } from '../utils/useFocusTrap';

// Mismo número que aparece en el pie de página (+56 9 7149 4060), en formato
// internacional sin espacios ni símbolos, como lo pide el link de WhatsApp.
const WHATSAPP_NUMBER = '56971494060';

function PlaceholderPhoto({ nombre }) {
  return (
    <div style={{
      width: '100%', aspectRatio: '4/3', borderRadius: '12px 12px 0 0',
      background: 'linear-gradient(150deg, var(--border-soft), var(--border))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--olive)', opacity: 0.55, lineHeight: 1 }}>
        {nombre?.charAt(0)?.toUpperCase() || '✦'}
      </span>
    </div>
  );
}

// Con 24 fotos en la grilla, cargarlas todas de golpe se siente lento y
// además cada una aparecía de un salto apenas terminaba de cargar. Esto
// arregla ambas cosas: `loading="lazy"` hace que el navegador solo pida las
// fotos cercanas a la pantalla (las de más abajo esperan a que hagas
// scroll), y el fundido de opacidad hace que cada una aparezca suave en vez
// de "poof" — mientras carga se ve el mismo tono neutro de fondo, no un
// hueco en blanco.
function TreatmentImage({ src, alt, radius }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--border-soft)', borderRadius: radius || 0 }}>
      <img
        src={src} alt={alt} loading="lazy" decoding="async"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          opacity: loaded ? 1 : 0, transition: 'opacity 0.5s ease',
        }}
      />
    </div>
  );
}

const whatsappHref = (nombre) => {
  const text = `Hola! Me gustaría más información sobre ${nombre}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
};

// Ficha del tratamiento — se abre al tocar la foto en la grilla, en vez de
// ir directo a reservar. Así el cliente ve bien de qué se trata antes de
// decidir entre agendar de una vez o preguntar primero por WhatsApp.
function TreatmentDetailModal({ service, imageSrc, onClose }) {
  const cardRef = useRef(null);
  useFocusTrap(cardRef);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="dialog" aria-modal="true" aria-label={service.nombre} onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(23,27,22,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'treatmentModalFadeIn 0.2s ease' }}
    >
      <div ref={cardRef} tabIndex={-1} onClick={e => e.stopPropagation()} style={{ outline: 'none', background: 'var(--cream)', borderRadius: '20px', width: '100%', maxWidth: '440px', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 30px 70px rgba(23,27,22,0.3)', animation: 'treatmentModalPop 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ position: 'relative' }}>
          {imageSrc
            ? <TreatmentImage src={imageSrc} alt={service.nombre} radius="20px 20px 0 0" />
            : <PlaceholderPhoto nombre={service.nombre} />}
          <button onClick={onClose} aria-label="Cerrar" style={{
            position: 'absolute', top: '12px', right: '12px', width: '34px', height: '34px', borderRadius: '50%',
            background: 'rgba(23,27,22,0.55)', border: 'none', color: 'var(--cream)', fontSize: '1rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <div style={{ padding: '24px 26px 28px' }}>
          {service.categoria && (
            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--gold-accent)', fontSize: '0.65rem', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '8px' }}>
              {service.categoria.toUpperCase()}
            </p>
          )}
          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '10px' }}>{service.nombre}</h3>
          {service.precio && (
            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--olive)', fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>{formatCLP(service.precio)}</p>
          )}
          {service.descripcion && (
            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '10px' }}>{service.descripcion}</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '18px' }}>
            <Link to={`/reservar?servicio=${encodeURIComponent(service.nombre)}`} onClick={onClose}
              style={{ background: 'var(--olive)', color: 'var(--cream)', padding: '14px', borderRadius: '10px', textAlign: 'center', textDecoration: 'none', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.85rem', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--olive-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--olive)'}>
              Agendar este tratamiento
            </Link>
            <a href={whatsappHref(service.nombre)} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--ink)', padding: '14px', borderRadius: '10px', textDecoration: 'none', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.85rem', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-accent)'; e.currentTarget.style.background = 'var(--cream-soft)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.6 6.32A8.86 8.86 0 0 0 11.9 4a8.94 8.94 0 0 0-7.75 13.4L3 21l3.7-1.1a8.9 8.9 0 0 0 5.2 1.67h.01a8.94 8.94 0 0 0 8.94-8.93 8.87 8.87 0 0 0-3.25-6.32ZM11.9 20a7.4 7.4 0 0 1-3.79-1.04l-.27-.16-2.24.66.65-2.18-.18-.28A7.44 7.44 0 1 1 19.35 12.6 7.45 7.45 0 0 1 11.9 20Zm4.08-5.58c-.22-.11-1.32-.65-1.53-.72-.2-.08-.35-.11-.5.11-.15.22-.58.72-.71.87-.13.15-.26.16-.48.06-.22-.11-.94-.35-1.79-1.11a6.72 6.72 0 0 1-1.24-1.55c-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.06-.11-.5-1.21-.69-1.66-.18-.43-.36-.37-.5-.38h-.43a.83.83 0 0 0-.6.28 2.5 2.5 0 0 0-.79 1.87c0 1.1.8 2.16.91 2.31.11.15 1.57 2.4 3.8 3.36.53.23.95.37 1.27.47.53.17 1.02.15 1.4.09.43-.06 1.32-.54 1.5-1.06.19-.52.19-.96.13-1.06-.06-.1-.2-.15-.42-.26Z" /></svg>
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes treatmentModalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes treatmentModalPop { from { opacity: 0; transform: scale(0.92) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
}

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    getActiveServices().then(({ data }) => {
      setServices(data || []);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => {
    const set = new Set(services.map(s => s.categoria).filter(Boolean));
    return ['Todos', ...set];
  }, [services]);

  const filtered = filter === 'Todos' ? services : services.filter(s => s.categoria === filter);

  const imageFor = (s) => s.foto_url || TREATMENT_DEFAULT_IMAGE[s.nombre] || CATEGORY_DEFAULT_IMAGE[s.categoria];

  return (
    <section id="servicios" style={{ background: 'var(--cream-soft)', padding: 'clamp(60px,10vw,100px) 16px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,5vw,48px)' }}>
          <p style={{ color: 'var(--gold-accent)', fontSize: '0.72rem', letterSpacing: '0.22em', fontFamily: 'var(--font-sans)', fontWeight: 700, marginBottom: '14px' }}>NUESTROS SERVICIOS</p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.8rem)', color: 'var(--ink)', marginBottom: '18px', fontWeight: 400 }}>Tratamientos Exclusivos</h2>
          <SectionDivider margin="0 auto 16px" />
          <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)', fontSize: 'clamp(0.9rem,2vw,1rem)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            Cada tratamiento es una experiencia única, diseñada para revelar tu mejor versión. Toca una foto para ver más.
          </p>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Cargando tratamientos...</p>
        ) : services.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--ink-soft)', fontFamily: 'var(--font-sans)' }}>Pronto vas a encontrar aquí nuestros tratamientos.</p>
        ) : (
          <>
            {/* Category filter chips — en escritorio se acomodan centrados en
                varias filas; en celular eso ocupaba mucho alto antes de
                llegar a los tratamientos, así que ahí van en una sola fila
                que se desliza al costado (como los filtros de Instagram). */}
            {categories.length > 2 && (
              <div className="category-chips" style={{ gap: '8px', marginBottom: 'clamp(28px,4vw,40px)' }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setFilter(cat)} style={{
                    background: filter === cat ? 'var(--olive)' : 'transparent',
                    color: filter === cat ? 'var(--cream)' : 'var(--ink-soft)',
                    border: filter === cat ? '1px solid var(--olive)' : '1px solid var(--border)',
                    padding: '8px 16px', borderRadius: '99px', fontFamily: 'var(--font-sans)',
                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    flexShrink: 0,
                  }}>
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Grid — cada tarjeta abre la ficha del tratamiento (foto grande,
                nombre, precio y los dos botones) en vez de ir directo a
                reservar, para que el cliente pueda elegir entre agendar de
                una vez o preguntar antes por WhatsApp. */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap: '18px' }}>
              {filtered.map(s => (
                <div key={s.id} role="button" tabIndex={0}
                  onClick={() => setSelectedService(s)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedService(s); } }}
                  style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.3s, transform 0.3s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-accent)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
                  {imageFor(s) ? <TreatmentImage src={imageFor(s)} alt={s.nombre} /> : <PlaceholderPhoto nombre={s.nombre} />}
                  <div style={{ padding: '16px 18px' }}>
                    {s.categoria && (
                      <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--gold-accent)', fontSize: '0.62rem', letterSpacing: '0.1em', marginBottom: '6px' }}>
                        {s.categoria.toUpperCase()}
                      </p>
                    )}
                    <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: '1.02rem', fontWeight: 400, marginBottom: s.precio ? '6px' : 0 }}>{s.nombre}</h3>
                    {s.precio && (
                      <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--olive)', fontSize: '0.88rem', fontWeight: 700 }}>{formatCLP(s.precio)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link to="/reservar" style={{ background: 'var(--olive)', color: 'var(--cream)', padding: '15px clamp(28px,6vw,48px)', fontSize: '0.85rem', fontWeight: 600, borderRadius: '8px', textDecoration: 'none', fontFamily: 'var(--font-sans)', display: 'inline-block', transition: 'background 0.3s' }}
            onMouseEnter={e => e.target.style.background = 'var(--olive-light)'}
            onMouseLeave={e => e.target.style.background = 'var(--olive)'}>
            Agendar mi tratamiento
          </Link>
        </div>
      </div>

      {selectedService && (
        <TreatmentDetailModal service={selectedService} imageSrc={imageFor(selectedService)} onClose={() => setSelectedService(null)} />
      )}

      <style>{`
        .category-chips {
          display: flex; flex-wrap: wrap; justify-content: center;
        }
        @media (max-width: 640px) {
          .category-chips {
            flex-wrap: nowrap; justify-content: flex-start; overflow-x: auto;
            -webkit-overflow-scrolling: touch; scrollbar-width: none;
            margin-left: -16px; margin-right: -16px; padding-left: 16px; padding-right: 16px;
          }
          .category-chips::-webkit-scrollbar { display: none; }
        }
      `}</style>
    </section>
  );
}
