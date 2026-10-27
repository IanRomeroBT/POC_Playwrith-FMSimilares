import { test } from '../TestListeners/fixtures';
import { StoreActions } from '../CustomActions/StoreActions';
import { CheckoutActions } from '../CustomActions/CheckoutActions';
import { checkoutData } from '../Data Set/checkout';
import { requirePrecondition } from '../Core/Preconditions';

// Flujo independiente: prepara el carrito y termina antes de capturar una tarjeta.
test('TC04 — E2E Comprar producto hasta formulario de tarjeta @checkout', async ({ WebUI }) => {
  const contact = checkoutData();
  requirePrecondition(contact.missing.length === 0, 'MISSING_DATA', `Configurar .env antes de comprar: ${contact.missing.join(', ')}`);
  requirePrecondition(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email), 'INVALID_EMAIL', 'CHECKOUT_EMAIL debe ser un correo válido autorizado para pruebas.');
  requirePrecondition(/^\d{10}$/.test(contact.phone), 'INVALID_PHONE', 'CHECKOUT_PHONE debe contener exactamente 10 dígitos.');
  const store = new StoreActions(WebUI);
  await store.openStore();
  await store.addProductAndOpenCart();
  const checkout = new CheckoutActions(WebUI);
  await checkout.completeContact(contact);
  await checkout.completeShipping(contact);
  await checkout.verifyCardForm();
});
