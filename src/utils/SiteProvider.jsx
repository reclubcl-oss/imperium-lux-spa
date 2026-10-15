import { useCallback, useEffect, useMemo, useState } from 'react';
import { SiteContext, applyColors, buildSite, fetchOverrides, readCachedOverrides } from './siteContent';

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
