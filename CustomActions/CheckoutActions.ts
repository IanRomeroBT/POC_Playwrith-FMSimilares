import { expect, test } from '@playwright/test';
import { WebUI } from '../Core/WebUI';
import { Cart, Checkout } from '../Object Repository/objects';
import { checkoutData } from '../Data Set/checkout';
import data from '../Data Set/tienda.json';
import { requireCartWithProducts } from '../Core/Preconditions';

export class CheckoutActions {
  constructor(private readonly ui: WebUI) {}
  async completeContact(contact: ReturnType<typeof checkoutData>) {
    await test.step('CustomActions.completeContact', async () => {
      const close = Checkout.relatedClose.locate(this.ui.page);
      await this.ui.page.addLocatorHandler(close, async () => { await close.click(); });
      await requireCartWithProducts(this.ui.page);
      await this.ui.click(Cart.checkout);
      await this.ui.typeText(Checkout.preEmail, contact.email);
      await this.ui.click(Checkout.continueEmail);
      await this.ui.typeText(Checkout.firstName, contact.firstName);
      await this.ui.typeText(Checkout.lastName, contact.lastName);
      await this.ui.typeText(Checkout.phone, contact.phone);
      await this.ui.setChecked(Checkout.terms, true);
      await this.ui.verifyElementEnabled(Checkout.shipping);
      await this.ui.click(Checkout.shipping);
      await this.ui.verifyUrl(/#\/shipping/);
    });
  }
  async completeShipping(address: ReturnType<typeof checkoutData>) {
    await test.step('CustomActions.completeShipping', async () => {
      const numberPattern = new RegExp(`\\b${address.number.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      await this.fillShipping(address);
      await this.ui.click(Checkout.payment);
      // El mapa puede corregir dirección/CP y devolver el checkout al paso de envío.
      // Se resuelve explícitamente; un handler aquí ocultaría la pérdida de campos.
      const confirm = Checkout.mapConfirm.locate(this.ui.page);
      await expect(confirm).toBeVisible();
      await this.ui.click(Checkout.mapConfirm);
      await expect(confirm).toBeHidden();
      if (new URL(this.ui.page.url()).hash === '#/payment') {
        const summary = await Checkout.shippingSummary.locate(this.ui.page).innerText();
        if (!summary.includes(address.street) || !numberPattern.test(summary)) {
          await this.ui.click(Checkout.editShipping);
          await this.ui.verifyUrl(/#\/shipping/);
        }
      }
      if (new URL(this.ui.page.url()).hash === '#/shipping') {
        await this.fillShipping(address);
        await this.ui.click(Checkout.payment);
      }
      await this.ui.verifyUrl(/#\/payment/);
      await this.ui.verifyText(Checkout.shippingSummary, data.codigoPostal);
      await this.ui.verifyText(Checkout.shippingSummary, address.street);
      await this.ui.verifyText(Checkout.shippingSummary, numberPattern);
    });
  }
  private async fillShipping(address: ReturnType<typeof checkoutData>) {
    if (!await Checkout.street.locate(this.ui.page).isVisible() && await Checkout.editAddress.locate(this.ui.page).isVisible()) {
      await this.ui.click(Checkout.editAddress);
    }
    if (await Checkout.postalCode.locate(this.ui.page).inputValue() !== data.codigoPostal) {
      await Promise.all([
        this.ui.page.waitForResponse(response => new URL(response.url()).pathname === `/api/checkout/pub/postal-code/MEX/${data.codigoPostal}` && response.ok()),
        this.ui.typeText(Checkout.postalCode, data.codigoPostal),
      ]);
    }
    // La dirección elegida en el mapa también puede mostrar colonia como resumen fijo.
    const neighborhood = Checkout.neighborhood.locate(this.ui.page);
    if (await neighborhood.isVisible()) {
      if (await neighborhood.evaluate(element => element.tagName) === 'SELECT') {
        if (address.neighborhood) await this.ui.selectOption(Checkout.neighborhood, address.neighborhood);
        else await neighborhood.selectOption({ index: 0 });
      } else {
        await this.ui.typeText(Checkout.neighborhood, address.neighborhood || data.coloniaUbicacion);
      }
    }
    const fields = [
      [Checkout.reference, address.reference],
      [Checkout.street, address.street],
      [Checkout.receiver, address.receiver],
      [Checkout.number, address.number],
    ] as const;
    // La sincronización de dirección puede reconstruir campos ya capturados.
    // Se recapturan únicamente los valores perdidos y se comprueba el conjunto.
    for (let attempt = 0; attempt < 3; attempt++) {
      for (const [field, value] of fields) {
        const input = field.locate(this.ui.page);
        if (await input.isVisible() && await input.inputValue() !== value) await this.ui.typeText(field, value);
      }
      let complete = true;
      for (const [field, value] of fields) {
        const input = field.locate(this.ui.page);
        if (await input.isVisible() && await input.inputValue() !== value) complete = false;
      }
      if (complete) break;
    }
    await this.ui.verifyValue(Checkout.postalCode, data.codigoPostal);
    if (await Checkout.street.locate(this.ui.page).isVisible()) await this.ui.verifyValue(Checkout.street, address.street);
    await this.ui.verifyValue(Checkout.receiver, address.receiver);
    await this.ui.verifyValue(Checkout.number, address.number);
  }
  async verifyCardForm() {
    await test.step('CustomActions.verifyCardForm — fin del flujo', async () => {
      await this.ui.click(Checkout.credit);
      for (const object of [Checkout.cardNumber, Checkout.cardHolder, Checkout.cardMonth, Checkout.cardYear, Checkout.cardSecurity]) {
        await this.ui.verifyElementVisible(object);
        await this.ui.verifyElementEnabled(object);
      }
      await expect(Checkout.cardNumber.locate(this.ui.page)).toHaveValue('');
      await expect(Checkout.cardSecurity.locate(this.ui.page)).toHaveValue('');
      // Fin intencional. Nunca se captura tarjeta ni se pulsa Comprar ahora.
    });
  }
}
