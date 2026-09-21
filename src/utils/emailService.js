import emailjs from '@emailjs/browser';

const SERVICE_ID           = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID_CLINIC   = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;       // → clínica
const TEMPLATE_ID_CLIENT   = 'template_r9y2ubi';                              // → cliente
const PUBLIC_KEY           = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const CLINIC_EMAIL = import.meta.env.VITE_CLINIC_EMAIL || 'clinicaimperiumvina@gmail.com';

export async function sendBookingEmail({ nombre, email, telefono, servicio, fecha, hora, notas, staffEmail, staffNombre, manageUrl, skipClient }) {
  const params = {
    to_email:     CLINIC_EMAIL,
    client_email: email,
    reply_to:     email,
    nombre,
    email,
    telefono,
    servicio,
    fecha,
    hora,
    notas: notas || 'Sin notas adicionales',
    // Para que la plantilla de EmailJS pueda mostrar el enlace (agrega {{manage_url}} en el template).
    manage_url: manageUrl || '',
  };

  try {
    const clinicParams = { ...params, to_email: CLINIC_EMAIL };

    // Para el cliente: pasamos el email en TODAS las variables posibles
    // para que funcione sin importar cómo esté configurado el template
    const clientParams = {
      ...params,
      to_email:     email,
      to:           email,
      client_email: email,
      email:        email,
      recipient:    email,
    };

    // Si el servidor ya le mandó la confirmación a la clienta (Gmail, con su enlace
    // para cambiar/cancelar), aquí solo se avisa a la clínica.
    const [clinicRes, clientRes] = await Promise.all([
      emailjs.send(SERVICE_ID, TEMPLATE_ID_CLINIC, clinicParams, { publicKey: PUBLIC_KEY }),
      skipClient ? null : emailjs.send(SERVICE_ID, TEMPLATE_ID_CLIENT, clientParams, { publicKey: PUBLIC_KEY }),
    ]);

    // Notificación al profesional asignado — reutiliza el template de la clínica.
    // No bloquea ni afecta el resultado de la reserva si falla.
    if (staffEmail) {
      const staffParams = { ...params, to_email: staffEmail, staff_nombre: staffNombre || '' };
      emailjs.send(SERVICE_ID, TEMPLATE_ID_CLINIC, staffParams, { publicKey: PUBLIC_KEY })
        .catch(err => console.warn('Aviso al profesional falló:', err));
    }

    return { success: true, clinicRes, clientRes };
  } catch (error) {
    console.error('EmailJS error:', error);
    const msg = error?.text || error?.message || JSON.stringify(error);
    return { success: false, error: msg };
  }
}
