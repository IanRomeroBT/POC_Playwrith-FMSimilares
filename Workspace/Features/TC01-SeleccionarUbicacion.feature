# language: es
Característica: Ubicación de entrega
  Como cliente quiero elegir mi ubicación para consultar productos con cobertura.

  @smoke @regression
  Escenario: TC01 - Seleccionar ubicación
    Dado que estoy en la tienda
    Cuando selecciono la ubicación de entrega del Data Set
    Entonces el encabezado muestra la ubicación seleccionada
