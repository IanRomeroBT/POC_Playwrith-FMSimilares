import type { Locator, Page } from '@playwright/test';

/** Un objeto describe un elemento; se busca en la página de la prueba al utilizarlo. */
export type TestObject = Readonly<{ name: string; locate: (page: Page) => Locator }>;

/** El nombre aparece en el reporte; locate contiene la forma de encontrar el elemento. */
export const objeto = (name: string, locate: TestObject['locate']): TestObject => ({ name, locate });
