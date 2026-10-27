import { objeto } from './ObjetoPrueba';

// Cambiar aquí los localizadores cuando cambie esta pantalla, sin editar los casos.
export const Carrito = {
  producto: (name: string) => objeto('Carrito / Producto', p => p.locator('[id^="product-name"]').filter({ hasText: name })),
  campoCantidad: objeto('Carrito / Cantidad', p => p.locator('input[id^="item-quantity-"]')),
  botonAumentarCantidad: objeto('Carrito / Aumentar cantidad', p => p.locator('[id^="item-quantity-change-increment-"]')),
  botonEliminarProducto: objeto('Carrito / Eliminar', p => p.locator('[id^="item-remove-"]')),
  avisoCarritoVacio: objeto('Carrito / Vacío', p => p.getByText(/carrito.*vac[ií]o/i).first()),
  botonContinuarCompra: objeto('Carrito / Finalizar compra', p => p.locator('#cart-to-orderform')),
};

