import { test as base } from '@playwright/test';
import { crearWebUI, type WebUI } from '../Core/WebUI';
import { crearAccionesTienda, type AccionesTienda } from '../../Workspace/CustomActions/AccionesTienda';
import { crearAccionesCarrito, type AccionesCarrito } from '../../Workspace/CustomActions/AccionesCarrito';
import { crearAccionesCompra, type AccionesCompra } from '../../Workspace/CustomActions/AccionesCompra';

// Playwright prepara estas herramientas para cada caso y las descarta al terminar.
// En el test basta pedir { WebUI, tienda, carrito, compra }; no hay que preparar las herramientas a mano.
type HerramientasPrueba = {
  WebUI: WebUI;
  tienda: AccionesTienda;
  carrito: AccionesCarrito;
  compra: AccionesCompra;
  evidence: void;
  ambiente: void;
};

export const test = base.extend<HerramientasPrueba>({
  ambiente: [async ({ baseURL }, use, info) => {
    // Los QA de ejemplo permiten listar casos, pero requieren una URL real para navegar.
    if (info.project.name !== 'framework' && baseURL && new URL(baseURL).hostname.endsWith('.invalid')) {
      throw new Error(`El perfil ${process.env.TEST_PROFILE} es un ejemplo. Configura su baseURL real en Workspace/Profiles/ antes de ejecutar.`);
    }
    await use();
  }, { auto: true }],
  WebUI: async ({ page }, use) => { await use(crearWebUI(page)); },
  tienda: async ({ WebUI }, use) => { await use(crearAccionesTienda(WebUI)); },
  carrito: async ({ WebUI }, use) => { await use(crearAccionesCarrito(WebUI)); },
  compra: async ({ WebUI }, use) => { await use(crearAccionesCompra(WebUI)); },
  evidence: [async ({ page }, use, info) => {
    // beforeTest: cada caso recibe contexto y página nuevos del runner.
    await use();
    // afterTest: adjuntar evidencia también en éxito; errores de captura no ocultan el fallo original.
    if (!page.isClosed()) {
      try {
        const imagePath = info.outputPath('pantalla-final.png');
        await page.screenshot({ path: imagePath, fullPage: true });
        await info.attach('pantalla-final', { path: imagePath, contentType: 'image/png' });
      } catch (error) {
        await info.attach('error-captura', { body: String(error), contentType: 'text/plain' });
      }
    }
  }, { auto: true }],
});
export { expect } from '@playwright/test';
