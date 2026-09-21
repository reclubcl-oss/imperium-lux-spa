#!/usr/bin/env node
/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║       IMPERIUM LUX SPA – Setup de Intranet (Staff)         ║
 * ║   Ejecuta: node setup-staff.js                             ║
 * ╚═══════════════════════════════════════════════════════════╝
 *
 * Crea las cuentas de acceso (Supabase Auth) para el/la admin y
 * cada profesional, y su fila correspondiente en la tabla `staff`.
 *
 * Requiere haber corrido antes `supabase-migration-intranet.sql`
 * en el SQL Editor de Supabase.
 *
 * La Service Role Key NUNCA se guarda en disco ni en el bundle del
 * sitio (eso rompería la seguridad de Supabase) — este script solo
 * la usa en memoria mientras corre.
 */

import { createClient } from '@supabase/supabase-js';
import { createInterface } from 'readline';
import { readFileSync } from 'fs';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

function readEnvValue(key) {
  try {
    const content = readFileSync(new URL('./.env', import.meta.url), 'utf8');
    const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim() : '';
  } catch {
    return '';
  }
}

function randomPassword() {
  return Math.random().toString(36).slice(-6) + Math.random().toString(36).slice(-4).toUpperCase();
}

async function crearPersona({ supabase, rol, nombre, email, especialidad, orden }) {
  const password = randomPassword();

  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (userError) {
    console.error(`  ❌ Error creando usuario ${email}:`, userError.message);
    return null;
  }

  const { error: staffError } = await supabase.from('staff').insert([{
    auth_user_id: userData.user.id,
    nombre,
    email,
    especialidad: especialidad || null,
    rol,
    activo: true,
    orden,
  }]);

  if (staffError) {
    console.error(`  ❌ Error creando fila de staff para ${email}:`, staffError.message);
    return null;
  }

  return { nombre, email, password, rol };
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  IMPERIUM LUX SPA – Configuración de Intranet (Staff)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let supabaseUrl = readEnvValue('VITE_SUPABASE_URL');
  if (!supabaseUrl) {
    supabaseUrl = (await ask('URL de tu proyecto Supabase (https://xxxx.supabase.co): ')).trim();
  } else {
    console.log(`📡 Usando VITE_SUPABASE_URL del .env: ${supabaseUrl}`);
  }

  console.log('\n🔑 Necesito la Service Role Key (Supabase > Project Settings > API > service_role).');
  console.log('   Esta clave NO se guarda en ningún archivo, solo se usa en memoria mientras corre este script.');
  const serviceRoleKey = (await ask('Service Role Key: ')).trim();

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const creados = [];

  console.log('\n──────────────────────────────────────────────────────');
  console.log('Cuenta de administración (ve todas las reservas en /admin)');
  console.log('──────────────────────────────────────────────────────');
  const adminNombre = (await ask('Nombre del admin: ')).trim();
  const adminEmail = (await ask('Email del admin: ')).trim();
  const admin = await crearPersona({ supabase, rol: 'admin', nombre: adminNombre, email: adminEmail, orden: 0 });
  if (admin) creados.push(admin);

  const cantidadStr = await ask('\n¿Cuántos profesionales vas a registrar? [5]: ');
  const cantidad = parseInt(cantidadStr, 10) || 5;

  for (let i = 1; i <= cantidad; i++) {
    console.log(`\n──────────────────────────────────────────────────────`);
    console.log(`Profesional ${i} de ${cantidad}`);
    console.log('──────────────────────────────────────────────────────');
    const nombre = (await ask('Nombre: ')).trim();
    const email = (await ask('Email: ')).trim();
    const especialidad = (await ask('Especialidad (ej: Medicina Estética): ')).trim();
    const persona = await crearPersona({ supabase, rol: 'profesional', nombre, email, especialidad, orden: i });
    if (persona) creados.push(persona);
  }

  console.log('\n✅ ¡Listo! Cuentas creadas:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  creados.forEach((p) => {
    console.log(`${p.rol === 'admin' ? '👑 ADMIN' : '💼 STAFF'}  ${p.nombre}`);
    console.log(`   Email:    ${p.email}`);
    console.log(`   Password: ${p.password}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 Comparte estas credenciales con cada persona por un canal seguro.');
  console.log('🌐 Ingresan en: /intranet  (el admin además puede entrar a /admin)\n');

  rl.close();
}

main().catch((err) => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
