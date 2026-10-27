import { test, expect } from '../TestListeners/fixtures';
import { StoreActions } from '../CustomActions/StoreActions';
import { Cart } from '../Object Repository/objects';
import data from '../Data Set/tienda.json';

test('TC05 — E2E Vaciar carrito @regression', async ({ WebUI, page }) => {
  const store = new StoreActions(WebUI);
  await store.openStore();
  await store.addProductAndOpenCart();
  await WebUI.verifyElementVisible(Cart.product(data.producto.nombre));
  await WebUI.verifyValue(Cart.quantity, '1');
  await WebUI.click(Cart.increment);
  await WebUI.verifyValue(Cart.quantity, '2');
  await WebUI.click(Cart.remove);
  await WebUI.verifyElementVisible(Cart.empty);
  await expect(Cart.product(data.producto.nombre).locate(page)).toHaveCount(0);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await WebUI.verifyElementVisible(Cart.empty);
});
