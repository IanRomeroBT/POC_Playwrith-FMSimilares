import { test } from '../../Framework/Fixtures/fixtures';
import { Inicio } from '../Object Repository/objects';
import datos from '../Data Set/tienda.json';

test('TC01 — E2E Seleccionar ubicación @smoke @regression', async ({ WebUI, tienda }) => {
  // Paso 1: Abrir la tienda en una sesión nueva.
  await tienda.abrirTienda();

  // Paso 2: Elegir la ubicación de entrega usando el código postal del Data Set.
  await tienda.seleccionarUbicacion(datos.codigoPostal);

  // Resultado esperado: El encabezado muestra la ubicación seleccionada.
  await WebUI.verifyElementVisible(Inicio.ubicacionSeleccionada(datos.codigoPostal));
});
