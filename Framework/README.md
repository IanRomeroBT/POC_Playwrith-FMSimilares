# Mantenimiento del framework

Esta carpeta concentra la infraestructura. El QA trabaja en `../Workspace/`; la guía de ejecución está en `../README.md` y la arquitectura en `../ARQUITECTURA.md`.

```text
Core/         Implementación WebUI, FailureHandling y precondiciones
Fixtures/     Herramientas por prueba, hooks internos y evidencias
Reporters/    Adaptador Allure, generación automática y reporter JSON
Config/       Configuración de Playwright, BDD y Allure
Scripts/      Lanzador de comandos con selección de ambiente
Tests/        Pruebas técnicas locales, separadas de TC01 a TC05
Validation/   Escenarios aislados que provocan fallas para validar los reporters
Generated/    Pruebas BDD generadas; no se editan ni se versionan
```

## Entradas públicas

- `Workspace/TestListeners/fixtures.ts` expone `test` y `expect` a los casos del QA.
- `Workspace/TestListeners/bdd.fixtures.ts` expone `test`, `Dado`, `Cuando` y `Entonces`.
- `Workspace/CustomActions/WebUI.ts` expone `FailureHandling` y el tipo `WebUI`.
- Los archivos de configuración de la raíz reexportan las implementaciones de `Config/`.

Conservar estas entradas evita que los casos dependan de la organización interna del motor.

## Perfiles

El QA edita `Workspace/Profiles/*.json`; `Config/Profiles.ts` resuelve el perfil indicado por `TEST_PROFILE` (predeterminado: `prod`). Lee solamente el archivo privado indicado en `envFile`. Las variables de terminal/CI prevalecen sobre ese archivo y sobre la URL del JSON. No cargar `dotenv/config` por separado: mezclaría `.env.prod` de Prod con QA.

`Scripts/profile.cjs` implementa `pnpm ambiente <perfil> <script> [opciones]`, conserva el código de salida y propaga el ambiente a los dos procesos de BDD. El fixture automático `ambiente` impide navegar a las URLs ficticias `.invalid` de las plantillas QA; las pruebas técnicas locales y `--list` siguen disponibles. Los metadatos de Allure incluyen el perfil y la URL efectiva.

## Hooks y evidencias

`Fixtures/fixtures.ts` prepara una instancia de WebUI y las acciones reutilizables para cada página. El fixture automático de evidencias adjunta la captura final; Playwright conserva video, captura y traza según la configuración. `Fixtures/bdd.fixtures.ts` combina esas herramientas con BDD y prepara los datos de compra cuando el escenario los solicita.

Los objetos se localizan sobre la página del caso. No introducir una página global ni compartir sesión entre pruebas.

## Reportes

`Reporters/AllureReporter.ts` prepara resultados y etiquetas. `Reporters/GenerarAllure.ts` debe aparecer después del adaptador en la configuración: espera que estén escritos resultados y adjuntos antes de generar el HTML. Conserva las fallas de las pruebas y devuelve una falla si el generador no termina correctamente. `Reporters/ExecutionReporter.ts` escribe JSON y distingue las precondiciones bloqueadas.

La configuración de Allure conserva el historial fuera del directorio HTML que se regenera. No cambiar esas rutas sin ajustar limpieza, scripts y documentación.

## Validar cambios

Desde la raíz del proyecto:

```powershell
pnpm typecheck
pnpm bdd:gen
pnpm test:framework
pnpm test:bdd
```

La suite técnica se agrega en `Config/playwright.config.ts`; `Workspace/Test Suites/catalog.ts` contiene únicamente suites de negocio. Los escenarios de `Validation/` no se seleccionan como casos normales: los invocan las pruebas de `Tests/` en runners separados.
