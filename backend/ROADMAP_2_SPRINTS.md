# Roadmap de Mejora (2 Sprints)

## Objetivo general

- Endurecer seguridad de backend para entorno real.
- Subir calidad técnica y observabilidad.
- Mantener cobertura alta y estabilidad en CI.

## Sprint 1 (Hardening + calidad base)

Duración sugerida: 1-2 semanas.

### 1) Seguridad crítica de transporte y dependencias

Prioridad: Alta

Tareas:

- Actualizar `nodemailer` a versión segura compatible.
- Eliminar `rejectUnauthorized: false` en `emailService`.
- Revisar configuración SMTP por entorno (`dev`, `prod`).

Criterio de cierre:

- `npm audit` sin vulnerabilidades altas en dependencias de correo.
- En producción, TLS no acepta certificados inválidos.

### 2) CORS y confianza de proxy

Prioridad: Alta

Tareas:

- Restringir `CORS` con whitelist configurable (`CORS_ORIGINS`).
- Revisar `trust proxy` y uso de IP real para rate limit/auditoría.
- Evitar dependencia directa de `x-forwarded-for` sin validación.

Criterio de cierre:

- Solo orígenes permitidos consumen API en producción.
- Rate limiting consistente detrás de proxy/reverse proxy.

### 3) Middleware de seguridad HTTP

Prioridad: Alta

Tareas:

- Añadir `helmet`.
- Añadir sanitización básica de inputs (NoSQL injection/XSS server-side).
- Revisar límites de payload y endpoints con mayor superficie.

Criterio de cierre:

- Cabeceras de seguridad activas.
- Pruebas de input malicioso bloqueadas en rutas críticas.

### 4) Contrato de errores unificado

Prioridad: Media

Tareas:

- Estandarizar formato de error: `success`, `code`, `error`, `details`.
- Mapear códigos para errores frecuentes (`AUTH_*`, `VALIDATION_*`, etc.).
- Ajustar respuestas en rutas principales.

Criterio de cierre:

- Frontend recibe errores previsibles y tipables.

### 5) CI mínimo obligatorio

Prioridad: Alta

Tareas:

- Crear workflow de CI con:
  - `npm ci`
  - `npm run test`
  - `npm run test:coverage:80`
  - `npm audit --omit=dev`

Criterio de cierre:

- Pull requests bloqueadas si falla calidad mínima.

## Sprint 2 (Rendimiento + observabilidad + robustez)

Duración sugerida: 1-2 semanas.

### 1) Observabilidad

Prioridad: Alta

Tareas:

- Logging estructurado (`pino` o `winston`).
- Correlation/request id por request.
- Mejorar logs de errores sin filtrar secretos.

Criterio de cierre:

- Logs útiles para depuración y auditoría en producción.

### 2) Métricas y salud operativa

Prioridad: Media

Tareas:

- Endpoint `/metrics` (Prometheus) con latencia, errores, throughput.
- Mejorar `/health` con checks de dependencias clave.

Criterio de cierre:

- Métricas disponibles y consumibles por monitorización.

### 3) Rendimiento de consultas

Prioridad: Alta

Tareas:

- Revisar índices Mongo de rutas más usadas (`recipes`, `users`, `news`).
- Reducir patrones N+1 en endpoints admin/listados.
- Añadir límites/paginación estrictos en todas las rutas listables.

Criterio de cierre:

- Menor latencia en listados y menos carga DB.

### 4) Cache externa (opcional si hay carga)

Prioridad: Media

Tareas:

- Mover cache in-memory crítica a Redis para escalado horizontal.
- TTL y estrategia de invalidación clara.

Criterio de cierre:

- Hit rate razonable y coherencia de datos aceptable.

### 5) Mejorar cobertura por ramas

Prioridad: Media

Tareas:

- Subir `branches` en rutas críticas (`recipes`, `users`, `reviews`).
- Añadir tests de contracto contra `openapi.json`.

Criterio de cierre:

- Cobertura más equilibrada (no solo lines/functions).

## Orden de ejecución recomendado (primeros 5 días)

1. `nodemailer` + TLS seguro.
2. `CORS` whitelist + proxy/IP.
3. `helmet` + sanitización.
4. CI pipeline base.
5. Normalización de errores en rutas `auth/users/recipes`.

