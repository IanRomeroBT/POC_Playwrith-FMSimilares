import { test } from '../TestListeners/fixtures';
import { StoreActions } from '../CustomActions/StoreActions';
import { Cart } from '../Object Repository/objects';
import data from '../Data Set/tienda.json';

test('TC03 — E2E Agregar producto al carrito @smoke @regression', async ({ WebUI }) => {
  const store = new StoreActions(WebUI);
  await store.openStore();
  await store.addProductAndOpenCart();
  await WebUI.verifyElementVisible(Cart.product(data.producto.nombre));
  await WebUI.verifyValue(Cart.quantity, '1');
  await WebUI.verifyElementVisible(Cart.checkout);
});
