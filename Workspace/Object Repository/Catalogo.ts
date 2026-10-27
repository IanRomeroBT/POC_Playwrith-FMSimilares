import { objeto } from './ObjetoPrueba';

// Cambiar aquí los localizadores cuando cambie esta pantalla, sin editar los casos.
export const Catalogo = {
  tituloResultados: (name: string) => objeto('Catálogo / Título', p => p.getByRole('heading', { name: new RegExp(`^${name}$`, 'i') })),
  enlaceProducto: (path: string) => objeto('Catálogo / Producto', p => p.locator(`a[href="${path}"]`).filter({ visible: true }).first()),
};
