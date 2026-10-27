import { test } from '../TestListeners/fixtures';
import { StoreActions } from '../CustomActions/StoreActions';
import { Catalog, Product } from '../Object Repository/objects';
import data from '../Data Set/tienda.json';

test('TC02 — E2E Buscar producto @smoke @regression', async ({ WebUI }) => {
  const store = new StoreActions(WebUI);
  await store.openStore();
  await store.selectLocation();
  await store.search(data.busqueda);
  await WebUI.verifyElementVisible(Catalog.heading(data.busqueda));
  await WebUI.click(Catalog.productLink(data.producto.ruta));
  await WebUI.verifyElementVisible(Product.title(data.producto.nombre));
  await WebUI.verifyElementVisible(Product.description(data.producto.descripcion));
  await WebUI.verifyUrl(/\/algodon_paquete_c_50gr\/p/);
});
