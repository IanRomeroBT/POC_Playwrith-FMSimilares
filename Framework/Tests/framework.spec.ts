import { test, expect } from '../Fixtures/fixtures';
import { objeto } from '../../Workspace/Object Repository/objects';
import { validarCarritoConProductos, validarProductoDisponible } from '../Core/Preconditions';
import { crearWebUI } from '../Core/WebUI';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

test('FailureHandling distingue detener, continuar con falla y continuar con aviso @framework', async () => {
  // Un runner separado permite comprobar casos realmente fallidos sin falsear el resultado
  // con test.fail ni convertir fallas esperadas en escenarios de negocio aprobados.
  const ejecucion = spawnSync(process.execPath, [
    require.resolve('@playwright/test/cli'), 'test',
    '--config', 'Framework/Validation/FailureHandling/playwright.config.ts', '--reporter=json',
  ], {
    cwd: path.resolve(__dirname, '../..'), encoding: 'utf8', timeout: 45_000, maxBuffer: 5 * 1024 * 1024,
  });
  expect(ejecucion.error, ejecucion.stderr).toBeUndefined();
  expect(ejecucion.status, ejecucion.stderr).toBe(1);

  type Caso = { title: string; tests: Array<{ annotations: Array<{ type: string }>; results: Array<{ status: string }> }> };
  type Suite = { specs: Caso[]; suites?: Suite[] };
  const reporte = JSON.parse(ejecucion.stdout) as { suites: Suite[]; errors: unknown[] };
  const obtenerCasos = (suites: Suite[]): Caso[] => suites.flatMap(suite => [...suite.specs, ...obtenerCasos(suite.suites || [])]);
  expect(reporte.errors).toEqual([]);
  const casos = obtenerCasos(reporte.suites);
  expect(casos).toHaveLength(7);

  for (const caso of casos) {
    const resultado = caso.tests[0];
    const detener = ['predeterminado', 'detener'].includes(caso.title);
    const opcional = caso.title.startsWith('opcional');
    const aprobado = opcional || caso.title === 'exito';
    expect(resultado.results[0].status, caso.title).toBe(aprobado ? 'passed' : 'failed');
    expect(resultado.annotations.some(aviso => aviso.type === 'continuacion'), caso.title).toBe(!detener);
    expect(resultado.annotations.some(aviso => aviso.type === 'warning'), caso.title).toBe(opcional);
  }
});

test('WebUI conserva esperas, acciones y validaciones @framework', async ({ WebUI, page }) => {
  // Esta página local comprueba las palabras clave sin depender de la tienda real.
  await page.setContent('<label>Buscar<input aria-label="Buscar"></label><button>Buscar</button><output></output>');
  await page.getByRole('button').evaluate(button => {
    button.addEventListener('click', () => {
      document.querySelector('output')!.textContent = (document.querySelector('input') as HTMLInputElement).value;
    });
  });
  const input = objeto('Buscar / Texto', p => p.getByRole('textbox', { name: 'Buscar' }));
  await WebUI.setText(input, 'algodon');
  await WebUI.click(objeto('Buscar / Botón', p => p.getByRole('button', { name: 'Buscar' })));
  await expect(page.locator('output')).toHaveText('algodon');
  await WebUI.verifyValue(input, 'algodon');
});

test('Las herramientas del caso comparten su página durante la navegación @framework', async ({ WebUI, tienda, carrito, page }) => {
  // Interceptar toda la navegación mantiene esta comprobación completamente local.
  // El formulario simula Enter en el buscador; la URL conserva el contrato de la tienda.
  await page.route('**/*', route => route.fulfill({
    contentType: 'text/html; charset=utf-8',
    body: `<form action="/algodon"><input aria-label="¿Qué estás buscando?"><input type="hidden" name="map" value="ft"></form>
      <h2>El carrito está vacío</h2>`,
  }));
  await tienda.abrirTienda();
  await tienda.buscarProducto('algodon');
  await carrito.verificarCarritoVacio('Producto de prueba');
  await WebUI.refresh();
  await carrito.verificarCarritoVacio('Producto de prueba');
});

test('WebUI conserva la página de cada herramienta y funciona sin this @framework', async ({ WebUI, page }) => {
  // Dos páginas permiten detectar si una herramienta utiliza por error una página global.
  const otraPagina = await page.context().newPage();
  try {
    await page.setContent('<input aria-label="Buscar">');
    await otraPagina.setContent('<input aria-label="Buscar">');
    const otroWebUI = crearWebUI(otraPagina);
    const buscador = objeto('Buscar / Texto', pagina => pagina.getByRole('textbox', { name: 'Buscar' }));

    // Una función extraída del objeto debe conservar su página sin depender de this.
    const { setText } = WebUI;
    await setText(buscador, 'algodon');
    await otroWebUI.setText(buscador, 'vitaminas');

    await WebUI.verifyValue(buscador, 'algodon');
    await otroWebUI.verifyValue(buscador, 'vitaminas');
  } finally {
    await otraPagina.close();
  }
});

test('Guardia — carrito vacío produce un aviso explícito @framework', async ({ page }) => {
  await page.setContent('<h2>El carrito está vacío</h2>');
  await expect(validarCarritoConProductos(page, 500)).rejects.toMatchObject({
    name: 'PreconditionError', code: 'EMPTY_CART',
    message: expect.stringContaining('Carrito vacío: no se puede continuar con la compra'),
  });
});

test('Guardia — acepta varios productos y rechaza cantidades cero @framework', async ({ page }) => {
  await page.setContent('<input id="item-quantity-1" value="1"><input id="item-quantity-2" value="2"><a id="cart-to-orderform" href="#">Finalizar compra</a>');
  await validarCarritoConProductos(page);
  await page.locator('#item-quantity-2').fill('0');
  await expect(validarCarritoConProductos(page, 500)).rejects.toMatchObject({ code: 'INVALID_QUANTITY' });
});

test('Guardia — un recomendado agotado no bloquea el producto principal @framework', async ({ page }) => {
  await page.setContent('<h1>Producto principal</h1><button>Agregar al carrito</button><article><button disabled>Producto agotado</button></article>');
  await validarProductoDisponible(page);
});

test('Guardia — espera inventario antes de declarar producto agotado @framework', async ({ page }) => {
  await page.setContent(`<button id="stock" disabled>Producto agotado</button>
    <script>setTimeout(() => { const button = document.getElementById('stock'); button.textContent = 'Agregar al carrito'; button.disabled = false; }, 100);</script>`);
  await validarProductoDisponible(page);
});

test('Guardia — no confunde la carga del carrito con un carrito vacío @framework', async ({ page }) => {
  await page.setContent(`<h2 id="empty">El carrito está vacío</h2><div id="cart"></div>
    <script>setTimeout(() => {
      document.getElementById('empty').remove();
      document.getElementById('cart').innerHTML = '<input id="item-quantity-1" value="1"><a id="cart-to-orderform" href="#">Finalizar compra</a>';
    }, 100);</script>`);
  await validarCarritoConProductos(page, 1000);
});
