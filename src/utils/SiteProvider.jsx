import { useCallback, useEffect, useMemo, useState } from 'react';
import { SiteContext, buildSite, fetchOverrides, readCachedOverrides } from './siteContent';

// Aplica los colores elegidos en el admin a las variables CSS del sitio.
function applyColors(colores) {
  const root = document.documentElement.style;
  const set = (name, value) => { if (/^#[0-9a-f]{6}$/i.test(value || '')) root.setProperty(name, value); };
  set('--olive', colores.olive);
  set('--forest', colores.forest);
  set('--gold-accent', colores.gold);
  if (/^#[0-9a-f]{6}$/i.test(colores.olive || '')) root.setProperty('--olive-light', `color-mix(in srgb, ${colores.olive} 82%, white)`);
}

export default function SiteProvider({ children }) {
  // Arranca con lo último que se guardó en este navegador, así no hay "saltos" de texto.
  const [overrides, setOverrides] = useState(() => readCachedOverrides());
  const site = useMemo(() => buildSite(overrides), [overrides]);

  const reload = useCallback(async () => {
    const res = await fetchOverrides();
    if (res.success) setOverrides(res.data);
  }, []);

  useEffect(() => {
    let alive = true;
    fetchOverrides().then(res => { if (alive && res.success) setOverrides(res.data); });
    return () => { alive = false; };
  }, []);
  useEffect(() => { applyColors(site.colores); }, [site.colores]);

  const value = useMemo(() => ({ site, reload }), [site, reload]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
