// Mismo número que aparece en el pie de página (+56 9 7149 4060), en formato
// internacional sin espacios ni símbolos, como lo pide el enlace de WhatsApp.
export const WHATSAPP_NUMBER = '56971494060';

export const whatsappLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
