import { Link } from 'react-router-dom';

const services = [
  {
    icon: '✨',
    title: 'Tratamientos Faciales',
    desc: 'Hidratación profunda, antiedad y luminosidad. Protocolos personalizados para cada tipo de piel.',
    items: ['Hidratación Profunda', 'Peeling Químico', 'Radiofrecuencia Facial', 'Mesoterapia'],
  },
  {
    icon: '💎',
    title: 'Medicina Estética',
    desc: 'Procedimientos no invasivos con tecnología de última generación para resultados visibles.',
    items: ['Bótox & Rellenos', 'Plasma Rico en Plaquetas', 'Hilos Tensores', 'Bioestimuladores'],
  },
  {
    icon: '🌸',
    title: 'Tratamientos Corporales',
    desc: 'Esculpe y redefine tu silueta con tratamientos de alta eficacia y máxima comodidad.',
    items: ['Reducción de Medidas', 'Drenaje Linfático', 'Cavitación', 'Presoterapia'],
  },
  {
    icon: '⚡',
    title: 'Tecnología Avanzada',
    desc: 'Equipos médicos certificados de última generación para tratamientos seguros y eficaces.',
    items: ['Láser Depilación', 'Ultrasonido Focalizado', 'Luz Pulsada IPL', 'Criolipólisis'],
  },
  {
    icon: '💆',
    title: 'Relajación & Spa',
    desc: 'Rituales de bienestar que combinan técnicas ancestrales con la mejor cosmética profesional.',
    items: ['Masajes Terapéuticos', 'Ritual de Oro', 'Aromaterapia', 'Envoltura Corporal'],
  },
  {
    icon: '👁️',
    title: 'Zona Ocular & Labios',
    desc: 'Tratamientos especializados para recuperar la juventud y expresividad de la mirada.',
    items: ['Diseño de Cejas', 'Pestañas', 'Perfilado de Labios', 'Contorno de Ojos'],
  },
];

export default function Services() {
  return (
    <section id="servicios" style={{ background: '#0A0A0A', padding: '100px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ color: '#C9A84C', fontSize: '0.68rem', letterSpacing: '0.45em', fontFamily: 'Raleway, sans-serif', fontWeight: 600, marginBottom: '16px' }}>
            ✦ NUESTROS SERVICIOS ✦
          </p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#F5F0E8', marginBottom: '20px', fontWeight: 700 }}>
            Tratamientos Exclusivos
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '1px', background: '#C9A84C' }} />
            <div style={{ width: '5px', height: '5px', background: '#C9A84C', transform: 'rotate(45deg)' }} />
            <div style={{ width: '40px', height: '1px', background: '#C9A84C' }} />
          </div>
          <p style={{ color: 'rgba(245,240,232,0.6)', fontFamily: 'Raleway, sans-serif', fontSize: '1rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
            Cada tratamiento es una experiencia única, diseñada para revelar tu mejor versión.
          </p>
        </div>

        {/* Services grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {services.map((s) => (
            <div
              key={s.title}
              style={{
                background: '#111111',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: '12px',
                padding: '36px 28px',
                transition: 'all 0.3s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.border = '1px solid rgba(201,168,76,0.5)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(201,168,76,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = '1px solid rgba(201,168,76,0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>{s.icon}</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontSize: '1.2rem', fontWeight: 600, marginBottom: '12px' }}>
                {s.title}
              </h3>
              <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.55)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '20px' }}>
                {s.desc}
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {s.items.map(item => (
                  <li key={item} style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(201,168,76,0.8)', fontSize: '0.8rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '4px', height: '4px', background: '#C9A84C', borderRadius: '50%', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <Link
            to="/reservar"
            style={{
              background: 'transparent',
              border: '1px solid #C9A84C',
              color: '#C9A84C',
              padding: '16px 48px',
              fontSize: '0.8rem',
              letterSpacing: '0.2em',
              fontWeight: 700,
              borderRadius: '4px',
              textDecoration: 'none',
              fontFamily: 'Raleway, sans-serif',
              transition: 'all 0.3s',
              display: 'inline-block',
            }}
            onMouseEnter={e => { e.target.style.background = '#C9A84C'; e.target.style.color = '#0A0A0A'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#C9A84C'; }}
          >
            AGENDAR MI TRATAMIENTO
          </Link>
        </div>
      </div>
    </section>
  );
}
