import type { Locator, Page } from '@playwright/test';

export type TestObject = Readonly<{ name: string; locate: (page: Page) => Locator }>;
export const object = (name: string, locate: TestObject['locate']): TestObject => ({ name, locate });

export const Home = {
  promotionClose: object('Home / Cerrar promoción', p => p.locator('[class~="farmaciassimilaresmx-app-store-components-2-x-modal_wrapper_home_active"] [class$="-x-modal_wrapper_home_close"]')),
  cookies: object('Home / Aceptar cookies', p => p.getByRole('button', { name: 'ACEPTAR', exact: true })),
  search: object('Home / Buscar', p => p.getByRole('textbox', { name: /¿Qué estás buscando/ })),
  location: object('Home / Seleccionar ubicación', p => p.getByText('Seleccionar ubicación', { exact: true })),
  delivery: object('Ubicación / Entrega a domicilio', p => p.getByRole('button', { name: 'Entrega a domicilio', exact: true })),
  address: object('Ubicación / Dirección', p => p.locator('#searchAddressInputContainer input')),
  addressSearch: object('Ubicación / Buscar dirección', p => p.locator('#searchAddressInputContainer button')),
  confirmLocation: object('Ubicación / Confirmar', p => p.getByRole('button', { name: 'Confirmar', exact: true })),
  noCoverage: object('Ubicación / Sin cobertura', p => p.getByRole('button', { name: 'Sin cobertura', exact: true })),
  mapAddress: (cp: string) => object('Ubicación / Dirección encontrada en mapa', p => p.getByRole('dialog').getByText(new RegExp(`\\b${cp}\\b`)).first()),
  selectedLocation: (cp: string) => object('Home / Ubicación seleccionada', p => p.locator('[class$="-x-navbar_gps_text"]').filter({ hasText: new RegExp(`\\b${cp}\\b`) }).filter({ visible: true }).first()),
};

export const Catalog = {
  heading: (name: string) => object('Catálogo / Título', p => p.getByRole('heading', { name: new RegExp(`^${name}$`, 'i') })),
  productLink: (path: string) => object('Catálogo / Producto', p => p.locator(`a[href="${path}"]`).filter({ visible: true }).first()),
};

export const Product = {
  title: (name: string) => object('Producto / Nombre', p => p.getByRole('heading', { name, exact: true }).first()),
  description: (text: string) => object('Producto / Descripción', p => p.getByText(text, { exact: false }).first()),
  add: object('Producto / Agregar', p => p.getByRole('button', { name: 'Agregar al carrito', exact: true }).and(p.locator('button:not(article button)')).filter({ visible: true })),
  startPurchase: object('Producto / Elegir entrega para comprar', p => p.getByRole('button', { name: 'Comprar ahora', exact: true }).and(p.locator('button:not(article button)')).filter({ visible: true })),
  unavailable: object('Producto / Agotado', p => p.getByRole('button', { name: /^(Producto agotado|No disponible)$/i }).and(p.locator('button:not(article button)')).filter({ visible: true })),
  added: object('Producto / Confirmación', p => p.getByRole('heading', { name: /^¡Has agregado un producto al carrito!$/i })),
  goToCart: object('Producto / Ir al carrito', p => p.getByRole('button', { name: 'Ir al carrito', exact: true })),
};

export const Cart = {
  product: (name: string) => object('Carrito / Producto', p => p.locator('[id^="product-name"]').filter({ hasText: name })),
  quantity: object('Carrito / Cantidad', p => p.locator('input[id^="item-quantity-"]')),
  increment: object('Carrito / Aumentar cantidad', p => p.locator('[id^="item-quantity-change-increment-"]')),
  remove: object('Carrito / Eliminar', p => p.locator('[id^="item-remove-"]')),
  empty: object('Carrito / Vacío', p => p.getByText(/carrito.*vac[ií]o/i).first()),
  checkout: object('Carrito / Finalizar compra', p => p.locator('#cart-to-orderform')),
};

const creditCardFrame = (page: Page) => page.frameLocator('#iframe-placeholder-creditCardPaymentGroup iframe');

export const Checkout = {
  preEmail: object('Checkout / Correo inicial', p => p.locator('#client-pre-email')),
  continueEmail: object('Checkout / Continuar correo', p => p.locator('#btn-client-pre-email')),
  relatedClose: object('Checkout / Cerrar recomendaciones', p => p.locator('#btn-close-related-products')),
  firstName: object('Checkout / Nombre', p => p.locator('#client-first-name')),
  lastName: object('Checkout / Apellidos', p => p.locator('#client-last-name')),
  phone: object('Checkout / Teléfono', p => p.locator('#client-phone')),
  terms: object('Checkout / Términos', p => p.locator('input#terms-agreed')),
  shipping: object('Checkout / Continuar a envío', p => p.locator('#go-to-shipping')),
  postalCode: object('Envío / Código postal', p => p.locator('#ship-postalCode')),
  editAddress: object('Envío / Mostrar dirección completa', p => p.locator('#force-shipping-fields')),
  street: object('Envío / Calle', p => p.locator('#ship-street')),
  number: object('Envío / Número exterior', p => p.locator('#ship-number')),
  neighborhood: object('Envío / Colonia', p => p.locator('#ship-neighborhood')),
  receiver: object('Envío / Destinatario', p => p.locator('#ship-receiverName')),
  reference: object('Envío / Referencia', p => p.locator('#ship-reference')),
  payment: object('Envío / Ir al pago', p => p.locator('#btn-go-to-payment')),
  shippingSummary: object('Envío / Resumen de dirección', p => p.locator('#shipping-data')),
  editShipping: object('Envío / Editar dirección desde pago', p => p.locator('#edit-shipping-data')),
  mapConfirm: object('Envío / Confirmar mapa', p => p.locator('#mapsModal').getByRole('button', { name: 'Confirmar', exact: true })),
  credit: object('Pago / Tarjeta de crédito', p => p.locator('#payment-group-creditCardPaymentGroup')),
  cardNumber: object('Pago / Número', p => creditCardFrame(p).getByRole('textbox', { name: 'Número', exact: true })),
  cardHolder: object('Pago / Titular', p => creditCardFrame(p).getByRole('textbox', { name: 'Nombre y Apellido como figura en la tarjeta', exact: true })),
  cardMonth: object('Pago / Mes', p => creditCardFrame(p).locator('select[id$="Month"]')),
  cardYear: object('Pago / Año', p => creditCardFrame(p).locator('select[id$="Year"]')),
  cardSecurity: object('Pago / Código de seguridad', p => creditCardFrame(p).getByRole('textbox', { name: 'Código de Seguridad', exact: true })),
};
