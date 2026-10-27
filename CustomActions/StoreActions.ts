import { expect, test } from '@playwright/test';
import { WebUI } from '../Core/WebUI';
import { Catalog, Cart, Home, Product } from '../Object Repository/objects';
import data from '../Data Set/tienda.json';
import { requireCartWithProducts, requirePrecondition, requireProductAvailable } from '../Core/Preconditions';

export class StoreActions {
  constructor(private readonly ui: WebUI) {}
  async openStore() {
    const cookies = Home.cookies.locate(this.ui.page);
    await this.ui.page.addLocatorHandler(cookies, async () => { await cookies.click(); });
    const promotion = Home.promotionClose.locate(this.ui.page);
    await this.ui.page.addLocatorHandler(promotion, async () => {
      // Si ambos avisos coinciden, cookies está encima. Los handlers no son reentrantes.
      if (await cookies.isVisible()) await cookies.click();
      await promotion.click();
    });
    await this.ui.navigateToUrl('/');
    await this.ui.verifyElementVisible(Home.search);
  }
  async selectLocation(cp = data.codigoPostal) {
    await test.step(`CustomActions.selectLocation(${cp})`, async () => {
      await this.ui.click(Home.location);
      await this.configureLocation(cp);
    });
  }
  private async configureLocation(cp = data.codigoPostal) {
    await test.step('CustomActions.configureLocation — método y cobertura', async () => {
      await this.ui.verifyElementVisible(Home.delivery);
      await this.ui.click(Home.delivery);
      await this.ui.setText(Home.address, `${data.coloniaUbicacion}, ${cp} Zapopan, Jalisco, México`);
      await this.ui.click(Home.addressSearch);
      // El mapa muestra una dirección predeterminada mientras resuelve la búsqueda.
      await this.ui.verifyElementVisible(Home.mapAddress(cp));
      try {
        await expect(Home.confirmLocation.locate(this.ui.page)).toBeEnabled();
      } catch (error) {
        requirePrecondition(!await Home.noCoverage.locate(this.ui.page).isVisible(), 'NO_COVERAGE',
          `La tienda indica Sin cobertura para el CP ${cp}, colonia ${data.coloniaUbicacion}. El flujo no puede continuar en esa ubicación.`);
        throw error;
      }
      await this.ui.click(Home.confirmLocation);
      await expect(Home.confirmLocation.locate(this.ui.page), 'La ubicación no terminó de confirmarse.').toBeHidden();
      await this.ui.verifyElementVisible(Home.selectedLocation(cp));
    });
  }
  async search(query: string) {
    await this.ui.setText(Home.search, query);
    await this.ui.pressKey(Home.search, 'Enter');
    await this.ui.verifyUrl(new RegExp(`/${encodeURIComponent(query)}\\?map=ft`));
  }
  async addProductAndOpenCart() {
    await test.step('CustomActions.addProductAndOpenCart', async () => {
      await this.search(data.busqueda);
      await this.ui.verifyElementVisible(Catalog.heading(data.busqueda));
      await this.ui.click(Catalog.productLink(data.producto.ruta));
      await this.ui.verifyElementVisible(Product.title(data.producto.nombre));
      // Comprar ahora en el detalle solicita ubicación; no confirma un pedido.
      const initialAction = Product.startPurchase.locate(this.ui.page);
      await expect(initialAction.or(Product.add.locate(this.ui.page)).or(Product.unavailable.locate(this.ui.page)).first()).toBeVisible();
      if (await initialAction.isVisible()) {
        await this.ui.click(Product.startPurchase);
        await this.configureLocation();
      }
      const added = Product.added.locate(this.ui.page);
      await expect(added.or(Product.add.locate(this.ui.page)).or(Product.unavailable.locate(this.ui.page)).first()).toBeVisible();
      if (!await added.isVisible()) {
        await requireProductAvailable(this.ui.page);
        await this.ui.click(Product.add);
      }
      await this.ui.verifyElementVisible(Product.added);
      await this.ui.click(Product.goToCart);
      await this.ui.verifyUrl(/\/checkout\/#\/cart/);
      await requireCartWithProducts(this.ui.page);
      await this.ui.verifyElementVisible(Cart.product(data.producto.nombre));
    });
  }
}
