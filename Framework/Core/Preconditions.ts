import { expect, test, type Page } from '@playwright/test';
import { Carrito, Producto } from '../../Workspace/Object Repository/objects';

/** Identifica un bloqueo de datos o disponibilidad para distinguirlo en los reportes. */
export class PreconditionError extends Error {
  constructor(readonly code: string, message: string) {
    super(`[PRECONDICION:${code}] ${message}`);
    this.name = 'PreconditionError';
  }
}

/** Si falta una condición necesaria, registra el motivo y detiene el caso con ese aviso. */
export function validarPrecondicion(condition: boolean, code: string, message: string): asserts condition {
  if (condition) return;
  test.info().annotations.push({ type: 'precondicion', description: `${code}: ${message}` });
  console.warn(`[PRECONDICION:${code}] ${message}`);
  throw new PreconditionError(code, message);
}

/** Espera la carga real del carrito y comprueba cantidades antes de permitir la compra. */
export async function validarCarritoConProductos(page: Page, timeout = 20_000) {
  await test.step('Precondición — carrito con productos antes de comprar', async () => {
    try {
      // El checkout muestra el template vacío antes de recuperar el carrito de la sesión.
      await expect(Carrito.campoCantidad.locate(page).first(), 'El carrito no terminó de cargar sus productos.').toBeVisible({ timeout });
      await expect(Carrito.botonContinuarCompra.locate(page)).toBeVisible({ timeout });
    } catch (error) {
      validarPrecondicion(!await Carrito.avisoCarritoVacio.locate(page).isVisible(), 'EMPTY_CART',
        'Carrito vacío: no se puede continuar con la compra. Agrega al menos un producto y vuelve a ejecutar el flujo.');
      throw error;
    }
    for (const quantity of await Carrito.campoCantidad.locate(page).all()) {
      try { await expect(quantity).not.toHaveValue('0', { timeout }); }
      catch (error) {
        if (await quantity.count() === 1 && await quantity.inputValue() === '0') {
          validarPrecondicion(false, 'INVALID_QUANTITY', 'El carrito contiene una cantidad no comprable. Revisa sus productos antes de continuar.');
        }
        throw error;
      }
      validarPrecondicion(Number(await quantity.inputValue()) > 0, 'INVALID_QUANTITY',
        'El carrito contiene una cantidad no comprable. Revisa sus productos antes de continuar.');
    }
    await expect(Carrito.botonContinuarCompra.locate(page), 'El carrito tiene productos pero Finalizar compra no está habilitado.').toBeEnabled();
  });
}

/** Distingue un producto agotado de un fallo al cargar o habilitar el botón de agregar. */
export async function validarProductoDisponible(page: Page) {
  await test.step('Precondición — producto disponible', async () => {
    const add = Producto.botonAgregarAlCarrito.locate(page);
    const unavailable = Producto.avisoAgotado.locate(page);
    try {
      // El sitio muestra Agotado transitoriamente mientras consulta inventario.
      await expect(add, 'No se habilitó Agregar al carrito tras cargar el inventario.').toBeEnabled();
    } catch (error) {
      validarPrecondicion(!await unavailable.isVisible(), 'OUT_OF_STOCK',
        'Producto agotado en la ubicación seleccionada. Actualiza el Data Set con un producto disponible antes de ejecutar el flujo.');
      throw error;
    }
  });
}
