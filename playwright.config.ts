import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';
import { suites } from './Test Suites/catalog';

export default defineConfig({
  testDir: './Test Cases',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  outputDir: 'Reportes/artifacts',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'Reportes/html', open: 'never' }],
    ['junit', { outputFile: 'Reportes/junit/results.xml' }],
    ['./TestListeners/ExecutionReporter.ts'],
  ],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.BASE_URL || 'https://www.farmaciasdesimilares.com',
    locale: 'es-MX', timezoneId: 'America/Mexico_City',
    actionTimeout: 20_000, navigationTimeout: 60_000,
    screenshot: 'only-on-failure', trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: suites,
});
