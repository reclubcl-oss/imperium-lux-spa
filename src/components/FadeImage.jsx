import { useState } from 'react';

/**
 * Imagen con carga perezosa + fundido suave — reutilizable en cualquier
 * parte del sitio. `loading="lazy"` evita pedir fotos que están lejos de la
 * pantalla todavía, y el fundido de opacidad hace que cada una aparezca
 * suave en vez de "poof" apenas termina de cargar (mientras tanto se ve el
 * mismo tono neutro de fondo, no un hueco en blanco).
 */
export default function FadeImage({ src, alt, aspectRatio, radius, imgStyle, containerStyle }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{
      width: '100%', height: aspectRatio ? undefined : '100%', aspectRatio,
      overflow: 'hidden', background: 'var(--border-soft)', borderRadius: radius || 0,
      ...containerStyle,
    }}>
      <img
        src={src} alt={alt} loading="lazy" decoding="async"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          opacity: loaded ? 1 : 0, transition: 'opacity 0.5s ease',
          ...imgStyle,
        }}
      />
    </div>
  );
}
