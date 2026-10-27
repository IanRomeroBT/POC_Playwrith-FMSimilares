import { test, expect } from '../Fixtures/fixtures';
import { Compra } from '../../Workspace/Object Repository/objects';

test('Envío espera el guardado del mapa antes de recuperar calle y número @framework', async ({ page, compra }) => {
  const direccion = {
    missing: [], email: '', phone: '', firstName: '', lastName: '',
    street: 'Calle de prueba', number: '1', receiver: 'Prueba', neighborhood: '', reference: '',
  };
  // Simular la respuesta tardía que borra datos después de cerrar el modal del mapa.
  await page.route('https://checkout.local/**', async ruta => {
    if (ruta.request().method() === 'POST') {
      await new Promise(resolve => setTimeout(resolve, 150));
      await ruta.fulfill({ contentType: 'application/json', body: '{}' });
      return;
    }
    await ruta.fulfill({ contentType: 'text/html; charset=utf-8', body: `
      <input id="ship-postalCode" value="45133">
      <input id="ship-street" value="Calle de prueba">
      <input id="ship-number" value="1">
      <input id="ship-receiverName" value="Prueba">
      <button id="btn-go-to-payment">Ir al pago</button>
      <button id="edit-shipping-data" data-ediciones="0">Editar envío</button>
      <div id="shipping-data"><span class="street">Calle de prueba</span> <span class="number">1</span><span>Los Almendros 45133</span></div>
      <div id="mapsModal" hidden><button>Confirmar</button></div>
      <script>
        let confirmado = false;
        const mapa = document.querySelector('#mapsModal');
        const calle = document.querySelector('#ship-street');
        const numero = document.querySelector('#ship-number');
        const resumenCalle = document.querySelector('.street');
        const resumenNumero = document.querySelector('.number');
        document.querySelector('#btn-go-to-payment').onclick = () => {
          location.hash = '/payment';
          if (!confirmado) mapa.hidden = false;
          else { resumenCalle.textContent = calle.value; resumenNumero.textContent = numero.value; }
        };
        document.querySelector('#mapsModal button').onclick = async () => {
          confirmado = true;
          mapa.hidden = true;
          await fetch('/api/checkout/pub/orderForm/prueba/attachments/shippingData', {method:'POST'}).then(r => r.json());
          calle.value = ''; numero.value = '';
          resumenCalle.textContent = ''; resumenNumero.textContent = '';
        };
        document.querySelector('#edit-shipping-data').onclick = event => {
          event.currentTarget.dataset.ediciones = String(Number(event.currentTarget.dataset.ediciones) + 1);
          location.hash = '/shipping';
        };
      </script>
    ` });
  });
  await page.goto('https://checkout.local/#/shipping');
  await compra.completarEnvio(direccion);

  // Se debe haber reparado el envío después del guardado tardío, no antes de que borre datos.
  await expect(page.locator('#edit-shipping-data')).toHaveAttribute('data-ediciones', '1');
  await expect(Compra.calleResumenEnvio.locate(page)).toHaveText(direccion.street);
  await expect(Compra.numeroResumenEnvio.locate(page)).toHaveText('1');
});
