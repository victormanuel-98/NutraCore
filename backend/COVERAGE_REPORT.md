# Backend Coverage Report

## Estado actual

Resultado de `npm run test:coverage:80`:

- Statements: `80.24%`
- Lines: `82.64%`
- Functions: `83.85%`
- Branches: `58.67%`

Tests:

- Suites: `19`
- Tests: `120`
- Estado: `passing`

## Cobertura por módulo (resumen)

- `routes/`: `78.19% stmts`, `63.5% branches`, `87.5% funcs`, `80.69% lines`
- `services/`: `84.61% stmts`, `52.8% branches`, `89.65% funcs`, `87.72% lines`
- `middleware/`: `88.54% stmts`, `66.66% branches`, `90.9% funcs`, `91.35% lines`
- `config/`: `75.38% stmts`, `47.61% branches`, `100% funcs`, `78.33% lines`
- `models/`: `80.74% stmts`, `28.12% branches`, `48.27% funcs`, `81.34% lines`

Archivos de rutas con mayor impacto pendiente:

- `routes/recipes.js`: `78.06% stmts`, `65.18% branches`, `82.22% funcs`, `82.58% lines`
- `routes/news.js`: `68.53% stmts`, `57.69% branches`, `88.88% funcs`, `68.53% lines`
- `routes/dishes.js`: `68.35% stmts`, `54.83% branches`, `85.71% funcs`, `70.12% lines`
- `routes/reviews.js`: `73.21% stmts`, `45% branches`, `83.33% funcs`, `72.72% lines`

## Riesgos pendientes (zonas no cubiertas)

1. Flujos de error y edge-case en rutas de catálogo:
- `news` y `dishes` aún tienen ramas de errores de DB y escenarios de filtros avanzados no cubiertos.

2. Ramas complejas en recetas:
- `recipes` tiene lógica extensa (cache, ownership, restore, validaciones y combinaciones de query params) con ramas aún abiertas.

3. Modelos con hooks/métodos parcialmente cubiertos:
- `Recipe`, `Review`, `User` mantienen ramas internas no cubiertas (especialmente hooks y caminos alternos).

4. Branches bajos en servicios con integración externa:
- `openFoodFactsService` tiene buena cobertura de líneas, pero ramas (timeouts/reintentos/combinaciones de fallback) siguen siendo costosas.

## Plan de mejora (2 iteraciones)

### Iteración 1 (rápida, alto impacto)

Objetivo:

- Llevar `branches` global a ~`63-66%`.

Acciones:

- Añadir tests dirigidos a ramas de `routes/news.js`, `routes/dishes.js`, `routes/reviews.js`.
- Cubrir escenarios de error adicionales en `routes/recipes.js`:
  - combinaciones de filtros (`favorites`, `author`, `search`) y errores de persistencia.

Resultado esperado:

- Subida visible de `branches` sin cambios de arquitectura.

### Iteración 2 (profunda, consolidación)

Objetivo:

- Llevar `branches` global a ~`68-72%`.

Acciones:

- Expandir tests de `services/openFoodFactsService.js` para caminos de timeout, JSON inválido y fallback por tags.
- Añadir pruebas de hooks/métodos en `models/Recipe.js` y `models/Review.js` (pre/post save y agregaciones).
- Refuerzo de rutas administrativas de `users` para ramas negativas específicas.

Resultado esperado:

- Mayor robustez en caminos no felices y reducción de riesgo de regresiones.

## Comandos útiles

- Suite completa:
  - `npm test`
- Cobertura informativa:
  - `npm run test:coverage`
- Cobertura umbral actual:
  - `npm run test:coverage:80`
