import logoSrc from '../assets/brand/logo.png';

// Generador de diseños para redes sociales — arma una imagen lista para
// publicar (foto del tratamiento + textos de marca) dibujando todo en un
// <canvas> oculto, sin depender de ninguna herramienta externa de diseño ni
// de IA de imágenes. Se exporta como PNG en el tamaño exacto que pide
// Instagram para posts (1080x1080) e historias (1080x1920).

const GOLD = '#B5924D';
const CREAM = '#FFFEFB';
const FOREST = '#172616';
const OLIVE = '#263A22';
const SANS = '-apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    img.src = src;
  });
}

/** Dibuja `img` cubriendo todo el rectángulo (x,y,w,h) — igual que object-fit: cover. */
function drawCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx, sy, sw, sh;
  if (imgRatio > boxRatio) {
    sh = img.height;
    sw = sh * boxRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / boxRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Parte `text` en líneas que quepan en `maxWidth` (ctx.font ya debe estar seteado) — solo mide, no dibuja. */
function splitLines(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(testLine).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Genera el <canvas> con el diseño de un tratamiento. Todo el texto es
 * editable desde el llamador (AdminDesignView) — acá solo se dibuja.
 *
 * `format`: 'post' (1080x1080) o 'story' (1080x1920).
 * `precioLabel`: string ya lista para mostrar (ej. "$45.000", "2x1", o
 * vacío para no mostrar precio) — no se formatea acá, así el admin puede
 * escribir lo que quiera en el campo de precio.
 * `cta`: texto del botón de llamado a la acción; vacío = sin botón.
 *
 * El bloque de texto se mide ANTES de dibujar y se ancla desde ABAJO hacia
 * arriba (en vez de reservar una altura fija) — así nunca queda cortado,
 * sin importar cuánto texto haya puesto el admin.
 */
export async function generateTreatmentDesign({ imageSrc, categoria, nombre, precioLabel, cta, format }) {
  const isStory = format === 'story';
  const W = 1080;
  const H = isStory ? 1920 : 1080;
  const pad = 72;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const [img, logoImg] = await Promise.all([loadImage(imageSrc), loadImage(logoSrc)]);
  drawCover(ctx, img, 0, 0, W, H);

  // ── Medir todo el bloque de texto primero ──────────────────────────────
  const catFont = `700 28px ${SANS}`;
  const nameFont = `400 76px ${SERIF}`;
  const nameLineHeight = 84;
  const priceFont = `700 34px ${SANS}`;
  const ctaFont = `700 32px ${SANS}`;
  const ctaText = cta ? `${cta.toUpperCase()}  →` : '';
  const priceBadgeH = 64;
  const ctaH = 76;

  ctx.font = nameFont;
  const nameLines = splitLines(ctx, nombre, W - pad * 2);

  let blockHeight = 0;
  if (categoria) blockHeight += 54;
  blockHeight += nameLines.length * nameLineHeight + 24;
  blockHeight += precioLabel ? priceBadgeH + 36 : 16;
  blockHeight += ctaText ? ctaH : 0;

  let cursorY = H - pad - blockHeight;

  // Degradado oscuro detrás del texto — arranca un poco antes del bloque
  // medido, con un mínimo para que nunca se vea demasiado angosto.
  const gradTop = Math.min(Math.max(cursorY - 100, H * 0.2), H * 0.6);
  const grad = ctx.createLinearGradient(0, gradTop, 0, H);
  grad.addColorStop(0, 'rgba(23,27,22,0)');
  grad.addColorStop(1, 'rgba(23,27,22,0.92)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, gradTop, W, H - gradTop);

  // Logo de la clínica, arriba a la izquierda — tarjetita clara con sombra
  // para que se despegue de la foto (el logo ya viene con fondo blanco).
  const logoSize = 150;
  const logoR = 20;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 8;
  roundRect(ctx, pad, pad, logoSize, logoSize, logoR);
  ctx.fillStyle = CREAM;
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, pad, pad, logoSize, logoSize, logoR);
  ctx.clip();
  const logoInset = 10;
  ctx.drawImage(logoImg, pad + logoInset, pad + logoInset, logoSize - logoInset * 2, logoSize - logoInset * 2);
  ctx.restore();
  ctx.textAlign = 'left';

  // ── Dibujar el bloque, ya con el espacio garantizado ───────────────────
  if (categoria) {
    ctx.fillStyle = GOLD;
    ctx.font = catFont;
    ctx.fillText(categoria.toUpperCase(), pad, cursorY);
    cursorY += 54;
  }

  ctx.fillStyle = CREAM;
  ctx.font = nameFont;
  nameLines.forEach((l, i) => ctx.fillText(l, pad, cursorY + i * nameLineHeight));
  cursorY += nameLines.length * nameLineHeight + 24;

  if (precioLabel) {
    ctx.font = priceFont;
    const textW = ctx.measureText(precioLabel).width;
    roundRect(ctx, pad, cursorY, textW + 60, priceBadgeH, priceBadgeH / 2);
    ctx.fillStyle = GOLD;
    ctx.fill();
    ctx.fillStyle = FOREST;
    ctx.fillText(precioLabel, pad + 30, cursorY + priceBadgeH / 2 + 12);
    cursorY += priceBadgeH + 36;
  } else {
    cursorY += 16;
  }

  // Botón de llamado a la acción (opcional).
  if (ctaText) {
    ctx.font = ctaFont;
    const ctaW = ctx.measureText(ctaText).width + 70;
    roundRect(ctx, pad, cursorY, ctaW, ctaH, ctaH / 2);
    ctx.fillStyle = CREAM;
    ctx.fill();
    ctx.fillStyle = OLIVE;
    ctx.fillText(ctaText, pad + 35, cursorY + ctaH / 2 + 11);
  }

  // Arroba, esquina inferior derecha.
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,254,251,0.7)';
  ctx.font = `400 26px ${SANS}`;
  ctx.fillText('@clinica.estetica.imperium', W - pad, H - pad + 6);

  return canvas;
}

export function downloadCanvas(canvas, filename) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) { reject(new Error('No se pudo generar el archivo')); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });
}

/** Nombre de archivo seguro a partir del nombre del tratamiento, ej. "Bótox & Rellenos" -> "botox-rellenos". */
export function slugify(text) {
  return text
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // saca tildes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
