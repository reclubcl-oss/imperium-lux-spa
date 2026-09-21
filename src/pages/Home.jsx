import Hero from '../components/Hero';
import Services from '../components/Services';
import VideoSection from '../components/VideoSection';
import Location from '../components/Location';
import PromoPopup from '../components/PromoPopup';
import LoyaltySection from '../components/LoyaltySection';
import FadeImage from '../components/FadeImage';
import cienciaImg from '../assets/brand/ciencia.webp';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActiveServices } from '../utils/services';

export default function Home() {
  // Solo cifras verificables: la cantidad de tratamientos sale en vivo de la
  // base de datos, y el resto son datos fijos del servicio. Si más adelante
  // quieres mostrar "clientes atendidos" o "años de experiencia", agrega esas
  // cifras acá con los números reales.
  const [treatmentCount, setTreatmentCount] = useState(null);
  useEffect(() => {
    getActiveServices().then(res => { if (res.success) setTreatmentCount(res.data.length); });
  }, []);

  const stats = [
    ...(treatmentCount ? [{ number: treatmentCount, label: 'Tratamientos disponibles' }] : []),
    { number: '6', label: 'Días de atención a la semana' },
    { number: '1 a 1', label: 'Atención personalizada' },
  ];

  return (
    <>
      <PromoPopup />
      <Hero />
      <Services />

      {/* Stats */}
      <section style={{ background: 'var(--cream)', padding: 'clamp(40px,7vw,64px) 16px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,150px),1fr))', gap: 'clamp(20px,4vw,32px)', textAlign: 'center' }}>
          {stats.map(({ number, label }) => (
            <div key={label}>
              <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--olive)', fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 400, marginBottom: '6px' }}>{number}</p>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-soft)', fontSize: 'clamp(0.7rem,1.5vw,0.82rem)', letterSpacing: '0.05em', fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      <LoyaltySection />

      <VideoSection />

      {/* About — sección oscura estilo "Ciencia, precisión y cuidado" */}
      <section id="nosotros" style={{ background: 'var(--forest)', padding: 0 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))' }}>
          <div style={{ padding: 'clamp(48px,8vw,80px) clamp(24px,5vw,48px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ color: 'var(--gold-accent)', fontSize: '0.72rem', letterSpacing: '0.22em', fontFamily: 'var(--font-sans)', fontWeight: 700, marginBottom: '16px' }}>NUESTRA FORMA DE CUIDARTE</p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.8rem)', color: 'var(--cream)', marginBottom: '20px', fontWeight: 400, lineHeight: 1.15 }}>
              Ciencia, precisión y cuidado
            </h2>
            <div style={{ width: '48px', height: '3px', background: 'var(--gold-accent)', marginBottom: '22px' }} />
            <p style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,254,251,0.75)', fontSize: 'clamp(0.9rem,2vw,1rem)', lineHeight: 1.9, marginBottom: '16px' }}>
              En Imperium combinamos atención personalizada, tecnología estética y un enfoque cercano para acompañarte en cada etapa de tu tratamiento.
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,254,251,0.75)', fontSize: 'clamp(0.9rem,2vw,1rem)', lineHeight: 1.9, marginBottom: '28px' }}>
              Cada procedimiento comienza con una evaluación orientada a tus necesidades y objetivos.
            </p>
            <Link to="/reservar" style={{ alignSelf: 'flex-start', background: 'var(--gold-accent)', color: 'var(--forest)', padding: '14px 30px', fontSize: '0.85rem', fontWeight: 700, borderRadius: '8px', textDecoration: 'none', fontFamily: 'var(--font-sans)' }}>
              Solicitar evaluación
            </Link>
          </div>
          <div style={{ minHeight: '320px' }}>
            <FadeImage src={cienciaImg} alt="Instalaciones y espacios de Clínica Estética Imperium" containerStyle={{ minHeight: '320px' }} />
          </div>
        </div>
      </section>

      <Location />
    </>
  );
}
