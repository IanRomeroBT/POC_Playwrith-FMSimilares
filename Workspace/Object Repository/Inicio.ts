import { objeto } from './ObjetoPrueba';

// Cambiar aquí los localizadores cuando cambie esta pantalla, sin editar los casos.
export const Inicio = {
  botonCerrarPromocion: objeto('Inicio / Cerrar promoción', p => p.locator('[class~="farmaciassimilaresmx-app-store-components-2-x-modal_wrapper_home_active"] [class$="-x-modal_wrapper_home_close"]')),
  botonAceptarCookies: objeto('Inicio / Aceptar cookies', p => p.getByRole('button', { name: 'ACEPTAR', exact: true })),
  campoBuscarProducto: objeto('Inicio / Campo buscar producto', p => p.getByRole('textbox', { name: /¿Qué estás buscando/ })),
  botonSeleccionarUbicacion: objeto('Inicio / Seleccionar ubicación', p => p.getByText('Seleccionar ubicación', { exact: true })),
  botonEntregaDomicilio: objeto('Ubicación / Entrega a domicilio', p => p.getByRole('button', { name: 'Entrega a domicilio', exact: true })),
  campoDireccion: objeto('Ubicación / Dirección', p => p.locator('#searchAddressInputContainer input')),
  botonBuscarDireccion: objeto('Ubicación / Buscar dirección', p => p.locator('#searchAddressInputContainer button')),
  sugerenciaDireccion: (cp: string) => objeto('Ubicación / Sugerencia de dirección', p => p.locator('#searchAddressInputContainer').getByText(new RegExp(`\\b${cp}\\b`)).first()),
  botonConfirmarUbicacion: objeto('Ubicación / Confirmar', p => p.getByRole('button', { name: 'Confirmar', exact: true })),
  avisoSinCobertura: objeto('Ubicación / Sin cobertura', p => p.getByRole('button', { name: 'Sin cobertura', exact: true })),
  // El CP debe aparecer en la dirección del pin; una sugerencia del buscador no confirma el mapa.
  direccionEncontradaEnMapa: (cp: string) => objeto('Ubicación / Dirección encontrada en mapa', p => p.getByRole('dialog').locator('[class*="-x-text_address_map"]').filter({ hasText: new RegExp(`\\b${cp}\\b`) }).filter({ visible: true }).first()),
  ubicacionSeleccionada: (cp: string) => objeto('Inicio / Ubicación seleccionada', p => p.locator('[class$="-x-navbar_gps_text"]').filter({ hasText: new RegExp(`\\b${cp}\\b`) }).filter({ visible: true }).first()),
};
