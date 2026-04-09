import Hero from '../components/Hero';
import Services from '../components/Services';
import VideoSection from '../components/VideoSection';
import Location from '../components/Location';

const stats = [
  { number: '500+', label: 'Clientes Satisfechos' },
  { number: '15+',  label: 'Tratamientos Exclusivos' },
  { number: '5★',   label: 'Valoración Media' },
  { number: '3+',   label: 'Años de Experiencia' },
];

export default function Home() {
  return (
    <>
      <Hero />
      <Services />

      {/* Stats */}
      <section style={{ background: '#0D0D0D', padding: 'clamp(40px,7vw,64px) 16px', borderTop: '1px solid rgba(201,168,76,0.1)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,140px),1fr))', gap: 'clamp(20px,4vw,32px)', textAlign: 'center' }}>
          {stats.map(({ number, label }) => (
            <div key={label}>
              <p style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C', fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 700, marginBottom: '6px' }}>{number}</p>
              <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.55)', fontSize: 'clamp(0.65rem,1.5vw,0.8rem)', letterSpacing: '0.12em', fontWeight: 500 }}>{label.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </section>

      <VideoSection />

      {/* About */}
      <section id="nosotros" style={{ background: '#111', padding: 'clamp(60px,10vw,100px) 16px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', fontFamily: 'Raleway, sans-serif', fontWeight: 600, marginBottom: '14px' }}>✦ NUESTRA ESENCIA ✦</p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.6rem,5vw,2.8rem)', color: '#F5F0E8', marginBottom: '22px', fontWeight: 700 }}>
            Donde la Belleza se Convierte en Arte
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '36px', height: '1px', background: '#C9A84C' }} />
            <div style={{ width: '4px', height: '4px', background: '#C9A84C', transform: 'rotate(45deg)' }} />
            <div style={{ width: '36px', height: '1px', background: '#C9A84C' }} />
          </div>
          <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.65)', fontSize: 'clamp(0.88rem,2vw,1rem)', lineHeight: 1.9, marginBottom: '18px' }}>
            En Imperium Lux Spa, creemos que la belleza es una expresión de bienestar interior. Nuestro equipo de especialistas altamente cualificados combina las últimas tecnologías con protocolos exclusivos para ofrecerte resultados excepcionales.
          </p>
          <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.65)', fontSize: 'clamp(0.88rem,2vw,1rem)', lineHeight: 1.9 }}>
            Cada visita es una experiencia sensorial única en un entorno de máximo lujo y confort, donde tu bienestar es nuestra prioridad absoluta.
          </p>
        </div>
      </section>

      <Location />
    </>
  );
}
