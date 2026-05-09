# Memoria Tecnica Resumida - NutraCore

Fecha de actualizacion: 2026-05-09

## 1. Objetivo del sistema

NutraCore es una plataforma web orientada a nutricion y bienestar que integra:

- autenticacion y control de acceso por roles
- catalogo y creacion de recetas con informacion nutricional
- sistema de resenas
- perfil y seguimiento basico de objetivos
- panel administrativo
- contenido informativo tipo noticias/blog

El objetivo academico del proyecto no es solo mostrar una interfaz, sino demostrar una solucion completa con reglas de negocio, arquitectura separada y validacion automatizada.

## 2. Arquitectura general

Frontend:

- React + Vite
- Enfoque SPA con rutas protegidas
- Contextos para autenticacion, tema y notificaciones

Backend:

- Node.js + Express
- MongoDB con Mongoose
- Middleware de autenticacion, RBAC, rate limiting y validacion

Separacion principal:

- `frontend/` contiene presentacion, navegacion y experiencia de usuario
- `backend/` contiene API, modelos, seguridad, reglas de negocio y pruebas

## 3. Decisiones tecnicas relevantes

Autenticacion:

- JWT para sesion
- proteccion de rutas privadas
- diferencia explicita entre usuario estandar y admin

Recetas:

- validacion de payload
- calculo nutricional automatico
- soft-delete en lugar de borrado duro
- restricciones de negocio como favorito propio no permitido

Resenas:

- una resena por usuario y receta
- recalculo de media y contador

Seguridad y robustez:

- `helmet`, `hpp`, `express-mongo-sanitize`
- rate limiting por areas funcionales
- errores API normalizados

## 4. Estrategia de validacion

La validacion se ha planteado en tres niveles:

- unit tests para piezas aisladas y utilidades
- integration tests para rutas y reglas backend
- E2E para flujos funcionales y comportamiento del frontend en navegador

Estado validado:

- Backend: `154/154` tests OK
- Frontend browser E2E: `18` OK, `2` skipped por no aplicar al breakpoint
- Build frontend: OK

La incorporacion de Playwright aporta evidencia real en:

- responsive design
- estados de carga
- manejo de errores de red

## 5. Mejoras introducidas en esta iteracion

- Se amplio el E2E de backend para cubrir casos del plan funcional.
- Se anadio Playwright al frontend para validar navegador real.
- Se alineo el proyecto a Node 20 en configuracion y CI.
- Se corrigio el manejo de errores de red en `apiClient`.
- Se ajusto el comportamiento de limites en recetas para bloquear excesos en lugar de truncarlos silenciosamente.

## 6. Riesgos y limitaciones conocidas

- La maquina local usada en esta revision corre con Node `22.18.0`; el proyecto queda preparado para Node `20.x`, que es la version recomendada y fijada en CI.
- El entorno local presento incidencias TLS al descargar dependencias y el navegador de Playwright. Esto afecta al entorno, no al codigo funcional de NutraCore.
- Existe una divergencia documental a revisar: el PDF menciona `25` ingredientes como umbral, mientras el backend implementa `20`.

## 7. Valor academico del TFG

Desde el punto de vista de tribunal, el valor del proyecto esta en que combina:

- arquitectura separada y mantenible
- negocio no trivial
- seguridad y validaciones reales
- pruebas automatizadas multinivel
- documentacion y trazabilidad entre requisitos y resultados

Esto lo situa como un TFG tecnicamente solido y defendible, especialmente ahora que la validacion no depende solo de pruebas manuales.
