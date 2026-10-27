import { defineConfig } from '@playwright/test';

// Ejecución aislada: estos escenarios provocan fallas para comprobar el resultado real.
// No se seleccionan como casos de negocio ni escriben los reportes de la ejecución principal.
export default defineConfig({
  testDir: '.',
  testMatch: 'escenarios.ts',
  outputDir: '../../../Workspace/Reportes/failure-handling',
  workers: 1,
  retries: 0,
  timeout: 10_000,
  expect: { timeout: 150 },
  use: { browserName: 'chromium', headless: true, actionTimeout: 150 },
});
