import { test as base } from '@playwright/test';
import { WebUI } from '../Core/WebUI';

export const test = base.extend<{ WebUI: WebUI; evidence: void }>({
  WebUI: async ({ page }, use) => { await use(new WebUI(page)); },
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
