import { test, expect } from '../Fixtures/fixtures';
import { Inicio } from '../../Workspace/Object Repository/objects';

test('Ubicación espera la sugerencia correcta antes de confirmar el mapa @framework', async ({ tienda, WebUI, page }) => {
  // Simula la actualización diferida real del buscador. Buscar inmediatamente conserva
  // la dirección predeterminada; elegir una sugerencia resuelta produce el CP solicitado.
  await page.setContent(`
    <button id="abrir">Seleccionar ubicación</button>
    <span class="prueba-x-navbar_gps_text"></span>
    <section role="dialog" id="modal" hidden>
      <button>Entrega a domicilio</button>
      <div id="searchAddressInputContainer">
        <input aria-label="Dirección">
        <button id="buscar">Buscar dirección</button>
        <div id="sugerencias"></div>
      </div>
      <p id="direccion" class="prueba-x-text_address_map">Dirección predeterminada, CP 06000</p>
      <button id="confirmar">Confirmar</button>
    </section>
    <script>
      const modal = document.querySelector('#modal');
      const direccion = document.querySelector('#direccion');
      const sugerencias = document.querySelector('#sugerencias');
      let temporizador;
      let seleccionada = false;
      document.querySelector('#abrir').onclick = () => { modal.hidden = false; };
      document.querySelector('input').oninput = () => {
        clearTimeout(temporizador);
        sugerencias.replaceChildren();
        temporizador = setTimeout(() => {
          const opcion = document.createElement('button');
          opcion.textContent = 'Los Almendros, 45133 Zapopan, Jalisco, México';
          opcion.onclick = () => {
            seleccionada = true;
            direccion.textContent = opcion.textContent;
            sugerencias.replaceChildren();
          };
          sugerencias.append(opcion);
        }, 650);
      };
      document.querySelector('#buscar').onclick = () => {
        if (!seleccionada) direccion.textContent = 'Dirección predeterminada, CP 06000';
      };
      document.querySelector('#confirmar').onclick = () => {
        if (seleccionada) {
          document.querySelector('span').textContent = 'Ubicación seleccionada: 45133';
          modal.hidden = true;
        }
      };
    </script>
  `);

  await tienda.seleccionarUbicacion('45133');

  // Debe seleccionar realmente una opción; no basta con que el texto del input tenga el CP.
  await WebUI.verifyElementVisible(Inicio.ubicacionSeleccionada('45133'));
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('Ubicación no confunde una sugerencia con la dirección del mapa @framework', async ({ page }) => {
  await page.setContent(`
    <section role="dialog">
      <div id="searchAddressInputContainer"><button>Los Almendros, 45133 Zapopan</button></div>
      <span class="prueba-x-text_address_map">Dirección predeterminada, 06000</span>
    </section>
  `);

  // El CP correcto en la lista de opciones no debe autorizar la confirmación de otro lugar.
  await expect(Inicio.direccionEncontradaEnMapa('45133').locate(page)).toHaveCount(0);
});
