import { test } from '../../Framework/Fixtures/fixtures';
import { Carrito } from '../Object Repository/objects';
import datos from '../Data Set/tienda.json';

test('TC03 — E2E Agregar producto al carrito @smoke @regression', async ({ WebUI, tienda, carrito }) => {
  // Paso 1: Abrir una sesión nueva de la tienda.
  await tienda.abrirTienda();

  // Paso 2: Buscar el producto, seleccionar entrega y agregarlo al carrito.
  await tienda.agregarProductoYAbrirCarrito();

  // Resultado esperado: El carrito contiene una unidad y permite continuar la compra.
  await carrito.verificarProductoYCantidad(datos.producto.nombre, '1');
  await WebUI.verifyElementVisible(Carrito.botonContinuarCompra);
  await WebUI.verifyElementEnabled(Carrito.botonContinuarCompra);
});
