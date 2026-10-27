import { Dado, Cuando, Entonces } from '../../Framework/Fixtures/bdd.fixtures';
import { Inicio, Catalogo, Producto, Carrito } from '../Object Repository/objects';
import { FailureHandling } from '../CustomActions/WebUI';
import datos from '../Data Set/tienda.json';

// DADO: prepara una sesión independiente y sus precondiciones.
Dado('que estoy en la tienda', async ({ tienda }) => {
  await tienda.abrirTienda();
});

Dado('tengo seleccionada la ubicación de entrega del Data Set', async ({ tienda }) => {
  await tienda.seleccionarUbicacion(datos.codigoPostal);
});

Dado('que dispongo de datos válidos de contacto y envío', async ({ datosCompra }) => {
  // Solicitar el fixture lee y valida .env antes de interactuar con la tienda.
  // La validación ya fue realizada al preparar datosCompra; aquí no se imprimen sus valores.
  void datosCompra;
});

Dado('tengo el producto del Data Set en mi carrito', async ({ tienda }) => {
  await tienda.agregarProductoYAbrirCarrito();
});

// CUANDO: ejecuta acciones del cliente con las mismas palabras clave estilo Katalon.
Cuando('selecciono la ubicación de entrega del Data Set', async ({ tienda }) => {
  await tienda.seleccionarUbicacion(datos.codigoPostal);
});

Cuando('busco el producto del Data Set', async ({ tienda }) => {
  await tienda.buscarProducto(datos.busqueda);
});

Cuando('abro el producto encontrado', async ({ WebUI }) => {
  await WebUI.verifyElementVisible(Catalogo.tituloResultados(datos.busqueda));
  await WebUI.click(Catalogo.enlaceProducto(datos.producto.ruta), FailureHandling.STOP_ON_FAILURE);
});

Cuando('agrego el producto del Data Set y abro el carrito', async ({ tienda }) => {
  await tienda.agregarProductoYAbrirCarrito();
});

Cuando('completo los datos de contacto y acepto los términos autorizados', async ({ compra, datosCompra }) => {
  await compra.completarContacto(datosCompra);
});

Cuando('completo el envío y confirmo la dirección en el mapa', async ({ compra, datosCompra }) => {
  await compra.completarEnvio(datosCompra);
});

Cuando('aumento la cantidad del producto', async ({ WebUI }) => {
  await WebUI.click(Carrito.botonAumentarCantidad);
});

Cuando('elimino el producto del carrito', async ({ WebUI }) => {
  await WebUI.click(Carrito.botonEliminarProducto);
});

Cuando('recargo la página', async ({ WebUI }) => {
  await WebUI.refresh();
});

// ENTONCES: valida el resultado. Una frase sin una comprobación no demuestra que el caso pasó.
Entonces('el encabezado muestra la ubicación seleccionada', async ({ WebUI }) => {
  await WebUI.verifyElementVisible(Inicio.ubicacionSeleccionada(datos.codigoPostal));
});

Entonces('veo el nombre, la descripción y la dirección del producto esperado', async ({ WebUI }) => {
  await WebUI.verifyElementVisible(Producto.nombre(datos.producto.nombre));
  // Registrar una descripción ausente y verificar también la URL, igual que en TC02 TypeScript.
  await WebUI.verifyElementVisible(Producto.descripcion(datos.producto.descripcion), FailureHandling.CONTINUE_ON_FAILURE);
  await WebUI.verifyUrl(/\/algodon_paquete_c_50gr\/p/);
});

Entonces('el carrito contiene {int} unidad(es) del producto esperado', async ({ carrito }, cantidad: number) => {
  await carrito.verificarProductoYCantidad(datos.producto.nombre, String(cantidad));
});

Entonces('puedo continuar con la compra', async ({ WebUI }) => {
  await WebUI.verifyElementVisible(Carrito.botonContinuarCompra);
  await WebUI.verifyElementEnabled(Carrito.botonContinuarCompra);
});

Entonces('el formulario de tarjeta está disponible sin capturar datos de pago', async ({ compra }) => {
  await compra.verificarFormularioTarjeta();
});

Entonces('el carrito está vacío y el producto ya no aparece', async ({ carrito }) => {
  await carrito.verificarCarritoVacio(datos.producto.nombre);
});

Entonces('el carrito sigue vacío y el producto no reaparece', async ({ carrito }) => {
  await carrito.verificarCarritoVacio(datos.producto.nombre);
});
