import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Loyalty from './pages/Loyalty';
import Creditos from './pages/Creditos';
import Privacidad from './pages/Privacidad';
import Cita from './pages/Cita';
import LinkHub from './pages/LinkHub';

// El panel admin y la intranet solo los usa el equipo — no tiene sentido
// que cada visitante descargue ese código para ver la página de inicio.
const Admin = lazy(() => import('./pages/Admin'));
const Intranet = lazy(() => import('./pages/Intranet'));
import { initAnalytics, trackPageView } from './utils/analytics';
import './index.css';

const PAGE_TITLES = {
  '/':         'Clínica Estética Imperium | Viña del Mar',
  '/reservar': 'Reservar hora | Clínica Estética Imperium',
  '/fidelidad': 'Club de Fidelidad | Clínica Estética Imperium',
  '/creditos': 'Créditos | Clínica Estética Imperium',
  '/privacidad': 'Política de Privacidad | Clínica Estética Imperium',
  '/cita': 'Tu cita | Clínica Estética Imperium',
  '/link':     'Clínica Estética Imperium',
  '/admin':    'Admin | Clínica Estética Imperium',
  '/intranet': 'Intranet | Clínica Estética Imperium',
};

function Layout() {
  const { pathname, hash } = useLocation();
  const isBare = pathname === '/admin' || pathname === '/intranet' || pathname === '/link';

  useEffect(() => { initAnalytics(); }, []);

  useEffect(() => {
    document.title = PAGE_TITLES[pathname] || PAGE_TITLES['/'];
    if (pathname !== '/admin' && pathname !== '/intranet') trackPageView(pathname);
  }, [pathname]);

  // React Router no reinicia el scroll al cambiar de página (a diferencia de
  // una navegación normal del navegador) — si vienes desplazado hacia abajo
  // en una página y haces click en un <Link> (ej. "Agendar" en una tarjeta de
  // tratamiento), la página nueva carga manteniendo ese mismo scroll en vez
  // de partir arriba. Si además hay un ancla ("/#seccion", usado por
  // Servicios/Nosotros/Ubicación/Contacto del navbar y footer), saltamos ahí
  // en su lugar — reintentando, porque en una carga de página completa el
  // navegador intenta saltar al ancla ANTES de que React monte el contenido.
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    const id = hash.slice(1);
    const tryScroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    tryScroll();
    const retry = setTimeout(tryScroll, 350);
    return () => clearTimeout(retry);
  }, [pathname, hash]);

  return (
    <>
      {!isBare && <Navbar />}
      <main>
        <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/reservar" element={<Booking />} />
          <Route path="/admin"    element={<Admin />} />
          <Route path="/intranet" element={<Intranet />} />
          <Route path="/fidelidad" element={<Loyalty />} />
          <Route path="/creditos" element={<Creditos />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/cita" element={<Cita />} />
          <Route path="/link" element={<LinkHub />} />
        </Routes>
        </Suspense>
      </main>
      {!isBare && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
