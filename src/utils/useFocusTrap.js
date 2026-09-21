import { useEffect } from 'react';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

// Mantiene el foco del teclado dentro de un modal mientras está abierto (Tab
// y Shift+Tab dan la vuelta en vez de escapar a la página de atrás) y lo
// devuelve al elemento que lo abrió al cerrar.
export function useFocusTrap(ref, active = true) {
  useEffect(() => {
    const node = ref.current;
    if (!active || !node) return;

    const previous = document.activeElement;
    const items = () => [...node.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
    (items()[0] || node).focus({ preventScroll: true });

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const list = items();
      if (!list.length) { e.preventDefault(); return; }
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    node.addEventListener('keydown', onKeyDown);
    return () => {
      node.removeEventListener('keydown', onKeyDown);
      previous?.focus?.({ preventScroll: true });
    };
  }, [ref, active]);
}
