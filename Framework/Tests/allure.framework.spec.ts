import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

test('Allure genera el reporte al terminar y conserva los errores de ejecución @framework', async () => {
  // Los runners secundarios usan directorios temporales propios; no tocan el reporte principal.
  const temporal = mkdtempSync(path.join(os.tmpdir(), 'allure-auto-'));
  const raiz = path.resolve(__dirname, '../..');
  try {
    for (const modo of ['aprobado', 'mixto', 'error-generacion', 'listado']) {
      const resultados = path.join(temporal, `${modo}-results`);
      const salida = path.join(temporal, `${modo}-report`);
      const configuracionAllure = path.join(temporal, `${modo}.allurerc.json`);
      const configuracionPruebas = path.join(temporal, `${modo}.config.json`);
      writeFileSync(configuracionAllure, JSON.stringify({
        resultsDir: modo === 'error-generacion' ? path.join(temporal, 'no-existe') : resultados,
        output: salida,
        plugins: { awesome: { options: { singleFile: true } } },
      }));
      writeFileSync(configuracionPruebas, JSON.stringify({
        testDir: path.join(raiz, 'Framework/Validation/AllureAuto'),
        testMatch: 'escenarios.ts',
        outputDir: path.join(temporal, `${modo}-artifacts`),
        workers: 1, retries: 0,
        reporter: [
          ['list'],
          [require.resolve('allure-playwright'), { resultsDir: resultados }],
          [path.join(raiz, 'Framework/Reporters/GenerarAllure.ts'), { configFile: configuracionAllure }],
        ],
      }));
      const argumentos = [require.resolve('@playwright/test/cli'), 'test', '--config', configuracionPruebas];
      if (modo !== 'mixto') argumentos.push('--grep', 'caso aprobado');
      if (modo === 'listado') argumentos.push('--list');
      const ejecucion = spawnSync(process.execPath, argumentos, {
        cwd: raiz, encoding: 'utf8', timeout: 45_000, maxBuffer: 5 * 1024 * 1024,
      });
      const diagnostico = `${modo}\n${ejecucion.stdout}\n${ejecucion.stderr}`;
      expect(ejecucion.error, diagnostico).toBeUndefined();
      expect(ejecucion.status, diagnostico).toBe(['aprobado', 'listado'].includes(modo) ? 0 : 1);

      if (modo === 'listado') {
        expect(existsSync(path.join(salida, 'index.html'))).toBe(false);
        expect(diagnostico).not.toContain('Reporte Allure generado automáticamente');
      } else if (modo === 'error-generacion') {
        expect(diagnostico).toContain('No se pudo generar el reporte Allure');
        expect(existsSync(path.join(salida, 'index.html'))).toBe(false);
      } else {
        // El HTML debe existir sin ejecutar manualmente allure generate.
        expect(existsSync(path.join(salida, 'index.html')), diagnostico).toBe(true);
        const resumen = JSON.parse(readFileSync(path.join(salida, 'summary.json'), 'utf8'));
        expect(resumen.stats.total).toBe(modo === 'mixto' ? 2 : 1);
        expect(resumen.stats.passed).toBe(1);
        if (modo === 'mixto') expect(resumen.stats.failed).toBe(1);
      }
    }
  } finally {
    // Eliminar únicamente el directorio temporal que esta prueba acaba de crear.
    if (path.dirname(temporal) === path.resolve(os.tmpdir()) && path.basename(temporal).startsWith('allure-auto-')) {
      rmSync(temporal, { recursive: true, force: true });
    }
  }
});
