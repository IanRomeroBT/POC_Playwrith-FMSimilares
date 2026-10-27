import type { Page } from '@playwright/test';
import { objeto } from './ObjetoPrueba';

// Los campos de crédito viven dentro de un iframe separado de la página principal.
const creditCardFrame = (page: Page) => page.frameLocator('#iframe-placeholder-creditCardPaymentGroup iframe');

// Cambiar aquí los localizadores cuando cambie esta pantalla, sin editar los casos.
export const Compra = {
  campoCorreoInicial: objeto('Compra / Correo inicial', p => p.locator('#client-pre-email')),
  botonContinuarCorreo: objeto('Compra / Continuar correo', p => p.locator('#btn-client-pre-email')),
  botonCerrarRecomendaciones: objeto('Compra / Cerrar recomendaciones', p => p.locator('#btn-close-related-products')),
  campoNombre: objeto('Compra / Nombre', p => p.locator('#client-first-name')),
  campoApellidos: objeto('Compra / Apellidos', p => p.locator('#client-last-name')),
  campoTelefono: objeto('Compra / Teléfono', p => p.locator('#client-phone')),
  casillaTerminos: objeto('Compra / Términos', p => p.locator('input#terms-agreed')),
  botonContinuarEnvio: objeto('Compra / Continuar a envío', p => p.locator('#go-to-shipping')),
  campoCodigoPostal: objeto('Envío / Código postal', p => p.locator('#ship-postalCode')),
  botonMostrarDireccion: objeto('Envío / Mostrar dirección completa', p => p.locator('#force-shipping-fields')),
  campoCalle: objeto('Envío / Calle', p => p.locator('#ship-street')),
  campoNumeroExterior: objeto('Envío / Número exterior', p => p.locator('#ship-number')),
  campoColonia: objeto('Envío / Colonia', p => p.locator('#ship-neighborhood')),
  campoDestinatario: objeto('Envío / Destinatario', p => p.locator('#ship-receiverName')),
  campoReferencia: objeto('Envío / Referencia', p => p.locator('#ship-reference')),
  botonIrAlPago: objeto('Envío / Ir al pago', p => p.locator('#btn-go-to-payment')),
  resumenDireccion: objeto('Envío / Resumen de dirección', p => p.locator('#shipping-data')),
  calleResumenEnvio: objeto('Envío / Calle del resumen', p => p.locator('#shipping-data .street').filter({ visible: true }).first()),
  numeroResumenEnvio: objeto('Envío / Número exterior del resumen', p => p.locator('#shipping-data .number').filter({ visible: true }).first()),
  botonEditarEnvio: objeto('Envío / Editar dirección desde pago', p => p.locator('#edit-shipping-data')),
  botonConfirmarMapa: objeto('Envío / Confirmar mapa', p => p.locator('#mapsModal').getByRole('button', { name: 'Confirmar', exact: true })),
  opcionTarjetaCredito: objeto('Pago / Tarjeta de crédito', p => p.locator('#payment-group-creditCardPaymentGroup')),
  campoNumeroTarjeta: objeto('Pago / Número', p => creditCardFrame(p).getByRole('textbox', { name: 'Número', exact: true })),
  campoTitularTarjeta: objeto('Pago / Titular', p => creditCardFrame(p).getByRole('textbox', { name: 'Nombre y Apellido como figura en la tarjeta', exact: true })),
  listaMesTarjeta: objeto('Pago / Mes', p => creditCardFrame(p).locator('select[id$="Month"]')),
  listaAnioTarjeta: objeto('Pago / Año', p => creditCardFrame(p).locator('select[id$="Year"]')),
  campoCodigoSeguridad: objeto('Pago / Código de seguridad', p => creditCardFrame(p).getByRole('textbox', { name: 'Código de Seguridad', exact: true })),
};
