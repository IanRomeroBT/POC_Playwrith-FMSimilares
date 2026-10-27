import { defineConfig } from 'allure';

// Allure 3 genera el reporte con Node.js. El historial queda fuera del HTML que se regenera.
export default defineConfig({
  name: 'Farmacias Similares · Resultados de pruebas',
  resultsDir: 'Workspace/Reportes/allure-results',
  output: 'Workspace/Reportes/allure',
  historyPath: 'Workspace/Reportes/allure-history/history.jsonl',
  historyLimit: 20,
  plugins: {
    awesome: {
      options: {
        reportName: 'Farmacias Similares · Resultados de pruebas',
        reportLanguage: 'es',
        singleFile: true,
        groupBy: ['parentSuite', 'suite', 'subSuite'],
      },
    },
  },
});
