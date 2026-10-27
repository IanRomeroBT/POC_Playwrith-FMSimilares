import AllureReporter from 'allure-playwright';
import type { Suite, TestCase } from '@playwright/test/reporter';
import { lstatSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';

const funcionalidades: Record<string, string> = {
  TC01: 'Ubicación de entrega',
  TC02: 'Búsqueda de productos',
  TC03: 'Agregar productos al carrito',
  TC04: 'Contacto, envío y formulario de pago',
  TC05: 'Vaciar el carrito',
};

/** Añade organización al reporte sin meter instrucciones de Allure en los casos. */
export default class ReporteAllure extends AllureReporter {
  onBegin(suite: Suite) {
    // Solo se eliminan resultados generados de la ejecución anterior, no el historial.
    const reportes = path.resolve(__dirname, '../../Workspace/Reportes');
    const resultados = path.resolve(reportes, 'allure-results');
    if (path.dirname(resultados) !== reportes || (existsSync(reportes) && lstatSync(reportes).isSymbolicLink())) {
      throw new Error('La carpeta de resultados Allure debe estar dentro de Reportes.');
    }
    rmSync(resultados, { recursive: true, force: true });
    super.onBegin(suite);
  }

  onTestBegin(caso: TestCase) {
    const identificador = caso.title.match(/\bTC\d{2}\b/)?.[0];
    const funcionalidad = identificador ? funcionalidades[identificador] : 'Comprobaciones del framework';
    const esBdd = caso.location.file.includes('.feature');

    // Las etiquetas permiten navegar por estilo de prueba, funcionalidad y caso.
    const etiquetas = {
      epic: 'Farmacias Similares',
      feature: funcionalidad || 'Otros escenarios',
      story: identificador || 'Framework',
      parentSuite: esBdd ? 'Escenarios BDD' : identificador ? 'Casos TypeScript' : 'Pruebas técnicas',
      suite: funcionalidad || 'Otros escenarios',
      subSuite: identificador || 'Framework',
      severity: identificador === 'TC04' ? 'critical' : 'normal',
    };
    for (const [nombre, valor] of Object.entries(etiquetas)) {
      const tipo = `allure.label.${nombre}`;
      // En un reintento se conserva una sola etiqueta por nombre.
      if (!caso.annotations.some(anotacion => anotacion.type === tipo)) {
        caso.annotations.push({ type: tipo, description: valor });
      }
    }
    super.onTestBegin(caso);
  }
}
