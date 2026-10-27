import { expect, test } from '@playwright/test';
import type { WebUI } from './WebUI';
import { Catalogo, Carrito, Inicio, Producto } from '../Object Repository/objects';
import data from '../Data Set/tienda.json';
import { validarCarritoConProductos, validarPrecondicion, validarProductoDisponible } from '../../Framework/Core/Preconditions';

/** Flujos reutilizables de tienda. Los casos describen el objetivo y aquí se resuelven los detalles. */
export function crearAccionesTienda(WebUI: WebUI) {
  /** Prepara el cierre de avisos y abre el inicio en la sesión de esta prueba. */
  async function abrirTienda() {
    const cookies = Inicio.botonAceptarCookies.locate(WebUI.page);
    await WebUI.page.addLocatorHandler(cookies, async () => { await cookies.click(); });
    const promotion = Inicio.botonCerrarPromocion.locate(WebUI.page);
    await WebUI.page.addLocatorHandler(promotion, async () => {
      // Si ambos avisos coinciden, cookies está encima. Los handlers no son reentrantes.
      if (await cookies.isVisible()) await cookies.click();
      await promotion.click();
    });
    await WebUI.navigateToUrl('/');
    await WebUI.verifyElementVisible(Inicio.campoBuscarProducto);
  }
  /** Selecciona la entrega para el código postal indicado en los datos de prueba. */
  async function seleccionarUbicacion(cp = data.codigoPostal) {
    await test.step(`Seleccionar ubicación para el CP ${cp}`, async () => {
      await WebUI.click(Inicio.botonSeleccionarUbicacion);
      await configurarUbicacion(cp);
    });
  }
  async function configurarUbicacion(cp = data.codigoPostal) {
    await test.step('Elegir entrega a domicilio y comprobar cobertura', async () => {
      await WebUI.verifyElementVisible(Inicio.botonEntregaDomicilio);
      await WebUI.click(Inicio.botonEntregaDomicilio);
      await WebUI.setText(Inicio.campoDireccion, `${data.coloniaUbicacion}, ${cp} Zapopan, Jalisco, México`);
      // El buscador actualiza sus sugerencias de forma diferida. Esperar y elegir la
      // sugerencia del CP evita enviar una búsqueda antes de que termine esa actualización.
      await WebUI.click(Inicio.sugerenciaDireccion(cp));
      // Validar el pin del mapa, no el texto de la lista de sugerencias.
      await WebUI.verifyElementVisible(Inicio.direccionEncontradaEnMapa(cp));
      try {
        await expect(Inicio.botonConfirmarUbicacion.locate(WebUI.page)).toBeEnabled();
      } catch (error) {
        validarPrecondicion(!await Inicio.avisoSinCobertura.locate(WebUI.page).isVisible(), 'NO_COVERAGE',
          `La tienda indica Sin cobertura para el CP ${cp}, colonia ${data.coloniaUbicacion}. El flujo no puede continuar en esa ubicación.`);
        throw error;
      }
      await WebUI.click(Inicio.botonConfirmarUbicacion);
      await WebUI.verifyElementNotVisible(Inicio.botonConfirmarUbicacion);
      await WebUI.verifyElementVisible(Inicio.ubicacionSeleccionada(cp));
    });
  }
  /** Agrupa los mismos pasos explícitos que enseña TC02 para reutilizarlos en otros flujos. */
  async function buscarProducto(productoBuscado: string) {
    await test.step('Buscar un producto en la tienda', async () => {
      // Escribir el nombre y enviar la búsqueda con Enter.
      await WebUI.setText(Inicio.campoBuscarProducto, productoBuscado);
      await WebUI.pressKey(Inicio.campoBuscarProducto, 'Enter');
      await WebUI.verifyUrl(new RegExp(`/${encodeURIComponent(productoBuscado)}\\?map=ft`));
    });
  }
  /** Prepara un carrito desde cero; ningún caso depende de haber ejecutado otro antes. */
  async function agregarProductoYAbrirCarrito() {
    await test.step('Buscar el producto, agregarlo y abrir el carrito', async () => {
      await buscarProducto(data.busqueda);
      await WebUI.verifyElementVisible(Catalogo.tituloResultados(data.busqueda));
      await WebUI.click(Catalogo.enlaceProducto(data.producto.ruta));
      await WebUI.verifyElementVisible(Producto.nombre(data.producto.nombre));
      // Comprar ahora en el detalle solicita ubicación; no confirma un pedido.
      const initialAction = Producto.botonElegirEntrega.locate(WebUI.page);
      await expect(initialAction.or(Producto.botonAgregarAlCarrito.locate(WebUI.page)).or(Producto.avisoAgotado.locate(WebUI.page)).first()).toBeVisible();
      if (await initialAction.isVisible()) {
        await WebUI.click(Producto.botonElegirEntrega);
        await configurarUbicacion();
      }
      const added = Producto.confirmacionProductoAgregado.locate(WebUI.page);
      await expect(added.or(Producto.botonAgregarAlCarrito.locate(WebUI.page)).or(Producto.avisoAgotado.locate(WebUI.page)).first()).toBeVisible();
      if (!await added.isVisible()) {
        await validarProductoDisponible(WebUI.page);
        await WebUI.click(Producto.botonAgregarAlCarrito);
      }
      await WebUI.verifyElementVisible(Producto.confirmacionProductoAgregado);
      await WebUI.click(Producto.botonIrAlCarrito);
      await WebUI.verifyUrl(/\/checkout\/#\/cart/);
      await validarCarritoConProductos(WebUI.page);
      await WebUI.verifyElementVisible(Carrito.producto(data.producto.nombre));
    });
  }
  // Estas funciones conservan la página de esta prueba sin utilizar this.
  return {
    abrirTienda,
    seleccionarUbicacion,
    buscarProducto,
    agregarProductoYAbrirCarrito,
  } as const;
}

export type AccionesTienda = ReturnType<typeof crearAccionesTienda>;
