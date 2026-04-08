import emailjs from '@emailjs/browser';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const CLINIC_EMAIL = import.meta.env.VITE_CLINIC_EMAIL || 'benjamin.tapia.r1@gmail.com';

export async function sendBookingEmail({ nombre, email, telefono, servicio, fecha, hora, notas }) {
  const templateParams = {
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
  };

  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      { publicKey: PUBLIC_KEY }
    );
    return { success: true, response };
  } catch (error) {
    console.error('EmailJS error completo:', error);
    const msg = error?.text || error?.message || JSON.stringify(error);
    return { success: false, error: msg };
  }
}
