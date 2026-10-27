# language: es
Característica: Preparar una compra
  Como cliente quiero completar contacto y envío hasta llegar al formulario de pago.
  Este recorrido termina sin capturar datos de tarjeta ni generar un pedido.

  @checkout
  Escenario: TC04 - Llegar al formulario de tarjeta
    Dado que dispongo de datos válidos de contacto y envío
    Y que estoy en la tienda
    Y tengo el producto del Data Set en mi carrito
    Cuando completo los datos de contacto y acepto los términos autorizados
    Y completo el envío y confirmo la dirección en el mapa
    Entonces el formulario de tarjeta está disponible sin capturar datos de pago
