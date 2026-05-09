# Reporte de Pruebas Automatizadas - NutraCore

Fecha de ejecucion principal: 2026-05-09
Fuente funcional revisada: `c:\Users\Usuario\Downloads\PlanPruebasFuncionalesNutraCore.pdf`

## 1. Resumen ejecutivo

Se reviso el plan funcional del PDF y se contrasto con el estado real del repositorio. A partir de esa revision se ampliaron las pruebas para cubrir los huecos mas relevantes de cara al TFG:

- E2E funcional de backend alineado con AUTH, REC, SEC, NUT, REV y USR.
- E2E real de frontend con navegador usando Playwright.
- Validacion responsive en `375x667`, `393x852`, `768x1024` y desktop `1280px+`.
- Comprobacion de estados de carga y manejo amigable de errores de red.
- Alineacion de entorno con Node 20 en raiz y frontend, y pipeline dedicada de frontend E2E.

## 2. Cambios implementados

Backend:

- Nueva suite funcional: `backend/tests/e2e/functional-plan.e2e.test.js`
- Refuerzo de `REC-07`: el backend ya no recorta silenciosamente ingredientes, pasos o imagenes por encima del limite antes de validar; ahora bloquea la operacion y devuelve error de validacion.

Frontend:

- Nueva infraestructura Playwright:
  - `frontend/playwright.config.js`
  - `frontend/tests/e2e/responsive.spec.js`
  - `frontend/tests/e2e/ux-feedback.spec.js`
  - `frontend/tests/e2e/support/mockApi.js`
- Ajuste de estabilidad para E2E:
  - `frontend/src/App.jsx`
- Mejora funcional real:
  - `frontend/src/services/apiClient.js` ahora traduce tambien errores de red cuando `fetch` falla antes de recibir respuesta.

Entorno y CI:

- `.nvmrc` en raiz con Node 20
- `engines.node = 20.x` en raiz y frontend
- Nueva pipeline: `.github/workflows/frontend-e2e.yml`

## 3. Evidencia de ejecucion

Comandos ejecutados:

- `npm --prefix frontend run build`
- `npm --prefix frontend run test:e2e`
- `npm --prefix backend run test:e2e`
- `npm --prefix backend run test`

Resultados verificados:

- Frontend build: OK
- Frontend Playwright E2E: `20` tests totales, `18` OK, `2` skipped
- Backend E2E: `8` tests OK
- Backend global: `21` suites, `154` tests OK

Detalle de `skipped` en frontend:

- Los 2 casos omitidos corresponden al test de menu movil en proyectos `tablet-ipad` y `desktop`, donde no aplica por definicion del breakpoint.

## 4. Cobertura frente al plan funcional

Cobertura automatizada ya validada:

- AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
- REC-01, REC-02, REC-03, REC-04, REC-05, REC-06, REC-07
- SEC-01, NUT-01
- REV-01, REV-02
- USR-01, USR-02
- UX responsive, loading states y network error handling

Documento de trazabilidad detallado:

- `MATRIZ_TRAZABILIDAD_PRUEBAS_NUTRACORE.md`

Documento de apoyo para memoria/defensa:

- `MEMORIA_TECNICA_TFG_NUTRACORE.md`

## 5. Hallazgos de entorno y acciones tomadas

- Faltaban dependencias efectivas de backend para ejecutar las suites (`swagger-ui-dist`, `node-mailjet`). Se normalizo el entorno con instalacion de dependencias.
- La maquina actual ejecuto con Node `22.18.0`, mientras el proyecto declara Node `20.x`. Para dejarlo redondo de cara al TFG se anclo Node 20 en:
  - `.nvmrc`
  - `package.json` raiz
  - `frontend/package.json`
  - workflows de CI
- La descarga de dependencias y del navegador de Playwright estuvo afectada por un problema TLS del entorno (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`). Se resolvio unicamente para la instalacion local y se deja registrado como incidencia de entorno, no de la aplicacion.

## 6. Conclusiones

El proyecto queda en un estado claramente mas solido para un TFG porque ahora no solo tiene logica y pruebas de backend, sino tambien evidencia automatizada de comportamiento real del frontend en navegador y en distintos breakpoints.

Estado final tras esta iteracion: APTO para defensa tecnica, con trazabilidad clara y validacion automatizada reproducible.
