import type { Project } from '@playwright/test';

// Los casos viven una sola vez; las suites los seleccionan por etiquetas.
export const suites: Project[] = [
  { name: 'e2e', testIgnore: /framework/ },
  { name: 'smoke', grep: /@smoke/, testIgnore: /framework/ },
  { name: 'regression', grep: /@regression/, testIgnore: /framework/ },
  { name: 'checkout', grep: /@checkout/, testIgnore: /framework/ },
  { name: 'framework', testMatch: /framework\.spec\.ts/ },
];
