import { expect, test } from '@playwright/test';
import type { WebUI } from './WebUI';
import { Carrito, Compra } from '../Object Repository/objects';
import { obtenerDatosCompra } from '../Data Set/checkout';
import data from '../Data Set/tienda.json';
import { validarCarritoConProductos } from '../../Framework/Core/Preconditions';

/** Contacto, envío y validación de pago. El recorrido termina sin generar un pedido. */
export function crearAccionesCompra(WebUI: WebUI) {
  /** Comprueba el carrito antes de capturar los datos autorizados del contacto. */
  async function completarContacto(contact: ReturnType<typeof obtenerDatosCompra>) {
    await test.step('Completar contacto y continuar al envío', async () => {
      const close = Compra.botonCerrarRecomendaciones.locate(WebUI.page);
      await WebUI.page.addLocatorHandler(close, async () => { await close.click(); });
      await validarCarritoConProductos(WebUI.page);
      await WebUI.click(Carrito.botonContinuarCompra);
      await WebUI.typeText(Compra.campoCorreoInicial, contact.email);
      await WebUI.click(Compra.botonContinuarCorreo);
      await WebUI.typeText(Compra.campoNombre, contact.firstName);
      await WebUI.typeText(Compra.campoApellidos, contact.lastName);
      await WebUI.typeText(Compra.campoTelefono, contact.phone);
      await WebUI.setChecked(Compra.casillaTerminos, true);
      await WebUI.verifyElementEnabled(Compra.botonContinuarEnvio);
      await WebUI.click(Compra.botonContinuarEnvio);
      await WebUI.verifyUrl(/#\/shipping/);
    });
  }
  /** Confirma el mapa y recupera campos que la tienda pudiera borrar al actualizar la dirección. */
  async function completarEnvio(address: ReturnType<typeof obtenerDatosCompra>) {
    await test.step('Completar envío y comprobar la dirección final', async () => {
      const numberPattern = new RegExp(`\\b${address.number.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      await capturarDireccion(address);
      await WebUI.click(Compra.botonIrAlPago);
      // El mapa puede corregir dirección/CP y devolver el checkout al paso de envío.
      // Se resuelve explícitamente; un handler aquí ocultaría la pérdida de campos.
      const confirm = Compra.botonConfirmarMapa.locate(WebUI.page);
      await expect(confirm).toBeVisible();
      // El modal se oculta antes de que termine el guardado. Esa respuesta puede borrar
      // calle/número; esperar la petición nueva evita revisar un resumen todavía antiguo.
      const [solicitudMapa] = await Promise.all([
        WebUI.page.waitForRequest(solicitud => solicitud.method() === 'POST'
          && new URL(solicitud.url()).pathname.endsWith('/attachments/shippingData')),
        WebUI.click(Compra.botonConfirmarMapa),
      ]);
      const respuestaMapa = await solicitudMapa.response();
      expect(respuestaMapa, 'La tienda no respondió al guardar la dirección del mapa.').not.toBeNull();
      expect(respuestaMapa!.ok(), 'La tienda rechazó el guardado de la dirección del mapa.').toBe(true);
      const errorRespuesta = await respuestaMapa!.finished();
      expect(errorRespuesta, 'La respuesta del guardado de dirección quedó incompleta.').toBeNull();
      await expect(confirm).toBeHidden();
      if (new URL(WebUI.page.url()).hash === '#/payment') {
        const summary = await Compra.resumenDireccion.locate(WebUI.page).innerText();
        if (!summary.includes(address.street) || !numberPattern.test(summary)) {
          await WebUI.click(Compra.botonEditarEnvio);
          await WebUI.verifyUrl(/#\/shipping/);
        }
      }
      if (new URL(WebUI.page.url()).hash === '#/shipping') {
        await capturarDireccion(address);
        await WebUI.click(Compra.botonIrAlPago);
      }
      await WebUI.verifyUrl(/#\/payment/);
      await WebUI.verifyText(Compra.resumenDireccion, data.codigoPostal);
      await expect(Compra.calleResumenEnvio.locate(WebUI.page), 'La calle no se conservó en el resumen final.').toHaveText(address.street);
      // El HTML une textos como "1Los Almendros". Comparar el campo evita confundir
      // un número correcto con la falta de un límite de palabra en el texto completo.
      await expect(Compra.numeroResumenEnvio.locate(WebUI.page), 'El número exterior no se conservó en el resumen final.').toHaveText(address.number);
    });
  }
  async function capturarDireccion(address: ReturnType<typeof obtenerDatosCompra>) {
    if (!await Compra.campoCalle.locate(WebUI.page).isVisible() && await Compra.botonMostrarDireccion.locate(WebUI.page).isVisible()) {
      await WebUI.click(Compra.botonMostrarDireccion);
    }
    if (await Compra.campoCodigoPostal.locate(WebUI.page).inputValue() !== data.codigoPostal) {
      await Promise.all([
        WebUI.page.waitForResponse(response => new URL(response.url()).pathname === `/api/checkout/pub/postal-code/MEX/${data.codigoPostal}` && response.ok()),
        WebUI.typeText(Compra.campoCodigoPostal, data.codigoPostal),
      ]);
    }
    // La dirección elegida en el mapa también puede mostrar colonia como resumen fijo.
    const neighborhood = Compra.campoColonia.locate(WebUI.page);
    if (await neighborhood.isVisible()) {
      if (await neighborhood.evaluate(element => element.tagName) === 'SELECT') {
        if (address.neighborhood) await WebUI.selectOptionByLabel(Compra.campoColonia, address.neighborhood);
        else await neighborhood.selectOption({ index: 0 });
      } else {
        await WebUI.typeText(Compra.campoColonia, address.neighborhood || data.coloniaUbicacion);
      }
    }
    const fields = [
      [Compra.campoReferencia, address.reference],
      [Compra.campoCalle, address.street],
      [Compra.campoDestinatario, address.receiver],
      [Compra.campoNumeroExterior, address.number],
    ] as const;
    // La sincronización de dirección puede reconstruir campos ya capturados.
    // Se recapturan únicamente los valores perdidos y se comprueba el conjunto.
    for (let attempt = 0; attempt < 3; attempt++) {
      for (const [field, value] of fields) {
        const input = field.locate(WebUI.page);
        if (await input.isVisible() && await input.inputValue() !== value) await WebUI.typeText(field, value);
      }
      let complete = true;
      for (const [field, value] of fields) {
        const input = field.locate(WebUI.page);
        if (await input.isVisible() && await input.inputValue() !== value) complete = false;
      }
      if (complete) break;
    }
    await WebUI.verifyValue(Compra.campoCodigoPostal, data.codigoPostal);
    if (await Compra.campoCalle.locate(WebUI.page).isVisible()) await WebUI.verifyValue(Compra.campoCalle, address.street);
    await WebUI.verifyValue(Compra.campoDestinatario, address.receiver);
    await WebUI.verifyValue(Compra.campoNumeroExterior, address.number);
  }
  /** Comprueba que los campos estén disponibles sin capturar datos de tarjeta. */
  async function verificarFormularioTarjeta() {
    await test.step('Verificar el formulario de tarjeta y terminar el recorrido', async () => {
      await WebUI.click(Compra.opcionTarjetaCredito);
      for (const object of [Compra.campoNumeroTarjeta, Compra.campoTitularTarjeta, Compra.listaMesTarjeta, Compra.listaAnioTarjeta, Compra.campoCodigoSeguridad]) {
        await WebUI.verifyElementVisible(object);
        await WebUI.verifyElementEnabled(object);
      }
      await WebUI.verifyValue(Compra.campoNumeroTarjeta, '');
      await WebUI.verifyValue(Compra.campoCodigoSeguridad, '');
      // Fin intencional. Nunca se captura tarjeta ni se pulsa Comprar ahora.
    });
  }
  // Estas funciones conservan la página de esta prueba sin utilizar this.
  return {
    completarContacto,
    completarEnvio,
    verificarFormularioTarjeta,
  } as const;
}

export type AccionesCompra = ReturnType<typeof crearAccionesCompra>;
