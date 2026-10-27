# language: es
Característica: Búsqueda de productos
  Como cliente quiero encontrar un producto y consultar su detalle.

  @smoke @regression
  Escenario: TC02 - Buscar producto
    Dado que estoy en la tienda
    Y tengo seleccionada la ubicación de entrega del Data Set
    Cuando busco el producto del Data Set
    Y abro el producto encontrado
    Entonces veo el nombre, la descripción y la dirección del producto esperado
