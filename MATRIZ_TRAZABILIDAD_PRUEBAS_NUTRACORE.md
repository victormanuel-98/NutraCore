# Matriz de Trazabilidad de Pruebas - NutraCore

Fecha de actualizacion: 2026-05-09
Referencia funcional: `c:\Users\Usuario\Downloads\PlanPruebasFuncionalesNutraCore.pdf`

## Criterio

- `Automatica backend`: validado con Jest/Supertest/Mongo en memoria.
- `Automatica frontend`: validado con Playwright sobre navegador real.
- `Equivalente`: el caso no existe literalmente en UI automatizada, pero queda cubierto por el flujo tecnico equivalente.

## Matriz

| ID | Modulo | Cobertura | Evidencia principal | Estado |
| --- | --- | --- | --- | --- |
| AUTH-01 | Registro de usuario nuevo | Automatica backend | `backend/tests/e2e/functional-plan.e2e.test.js` | OK |
| AUTH-02 | Login con credenciales validas | Automatica backend + frontend | `backend/tests/e2e/functional-plan.e2e.test.js`, `frontend/tests/e2e/ux-feedback.spec.js` | OK |
| AUTH-03 | Login con credenciales invalidas | Automatica backend | `backend/tests/e2e/functional-plan.e2e.test.js` | OK |
| AUTH-04 | Ruta protegida sin token | Automatica backend | `backend/tests/e2e/functional-plan.e2e.test.js` | OK |
| AUTH-05 | Acceso admin | Automatica backend | `backend/tests/e2e/functional-plan.e2e.test.js` | OK |
| REC-01 | Crear receta completa | Automatica backend | `backend/tests/e2e/functional-plan.e2e.test.js` | OK |
| REC-02 | Campos obligatorios | Automatica backend | `backend/tests/e2e/functional-plan.e2e.test.js` | OK |
| REC-03 | Busqueda en catalogo | Automatica backend | `backend/tests/e2e/functional-plan.e2e.test.js` | OK |
| REC-04 | Edicion de receta propia | Automatica backend | `backend/tests/e2e/functional-plan.e2e.test.js` | OK |
| SEC-01 | Filtro de lenguaje inapropiado | Automatica backend | `backend/tests/e2e/functional-plan.e2e.test.js` | OK |
| NUT-01 | Calculo nutricional automatico | Automatica backend | `backend/tests/e2e/functional-plan.e2e.test.js` | OK |
| REC-05 | Soft delete | Automatica backend | `backend/tests/e2e/functional-plan.e2e.test.js` | OK |
| REC-06 | Restriccion de favoritos propios | Automatica backend | `backend/tests/e2e/functional-plan.e2e.test.js` | OK |
| REC-07 | Limites de contenido | Automatica backend | `backend/tests/e2e/functional-plan.e2e.test.js` | OK |
| REV-01 | Crear resena | Automatica backend | `backend/tests/e2e/functional-plan.e2e.test.js` | OK |
| REV-02 | Evitar multiples resenas | Automatica backend | `backend/tests/e2e/functional-plan.e2e.test.js` | OK |
| USR-01 | Actualizar perfil | Automatica backend | `backend/tests/e2e/functional-plan.e2e.test.js` | OK |
| USR-02 | Visualizacion de dashboard | Equivalente backend + frontend | `backend/tests/e2e/functional-plan.e2e.test.js`, `frontend/tests/e2e/ux-feedback.spec.js` | OK |
| UX-01 | Responsive formulario registro | Automatica frontend | `frontend/tests/e2e/responsive.spec.js` | OK |
| UX-02 | Responsive cards de catalogo | Automatica frontend | `frontend/tests/e2e/responsive.spec.js` | OK |
| UX-03 | Menu movil usable | Automatica frontend | `frontend/tests/e2e/responsive.spec.js` | OK |
| UX-04 | Feedback visual de carga | Automatica frontend | `frontend/tests/e2e/ux-feedback.spec.js` | OK |
| UX-05 | Mensaje amigable ante error de red | Automatica frontend | `frontend/tests/e2e/ux-feedback.spec.js` | OK |

## Resultados consolidados

- Backend global: `154/154` tests OK
- Frontend Playwright: `18` OK, `2` skipped por no aplicar al breakpoint
- Build frontend: OK

## Observacion funcional

El PDF indicaba bloqueo por exceso de `>5` imagenes o `25` ingredientes. La implementacion backend valida ahora el bloqueo de limites, pero el valor tecnico vigente en codigo para ingredientes es `20`, no `25`. Este punto debe reflejarse en la memoria para evitar incoherencias entre documento funcional y sistema implementado.
