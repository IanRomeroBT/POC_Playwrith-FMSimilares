import { test } from '../../Framework/Fixtures/fixtures';
import { Carrito } from '../Object Repository/objects';
import datos from '../Data Set/tienda.json';

test('TC05 — E2E Vaciar carrito @regression', async ({ WebUI, tienda, carrito }) => {
  // Paso 1: Preparar un carrito con una unidad del producto.
  await tienda.abrirTienda();
  await tienda.agregarProductoYAbrirCarrito();
  await carrito.verificarProductoYCantidad(datos.producto.nombre, '1');

  // Paso 2: Aumentar la cantidad y comprobar que ahora hay dos unidades.
  await WebUI.click(Carrito.botonAumentarCantidad);
  await WebUI.verifyValue(Carrito.campoCantidad, '2');

  // Paso 3: Eliminar el producto y comprobar que desapareció del carrito.
  await WebUI.click(Carrito.botonEliminarProducto);
  await carrito.verificarCarritoVacio(datos.producto.nombre);

  // Resultado esperado: El carrito sigue vacío después de recargar la página.
  await WebUI.refresh();
  await carrito.verificarCarritoVacio(datos.producto.nombre);
});
