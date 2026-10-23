// Google Analytics 4 y Meta Pixel — solo se activan si están definidos
// VITE_GA_ID (ej. G-XXXXXXXXXX) y/o VITE_META_PIXEL_ID en Vercel. Sin esas
// variables todo es un no-op, así que es seguro dejarlo siempre llamado.

const GA_ID = import.meta.env.VITE_GA_ID;
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

let started = false;

function loadScript(src) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

export function initAnalytics() {
  if (started || typeof window === 'undefined') return;
  started = true;

  if (GA_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { send_page_view: false });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
  }

  if (PIXEL_ID) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', PIXEL_ID);
  }
}

export function trackPageView(path) {
  if (GA_ID && window.gtag) window.gtag('event', 'page_view', { page_path: path });
  if (PIXEL_ID && window.fbq) window.fbq('track', 'PageView');
}

// `reserva_confirmada` en GA4 y `Lead` en Meta — el evento estándar que Meta
// usa para optimizar anuncios hacia gente que agenda.
export function trackBookingConfirmed({ servicio }) {
  if (GA_ID && window.gtag) window.gtag('event', 'reserva_confirmada', { servicio });
  if (PIXEL_ID && window.fbq) window.fbq('track', 'Lead', { content_name: servicio });
}
