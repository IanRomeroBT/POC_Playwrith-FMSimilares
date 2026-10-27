import { test, expect } from '@playwright/test';
import { crearWebUI, FailureHandling } from '../../Core/WebUI';
import { objeto } from '../../../Workspace/Object Repository/objects';

const campo = objeto('Ejemplo / Campo', pagina => pagina.getByRole('textbox', { name: 'Campo' }));
const ausente = objeto('Ejemplo / Botón ausente', pagina => pagina.getByRole('button', { name: 'Ausente' }));
const continuar = () => test.info().annotations.push({ type: 'continuacion', description: 'Se ejecutó el paso siguiente' });

test.beforeEach(async ({ page }) => {
  await page.setContent('<input aria-label="Campo" value="inicial">');
});

test('predeterminado', async ({ page }) => {
  await crearWebUI(page).click(ausente);
  continuar();
});

test('detener', async ({ page }) => {
  await crearWebUI(page).verifyValue(campo, 'otro', FailureHandling.STOP_ON_FAILURE);
  continuar();
});

test('continuar-accion', async ({ page }) => {
  const WebUI = crearWebUI(page);
  expect(await WebUI.click(ausente, FailureHandling.CONTINUE_ON_FAILURE)).toBe(false);
  await WebUI.setText(campo, 'siguiente');
  await WebUI.verifyValue(campo, 'siguiente');
  continuar();
});

test('continuar-verificacion', async ({ page }) => {
  expect(await crearWebUI(page).verifyValue(campo, 'otro', FailureHandling.CONTINUE_ON_FAILURE)).toBe(false);
  continuar();
});

test('opcional-accion', async ({ page }) => {
  const WebUI = crearWebUI(page);
  expect(await WebUI.click(ausente, FailureHandling.OPTIONAL)).toBe(false);
  await WebUI.setText(campo, 'siguiente');
  await WebUI.verifyValue(campo, 'siguiente');
  continuar();
});

test('opcional-verificacion', async ({ page }) => {
  expect(await crearWebUI(page).verifyValue(campo, 'otro', FailureHandling.OPTIONAL)).toBe(false);
  continuar();
});

test('exito', async ({ page }) => {
  const WebUI = crearWebUI(page);
  for (const modo of Object.values(FailureHandling)) {
    expect(await WebUI.setText(campo, modo, modo)).toBe(true);
    expect(await WebUI.verifyValue(campo, modo, modo)).toBe(true);
  }
  continuar();
});
