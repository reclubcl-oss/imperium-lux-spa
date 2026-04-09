import Hero from '../components/Hero';
import Services from '../components/Services';
import VideoSection from '../components/VideoSection';

const stats = [
  { number: '500+', label: 'Clientes Satisfechos' },
  { number: '15+', label: 'Tratamientos Exclusivos' },
  { number: '5★', label: 'Valoración Media' },
  { number: '3+', label: 'Años de Experiencia' },
];

export default function Home() {
  return (
    <>
      <Hero />
      <Services />

      {/* Stats section */}
      <section style={{ background: '#0D0D0D', padding: '64px 24px', borderTop: '1px solid rgba(201,168,76,0.1)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', textAlign: 'center' }}>
          {stats.map(({ number, label }) => (
            <div key={label}>
              <p style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, marginBottom: '8px' }}>{number}</p>
              <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.55)', fontSize: '0.8rem', letterSpacing: '0.15em', fontWeight: 500 }}>{label.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </section>

      <VideoSection />

      {/* About section */}
      <section id="nosotros" style={{ background: '#111111', padding: '100px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#C9A84C', fontSize: '0.68rem', letterSpacing: '0.45em', fontFamily: 'Raleway, sans-serif', fontWeight: 600, marginBottom: '16px' }}>
            ✦ NUESTRA ESENCIA ✦
          </p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F5F0E8', marginBottom: '24px', fontWeight: 700 }}>
            Donde la Belleza se Convierte en Arte
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '28px' }}>
            <div style={{ width: '40px', height: '1px', background: '#C9A84C' }} />
            <div style={{ width: '5px', height: '5px', background: '#C9A84C', transform: 'rotate(45deg)' }} />
            <div style={{ width: '40px', height: '1px', background: '#C9A84C' }} />
          </div>
          <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.65)', fontSize: '1rem', lineHeight: 1.9, marginBottom: '20px' }}>
            En Imperium Lux Spa, creemos que la belleza es una expresión de bienestar interior. Nuestro equipo de especialistas altamente cualificados combina las últimas tecnologías con protocolos exclusivos para ofrecerte resultados excepcionales.
          </p>
          <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.65)', fontSize: '1rem', lineHeight: 1.9 }}>
            Cada visita es una experiencia sensorial única en un entorno de máximo lujo y confort, donde tu bienestar es nuestra prioridad absoluta.
          </p>
        </div>
      </section>
    </>
  );
}
