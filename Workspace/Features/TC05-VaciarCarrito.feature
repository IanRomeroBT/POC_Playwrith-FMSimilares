# language: es
Característica: Vaciar el carrito
  Como cliente quiero eliminar un producto y conservar el carrito vacío al recargar.

  @regression
  Escenario: TC05 - Vaciar carrito
    Dado que estoy en la tienda
    Y tengo el producto del Data Set en mi carrito
    Entonces el carrito contiene 1 unidad del producto esperado
    Cuando aumento la cantidad del producto
    Entonces el carrito contiene 2 unidades del producto esperado
    Cuando elimino el producto del carrito
    Entonces el carrito está vacío y el producto ya no aparece
    Cuando recargo la página
    Entonces el carrito sigue vacío y el producto no reaparece
