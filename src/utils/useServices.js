import { useEffect, useState } from 'react';
import { getActiveServices } from './services';
import { SERVICIOS_RESPALDO } from './serviciosRespaldo';
import { CATEGORY_DEFAULT_IMAGE } from './categoryDefaults';
import { TREATMENT_DEFAULT_IMAGE } from './treatmentDefaults';

/** Lista de tratamientos; si la base de datos no responde (o viene vacía) usa la copia de respaldo. */
export function useServiceList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getActiveServices().then(({ success, data }) => {
      setServices(success && data?.length ? data : SERVICIOS_RESPALDO);
      setLoading(false);
    }).catch(() => { setServices(SERVICIOS_RESPALDO); setLoading(false); });
  }, []);
  return { services, loading };
}

// Los tratamientos sin categoría van en "Otros".
export const catOf = (s) => s.categoria || 'Otros';

export const serviceImage = (s) => s.foto_url || TREATMENT_DEFAULT_IMAGE[s.nombre] || CATEGORY_DEFAULT_IMAGE[s.categoria];

// true en pantallas de celular (<= 640px); se actualiza si giras el teléfono.
export function useIsMobile() {
  const query = '(max-width: 640px)';
  const [mobile, setMobile] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return mobile;
}
