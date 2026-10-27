import { validarPrecondicion } from '../../Framework/Core/Preconditions';

/** Lee los datos privados al ejecutar el caso; no se guardan en los archivos de prueba. */
export function obtenerDatosCompra() {
  const required = ['CHECKOUT_EMAIL', 'CHECKOUT_PHONE', 'SHIPPING_STREET', 'SHIPPING_NUMBER', 'SHIPPING_RECEIVER'] as const;
  const missing = required.filter(key => !process.env[key]?.trim());
  return {
    missing,
    email: process.env.CHECKOUT_EMAIL || '',
    phone: process.env.CHECKOUT_PHONE || '',
    firstName: process.env.CHECKOUT_FIRST_NAME || 'Prueba',
    lastName: process.env.CHECKOUT_LAST_NAME || 'Automatizada',
    street: process.env.SHIPPING_STREET || '',
    number: process.env.SHIPPING_NUMBER || '',
    receiver: process.env.SHIPPING_RECEIVER || '',
    neighborhood: process.env.SHIPPING_NEIGHBORHOOD || '',
    reference: process.env.SHIPPING_REFERENCE || 'Datos de prueba POC. No generar pedido.',
  };
}

/** Centraliza las reglas de entrada para que el caso muestre únicamente pasos de negocio. */
export function obtenerDatosCompraValidados() {
  const datos = obtenerDatosCompra();
  validarPrecondicion(datos.missing.length === 0, 'MISSING_DATA', `Configurar los datos privados del perfil ${process.env.TEST_PROFILE || 'prod'} antes de comprar: ${datos.missing.join(', ')}`);
  validarPrecondicion(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email), 'INVALID_EMAIL', 'CHECKOUT_EMAIL debe ser un correo válido autorizado para pruebas.');
  validarPrecondicion(/^\d{10}$/.test(datos.phone), 'INVALID_PHONE', 'CHECKOUT_PHONE debe contener exactamente 10 dígitos.');
  return datos;
}
