import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import configuracionBase from './playwright.config';
import { suites } from '../../Workspace/Test Suites/catalog';

// Gherkin se convierte en pruebas de Playwright; los archivos generados no se editan.
const testDir = defineBddConfig({
  features: 'Workspace/Features/**/*.feature',
  steps: ['Workspace/Step Definitions/**/*.ts', 'Framework/Fixtures/bdd.fixtures.ts'],
  outputDir: 'Framework/Generated/features',
  language: 'es',
});

export default defineConfig({
  ...configuracionBase,
  testDir,
  // Cada suite selecciona los mismos escenarios por etiquetas, como en los casos TypeScript.
  projects: suites.map(suite => ({ ...suite, testDir })),
});
