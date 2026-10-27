import { expect, test, type Page } from '@playwright/test';
import type { TestObject } from '../Object Repository/objects';

/** Fachada pequeña: los objetos mantienen los localizadores y Playwright conserva sus esperas. */
export class WebUI {
  constructor(readonly page: Page) {}

  async navigateToUrl(url: string) {
    await test.step(`WebUI.navigateToUrl(${url})`, async () => {
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    });
  }
  async click(object: TestObject) {
    await test.step(`WebUI.click(${object.name})`, () => object.locate(this.page).click());
  }
  async setText(object: TestObject, value: string) {
    // No se incluye el valor en el nombre del step (puede contener datos personales).
    await test.step(`WebUI.setText(${object.name})`, () => object.locate(this.page).fill(value));
  }
  async typeText(object: TestObject, value: string) {
    await test.step(`WebUI.typeText(${object.name})`, async () => {
      const target = object.locate(this.page);
      for (let attempt = 0; attempt < 3; attempt++) {
        await target.fill('');
        await target.pressSequentially(value, { delay: 60 });
        await target.press('Tab');
        try {
          await expect(target).toHaveValue(value, { timeout: 1500 });
          return;
        } catch (error) {
          if (attempt === 2) throw error;
        }
      }
    });
  }
  async pressKey(object: TestObject, key: string) {
    await test.step(`WebUI.pressKey(${object.name}, ${key})`, () => object.locate(this.page).press(key));
  }
  async verifyElementVisible(object: TestObject) {
    await test.step(`WebUI.verifyElementVisible(${object.name})`, () => expect(object.locate(this.page)).toBeVisible());
  }
  async verifyElementEnabled(object: TestObject) {
    await test.step(`WebUI.verifyElementEnabled(${object.name})`, () => expect(object.locate(this.page)).toBeEnabled());
  }
  async verifyValue(object: TestObject, expected: string) {
    await test.step(`WebUI.verifyValue(${object.name})`, () => expect(object.locate(this.page)).toHaveValue(expected));
  }
  async verifyText(object: TestObject, expected: string | RegExp) {
    await test.step(`WebUI.verifyText(${object.name})`, () => expect(object.locate(this.page)).toContainText(expected));
  }
  async verifyUrl(expected: RegExp) {
    await test.step('WebUI.verifyUrl', () => expect(this.page).toHaveURL(expected));
  }
  async selectOption(object: TestObject, label: string) {
    await test.step(`WebUI.selectOption(${object.name})`, () => object.locate(this.page).selectOption({ label }));
  }
  async setChecked(object: TestObject, checked: boolean) {
    await test.step(`WebUI.setChecked(${object.name})`, async () => {
      const target = object.locate(this.page);
      // Una barra flotante del sitio cubre el checkbox: teclado conserva eventos reales.
      if ((await target.isChecked()) !== checked) await target.press('Space');
      await expect(target).toBeChecked({ checked });
    });
  }
}
