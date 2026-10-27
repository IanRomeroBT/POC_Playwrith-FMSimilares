import type { Project } from '@playwright/test';

// Los casos viven una sola vez; las suites los seleccionan por etiquetas.
export const suites: Project[] = [
  { name: 'e2e' },
  { name: 'smoke', grep: /@smoke/ },
  { name: 'regression', grep: /@regression/ },
  { name: 'checkout', grep: /@checkout/ },
];
