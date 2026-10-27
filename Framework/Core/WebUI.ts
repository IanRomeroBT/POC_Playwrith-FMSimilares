import { expect, type Page } from '@playwright/test';
import type { TestObject } from '../../Workspace/Object Repository/objects';
import { ejecutarPaso, FailureHandling } from './FailureHandling';

export { FailureHandling } from './FailureHandling';

/** Acciones al estilo Katalon. El último argumento elige cómo manejar una falla.
 * Sin indicar un modo, el caso se detiene al fallar. Cada acción devuelve true o false.
 */
export function crearWebUI(page: Page) {
  // La página recibida queda disponible para todas las funciones, sin una variable global.

  /** Abre una URL completa o una ruta relativa a BASE_URL. */
  async function navigateToUrl(url: string, modo = FailureHandling.STOP_ON_FAILURE) {
    return ejecutarPaso(`Abrir página: ${url}`, () => page.goto(url, { waitUntil: 'domcontentloaded' }), modo);
  }

  async function refresh(modo = FailureHandling.STOP_ON_FAILURE) {
    return ejecutarPaso('Recargar la página', () => page.reload({ waitUntil: 'domcontentloaded' }), modo);
  }

  async function click(elemento: TestObject, modo = FailureHandling.STOP_ON_FAILURE) {
    return ejecutarPaso(`Hacer clic en ${elemento.name}`, () => elemento.locate(page).click(), modo);
  }

  /** Reemplaza el contenido del campo. El dato se omite del nombre del paso por privacidad. */
  async function setText(elemento: TestObject, texto: string, modo = FailureHandling.STOP_ON_FAILURE) {
    return ejecutarPaso(`Escribir texto en ${elemento.name}`, () => elemento.locate(page).fill(texto), modo);
  }

  /** Usar en campos de compra que necesitan eventos de teclado para guardar el dato. */
  async function typeText(elemento: TestObject, texto: string, modo = FailureHandling.STOP_ON_FAILURE) {
    return ejecutarPaso(`Escribir con teclado en ${elemento.name}`, async () => {
      const campo = elemento.locate(page);
      // El checkout puede reconstruir el campo mientras escribimos: se comprueba y reintenta.
      for (let intento = 0; intento < 3; intento++) {
        await campo.fill('');
        await campo.pressSequentially(texto, { delay: 60 });
        await campo.press('Tab');
        try {
          await expect(campo).toHaveValue(texto, { timeout: 1500 });
          return;
        } catch (error) {
          if (intento === 2) throw error;
        }
      }
    }, modo);
  }

  async function pressKey(elemento: TestObject, tecla: string, modo = FailureHandling.STOP_ON_FAILURE) {
    return ejecutarPaso(`Presionar ${tecla} en ${elemento.name}`, () => elemento.locate(page).press(tecla), modo);
  }

  // Las verificaciones esperan el resultado; no necesitan pausas fijas con sleep.
  async function verifyElementVisible(elemento: TestObject, modo = FailureHandling.STOP_ON_FAILURE) {
    return ejecutarPaso(`Verificar que sea visible: ${elemento.name}`, () => expect(elemento.locate(page)).toBeVisible(), modo);
  }

  async function verifyElementNotVisible(elemento: TestObject, modo = FailureHandling.STOP_ON_FAILURE) {
    return ejecutarPaso(`Verificar que esté oculto: ${elemento.name}`, () => expect(elemento.locate(page)).toBeHidden(), modo);
  }

  async function verifyElementNotPresent(elemento: TestObject, modo = FailureHandling.STOP_ON_FAILURE) {
    return ejecutarPaso(`Verificar que ya no exista: ${elemento.name}`, () => expect(elemento.locate(page)).toHaveCount(0), modo);
  }

  async function verifyElementEnabled(elemento: TestObject, modo = FailureHandling.STOP_ON_FAILURE) {
    return ejecutarPaso(`Verificar que esté habilitado: ${elemento.name}`, () => expect(elemento.locate(page)).toBeEnabled(), modo);
  }

  /** Compara el valor de un campo con el esperado, sin incluirlo en el título del paso. */
  async function verifyValue(elemento: TestObject, valorEsperado: string, modo = FailureHandling.STOP_ON_FAILURE) {
    return ejecutarPaso(`Verificar el valor de ${elemento.name}`, () => expect(elemento.locate(page)).toHaveValue(valorEsperado), modo);
  }

  async function verifyText(elemento: TestObject, textoEsperado: string | RegExp, modo = FailureHandling.STOP_ON_FAILURE) {
    return ejecutarPaso(`Verificar el texto de ${elemento.name}`, () => expect(elemento.locate(page)).toContainText(textoEsperado), modo);
  }

  /** RegExp permite comprobar una parte de la dirección sin fijar el dominio. */
  async function verifyUrl(patronEsperado: RegExp, modo = FailureHandling.STOP_ON_FAILURE) {
    return ejecutarPaso('Verificar la dirección de la página', () => expect(page).toHaveURL(patronEsperado), modo);
  }

  /** Selecciona una opción por el texto que ve el usuario. */
  async function selectOptionByLabel(elemento: TestObject, textoOpcion: string, modo = FailureHandling.STOP_ON_FAILURE) {
    return ejecutarPaso(`Seleccionar una opción en ${elemento.name}`, () => elemento.locate(page).selectOption({ label: textoOpcion }), modo);
  }

  async function setChecked(elemento: TestObject, marcada: boolean, modo = FailureHandling.STOP_ON_FAILURE) {
    return ejecutarPaso(`${marcada ? 'Marcar' : 'Desmarcar'} ${elemento.name}`, async () => {
      const casilla = elemento.locate(page);
      // Una barra flotante cubre la casilla: Espacio permite usarla con eventos reales.
      if ((await casilla.isChecked()) !== marcada) await casilla.press('Space');
      await expect(casilla).toBeChecked({ checked: marcada });
    }, modo);
  }
  // Estas funciones conservan la página de esta prueba sin utilizar this.
  return {
    page,
    navigateToUrl,
    refresh,
    click,
    setText,
    typeText,
    pressKey,
    verifyElementVisible,
    verifyElementNotVisible,
    verifyElementNotPresent,
    verifyElementEnabled,
    verifyValue,
    verifyText,
    verifyUrl,
    selectOptionByLabel,
    setChecked,
  } as const;
}

export type WebUI = ReturnType<typeof crearWebUI>;
