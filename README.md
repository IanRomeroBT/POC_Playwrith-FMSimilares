# POC Playwright · Farmacias Similares

Guía para instalar, ejecutar y mantener las pruebas de la tienda. El proyecto usa **Playwright + TypeScript**, palabras clave estilo Katalon, **BDD en español** y **Allure con generación automática**.

El recorrido de compra termina al comprobar el formulario de tarjeta. No captura tarjetas ni confirma pedidos.

## Inicio rápido

Abre PowerShell en la carpeta del proyecto, donde está `package.json`.

```powershell
# 1. Instalar dependencias y Chromium. Se necesita Node.js 20 o superior y pnpm.
pnpm install --frozen-lockfile
pnpm install:browsers

# 2. Revisar .env.prod, especialmente correo y teléfono para el caso de compra.
# 3. Comprobar TypeScript y ejecutar los cinco escenarios BDD.
pnpm typecheck
pnpm test:bdd

# 4. Abrir Allure; ya se generó automáticamente al terminar.
pnpm report:allure
```

Para una primera prueba sin capturar datos de contacto, usa `pnpm test:bdd:smoke` en lugar de `pnpm test:bdd`.

Comprueba las herramientas con `node --version` y `pnpm --version`. Si falta pnpm, puedes instalarlo con `npm install --global pnpm`. El proyecto versiona `pnpm-lock.yaml`; usa pnpm para conservar instalaciones reproducibles.

## Dónde trabaja el QA

Las carpetas de negocio están agrupadas en `Workspace/`. El motor, los hooks internos, los reporters y sus pruebas están en `Framework/`. Las dependencias `node_modules/` permanecen fuera del workspace del tester, en la raíz técnica de la solución.

```text
Workspace/                Área del tester
  Test Cases/             TC01 a TC05 en TypeScript
  Features/               TC01 a TC05 en Gherkin, en español
  Step Definitions/       Implementación de Dado / Cuando / Entonces
  Test Suites/            Suites de negocio y etiquetas
  Object Repository/      Elementos de las pantallas
  CustomActions/          Flujos reutilizables y entrada pública WebUI
  Data Set/               Datos de productos y lectura de datos de compra
  TestListeners/          Entradas simples para importar test y pasos BDD
  Profiles/               Ambientes prod y qa (dummy)
  Reportes/               Allure, HTML, historial y evidencias

Framework/                Motor, hooks internos, configuración y pruebas técnicas
node_modules/             Dependencias; fuera del área del tester
.env.prod                 Datos privados de Prod; no se versiona
.env.qa                   Datos ficticios de QA; no se versiona
```

| Quiero cambiar… | Archivo o carpeta |
| --- | --- |
| Los pasos de un caso TypeScript | `Workspace/Test Cases/TCxx-....spec.ts` |
| La descripción de un escenario BDD | `Workspace/Features/TCxx-....feature` |
| Lo que hace una frase BDD | `Workspace/Step Definitions/tienda.steps.ts` |
| Qué casos entran a smoke o regression | Etiquetas del caso y `Workspace/Test Suites/catalog.ts` |
| Cómo se encuentra un elemento | Archivo de su pantalla en `Workspace/Object Repository/` |
| Un flujo compartido | `Workspace/CustomActions/AccionesTienda.ts`, `AccionesCarrito.ts` o `AccionesCompra.ts` |
| Producto, colonia o código postal de ubicación | `Workspace/Data Set/tienda.json` |
| Contacto y dirección de envío | `.env.prod` o `.env.qa` |
| Ambiente y URL de ejecución | `Workspace/Profiles/*.json` y su archivo privado correspondiente |
| Hooks técnicos, evidencias o reporters | `Framework/`; ver su guía de mantenimiento |

Los archivos `playwright.config.ts`, `playwright.bdd.config.ts` y `allurerc.mjs` de la raíz son entradas de las herramientas. Su implementación vive en `Framework/Config/`; no hace falta modificarlos para escribir casos.

La propuesta de organización y sus responsabilidades están en [ARQUITECTURA.md](ARQUITECTURA.md). El tester tiene una guía breve en [Workspace/README.md](Workspace/README.md). Ejecuta los comandos desde la raíz; desde `Workspace/` puedes usar, por ejemplo, `pnpm --dir .. test:bdd:smoke`.

## Configurar los datos

Solo se utilizan `.env.prod` y `.env.qa`. Prod conserva los datos actuales y QA contiene datos ficticios. Ambos están excluidos de Git. En una instalación nueva, crea el archivo del ambiente con las variables siguientes o proporciónalas desde CI. El caso TC04 valida estas cinco como obligatorias:

| Variable | Qué colocar |
| --- | --- |
| `CHECKOUT_EMAIL` | Correo válido autorizado para pruebas |
| `CHECKOUT_PHONE` | Teléfono de exactamente 10 dígitos, sin espacios |
| `SHIPPING_STREET` | Calle de prueba |
| `SHIPPING_NUMBER` | Número exterior |
| `SHIPPING_RECEIVER` | Nombre del destinatario |

También puedes configurar `CHECKOUT_FIRST_NAME`, `CHECKOUT_LAST_NAME`, `SHIPPING_NEIGHBORHOOD` y `SHIPPING_REFERENCE`. En el perfil predeterminado, `prod`, `.env.prod` conserva la configuración actual de producción.

El producto, la colonia de ubicación y el CP se leen de `Workspace/Data Set/tienda.json`. Actualmente se usa Los Almendros, CP `45133`. Cambiar el CP de ubicación se hace ahí, no agregando una variable a `.env.prod`.

Los casos TC01, TC02, TC03 y TC05 no requieren los datos de contacto del checkout.

## Perfiles de ejecución: Prod y QA

Elige el ambiente sin editar los casos ni la configuración técnica:

```powershell
# Ejecutar en la tienda actual de producción.
pnpm ambiente prod test:smoke
pnpm ambiente prod test:bdd

# Listar los escenarios de QA sin conectarse a ningún sitio.
pnpm ambiente qa test:bdd:smoke --list

# Ejecutar QA después de configurar su URL real y sus datos.
pnpm ambiente qa test:bdd:smoke

# Ejecutar un caso específico en el ambiente elegido.
pnpm ambiente qa test:e2e --grep TC05
```

| Perfil | Configuración editable | Datos privados | Estado inicial |
| --- | --- | --- | --- |
| `prod` | `Workspace/Profiles/prod.json` | `.env.prod` | Tienda actual de producción |
| `qa` | `Workspace/Profiles/qa.json` | `.env.qa` | Ejemplo con URL ficticia |

QA es dummy: su dominio `.invalid` es ficticio. Permite listar los casos; una ejecución de negocio solicita configurar la URL real antes de navegar.

Para preparar QA:

1. Cambia `baseURL` en `Workspace/Profiles/qa.json` por la dirección real del ambiente.
2. Reemplaza los datos dummy de `.env.qa` por datos autorizados cuando exista ese ambiente.

Por ejemplo, `Workspace/Profiles/qa.json` contiene:

```json
{
  "descripcion": "Ejemplo de QA: reemplazar por la URL real del ambiente",
  "baseURL": "https://qa.farmacias-simuladas.invalid",
  "envFile": ".env.qa"
}
```

Los comandos existentes, como `pnpm test:bdd`, siguen usando `prod` por defecto. `pnpm ambiente <perfil> <script> [opciones]` aplica el perfil tanto a la generación BDD como a la ejecución. Allure muestra **Ambiente** y **URL** en la información de la ejecución.

Cada perfil lee únicamente su archivo privado: QA no toma contacto ni URL del archivo `.env.prod` de Prod. La prioridad es **variables de la terminal/CI > archivo privado del perfil > JSON**. Si tienes `BASE_URL` definida en la terminal, esa variable prevalece incluso al cambiar de perfil; elimínala con `Remove-Item Env:BASE_URL` si quieres usar la URL del perfil. Los dos archivos privados se excluyen de Git.

En CI puedes seleccionar el ambiente mediante `TEST_PROFILE=qa` y proporcionar los datos como variables del pipeline. En PowerShell:

```powershell
$env:TEST_PROFILE = 'qa'
pnpm test:smoke
Remove-Item Env:TEST_PROFILE
```

Prod y QA comparten casos, objetos y `Workspace/Data Set/tienda.json`. Los reportes de `Workspace/Reportes/` representan la última corrida; consérvalos antes de ejecutar otro ambiente si los necesitas.

## Casos disponibles

| Caso | Resultado esperado | Etiquetas |
| --- | --- | --- |
| TC01 · Seleccionar ubicación | El encabezado muestra la ubicación elegida | `@smoke`, `@regression` |
| TC02 · Buscar producto | El detalle tiene el nombre, la descripción y la ruta esperados | `@smoke`, `@regression` |
| TC03 · Agregar producto | El carrito contiene una unidad y permite continuar | `@smoke`, `@regression` |
| TC04 · Preparar compra | Contacto y envío completos; formulario de tarjeta disponible sin capturar datos de pago | `@checkout` |
| TC05 · Vaciar carrito | Aumenta a dos unidades, elimina y permanece vacío después de recargar | `@regression` |

Cada caso prepara su propia sesión; TC04 no necesita ejecutar TC03 antes. Se usa un worker para ejecutar de forma secuencial contra la tienda real.

## Ejecutar pruebas

Puedes trabajar con TypeScript o con BDD. Son dos formas de ejecutar los mismos cinco recorridos de negocio; no necesitas ejecutar ambas en cada corrida.

### Casos TypeScript

| Comando | Qué ejecuta |
| --- | --- |
| `pnpm test:e2e` | Los cinco casos de negocio |
| `pnpm test:smoke` | TC01, TC02 y TC03 |
| `pnpm test:regression` | TC01, TC02, TC03 y TC05 |
| `pnpm test:checkout` | TC04 |
| `pnpm test:headed` | Los cinco casos con navegador visible |
| `pnpm test:ui` | Interfaz interactiva de Playwright |
| `pnpm test:framework` | Las 17 comprobaciones técnicas locales de `Framework/Tests/` |
| `pnpm test` | Los cinco casos TypeScript y las 17 comprobaciones locales |

Usa estos scripts o indica `--project` al ejecutar Playwright directamente. Sin seleccionar un proyecto, Playwright ejecuta todas las suites configuradas y puede repetir un mismo caso en smoke, regression y e2e.

### Escenarios BDD

| Comando | Qué ejecuta |
| --- | --- |
| `pnpm test:bdd` | Los cinco escenarios Gherkin |
| `pnpm test:bdd:smoke` | TC01, TC02 y TC03 |
| `pnpm test:bdd:regression` | TC01, TC02, TC03 y TC05 |
| `pnpm test:bdd:checkout` | TC04 |
| `pnpm test:bdd:headed` | Los cinco escenarios con navegador visible |
| `pnpm test:bdd:ui` | Interfaz interactiva para los escenarios BDD |

Los comandos BDD generan primero los archivos ejecutables dentro de `Framework/Generated/features/`. Esa carpeta es temporal, se excluye de Git y no se edita.

### Ejecutar un solo caso

TypeScript:

```powershell
pnpm exec playwright test --project=e2e --grep TC05

# Agregar --headed para ver el navegador.
pnpm exec playwright test --project=e2e --grep TC05 --headed
```

BDD:

```powershell
pnpm bdd:gen
pnpm exec playwright test --config playwright.bdd.config.ts --project=e2e --grep TC05
```

Para listar lo que se ejecutaría, sin abrir la tienda:

```powershell
pnpm exec playwright test --project=e2e --list
pnpm bdd:gen
pnpm exec playwright test --config playwright.bdd.config.ts --project=e2e --list
```

## Allure y evidencias

**Allure se genera automáticamente cuando termina una ejecución**, incluso si hay pruebas fallidas. No tienes que ejecutar un comando de generación después de cada suite.

```powershell
pnpm test:bdd
pnpm report:allure
```

`pnpm report:allure` abre el reporte existente; no vuelve a ejecutar pruebas. El navegador se abre al pedir el reporte, no al terminar automáticamente cada prueba. Si necesitas abrirlo manualmente, usa la URL que aparece en consola; su puerto puede cambiar. `Ctrl+C` detiene ese servidor local.

También están disponibles:

| Comando | Uso |
| --- | --- |
| `pnpm allure:open` | Alias para abrir Allure |
| `pnpm allure:generate` | Reconstruir el reporte manualmente si hace falta |
| `pnpm report` | Abrir el HTML original de Playwright |

En Allure puedes filtrar resultados, expandir funcionalidades y abrir cada caso para ver pasos, duración y adjuntos. Se agrupa por escenarios BDD, casos TypeScript o pruebas técnicas. Se conserva una captura final incluso cuando el caso pasa; cuando falla, Playwright conserva también captura de falla, video y traza según la configuración.

| Ruta | Contenido |
| --- | --- |
| `Workspace/Reportes/allure/index.html` | Reporte Allure en un HTML autocontenido |
| `Workspace/Reportes/allure/summary.json` | Resumen del reporte Allure |
| `Workspace/Reportes/allure-results/` | Resultados y adjuntos de la última ejecución |
| `Workspace/Reportes/allure-history/history.jsonl` | Historial local, limitado a 20 entradas |
| `Workspace/Reportes/html/index.html` | Reporte nativo de Playwright |
| `Workspace/Reportes/json/execution.json` | Estados, duración, errores, reintentos y avisos |
| `Workspace/Reportes/junit/results.xml` | Resultado para integración con pipelines |
| `Workspace/Reportes/artifacts/` | Evidencias de Playwright |

Cada corrida reemplaza los resultados actuales y genera su propio reporte. El historial Allure se conserva por separado. Si ejecutas `test:framework` después de BDD, el reporte actual mostrará las pruebas técnicas. Copia el reporte antes de otra ejecución si necesitas conservar esa corrida; no ejecutes dos suites simultáneamente sobre estas mismas carpetas.

Una prueba fallida sigue devolviendo un código de error aunque Allure se genere correctamente. Si falla el generador, el comando también devuelve un error. `--list` no genera HTML. Si reemplazas los reporters con `--reporter=list`, deshabilitas también Allure para esa ejecución.

Allure 3 está instalado en el proyecto y se ejecuta con Node.js; no necesitas Java. Las evidencias pueden incluir datos de contacto capturados. `.env.prod`, `Workspace/Reportes/` y los archivos generados se excluyen de Git.

## Escribir casos estilo Katalon

Este ejemplo va dentro de un archivo de `Workspace/Test Cases/`:

```typescript
import { test } from '../TestListeners/fixtures';
import { Inicio, Catalogo } from '../Object Repository/objects';
import datos from '../Data Set/tienda.json';

test('TC06 - Buscar producto @regression', async ({ WebUI, tienda }) => {
  const productoBuscado = datos.busqueda;

  // Paso 1: Preparar la tienda y la ubicación.
  await tienda.abrirTienda();
  await tienda.seleccionarUbicacion(datos.codigoPostal);

  // Paso 2: Escribir el producto y enviar la búsqueda.
  await WebUI.setText(Inicio.campoBuscarProducto, productoBuscado);
  await WebUI.pressKey(Inicio.campoBuscarProducto, 'Enter');

  // Resultado esperado: Se muestran los resultados del producto.
  await WebUI.verifyElementVisible(Catalogo.tituloResultados(productoBuscado));
});
```

En cada instrucción, `WebUI` identifica la herramienta, `setText` indica la acción, `Inicio.campoBuscarProducto` indica el elemento y `productoBuscado` es el dato.

`await` espera a que termine la acción antes de continuar. `async` permite usar esas esperas dentro de la función. Se conserva un `await` por acción: no es una pausa fija y quitarlo puede hacer que una instrucción empiece antes de que termine la anterior.

### Palabras clave WebUI

Todas aceptan `FailureHandling` como último argumento opcional.

| Palabra clave | Uso |
| --- | --- |
| `navigateToUrl(url)` | Abrir una URL o una ruta como `/` |
| `click(elemento)` | Hacer clic |
| `setText(elemento, texto)` | Reemplazar el contenido de un campo |
| `typeText(elemento, texto)` | Escribir carácter por carácter y terminar con Tab |
| `pressKey(elemento, tecla)` | Presionar una tecla como `Enter` |
| `selectOptionByLabel(elemento, opcion)` | Seleccionar por el texto de la opción |
| `setChecked(elemento, marcada)` | Marcar con `true` o desmarcar con `false` |
| `verifyElementVisible(elemento)` | Comprobar que se vea |
| `verifyElementNotVisible(elemento)` | Comprobar que esté oculto o haya desaparecido |
| `verifyElementNotPresent(elemento)` | Comprobar que no exista en la página |
| `verifyElementEnabled(elemento)` | Comprobar que esté habilitado |
| `verifyValue(elemento, valor)` | Comparar el contenido de un campo |
| `verifyText(elemento, texto)` | Comprobar que contenga un texto o patrón |
| `verifyUrl(patron)` | Comprobar un patrón en la URL, por ejemplo `/checkout/` |
| `refresh()` | Recargar la página |

`setText` se usa en campos normales. El checkout necesita eventos de teclado en varios campos; sus acciones utilizan `typeText` y verifican que los datos se conserven. Los títulos de los pasos no incluyen los valores capturados, aunque los errores y las evidencias sí pueden contenerlos.

### FailureHandling

Dentro de un caso, importa el modo desde la entrada pública:

```typescript
import { FailureHandling } from '../CustomActions/WebUI';

// El modo se coloca después del último argumento normal de la acción.
await WebUI.click(Inicio.botonSeleccionarUbicacion, FailureHandling.STOP_ON_FAILURE);
await WebUI.setText(Inicio.campoBuscarProducto, 'algodon', FailureHandling.STOP_ON_FAILURE);
```

| Modo | Si falla el paso |
| --- | --- |
| `STOP_ON_FAILURE` | Detiene el caso con el error original. Es el predeterminado. |
| `CONTINUE_ON_FAILURE` | Continúa, pero registra una falla y el caso queda fallido. |
| `OPTIONAL` | Continúa y registra un aviso sin marcar el caso como fallido. |

Las acciones devuelven `true` al terminar correctamente. Si una falla permite continuar, devuelven `false`. Con `STOP_ON_FAILURE`, la falla lanza el error. Los modos conservan los tiempos de espera; `OPTIONAL` no significa verificar instantáneamente. Continuar tampoco recupera el estado de la página: úsalo cuando los pasos siguientes puedan ejecutarse de forma independiente.

Los `try/catch` técnicos y las recuperaciones del sitio viven en el framework o las acciones reutilizables; no se necesitan para elegir el modo de falla en un caso.

## Escribir escenarios BDD

Los archivos de `Workspace/Features/` describen el comportamiento en español. Por ejemplo:

```gherkin
# language: es
Característica: Búsqueda de productos
  @smoke @regression
  Escenario: TC02 - Buscar producto
    Dado que estoy en la tienda
    Y tengo seleccionada la ubicación de entrega del Data Set
    Cuando busco el producto del Data Set
    Y abro el producto encontrado
    Entonces veo el nombre, la descripción y la dirección del producto esperado
```

**Dado** prepara la situación inicial, **Cuando** ejecuta la acción y **Entonces** verifica el resultado. **Y** agrega otro paso del mismo tipo que el anterior. El `.feature` no necesita `await`, selectores ni datos privados.

Cada frase se conecta con una función en `Workspace/Step Definitions/tienda.steps.ts`:

```typescript
import { Cuando } from '../TestListeners/bdd.fixtures';
import datos from '../Data Set/tienda.json';

Cuando('busco el producto del Data Set', async ({ tienda }) => {
  await tienda.buscarProducto(datos.busqueda);
});
```

El patrón TypeScript no incluye la palabra `Cuando`. La frase debe coincidir con el `.feature`; si falta una implementación, `pnpm bdd:gen` indica cuál. Un patrón como `el carrito contiene {int} unidad(es) del producto esperado` permite usar `1 unidad` o `2 unidades` y recibe la cantidad como número.

TypeScript y BDD reutilizan las mismas acciones. Si cambia el comportamiento de un recorrido existente, actualiza su caso y su escenario; los localizadores y flujos compartidos permanecen centralizados.

## Agregar o mantener pruebas

1. Elige TypeScript o BDD para el nuevo caso, asigna un identificador como `TC06` y toma como ejemplo un recorrido existente.
2. Coloca los datos reutilizables en `Workspace/Data Set/`; los privados van en `.env.prod`.
3. Declara elementos nuevos en el archivo de su pantalla en `Workspace/Object Repository/` y expórtalos desde `objects.ts` si agregas una pantalla.
4. Escribe pasos comentados y termina con verificaciones del resultado esperado.
5. Extrae recorridos compartidos a `Workspace/CustomActions/` y reutilízalos también desde BDD.
6. Agrega `@smoke`, `@regression` o `@checkout`. Para crear una suite, modifica `Workspace/Test Suites/catalog.ts`.
7. Ejecuta `pnpm typecheck` y el caso afectado; usa `pnpm test:framework` si modificaste acciones, objetos compartidos o infraestructura.

Los casos importan `test` desde `Workspace/TestListeners/fixtures.ts`. Los pasos BDD importan `Dado`, `Cuando` y `Entonces` desde `Workspace/TestListeners/bdd.fixtures.ts`. Las herramientas `WebUI`, `tienda`, `carrito` y `compra` ya están preparadas por prueba; no se usa `this` ni se construyen clases dentro del caso.

## Avisos y solución de problemas

| Situación | Qué revisar |
| --- | --- |
| `pnpm` no se reconoce | Instalar pnpm y comprobar `node --version` y `pnpm --version` |
| Chromium no está instalado | Ejecutar `pnpm install:browsers` |
| `MISSING_DATA`, `INVALID_EMAIL` o `INVALID_PHONE` | Completar `.env.prod`; teléfono de 10 dígitos |
| `EMPTY_CART` o `INVALID_QUANTITY` | Revisar la preparación del carrito y las cantidades |
| `OUT_OF_STOCK` o `NO_COVERAGE` | Verificar producto y ubicación del Data Set |
| BDD indica que falta un paso | Comparar la frase del `.feature` con `Workspace/Step Definitions/` y generar de nuevo |
| El reporte muestra otra suite | Se está viendo la última ejecución; por ejemplo, una corrida de pruebas técnicas |
| Allure no se actualiza | Revisar el mensaje final del generador y recargar el navegador; comprobar que no se reemplazaron los reporters |
| Un caso falla en la tienda | Abrir el caso en Allure y revisar el primer paso fallido y sus adjuntos |

Las precondiciones detienen el recorrido con mensajes `[PRECONDICION:CODIGO]`. El JSON las clasifica como `blocked`; Playwright y JUnit las mantienen como fallas. Un botón que no carga o un servicio que no responde sigue siendo una falla: no se convierte automáticamente en falta de stock.

Las pruebas técnicas incluyen fallas deliberadas en runners aislados para comprobar `FailureHandling` y Allure. Esas comprobaciones principales pasan solo si los resultados internos son los esperados; los cinco casos de negocio no provocan fallas intencionales.

La tienda tiene inventario y cobertura dinámicos. La ubicación espera una sugerencia con el CP solicitado y después valida el pin del mapa. El envío espera el guardado real de la dirección y recupera calle y número si la tienda los borra. No se usan pausas fijas para esas esperas.

## Validación y mantenimiento técnico

En la revisión de organización del **27 de octubre de 2026**, los cinco casos TypeScript pasaron. La corrida BDD posterior terminó con tres aprobados y fallas en TC04 al esperar la sugerencia de dirección y TC05 al comprobar el aumento de cantidad. Esos resultados no se presentan como una corrida aprobada. El inventario y los servicios de la tienda pueden cambiar entre ejecuciones.

Después de agregar perfiles, TypeScript y las **17 pruebas técnicas locales** pasaron. Se verificó la colección de casos en Prod y QA dummy, y el bloqueo de la URL ficticia de QA. No se ejecutaron recorridos contra servidores QA reales: las URLs incluidas son plantillas.

El detalle del motor y los hooks está en [Framework/README.md](Framework/README.md). Para escribir o ejecutar casos no necesitas modificar esa carpeta.

Referencias: [Playwright](https://playwright.dev/docs/intro), [Playwright-BDD](https://vitalets.github.io/playwright-bdd/) y [Allure con Playwright](https://allurereport.org/docs/playwright/).
