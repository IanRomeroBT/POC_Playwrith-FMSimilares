import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cargarPerfil } from '../Config/Profiles';

let raiz: string;
test.beforeEach(() => {
  // Archivos privados ficticios para comprobar el aislamiento sin leer datos del usuario.
  raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'perfiles-poc-'));
  fs.mkdirSync(path.join(raiz, 'Workspace/Profiles'), { recursive: true });
  for (const nombre of ['prod', 'qa']) {
    fs.writeFileSync(path.join(raiz, 'Workspace/Profiles', `${nombre}.json`), JSON.stringify({
      descripcion: nombre, baseURL: `https://${nombre}.example.invalid`,
      envFile: nombre === 'prod' ? '.env.prod' : '.env.qa',
    }));
  }
  fs.writeFileSync(path.join(raiz, '.env.prod'), 'CHECKOUT_EMAIL=prod@example.invalid\nBASE_URL=https://prod-local.example.invalid');
});
test.afterEach(() => fs.rmSync(raiz, { recursive: true, force: true }));

test('Prod es el perfil predeterminado y lee únicamente .env.prod', () => {
  const perfil = cargarPerfil(raiz, {});
  expect(perfil.nombre).toBe('prod');
  expect(perfil.baseURL).toBe('https://prod-local.example.invalid');
  expect(perfil.variables.CHECKOUT_EMAIL).toBe('prod@example.invalid');
});

test('QA no hereda contacto ni URL del archivo privado de Prod', () => {
  const perfil = cargarPerfil(raiz, { TEST_PROFILE: 'qa' });
  expect(perfil.nombre).toBe('qa');
  expect(perfil.baseURL).toBe('https://qa.example.invalid');
  expect(perfil.variables.CHECKOUT_EMAIL).toBeUndefined();
});

test('Terminal y CI tienen prioridad sobre los datos privados del perfil', () => {
  fs.writeFileSync(path.join(raiz, '.env.qa'), 'CHECKOUT_EMAIL=qa@example.invalid\nBASE_URL=https://qa-local.example.invalid');
  const local = cargarPerfil(raiz, { TEST_PROFILE: 'qa' });
  expect(local.baseURL).toBe('https://qa-local.example.invalid');
  expect(local.variables.CHECKOUT_EMAIL).toBe('qa@example.invalid');
  const ci = cargarPerfil(raiz, { TEST_PROFILE: 'qa', BASE_URL: 'https://ci.example.invalid', CHECKOUT_EMAIL: 'ci@example.invalid' });
  expect(ci.baseURL).toBe('https://ci.example.invalid');
  expect(ci.variables.CHECKOUT_EMAIL).toBe('ci@example.invalid');
});

test('Un perfil inexistente, una ruta externa o una URL inválida detienen la configuración', () => {
  expect(() => cargarPerfil(raiz, { TEST_PROFILE: 'no-existe' })).toThrow('No existe el perfil');
  expect(() => cargarPerfil(raiz, { TEST_PROFILE: '../prod' })).toThrow('nombre de perfil');
  expect(() => cargarPerfil(raiz, { BASE_URL: 'file:///C:/datos' })).toThrow('HTTP/HTTPS');
  expect(() => cargarPerfil(raiz, { BASE_URL: 'url-incompleta' })).toThrow('baseURL inválida');
  fs.writeFileSync(path.join(raiz, 'Workspace/Profiles', 'qa.json'), JSON.stringify({ envFile: '../.env', baseURL: 'https://qa.example.invalid' }));
  expect(() => cargarPerfil(raiz, { TEST_PROFILE: 'qa' })).toThrow('envFile inválido');
});
