// Avisa a las administradoras que algo falló en el navegador de una clienta.
// Fire-and-forget: nunca debe estorbar ni romper lo que la clienta está haciendo.
export function reportError(where, message) {
  try {
    fetch('/api/report-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ where, message: String(message || '').slice(0, 160) }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* nada */ }
}
