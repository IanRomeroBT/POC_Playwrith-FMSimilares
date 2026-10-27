import { test } from '../../Framework/Fixtures/fixtures';
import { obtenerDatosCompraValidados } from '../Data Set/checkout';

// Flujo independiente: prepara el carrito y termina antes de capturar una tarjeta.
test('TC04 — E2E Comprar producto hasta formulario de tarjeta @checkout', async ({ tienda, compra }) => {
  // Precondición: Leer .env y detenerse con un aviso claro si faltan datos válidos.
  const datosCompra = obtenerDatosCompraValidados();

  // Paso 1: Preparar un carrito propio; no depende de TC03.
  await tienda.abrirTienda();
  await tienda.agregarProductoYAbrirCarrito();

  // Paso 2: Capturar el contacto y aceptar los términos autorizados para esta POC.
  await compra.completarContacto(datosCompra);

  // Paso 3: Capturar el envío y confirmar la dirección en el mapa.
  await compra.completarEnvio(datosCompra);

  // Resultado esperado: El formulario de tarjeta está habilitado. Aquí termina la prueba.
  await compra.verificarFormularioTarjeta();
});
