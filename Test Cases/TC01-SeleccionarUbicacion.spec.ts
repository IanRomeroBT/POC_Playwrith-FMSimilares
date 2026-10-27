import { test } from '../TestListeners/fixtures';
import { StoreActions } from '../CustomActions/StoreActions';
import { Home } from '../Object Repository/objects';
import data from '../Data Set/tienda.json';

test('TC01 — E2E Seleccionar ubicación @smoke @regression', async ({ WebUI }) => {
  const store = new StoreActions(WebUI);
  await store.openStore();
  await store.selectLocation();
  await WebUI.verifyElementVisible(Home.selectedLocation(data.codigoPostal));
});
