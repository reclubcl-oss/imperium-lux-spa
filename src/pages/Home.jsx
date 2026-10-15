import Hero from '../components/Hero';
import Services from '../components/Services';
import VideoSection from '../components/VideoSection';
import Location from '../components/Location';
import PromoPopup from '../components/PromoPopup';
import LoyaltySection from '../components/LoyaltySection';
import FadeImage from '../components/FadeImage';
import cienciaImg from '../assets/brand/ciencia.webp';
import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { getActiveServices } from '../utils/services';
import { useSite } from '../utils/siteContent';
import { E, EditableImage } from '../components/Editable';

export default function Home() {
  // Solo cifras verificables: la cantidad de tratamientos sale en vivo de la
  // base de datos, y el resto son datos fijos del servicio. Si más adelante
  // quieres mostrar "clientes atendidos" o "años de experiencia", agrega esas
  // cifras acá con los números reales.
  const [treatmentCount, setTreatmentCount] = useState(null);
  useEffect(() => {
    getActiveServices().then(res => { if (res.success) setTreatmentCount(res.data.length); });
  }, []);

  const site = useSite();
  const stats = [
    ...(site.cifras.mostrarTratamientos && treatmentCount ? [{ number: treatmentCount, label: 'Tratamientos disponibles' }] : []),
    ...site.cifras.items.map((i, idx) => ({ number: i.numero, label: i.texto, idx })),
  ];

  // About: sección oscura estilo "Ciencia, precisión y cuidado".
  const blocks = {
    cifras: (
      <section style={{ background: 'var(--cream)', padding: 'clamp(40px,7vw,64px) 16px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,150px),1fr))', gap: 'clamp(20px,4vw,32px)', textAlign: 'center' }}>
          {stats.map(({ number, label, idx }) => (
            <div key={idx ?? label}>
              <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--olive)', fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 400, marginBottom: '6px' }}>{idx === undefined ? number : <E path={`cifras.items.${idx}.numero`} />}</p>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: 'clamp(0.7rem,1.5vw,0.82rem)', letterSpacing: '0.05em', fontWeight: 500 }}>{idx === undefined ? label : <E path={`cifras.items.${idx}.texto`} />}</p>
            </div>
          ))}
        </div>
      </section>
    ),
    fidelidad: <LoyaltySection />,
    comunidad: <VideoSection />,
    nosotros: (
      <section id="nosotros" style={{ background: 'var(--forest)', padding: 0 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))' }}>
          <div style={{ padding: 'clamp(48px,8vw,80px) clamp(24px,5vw,48px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ color: 'var(--gold-accent)', fontSize: '0.72rem', letterSpacing: '0.22em', fontFamily: 'var(--font-sans)', fontWeight: 700, marginBottom: '16px' }}><E path="nosotros.etiqueta" /></p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.8rem)', color: 'var(--cream)', marginBottom: '20px', fontWeight: 400, lineHeight: 1.15 }}>
              <E path="nosotros.titulo" />
            </h2>
            <div style={{ width: '48px', height: '3px', background: 'var(--gold-accent)', marginBottom: '22px' }} />
            <p style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,254,251,0.75)', fontSize: 'clamp(0.9rem,2vw,1rem)', lineHeight: 1.9, marginBottom: '16px' }}>
              <E path="nosotros.parrafo1" />
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,254,251,0.75)', fontSize: 'clamp(0.9rem,2vw,1rem)', lineHeight: 1.9, marginBottom: '28px' }}>
              <E path="nosotros.parrafo2" />
            </p>
            <Link to="/reservar" style={{ alignSelf: 'flex-start', background: 'var(--gold-accent)', color: 'var(--forest)', padding: '14px 30px', fontSize: '0.85rem', fontWeight: 700, borderRadius: '8px', textDecoration: 'none', fontFamily: 'var(--font-sans)' }}>
              <E path="nosotros.boton" />
            </Link>
          </div>
          <div style={{ minHeight: '320px', position: 'relative' }}>
            <EditableImage path="nosotros.imagenUrl" nombre="nosotros">
              <FadeImage src={site.nosotros.imagenUrl || cienciaImg} alt="Instalaciones y espacios de Clínica Estética Imperium" containerStyle={{ minHeight: '320px' }} />
            </EditableImage>
          </div>
        </div>
      </section>
    ),
    ubicacion: <Location />,
  };

  return (
    <>
      <PromoPopup />
      <Hero />
      <Services />

      {site.secciones.filter(sec => sec.visible).map(sec => (
        <Fragment key={sec.id}>{blocks[sec.id]}</Fragment>
      ))}
    </>
  );
}
