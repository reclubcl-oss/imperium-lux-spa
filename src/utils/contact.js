// El número sale del editor del admin (Sitio web → Contacto); este es el de respaldo
// (+56 9 7149 4060), en formato internacional sin espacios ni símbolos, como lo pide
// el enlace de WhatsApp.
export const DEFAULT_WHATSAPP_NUMBER = '56971494060';
let whatsappNumber = DEFAULT_WHATSAPP_NUMBER;

export const setWhatsappNumber = (n) => {
  const digits = String(n || '').replace(/\D/g, '');
  whatsappNumber = digits.length >= 8 ? digits : DEFAULT_WHATSAPP_NUMBER;
};

export const whatsappLink = (text) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
