# language: es
Característica: Agregar productos al carrito
  Como cliente quiero agregar un producto disponible para continuar mi compra.

  @smoke @regression
  Escenario: TC03 - Agregar producto al carrito
    Dado que estoy en la tienda
    Cuando agrego el producto del Data Set y abro el carrito
    Entonces el carrito contiene 1 unidad del producto esperado
    Y puedo continuar con la compra
