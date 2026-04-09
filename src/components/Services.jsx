import { Link } from 'react-router-dom';

const services = [
  { icon: '✨', title: 'Tratamientos Faciales', desc: 'Hidratación profunda, antiedad y luminosidad. Protocolos personalizados para cada tipo de piel.', items: ['Hidratación Profunda','Peeling Químico','Radiofrecuencia Facial','Mesoterapia'] },
  { icon: '💎', title: 'Medicina Estética', desc: 'Procedimientos no invasivos con tecnología de última generación para resultados visibles.', items: ['Bótox & Rellenos','Plasma Rico en Plaquetas','Hilos Tensores','Bioestimuladores'] },
  { icon: '🌸', title: 'Tratamientos Corporales', desc: 'Esculpe y redefine tu silueta con tratamientos de alta eficacia y máxima comodidad.', items: ['Reducción de Medidas','Drenaje Linfático','Cavitación','Presoterapia'] },
  { icon: '⚡', title: 'Tecnología Avanzada', desc: 'Equipos médicos certificados de última generación para tratamientos seguros y eficaces.', items: ['Láser Depilación','Ultrasonido Focalizado','Luz Pulsada IPL','Criolipólisis'] },
  { icon: '💆', title: 'Relajación & Spa', desc: 'Rituales de bienestar que combinan técnicas ancestrales con la mejor cosmética profesional.', items: ['Masajes Terapéuticos','Ritual de Oro','Aromaterapia','Envoltura Corporal'] },
  { icon: '👁️', title: 'Zona Ocular & Labios', desc: 'Tratamientos especializados para recuperar la juventud y expresividad de la mirada.', items: ['Diseño de Cejas','Pestañas','Perfilado de Labios','Contorno de Ojos'] },
];

export default function Services() {
  return (
    <section id="servicios" style={{ background: '#0A0A0A', padding: 'clamp(60px,10vw,100px) 16px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(36px,6vw,64px)' }}>
          <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.4em', fontFamily: 'Raleway, sans-serif', fontWeight: 600, marginBottom: '14px' }}>✦ NUESTROS SERVICIOS ✦</p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.6rem,5vw,3rem)', color: '#F5F0E8', marginBottom: '18px', fontWeight: 700 }}>Tratamientos Exclusivos</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '1px', background: '#C9A84C' }} />
            <div style={{ width: '4px', height: '4px', background: '#C9A84C', transform: 'rotate(45deg)' }} />
            <div style={{ width: '36px', height: '1px', background: '#C9A84C' }} />
          </div>
          <p style={{ color: 'rgba(245,240,232,0.6)', fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(0.85rem,2vw,1rem)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            Cada tratamiento es una experiencia única, diseñada para revelar tu mejor versión.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: '16px' }}>
          {services.map(s => (
            <div key={s.title}
              style={{ background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', padding: 'clamp(20px,4vw,32px) clamp(16px,3vw,24px)', transition: 'all 0.3s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(201,168,76,0.5)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(201,168,76,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(201,168,76,0.15)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '12px' }}>{s.icon}</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontSize: 'clamp(1rem,2.5vw,1.2rem)', fontWeight: 600, marginBottom: '10px' }}>{s.title}</h3>
              <p style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(245,240,232,0.55)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '16px' }}>{s.desc}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {s.items.map(item => (
                  <li key={item} style={{ fontFamily: 'Raleway, sans-serif', color: 'rgba(201,168,76,0.8)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '4px', height: '4px', background: '#C9A84C', borderRadius: '50%', flexShrink: 0 }} />{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link to="/reservar" style={{ background: 'transparent', border: '1px solid #C9A84C', color: '#C9A84C', padding: '14px clamp(28px,6vw,48px)', fontSize: '0.78rem', letterSpacing: '0.18em', fontWeight: 700, borderRadius: '4px', textDecoration: 'none', fontFamily: 'Raleway, sans-serif', display: 'inline-block', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.target.style.background = '#C9A84C'; e.target.style.color = '#0A0A0A'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#C9A84C'; }}>
            AGENDAR MI TRATAMIENTO
          </Link>
        </div>
      </div>
    </section>
  );
}
