import { expect, test, type Page } from '@playwright/test';
import { Cart, Product } from '../Object Repository/objects';

export class PreconditionError extends Error {
  constructor(readonly code: string, message: string) {
    super(`[PRECONDICION:${code}] ${message}`);
    this.name = 'PreconditionError';
  }
}

export function requirePrecondition(condition: boolean, code: string, message: string): asserts condition {
  if (condition) return;
  test.info().annotations.push({ type: 'precondicion', description: `${code}: ${message}` });
  console.warn(`[PRECONDICION:${code}] ${message}`);
  throw new PreconditionError(code, message);
}

export async function requireCartWithProducts(page: Page, timeout = 20_000) {
  await test.step('Precondición — carrito con productos antes de comprar', async () => {
    try {
      // El checkout muestra el template vacío antes de recuperar el carrito de la sesión.
      await expect(Cart.quantity.locate(page).first(), 'El carrito no terminó de cargar sus productos.').toBeVisible({ timeout });
      await expect(Cart.checkout.locate(page)).toBeVisible({ timeout });
    } catch (error) {
      requirePrecondition(!await Cart.empty.locate(page).isVisible(), 'EMPTY_CART',
        'Carrito vacío: no se puede continuar con la compra. Agrega al menos un producto y vuelve a ejecutar el flujo.');
      throw error;
    }
    for (const quantity of await Cart.quantity.locate(page).all()) {
      try { await expect(quantity).not.toHaveValue('0', { timeout }); }
      catch (error) {
        if (await quantity.count() === 1 && await quantity.inputValue() === '0') {
          requirePrecondition(false, 'INVALID_QUANTITY', 'El carrito contiene una cantidad no comprable. Revisa sus productos antes de continuar.');
        }
        throw error;
      }
      requirePrecondition(Number(await quantity.inputValue()) > 0, 'INVALID_QUANTITY',
        'El carrito contiene una cantidad no comprable. Revisa sus productos antes de continuar.');
    }
    await expect(Cart.checkout.locate(page), 'El carrito tiene productos pero Finalizar compra no está habilitado.').toBeEnabled();
  });
}

export async function requireProductAvailable(page: Page) {
  await test.step('Precondición — producto disponible', async () => {
    const add = Product.add.locate(page);
    const unavailable = Product.unavailable.locate(page);
    try {
      // El sitio muestra Agotado transitoriamente mientras consulta inventario.
      await expect(add, 'No se habilitó Agregar al carrito tras cargar el inventario.').toBeEnabled();
    } catch (error) {
      requirePrecondition(!await unavailable.isVisible(), 'OUT_OF_STOCK',
        'Producto agotado en la ubicación seleccionada. Actualiza el Data Set con un producto disponible antes de ejecutar el flujo.');
      throw error;
    }
  });
}
