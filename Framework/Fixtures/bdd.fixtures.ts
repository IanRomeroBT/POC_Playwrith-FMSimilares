import { mergeTests } from '@playwright/test';
import { createBdd, test as baseBdd } from 'playwright-bdd';
import { test as herramientas } from './fixtures';
import { obtenerDatosCompraValidados } from '../../Workspace/Data Set/checkout';

// Reutiliza WebUI, tienda, carrito, compra y evidencias sin duplicar su preparación.
export const test = mergeTests(baseBdd, herramientas).extend<{
  datosCompra: ReturnType<typeof obtenerDatosCompraValidados>;
}>({
  // Este dato se prepara solo en el escenario que lo solicita y nunca se escribe en Gherkin.
  datosCompra: async ({}, use) => { await use(obtenerDatosCompraValidados()); },
});

// Los nombres en español facilitan relacionar cada frase del feature con su implementación.
export const { Given: Dado, When: Cuando, Then: Entonces } = createBdd(test);
