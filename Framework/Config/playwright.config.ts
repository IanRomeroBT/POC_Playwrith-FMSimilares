import { defineConfig, devices } from '@playwright/test';
import { cargarPerfil } from './Profiles';
import { suites } from '../../Workspace/Test Suites/catalog';
import path from 'node:path';

const raiz = path.resolve(__dirname, '../..');
const perfil = cargarPerfil(raiz);
// Los workers reciben únicamente el archivo privado del ambiente elegido.
Object.assign(process.env, perfil.variables, { TEST_PROFILE: perfil.nombre, BASE_URL: perfil.baseURL });

export default defineConfig({
  testDir: path.join(raiz, 'Workspace/Test Cases'),
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  outputDir: 'Workspace/Reportes/artifacts',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'Workspace/Reportes/html', open: 'never' }],
    ['junit', { outputFile: 'Workspace/Reportes/junit/results.xml' }],
    [path.join(raiz, 'Framework/Reporters/ExecutionReporter.ts')],
    [path.join(raiz, 'Framework/Reporters/AllureReporter.ts'), {
      resultsDir: 'Workspace/Reportes/allure-results',
      // Mostrar pasos de negocio y WebUI, evitando el ruido de cada llamada interna.
      detail: false,
      suiteTitle: false,
      environmentInfo: {
        Aplicacion: 'Farmacias Similares',
        Ambiente: perfil.nombre,
        URL: perfil.baseURL,
        Navegador: 'Chromium',
        Node: process.version,
        Plataforma: process.platform,
        ZonaHoraria: 'America/Mexico_City',
      },
    }],
    // Debe ir después del adaptador: primero guarda resultados y luego construye el HTML.
    [path.join(raiz, 'Framework/Reporters/GenerarAllure.ts')],
  ],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: perfil.baseURL,
    locale: 'es-MX', timezoneId: 'America/Mexico_City',
    actionTimeout: 20_000, navigationTimeout: 60_000,
    screenshot: 'only-on-failure', trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    ...suites,
    // Las pruebas técnicas están separadas de los casos que mantiene el QA.
    { name: 'framework', testDir: path.join(raiz, 'Framework/Tests'), testMatch: /framework\.spec\.ts/ },
  ],
});
