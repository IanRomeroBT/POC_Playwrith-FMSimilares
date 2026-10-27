import { test, expect } from '../TestListeners/fixtures';
import { object } from '../Object Repository/objects';
import { requireCartWithProducts, requireProductAvailable } from '../Core/Preconditions';

test('WebUI conserva esperas, acciones y validaciones @framework', async ({ WebUI, page }) => {
  await page.setContent('<label>Buscar<input aria-label="Buscar"></label><button>Buscar</button><output></output>');
  await page.getByRole('button').evaluate(button => {
    button.addEventListener('click', () => {
      document.querySelector('output')!.textContent = (document.querySelector('input') as HTMLInputElement).value;
    });
  });
  const input = object('Buscar / Texto', p => p.getByRole('textbox', { name: 'Buscar' }));
  await WebUI.setText(input, 'algodon');
  await WebUI.click(object('Buscar / Botón', p => p.getByRole('button', { name: 'Buscar' })));
  await expect(page.locator('output')).toHaveText('algodon');
  await WebUI.verifyValue(input, 'algodon');
});

test('Guardia — carrito vacío produce un aviso explícito @framework', async ({ page }) => {
  await page.setContent('<h2>El carrito está vacío</h2>');
  await expect(requireCartWithProducts(page, 500)).rejects.toMatchObject({
    name: 'PreconditionError', code: 'EMPTY_CART',
    message: expect.stringContaining('Carrito vacío: no se puede continuar con la compra'),
  });
});

test('Guardia — acepta varios productos y rechaza cantidades cero @framework', async ({ page }) => {
  await page.setContent('<input id="item-quantity-1" value="1"><input id="item-quantity-2" value="2"><a id="cart-to-orderform" href="#">Finalizar compra</a>');
  await requireCartWithProducts(page);
  await page.locator('#item-quantity-2').fill('0');
  await expect(requireCartWithProducts(page, 500)).rejects.toMatchObject({ code: 'INVALID_QUANTITY' });
});

test('Guardia — un recomendado agotado no bloquea el producto principal @framework', async ({ page }) => {
  await page.setContent('<h1>Producto principal</h1><button>Agregar al carrito</button><article><button disabled>Producto agotado</button></article>');
  await requireProductAvailable(page);
});

test('Guardia — espera inventario antes de declarar producto agotado @framework', async ({ page }) => {
  await page.setContent(`<button id="stock" disabled>Producto agotado</button>
    <script>setTimeout(() => { const button = document.getElementById('stock'); button.textContent = 'Agregar al carrito'; button.disabled = false; }, 100);</script>`);
  await requireProductAvailable(page);
});

test('Guardia — no confunde la carga del carrito con un carrito vacío @framework', async ({ page }) => {
  await page.setContent(`<h2 id="empty">El carrito está vacío</h2><div id="cart"></div>
    <script>setTimeout(() => {
      document.getElementById('empty').remove();
      document.getElementById('cart').innerHTML = '<input id="item-quantity-1" value="1"><a id="cart-to-orderform" href="#">Finalizar compra</a>';
    }, 100);</script>`);
  await requireCartWithProducts(page, 1000);
});
