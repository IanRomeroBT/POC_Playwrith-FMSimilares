import { test } from '../../Framework/Fixtures/fixtures';
import { Inicio, Catalogo, Producto } from '../Object Repository/objects';
import datos from '../Data Set/tienda.json';
import { FailureHandling } from '../CustomActions/WebUI';

test('TC02 — E2E Buscar producto @smoke @regression', async ({ WebUI, tienda }) => {
  const productoBuscado = datos.busqueda;

  // Paso 1: Preparar la tienda y la ubicación de entrega.
  await tienda.abrirTienda();
  await tienda.seleccionarUbicacion(datos.codigoPostal);

  // Paso 2: Escribir el producto en el buscador.
  await WebUI.setText(Inicio.campoBuscarProducto, productoBuscado);

  // Paso 3: Presionar Enter para iniciar la búsqueda.
  await WebUI.pressKey(Inicio.campoBuscarProducto, 'Enter');
  await WebUI.verifyUrl(new RegExp(`/${encodeURIComponent(productoBuscado)}\\?map=ft`));

  // Paso 4: Comprobar los resultados y abrir el producto del Data Set.
  await WebUI.verifyElementVisible(Catalogo.tituloResultados(productoBuscado));
  // Es un paso necesario para continuar: si falla, detener el caso.
  await WebUI.click(Catalogo.enlaceProducto(datos.producto.ruta), FailureHandling.STOP_ON_FAILURE);

  // Resultado esperado: El detalle corresponde al nombre, descripción y ruta del producto.
  await WebUI.verifyElementVisible(Producto.nombre(datos.producto.nombre));
  // Si falta la descripción, registrar la falla y comprobar también la URL.
  await WebUI.verifyElementVisible(Producto.descripcion(datos.producto.descripcion), FailureHandling.CONTINUE_ON_FAILURE);
  await WebUI.verifyUrl(/\/algodon_paquete_c_50gr\/p/);
});
