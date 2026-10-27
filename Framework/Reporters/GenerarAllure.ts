import type { FullResult, Reporter } from '@playwright/test/reporter';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const ejecutar = promisify(execFile);

/** Se ejecuta después del adaptador Allure, cuando ya terminó de guardar los adjuntos. */
export default class GenerarAllure implements Reporter {
  private hayPruebas = false;

  constructor(private readonly opciones: { configFile?: string } = {}) {}

  onTestBegin() {
    this.hayPruebas = true;
  }

  async onEnd(resultado: FullResult) {
    // No generar resultados antiguos al listar escenarios (--list) o si no hubo ejecución.
    if (!this.hayPruebas) return;

    const raiz = path.resolve(__dirname, '../..');
    const configuracion = path.resolve(raiz, this.opciones.configFile || 'allurerc.mjs');
    const cli = path.resolve(path.dirname(require.resolve('allure')), '../cli.js');
    try {
      // Usar Node directamente funciona en Windows y evita depender de una instalación global.
      // También se genera cuando las pruebas fallan; no se encadena con && al comando de test.
      await ejecutar(process.execPath, [cli, 'generate', '--clean', '--config', configuracion], {
        cwd: raiz, windowsHide: true, timeout: 120_000, maxBuffer: 10 * 1024 * 1024,
      });
      console.log('\nReporte Allure generado automáticamente. Abrir con: pnpm report:allure');
    } catch (error) {
      const fallo = error as Error & { stderr?: string };
      console.error('\nNo se pudo generar el reporte Allure:', fallo.stderr || fallo.message);
      // Una falla del generador también falla el comando; nunca transforma pruebas fallidas en éxito.
      return { status: resultado.status === 'passed' ? 'failed' as const : resultado.status };
    }
  }
}
