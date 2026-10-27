# Arquitectura de automatización y guía de adopción

**Propósito:** documentar la solución implementada y servir como base para adaptar otros proyectos de automatización web, tanto nuevos como existentes.

**Base de referencia:** Playwright, TypeScript, palabras clave estilo Katalon, BDD en español y reportes Allure. La implementación de referencia automatiza Farmacias Similares. Adoptar esta arquitectura requiere reemplazar sus objetos, datos y flujos de negocio; copiar las carpetas por sí solo no adapta las pruebas a otra aplicación.

**Fecha de referencia:** 27 de octubre de 2026. Las rutas de este documento parten de la raíz de la solución, salvo que se indique otra ubicación. Los ejemplos de adaptación son propuestas para el proyecto receptor, no funciones adicionales ya implementadas en esta POC.

## Contenido

- [Estructura aplicada](#estructura-aplicada)
- [Responsabilidades](#responsabilidades)
- [Flujo de ejecución](#flujo-de-ejecución)
- [Reglas para mantenerla](#reglas-para-mantenerla)
- [Decisiones y evolución del diseño](#decisiones-y-evolución-del-diseño)
- [Componentes y contratos](#componentes-y-contratos)
- [Ejemplo completo de adaptación](#ejemplo-completo-de-adaptación)
- [Perfiles y datos por ambiente](#perfiles-y-datos-por-ambiente)
- [Suites y ejecución](#suites-y-ejecución)
- [Resultados y evidencias](#resultados-y-evidencias)
- [Qué reutilizar y qué adaptar](#qué-reutilizar-y-qué-adaptar)
- [Migración de un proyecto existente](#migración-de-un-proyecto-existente)
- [Validación y entrega de la plantilla](#validación-y-entrega-de-la-plantilla)
- [Integración continua y crecimiento](#integración-continua-y-crecimiento)

La solución se divide en **Workspace**, donde el tester diseña las pruebas y consulta sus reportes, y **Framework**, donde se mantiene el motor. Las dependencias y los archivos de herramientas permanecen en la raíz de la solución, fuera del área de trabajo del tester.

## Estructura aplicada

```text
POC_Playwrigth-FMSimilares/          Raíz de la solución
│
├── Workspace/                      Área del tester
│   ├── Test Cases/                 Casos TypeScript
│   ├── Features/                   Escenarios BDD en español
│   ├── Step Definitions/           Conexión entre frases BDD y acciones
│   ├── Test Suites/                Selección de casos por suite
│   ├── Object Repository/          Objetos y localizadores por pantalla
│   ├── CustomActions/              Acciones reutilizables de negocio
│   ├── Data Set/                   Datos y validaciones de entrada
│   ├── TestListeners/              Entradas públicas para casos y pasos
│   ├── Profiles/                   Ambientes Prod y QA dummy
│   ├── Reportes/                   Resultados, historial y evidencias
│   └── README.md                   Guía breve del tester
│
├── Framework/                      Infraestructura de automatización
│   ├── Core/                       WebUI, FailureHandling y precondiciones
│   ├── Fixtures/                   Preparación, hooks y captura de evidencia
│   ├── Config/                     Playwright, BDD, perfiles y Allure
│   ├── Reporters/                  Resultados y generación de reportes
│   ├── Scripts/                    Lanzadores y utilidades técnicas
│   ├── Tests/                      Verificación local del framework
│   ├── Validation/                 Escenarios técnicos aislados
│   ├── Generated/                  Código BDD generado e ignorado por Git
│   └── README.md                   Guía de mantenimiento
│
├── node_modules/                   Dependencias administradas por pnpm
├── .env.prod                       Datos privados de producción
├── .env.qa                         Datos ficticios de QA
├── package.json                    Comandos y dependencias de la solución
├── pnpm-lock.yaml                  Versiones reproducibles
├── tsconfig.json                   Configuración de TypeScript
├── playwright.config.ts            Entrada de Playwright
├── playwright.bdd.config.ts        Entrada de BDD
├── allurerc.mjs                    Entrada de Allure
├── ARQUITECTURA.md                 Este documento
└── README.md                       Instalación y ejecución completas
```

## Responsabilidades

| Área | Responsable habitual | Qué se modifica |
| --- | --- | --- |
| `Workspace/` | Tester / QA | Casos, escenarios, objetos, datos, acciones, suites y perfiles |
| `Framework/` | Mantenedor de automatización | Motor WebUI, hooks internos, integración BDD y reportes |
| `Workspace/Reportes/` | Generación automática | Se consulta y exporta; no contiene código de prueba |
| Raíz técnica | Mantenedor de la solución | Instalación, scripts, dependencias y configuración de herramientas |

`node_modules/` está un nivel por encima de las carpetas del tester: no pertenece a `Workspace/`. Se conserva junto a `package.json` para que Node y pnpm resuelvan las dependencias normalmente.

## Flujo de ejecución

1. El comando selecciona el perfil de `Workspace/Profiles/` y la suite de `Workspace/Test Suites/`.
2. Playwright ejecuta un caso de `Workspace/Test Cases/`, o BDD genera código a partir de `Workspace/Features/` y `Workspace/Step Definitions/`.
3. El caso utiliza las entradas de `TestListeners/`, las acciones de negocio y los objetos del mismo `Workspace/`.
4. El framework prepara la sesión, ejecuta WebUI y recoge las evidencias.
5. Los reporters escriben los resultados y generan Allure dentro de `Workspace/Reportes/`.

Los imports entre carpetas del tester conservan rutas sencillas como `../Object Repository/objects`. Las entradas públicas conectan con el motor; los casos no necesitan conocer dónde están los hooks o los reporters. Actualmente el motor también importa acciones y objetos del workspace para construir las herramientas de cada caso: esta organización separa responsabilidades de mantenimiento dentro de una misma solución, sin convertirlas en paquetes independientes.

## Reglas para mantenerla

- Agregar casos y escenarios dentro de `Workspace/`; conservar allí los nombres y pasos de negocio.
- Centralizar localizadores en `Object Repository/` y recorridos compartidos en `CustomActions/`.
- Mantener los hooks de sesión y evidencia en `Framework/Fixtures/`; `Workspace/TestListeners/` conserva las entradas simples para el tester.
- No editar `Framework/Generated/`, `node_modules/` ni los archivos de resultados.
- Mantener los secretos fuera de los JSON de perfiles. `.env.prod` y `.env.qa` permanecen en la raíz y no se versionan.
- Ejecutar los comandos desde la raíz de la solución. Si la terminal está dentro de `Workspace/`, usar `pnpm --dir .. <comando>`.

No hace falta crear más capas para los cinco casos actuales. Si la solución incorpora varias aplicaciones, se puede crear un workspace por aplicación y extraer un motor independiente mediante interfaces; sería una evolución posterior, con contratos explícitos entre paquetes.

## Decisiones y evolución del diseño

La arquitectura busca que un QA pueda leer y mantener el recorrido de una prueba sin tener que resolver la preparación del navegador, los hooks o la generación de reportes en cada caso.

| Decisión | Necesidad que resuelve | Consecuencia para quien adopta la base |
| --- | --- | --- |
| Agrupar las carpetas del tester en `Workspace/` | Reducir el ruido de infraestructura en su área de trabajo | Conservar allí los artefactos de negocio y los resultados |
| Separar el motor en `Framework/` | Centralizar preparación, errores y evidencia | Probar los cambios del motor antes de aplicarlos a todas las suites |
| Usar funciones fábrica y fixtures | Trabajar sin `this` y sin páginas globales | Crear las herramientas con la página que pertenece a cada prueba |
| Exponer palabras clave `click`, `setText`, etc. | Facilitar la lectura a usuarios familiarizados con Katalon | Mantener una API pequeña y consistente |
| Conservar `await` | Ejecutar acciones asíncronas en el orden escrito | Cada acción debe terminar antes de la siguiente |
| Centralizar `FailureHandling` | Evitar `try/catch` repetidos en los casos | Elegir la política al final de la llamada WebUI |
| Compartir acciones entre TypeScript y BDD | Mantener un solo flujo de negocio | Los pasos Gherkin delegan en las mismas acciones |
| Separar perfiles públicos de datos privados | Cambiar de ambiente sin editar los casos | Los JSON definen URL y archivo; los valores privados se resuelven por ambiente |
| Generar Allure al terminar | Hacer que el reporte forme parte de la ejecución | Respetar el orden de reporters y conservar el código de error |

La separación de carpetas se implementó después de definir los contratos de acciones, objetos y fixtures. Por ello, los imports internos se ajustaron sin cambiar la forma en que el tester escribe los casos. Esa es la regla para futuras reorganizaciones: conservar las entradas públicas y validar las rutas de ejecución.

### Alcance actual y límites de reutilización

La base está implementada para automatización web con Chromium. No incluye motores para aplicaciones móviles nativas, escritorio ni una capa especializada de pruebas API. Estas capacidades requerirían adaptadores y convenciones propios.

Hoy existen dependencias del motor hacia el workspace:

- `Framework/Fixtures/fixtures.ts` importa las fábricas de acciones del negocio.
- `Framework/Core/WebUI.ts` importa el tipo de objeto desde el repositorio del workspace.
- `Framework/Core/Preconditions.ts` contiene reglas y objetos relacionados con producto y carrito.
- Los reporters incluyen el nombre de la aplicación y un catálogo de funcionalidades TC01–TC05.

Por tanto, `Framework/` es una infraestructura reutilizable **con puntos de adaptación**, todavía no un paquete independiente que pueda publicarse y conectarse a cualquier proyecto sin cambios. Para extraerlo como librería, habría que mover el contrato `TestObject` al motor, recibir las acciones mediante composición y sacar las precondiciones de dominio del núcleo. Esa extracción es una evolución propuesta; no forma parte de la implementación actual.

## Componentes y contratos

### 1. Casos de prueba

Ubicación: `Workspace/Test Cases/`.

Un caso describe preparación, acciones y resultado esperado. Importa `test` desde `../TestListeners/fixtures`, solicita las herramientas que necesita y termina con verificaciones observables.

El caso puede combinar palabras clave WebUI con acciones de negocio. Si un recorrido se repite o contiene sincronización compleja, conviene mantenerlo en `CustomActions/`.

Cada caso debe preparar su propio estado. Su éxito no debe depender de que se haya ejecutado otro caso antes. El identificador `TCxx` facilita la búsqueda y clasificación en reportes; al adaptar una suite, hay que mantenerlo único.

### 2. Repositorio de objetos

Ubicación: `Workspace/Object Repository/`.

El contrato implementado es:

```typescript
type TestObject = Readonly<{
  name: string;
  locate: (page: Page) => Locator;
}>;
```

`name` identifica el elemento en los pasos del reporte. `locate(page)` resuelve el localizador sobre la página de la prueba. El repositorio conserva las definiciones, no una sesión global de navegador.

Cada pantalla tiene su archivo y el módulo `objects.ts` reúne las exportaciones. Usar localizadores por rol, etiqueta o atributos estables cuando la aplicación los ofrezca; limitar los selectores CSS a los casos que lo necesiten. Los elementos parametrizados reciben el dato de búsqueda y producen un objeto con el mismo contrato.

### 3. Acciones de negocio

Ubicación: `Workspace/CustomActions/`.

Las acciones agrupan objetivos como seleccionar ubicación, agregar un producto o completar envío. Reciben WebUI mediante una función fábrica y devuelven funciones con nombres de negocio:

```typescript
export function crearAccionesEjemplo(WebUI: WebUI) {
  async function realizarOperacion() {
    // Acciones y verificaciones del recorrido de la aplicación receptora.
  }

  return { realizarOperacion };
}
```

La fábrica conserva su dependencia en un cierre; no necesita `this`. El fixture crea las acciones para la página del caso. Al agregar una nueva fábrica, también se debe registrar su tipo y construcción en los fixtures.

Las esperas de una operación de negocio pertenecen a esa operación. Por ejemplo, guardar una dirección puede requerir esperar una respuesta de red y después comprobar el estado visible. La espera debe representar el resultado que necesita el siguiente paso.

### 4. WebUI

Implementación: `Framework/Core/WebUI.ts`. Entrada pública de tipos y `FailureHandling`: `Workspace/CustomActions/WebUI.ts`.

WebUI recibe una `Page` de Playwright y ofrece acciones como `navigateToUrl`, `click`, `setText`, `pressKey`, `verifyText` y `verifyElementVisible`. Cada acción registra un `test.step` y aplica la política de falla.

Las acciones devuelven `Promise<boolean>`: `true` cuando completan correctamente y `false` cuando la política permite continuar después de una falla. En el modo de detención, el error se propaga. Las verificaciones utilizan aserciones de Playwright con espera del resultado.

`await` forma parte del contrato asíncrono:

```typescript
await WebUI.setText(Pantalla.campoBusqueda, 'producto');
await WebUI.pressKey(Pantalla.campoBusqueda, 'Enter');
```

La segunda acción debe comenzar después de la primera. No quitar `await` para abreviar el caso ni lanzar operaciones dependientes con `Promise.all`.

Al reutilizar el motor, revisar `typeText` y `setChecked`: su comportamiento actual incluye decisiones tomadas por el checkout de la tienda, como confirmar escritura con Tab y cambiar la casilla con Espacio. Otro sistema puede necesitar una política diferente o una acción específica de negocio.

### 5. Manejo de fallas y precondiciones

Implementación: `Framework/Core/FailureHandling.ts` y `Framework/Core/Preconditions.ts`.

| Política | ¿Continúa el caso? | Efecto de la falla |
| --- | --- | --- |
| `STOP_ON_FAILURE` | No | Propaga el error y falla el caso; es el modo predeterminado |
| `CONTINUE_ON_FAILURE` | Sí, si no ocurre otro bloqueo | Registra una aserción suave; el caso queda fallido |
| `OPTIONAL` | Sí | Registra una anotación de aviso; ese error no falla el caso |

El modo se coloca después de los argumentos normales de la acción:

```typescript
await WebUI.click(Pantalla.botonAviso, FailureHandling.OPTIONAL);
```

`OPTIONAL` corresponde a comportamientos prescindibles, como un aviso que puede no aparecer. Las verificaciones esenciales para el objetivo del caso deben conservar una política que registre la falla.

Las precondiciones validan datos o estados necesarios para iniciar o continuar un recorrido. En esta implementación, el reporter JSON clasifica esos errores como `blocked`; Playwright y JUnit los mantienen como fallas. Un proyecto receptor debe acordar y documentar esta equivalencia con su pipeline.

### 6. Fixtures, hooks y listeners

Implementación: `Framework/Fixtures/`. Entradas públicas: `Workspace/TestListeners/`.

El fixture `WebUI` construye la herramienta con la página del caso. Los fixtures de negocio construyen sus fábricas. La prueba solicita estas dependencias por nombre en su función de ejecución.

Los fixtures automáticos tienen dos responsabilidades actuales:

- `ambiente`: impide ejecutar recorridos de negocio contra el dominio ficticio de QA.
- `evidence`: después de la prueba, intenta adjuntar una captura final y registra el error de captura sin sustituir el error principal.

Los archivos de `TestListeners/` son entradas simples que reexportan `test`, `expect` y los pasos BDD. No existe un sistema de plugins que descubra automáticamente cualquier listener nuevo colocado allí. Un hook nuevo debe conectarse explícitamente con los fixtures o la configuración correspondiente.

Usar el código anterior a `await use()` para preparación y el posterior para cierre. Si el cierre debe ejecutarse incluso cuando falle la preparación o el cuerpo, diseñarlo con `try/finally` y comprobar el comportamiento. No compartir una página mutable entre casos.

### 7. BDD

Los escenarios están en `Workspace/Features/`; sus implementaciones, en `Workspace/Step Definitions/`.

`Framework/Config/playwright.bdd.config.ts` convierte Gherkin en pruebas ejecutables dentro de `Framework/Generated/features/`. Los archivos generados se ignoran en Git y se regeneran con `pnpm bdd:gen` o con los comandos `test:bdd*`.

El `.feature` expresa el comportamiento sin selectores ni datos privados. El step definition recibe fixtures y delega el trabajo en las acciones de negocio. BDD y TypeScript son dos entradas al mismo recorrido; cada equipo puede elegir la que necesita ejecutar y mantener.

## Ejemplo completo de adaptación

El siguiente ejemplo utiliza una aplicación ficticia con una búsqueda. Los archivos `Busqueda.ts`, `AccionesBusqueda.ts` y `TC06-Buscar.spec.ts` son ejemplos para crear en el proyecto receptor; no describen una pantalla ya existente en esta POC.

### Paso 1. Definir los objetos de la pantalla

Archivo propuesto: `Workspace/Object Repository/Busqueda.ts`.

```typescript
import { objeto } from './ObjetoPrueba';

export const Busqueda = {
  campo: objeto('Búsqueda / Texto', page =>
    page.getByRole('textbox', { name: 'Buscar' })),
  boton: objeto('Búsqueda / Buscar', page =>
    page.getByRole('button', { name: 'Buscar', exact: true })),
  resultado: objeto('Búsqueda / Resultado', page =>
    page.getByRole('heading', { name: 'Resultados', exact: true })),
};
```

Agregar `export { Busqueda } from './Busqueda';` a `Workspace/Object Repository/objects.ts`.

### Paso 2. Crear una acción reutilizable

Archivo propuesto: `Workspace/CustomActions/AccionesBusqueda.ts`.

```typescript
import { test } from '@playwright/test';
import type { WebUI } from './WebUI';
import { Busqueda } from '../Object Repository/objects';

export function crearAccionesBusqueda(WebUI: WebUI) {
  async function buscar(texto: string) {
    await test.step('Buscar en la aplicación', async () => {
      await WebUI.setText(Busqueda.campo, texto);
      await WebUI.click(Busqueda.boton);
    });
  }

  return { buscar };
}

export type AccionesBusqueda = ReturnType<typeof crearAccionesBusqueda>;
```

### Paso 3. Registrar la herramienta

En `Framework/Fixtures/fixtures.ts`, importar la fábrica, agregar `busqueda: AccionesBusqueda` a `HerramientasPrueba` y añadir esta entrada al objeto existente de `base.extend`:

```typescript
busqueda: async ({ WebUI }, use) => {
  await use(crearAccionesBusqueda(WebUI));
},
```

La entrada pública `Workspace/TestListeners/fixtures.ts` sigue exportando el `test` extendido, sin construir las acciones dentro de cada caso.

### Paso 4. Escribir el caso

Archivo propuesto: `Workspace/Test Cases/TC06-Buscar.spec.ts`.

```typescript
import { test } from '../TestListeners/fixtures';
import { Busqueda } from '../Object Repository/objects';

test('TC06 - Buscar información @smoke', async ({ WebUI, busqueda }) => {
  // Preparar: abrir la aplicación del perfil elegido.
  await WebUI.navigateToUrl('/');

  // Actuar: ejecutar el objetivo de negocio.
  await busqueda.buscar('dato de prueba');

  // Verificar: comprobar el resultado visible de la operación.
  await WebUI.verifyElementVisible(Busqueda.resultado);
});
```

Este ejemplo comprueba la apertura de la sección de resultados. Si el objetivo exige validar el dato encontrado, agregar un objeto y una aserción para ese contenido específico.

### Paso 5. Conectar el mismo flujo con BDD, si se requiere

Escenario propuesto en `Workspace/Features/TC06-Buscar.feature`:

```gherkin
# language: es
@smoke
Característica: Búsqueda de información
  Escenario: TC06 - Buscar información
    Dado que abrí la aplicación
    Cuando busco información de prueba
    Entonces veo la sección de resultados
```

Implementación propuesta en `Workspace/Step Definitions/busqueda.steps.ts`:

```typescript
import { Dado, Cuando, Entonces } from '../TestListeners/bdd.fixtures';
import { Busqueda } from '../Object Repository/objects';

Dado('que abrí la aplicación', async ({ WebUI }) => {
  await WebUI.navigateToUrl('/');
});

Cuando('busco información de prueba', async ({ busqueda }) => {
  await busqueda.buscar('dato de prueba');
});

Entonces('veo la sección de resultados', async ({ WebUI }) => {
  await WebUI.verifyElementVisible(Busqueda.resultado);
});
```

El fixture BDD actual combina las herramientas del fixture principal. La nueva herramienta queda disponible mediante esa composición; comprobarlo con TypeScript y la generación de pasos antes de ejecutar.

## Perfiles y datos por ambiente

La base mantiene únicamente dos perfiles y dos archivos de datos privados:

| Perfil | Archivo público | Archivo privado | Uso inicial |
| --- | --- | --- | --- |
| `prod` | `Workspace/Profiles/prod.json` | `.env.prod` | Aplicación actual de producción |
| `qa` | `Workspace/Profiles/qa.json` | `.env.qa` | URL ficticia y datos dummy |

El JSON declara `descripcion`, `baseURL` y `envFile`. El cargador `Framework/Config/Profiles.ts` valida el nombre del perfil, restringe el archivo privado a un nombre local admitido y comprueba que la URL sea HTTP/HTTPS sin credenciales embebidas.

La resolución es: **variables de terminal/CI > archivo privado del perfil > configuración JSON**, cuando una clave aplica a ese origen. Actualmente el JSON proporciona la URL; los datos de contacto proceden del archivo privado o del entorno. El cargador no completa QA leyendo `.env.prod`.

Las variables ya presentes en la terminal también pueden contener datos de Prod. Cambiar de perfil no borra esas variables: el equipo debe proporcionar las correspondientes al ambiente elegido. La URL efectiva y el nombre del perfil se incluyen en Allure.

Si falta un archivo privado, el cargador utiliza los datos disponibles en el entorno; el recorrido de compra valida sus campos obligatorios antes de usarlos. Los datos públicos y compartidos, como el producto de prueba, permanecen en `Workspace/Data Set/`.

**Adaptación a otra aplicación:** cambiar las URLs públicas, sustituir las variables de contacto/envío por las que requiera el nuevo negocio y ajustar sus validadores. No copiar credenciales de la POC. Los archivos `.env.prod` y `.env.qa` se excluyen de Git y deben prepararse localmente o mediante variables del pipeline; no se mantienen plantillas `.env.example`.

El perfil predeterminado actual es `prod`. Al adoptar la base, decidir explícitamente ese valor y revisar los efectos del recorrido antes de ejecutarlo. La POC se detiene antes de enviar un pedido; ese límite pertenece a sus acciones de negocio y debe redefinirse para cada aplicación.

QA dummy permite listar casos. Para ejecutar contra un QA real, reemplazar su dominio `.invalid` y sus datos ficticios. No hay un servidor QA simulado ni respuestas mock de negocio incluidas como ambiente completo.

## Suites y ejecución

El catálogo `Workspace/Test Suites/catalog.ts` utiliza proyectos de Playwright para seleccionar los mismos archivos por etiquetas:

| Suite actual | Selección |
| --- | --- |
| `e2e` | Todos los casos de negocio |
| `smoke` | Casos con `@smoke` |
| `regression` | Casos con `@regression` |
| `checkout` | Casos con `@checkout`; específica de esta tienda |
| `framework` | Pruebas técnicas; se declara en la configuración interna |

Las suites no contienen copias de los casos ni garantizan un orden entre ellos. Renombrar `checkout` o sustituirla si la aplicación receptora tiene otros dominios, ajustando también scripts y documentación.

Comandos desde la raíz:

```powershell
# Preparar las dependencias declaradas por el proyecto.
pnpm install --frozen-lockfile
pnpm install:browsers

# Revisar código y recolectar pruebas sin navegar.
pnpm typecheck
pnpm ambiente prod test:e2e --list
pnpm ambiente qa test:bdd:smoke --list

# Comprobar el motor con pruebas locales.
pnpm test:framework

# Ejecutar negocio contra un ambiente configurado.
pnpm ambiente prod test:smoke
pnpm ambiente prod test:bdd:smoke

# Abrir el reporte de la última ejecución.
pnpm report:allure
```

Desde una terminal dentro de `Workspace/`, anteponer `pnpm --dir ..`, por ejemplo `pnpm --dir .. ambiente prod test:smoke`.

Seleccionar siempre el proyecto o usar los scripts. Invocar Playwright sin esa selección puede ejecutar un mismo caso varias veces, porque `e2e`, `smoke` y `regression` se superponen.

Actualmente se utiliza un worker y no hay reintentos locales; cuando `CI` está definida se configura un reintento. El paralelismo es una decisión de configuración posterior a verificar el aislamiento de datos y sesiones.

## Resultados y evidencias

Todos los resultados se generan dentro de `Workspace/Reportes/`:

| Ruta | Contrato de salida |
| --- | --- |
| `allure-results/` | Resultados y adjuntos consumidos por Allure |
| `allure/index.html` | Reporte Allure generado automáticamente |
| `allure/summary.json` | Resumen de esa generación |
| `allure-history/history.jsonl` | Historial local, conservado aparte del HTML |
| `html/` | Reporte nativo de Playwright |
| `json/execution.json` | Resultados finales, intentos, errores y clasificación de precondiciones |
| `junit/results.xml` | Resultado consumible por herramientas CI |
| `artifacts/` | Capturas, videos y trazas del runner |

Secuencia implementada:

1. Los reporters reciben los eventos de ejecución.
2. El adaptador Allure escribe resultados y adjuntos.
3. `GenerarAllure.ts`, colocado después del adaptador, ejecuta la generación del HTML.
4. El comando conserva la falla si algún caso falló; un error del generador también produce un resultado de error.

La generación ocurre también después de casos fallidos. `--list` no genera un reporte nuevo. `pnpm report:allure` abre el existente; `pnpm allure:generate` lo reconstruye manualmente. Si se reemplaza la lista de reporters mediante CLI, se puede desactivar la generación automática.

El fixture conserva una captura final; la configuración retiene video, captura de falla y traza en los escenarios de error. Los títulos de escritura evitan incluir los datos capturados, pero las evidencias y mensajes de error aún pueden mostrarlos. La publicación de artefactos debe respetar el acceso y la retención acordados para el proyecto.

Las rutas actuales representan la última corrida. Ejecutar otra suite reemplaza los resultados vigentes; el historial se conserva por separado. Para ejecuciones simultáneas o por ambiente se requieren salidas distintas y su configuración coherente en Playwright, los reporters y Allure. Esa separación por ejecución no está implementada hoy.

## Qué reutilizar y qué adaptar

| Componente | Tratamiento al adoptar la base |
| --- | --- |
| Estructura `Workspace/` y `Framework/` | Reutilizar como convención de organización |
| API de palabras clave y `FailureHandling` | Reutilizar el contrato; revisar comportamientos particulares de la tienda |
| Objetos por pantalla | Reemplazar por los elementos de la nueva aplicación |
| `CustomActions/` | Reescribir los recorridos de negocio |
| Fixtures de negocio | Registrar las nuevas fábricas y retirar las anteriores |
| `Core/Preconditions.ts` | Sustituir reglas de producto/carrito; ubicar reglas nuevas de dominio junto a sus acciones si se busca desacoplar el motor |
| Casos, features y steps | Migrar el comportamiento y conservar el resultado esperado |
| `Data Set/` | Cambiar productos, CP, validadores y datos públicos |
| Perfiles y datos privados | Mantener Prod y QA; cambiar URLs y variables de la aplicación |
| Catálogo de suites | Conservar las suites útiles y adaptar las etiquetas de dominio |
| Reporters | Conservar el flujo; cambiar nombres, funcionalidades y clasificación que sean específicos |
| Pruebas técnicas | Conservar las genéricas; adaptar las que importan objetos o flujos de la tienda |
| Archivos de configuración de la raíz | Conservar las entradas y actualizar las rutas si cambia la ubicación de la solución |
| Versiones y lockfile | Mantenerlos coherentes con el gestor y la política del proyecto receptor |

También revisar locale, zona horaria, navegador, timeouts, límites de reintento y restricciones del ambiente. Los valores actuales responden a la POC y no constituyen requisitos universales de la plantilla.

## Migración de un proyecto existente

### Fase 1. Inventariar y acordar el alcance

Identificar el runner actual, los casos prioritarios, sus dependencias de datos, los hooks, los selectores, las cuentas de prueba y las salidas que consume CI. Elegir un recorrido representativo con un resultado fácil de comprobar y registrar cómo se ejecuta antes de migrarlo.

No sobrescribir la configuración existente del proyecto receptor. Integrar scripts, dependencias y archivos ignorados de forma explícita, preservando sus comandos vigentes durante la transición.

### Fase 2. Crear el esqueleto

Crear `Workspace/` y `Framework/` con la distribución de este documento. Conservar las dependencias junto al `package.json` que administra esta solución. Preparar Prod y QA dummy, y ajustar las entradas de Playwright y Allure.

Si la automatización se incorpora a un repositorio de producto, se puede ubicar la solución completa bajo una carpeta como `automation/`; desde esa carpeta se ejecutan sus comandos. Ajustar los contratos de CI y los imports antes de mover archivos. En un monorepositorio administrado por un gestor de paquetes, respetar su resolución de dependencias en lugar de imponer un segundo modelo sin necesidad.

### Fase 3. Migrar un recorrido vertical

Migrar todos los componentes de un solo caso: objetos, datos, acción, fixture, caso y reporte. Comprobar el resultado visible y contrastarlo con el recorrido original. Incluir una falla controlada en una verificación local para confirmar que el runner y el pipeline reportan el error.

No declarar completada la migración únicamente porque el navegador recorrió las pantallas: las verificaciones y los códigos de salida también forman parte del contrato.

### Fase 4. Migrar por capacidades de negocio

Repetir por pantalla o capacidad, extraer acciones compartidas y retirar la duplicación cuando cada nuevo recorrido esté comprobado. Agregar BDD cuando facilite la colaboración del equipo; no convertir todos los casos a Gherkin como condición previa para usar la estructura.

| Origen habitual | Adaptación propuesta |
| --- | --- |
| Proyecto Playwright con Page Objects | Mantener su comportamiento inicialmente; envolverlo o convertirlo gradualmente en fábricas de acciones |
| Proyecto Katalon | Mapear casos, objetos, keywords y profiles a las carpetas equivalentes; adaptar las llamadas al contrato asíncrono de TypeScript |
| Proyecto Selenium u otro runner | Reutilizar escenarios y criterios; reescribir interacción, esperas y fixtures para Playwright |
| Pruebas manuales | Identificar preparación y resultados observables antes de automatizar cada recorrido |

Las palabras clave estilo Katalon son una convención de lectura. No hay importación automática de proyectos Katalon ni equivalencia completa entre sus motores.

### Fase 5. Integrar y retirar el camino anterior

Actualizar el pipeline con los comandos del nuevo recorrido, publicar artefactos y verificar que una falla provoque una ejecución fallida. Conservar el camino anterior hasta completar los criterios acordados. Después, retirar archivos y scripts obsoletos del alcance migrado y entregar la guía al equipo.

## Validación y entrega de la plantilla

### Comprobaciones técnicas

- TypeScript compila sin emitir archivos.
- La colección TypeScript y la generación BDD encuentran únicamente los casos esperados.
- Los perfiles resuelven su URL y datos sin leer el archivo privado del otro ambiente.
- Una acción fallida respeta los tres modos de `FailureHandling`.
- Las pruebas utilizan páginas independientes.
- Los reportes se generan dentro de `Workspace/Reportes/` y conservan la falla de ejecución.
- Los recorridos críticos esperan estados o respuestas relevantes, sin sustituirlos por pausas fijas.

La referencia incluye 17 pruebas técnicas locales, con comprobaciones de WebUI, errores, perfiles, sincronización y generación Allure. Esa cantidad describe la POC; al sustituir el negocio, revisar cada prueba y mantener cobertura de los contratos, en lugar de conservar el número como objetivo.

### Criterios de aceptación de un proyecto adaptado

- [ ] El tester puede crear o modificar un caso desde `Workspace/` siguiendo el README.
- [ ] Objetos, acciones y datos pertenecen a la aplicación receptora.
- [ ] No quedan URLs, etiquetas o validaciones de Farmacias Similares fuera de referencias históricas identificadas.
- [ ] Prod y QA apuntan a los ambientes acordados; QA dummy sigue identificado si no existe un servidor real.
- [ ] Los valores privados no se incluyen en el repositorio ni en nombres de pasos.
- [ ] Cada caso prepara sus propios datos y sesión, con una limpieza definida cuando corresponda.
- [ ] Se comprobó un recorrido representativo exitoso y una falla esperada en validación aislada.
- [ ] La falla llega al código de salida de CI y el reporte permite identificar el paso responsable.
- [ ] La evidencia publicada tiene responsables, acceso y retención definidos.
- [ ] El README describe instalación, comandos, perfiles, restricciones del recorrido y diagnóstico de errores.

### Documentos de entrega

| Documento | Audiencia y propósito |
| --- | --- |
| [README principal](README.md) | Instalación, datos, comandos y solución de problemas |
| [Guía del tester](Workspace/README.md) | Orientación diaria dentro del workspace |
| [Guía del framework](Framework/README.md) | Hooks, composición y mantenimiento técnico |
| Este documento | Decisiones, contratos, adaptación y evolución de la arquitectura |

## Integración continua y crecimiento

Un pipeline puede instalar dependencias y navegador, comprobar tipos y pruebas técnicas, ejecutar la suite seleccionada con sus variables de ambiente y publicar `Workspace/Reportes/`. La publicación de evidencia debe ocurrir también cuando fallen los casos, conservando el código de salida del runner.

Los archivos de entorno son opcionales cuando CI suministra las variables requeridas. Proporcionar `TEST_PROFILE` de forma explícita y ejecutar el mismo script usado localmente. No depender de que exista el archivo privado de la computadora de un QA.

Antes de habilitar workers adicionales, separar usuarios, datos modificables y operaciones que compitan entre sí. El aislamiento del contexto del navegador no aísla por sí solo el estado del servidor.

Las siguientes evoluciones se pueden realizar cuando haya una necesidad comprobada; no son capacidades presentes en la plantilla:

| Necesidad | Evolución propuesta |
| --- | --- |
| Varias aplicaciones con releases independientes | Separar el motor como paquete y definir contratos de extensión |
| Corridas concurrentes o varios ambientes a la vez | Directorios de salida por ejecución y una estrategia de publicación o combinación |
| Reutilización de autenticación | Fixtures y estados de sesión por usuario/rol, con almacenamiento privado |
| Pruebas API o móvil | Adaptadores específicos, sus fixtures y sus pruebas de contrato |
| Datos de negocio que requieren creación y limpieza | Servicios de preparación y teardown con responsables y manejo de errores |
| Más navegadores | Proyectos explícitos por navegador y selección de suites que evite duplicaciones accidentales |

La plantilla debe evolucionar mediante contratos pequeños y comprobables. El objetivo de adopción es conservar un workspace legible y un motor mantenible mientras se reemplaza el comportamiento de negocio por el del proyecto receptor.
