export function checkoutData() {
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
