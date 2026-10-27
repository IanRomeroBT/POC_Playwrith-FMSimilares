import { objeto } from './ObjetoPrueba';

// Cambiar aquí los localizadores cuando cambie esta pantalla, sin editar los casos.
export const Producto = {
  nombre: (name: string) => objeto('Producto / Nombre', p => p.getByRole('heading', { name, exact: true }).first()),
  descripcion: (text: string) => objeto('Producto / Descripción', p => p.getByText(text, { exact: false }).first()),
  botonAgregarAlCarrito: objeto('Producto / Agregar', p => p.getByRole('button', { name: 'Agregar al carrito', exact: true }).and(p.locator('button:not(article button)')).filter({ visible: true })),
  botonElegirEntrega: objeto('Producto / Elegir entrega para comprar', p => p.getByRole('button', { name: 'Comprar ahora', exact: true }).and(p.locator('button:not(article button)')).filter({ visible: true })),
  avisoAgotado: objeto('Producto / Agotado', p => p.getByRole('button', { name: /^(Producto agotado|No disponible)$/i }).and(p.locator('button:not(article button)')).filter({ visible: true })),
  confirmacionProductoAgregado: objeto('Producto / Confirmación', p => p.getByRole('heading', { name: /^¡Has agregado un producto al carrito!$/i })),
  botonIrAlCarrito: objeto('Producto / Ir al carrito', p => p.getByRole('button', { name: 'Ir al carrito', exact: true })),
};
