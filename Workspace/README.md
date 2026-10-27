# Workspace del tester

Aquí están las carpetas que usas para crear y mantener las pruebas. El motor y sus hooks viven en `../Framework/`; las dependencias están en `../node_modules/`.

| Quiero trabajar con… | Carpeta |
| --- | --- |
| Casos TypeScript | `Test Cases/` |
| Escenarios BDD | `Features/` |
| Implementación de los pasos BDD | `Step Definitions/` |
| Suites y etiquetas | `Test Suites/` |
| Elementos de las pantallas | `Object Repository/` |
| Acciones reutilizables | `CustomActions/` |
| Datos de prueba | `Data Set/` |
| Entradas de test y pasos BDD | `TestListeners/` |
| URLs y perfiles Prod / QA dummy | `Profiles/` |
| Resultados, historial y evidencias | `Reportes/` |

Desde la raíz de la solución:

```powershell
pnpm ambiente prod test:bdd:smoke
pnpm ambiente qa test:bdd:smoke --list
pnpm report:allure
```

Si abriste la terminal directamente en esta carpeta:

```powershell
pnpm --dir .. ambiente prod test:bdd:smoke
pnpm --dir .. report:allure
```


Consulta el [README completo](../README.md) para instalar, configurar datos, escribir casos y usar FailureHandling. La distribución de responsabilidades está en [ARQUITECTURA.md](../ARQUITECTURA.md).
