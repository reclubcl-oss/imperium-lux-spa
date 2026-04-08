#!/usr/bin/env node
/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║          IMPERIUM LUX SPA – Setup de Email                ║
 * ║   Ejecuta: node setup-email.js                            ║
 * ╚═══════════════════════════════════════════════════════════╝
 *
 * Este script abre automáticamente los pasos necesarios en
 * el navegador y luego actualiza el archivo .env.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ENV_PATH = path.join(__dirname, '.env');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));

function openUrl(url) {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  execSync(`${cmd} "${url}"`);
}

function updateEnv(key, value) {
  let content = fs.readFileSync(ENV_PATH, 'utf8');
  content = content.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${value}`);
  fs.writeFileSync(ENV_PATH, content);
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  IMPERIUM LUX SPA – Configuración de Email (EmailJS)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📧 Las reservas llegarán a: benjamin.tapia.r1@gmail.com\n');
  console.log('Voy a abrir EmailJS en tu navegador. Sigue estos pasos:\n');

  // PASO 1: Crear cuenta
  console.log('──────────────────────────────────────────────────────');
  console.log('PASO 1: Crear cuenta en EmailJS (usa Google/Gmail)');
  console.log('──────────────────────────────────────────────────────');
  await ask('Presiona ENTER para abrir EmailJS en tu navegador...');
  openUrl('https://dashboard.emailjs.com/sign-up');
  await ask('✅ ¿Ya iniciaste sesión con tu Gmail? Presiona ENTER para continuar...');

  // PASO 2: Email Service
  console.log('\n──────────────────────────────────────────────────────');
  console.log('PASO 2: Conectar Gmail como servicio de envío');
  console.log('  → Haz clic en "Add New Service"');
  console.log('  → Selecciona "Gmail"');
  console.log('  → Autoriza con: benjamin.tapia.r1@gmail.com');
  console.log('  → El Service ID quedará visible (ej: service_abc123)');
  console.log('──────────────────────────────────────────────────────');
  await ask('Presiona ENTER para abrir la página de servicios...');
  openUrl('https://dashboard.emailjs.com/admin');

  const serviceId = await ask('\n📋 Pega aquí el SERVICE ID (ej: service_abc123): ');

  // PASO 3: Template
  console.log('\n──────────────────────────────────────────────────────');
  console.log('PASO 3: Crear el Template de email');
  console.log('──────────────────────────────────────────────────────');
  await ask('Presiona ENTER para abrir Email Templates...');
  openUrl('https://dashboard.emailjs.com/admin/templates');

  console.log('\n📝 Crea un nuevo template con este contenido:');
  console.log('────────────────────────────────────────────');
  console.log('Asunto: Nueva Reserva - {{nombre}} | Imperium Lux Spa');
  console.log('');
  console.log('🗓️ NUEVA RESERVA RECIBIDA');
  console.log('');
  console.log('Cliente:    {{nombre}}');
  console.log('Email:      {{email}}');
  console.log('Teléfono:   {{telefono}}');
  console.log('Servicio:   {{servicio}}');
  console.log('Fecha:      {{fecha}}');
  console.log('Hora:       {{hora}}');
  console.log('Notas:      {{notas}}');
  console.log('');
  console.log('Responder a: {{reply_to}}');
  console.log('────────────────────────────────────────────');

  const templateId = await ask('\n📋 Pega aquí el TEMPLATE ID (ej: template_xyz789): ');

  // PASO 4: Public Key
  console.log('\n──────────────────────────────────────────────────────');
  console.log('PASO 4: Obtener tu Public Key');
  console.log('──────────────────────────────────────────────────────');
  await ask('Presiona ENTER para abrir Configuración de cuenta...');
  openUrl('https://dashboard.emailjs.com/admin/account');
  console.log('  → Busca la sección "API Keys" → copia el Public Key');

  const publicKey = await ask('\n📋 Pega aquí el PUBLIC KEY: ');

  // Actualizar .env
  console.log('\n⚙️  Actualizando archivo .env...');
  updateEnv('VITE_EMAILJS_SERVICE_ID', serviceId.trim());
  updateEnv('VITE_EMAILJS_TEMPLATE_ID', templateId.trim());
  updateEnv('VITE_EMAILJS_PUBLIC_KEY', publicKey.trim());

  console.log('\n✅ ¡Configuración completada!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Correo destino:  benjamin.tapia.r1@gmail.com');
  console.log(`🔑 Service ID:      ${serviceId.trim()}`);
  console.log(`📄 Template ID:     ${templateId.trim()}`);
  console.log(`🗝️  Public Key:      ${publicKey.trim().substring(0,8)}...`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n▶️  Reinicia el servidor: npm run dev');
  console.log('🌐 Luego prueba una reserva en: http://localhost:5173/reservar\n');

  rl.close();
}

main().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
