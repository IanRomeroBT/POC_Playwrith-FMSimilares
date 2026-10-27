import { expect, test } from '@playwright/test';

/** Controla qué ocurre cuando falla una palabra clave de WebUI, al estilo Katalon. */
export enum FailureHandling {
  STOP_ON_FAILURE = 'STOP_ON_FAILURE',
  CONTINUE_ON_FAILURE = 'CONTINUE_ON_FAILURE',
  OPTIONAL = 'OPTIONAL',
}

/** Un único punto de manejo de errores para todas las acciones y verificaciones. */
export async function ejecutarPaso(
  descripcion: string,
  accion: () => Promise<unknown>,
  modo: FailureHandling = FailureHandling.STOP_ON_FAILURE,
): Promise<boolean> {
  return test.step(descripcion, async () => {
    try {
      await accion();
      return true;
    } catch (error) {
      // Detener es el comportamiento habitual: conserva el error y su causa originales.
      if (modo === FailureHandling.STOP_ON_FAILURE) throw error;

      const detalle = error instanceof Error ? error.message : String(error);
      const mensaje = `[${modo}] ${descripcion}\n${detalle}`;

      if (modo === FailureHandling.CONTINUE_ON_FAILURE) {
        // La aserción suave registra una falla real en Playwright, pero deja continuar.
        // Esto también funciona para errores de acciones como click o setText.
        expect.soft(false, mensaje).toBe(true);
      } else if (modo === FailureHandling.OPTIONAL) {
        // Un aviso no cambia el resultado del caso. Se ve en HTML y en el JSON del reporter.
        test.info().annotations.push({ type: 'warning', description: mensaje });
        console.warn(mensaje);
      } else {
        // Una configuración desconocida nunca debe silenciar el error original.
        throw error;
      }
      return false;
    }
  });
}
