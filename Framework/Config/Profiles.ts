import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'dotenv';

/** Resuelve un ambiente sin mezclar los datos privados de Prod con los de QA. */
export function cargarPerfil(raiz: string, entorno: NodeJS.ProcessEnv = process.env) {
  const nombre = (entorno.TEST_PROFILE || 'prod').toLowerCase();
  if (!/^[a-z][a-z0-9-]*$/.test(nombre)) {
    throw new Error('TEST_PROFILE debe ser un nombre de perfil, por ejemplo prod o qa.');
  }
  const archivo = path.join(raiz, 'Workspace/Profiles', `${nombre}.json`);
  if (!fs.existsSync(archivo)) throw new Error(`No existe el perfil Workspace/Profiles/${nombre}.json.`);
  const perfil = JSON.parse(fs.readFileSync(archivo, 'utf8')) as {
    descripcion: string; baseURL: string; envFile: string;
  };
  // Solo se admiten archivos locales en la raíz; cada perfil elige uno distinto.
  if (typeof perfil.envFile !== 'string' || !/^\.env(?:\.[a-z0-9-]+)?$/.test(perfil.envFile)) {
    throw new Error(`envFile inválido en Workspace/Profiles/${nombre}.json.`);
  }
  const archivoPrivado = path.join(raiz, perfil.envFile);
  const privados = fs.existsSync(archivoPrivado) ? parse(fs.readFileSync(archivoPrivado)) : {};
  // Prioridad: variables de la terminal/CI > archivo privado del perfil > JSON.
  const variables = { ...privados, ...Object.fromEntries(Object.entries(entorno).filter(([, valor]) => valor !== undefined)) };
  const baseURL = variables.BASE_URL || perfil.baseURL;
  let url: URL;
  try { url = new URL(baseURL); } catch { throw new Error(`baseURL inválida en el perfil ${nombre}.`); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error(`El perfil ${nombre} requiere una URL HTTP/HTTPS sin credenciales.`);
  }
  return { nombre, descripcion: perfil.descripcion, baseURL, envFile: perfil.envFile, variables };
}
