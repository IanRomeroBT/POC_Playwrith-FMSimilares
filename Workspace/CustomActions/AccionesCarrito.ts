import { test } from '@playwright/test';
import type { WebUI } from './WebUI';
import { Carrito } from '../Object Repository/objects';

/** Reúne comprobaciones de negocio del carrito sin exponer selectores en los casos. */
export function crearAccionesCarrito(WebUI: WebUI) {

  async function verificarProductoYCantidad(nombreProducto: string, cantidad: string) {
    await test.step('Comprobar el producto y su cantidad en el carrito', async () => {
      await WebUI.verifyElementVisible(Carrito.producto(nombreProducto));
      await WebUI.verifyValue(Carrito.campoCantidad, cantidad);
    });
  }

  async function verificarCarritoVacio(nombreProductoEliminado: string) {
    await test.step('Comprobar que el carrito esté vacío y el producto haya desaparecido', async () => {
      await WebUI.verifyElementVisible(Carrito.avisoCarritoVacio);
      await WebUI.verifyElementNotPresent(Carrito.producto(nombreProductoEliminado));
    });
  }
  // Estas funciones conservan la página de esta prueba sin utilizar this.
  return {
    verificarProductoYCantidad,
    verificarCarritoVacio,
  } as const;
}

export type AccionesCarrito = ReturnType<typeof crearAccionesCarrito>;
