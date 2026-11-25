# Polymind IA · Frontend

Aplicación web de Polymind IA construida con Angular 21 y TypeScript. Consume la API FastAPI del repositorio `Juanp-lucero/polymind-back`.

## Despliegue

Desplegado en Vercel:

| | URL | Repositorio |
|---|---|---|
| Aplicación (frontend) | https://polymind-front.vercel.app | [Juanp-lucero/polymind-front](https://github.com/Juanp-lucero/polymind-front) |
| API (backend) | https://polymind-back.vercel.app | [Juanp-lucero/polymind-back](https://github.com/Juanp-lucero/polymind-back) |
| Estado de la API | https://polymind-back.vercel.app/health | |
| Documentación de la API | https://polymind-back.vercel.app/docs | |

## Funcionalidades

- **Sesión:**
  - registro e inicio de sesión con JWT;
  - protección de rutas;
  - **renovación automática del token**: si el access token vence, se usa el refresh token y la petición se repite sin sacar al usuario (`core/api.service.ts`).
- **Dashboard** con estadísticas y decisiones recientes. El indicador lateral muestra el estado real del backend y si los agentes están usando IA (`/health`).
- **Decisiones:**
  - crear, **editar** y **eliminar** con confirmación;
  - entre 2 y 8 alternativas, sin repetidas y de máximo 200 caracteres cada una.
- **Análisis multiagente:**
  - mensajes de progreso por agente mientras se ejecuta;
  - al abrir una decisión se carga el análisis más reciente;
  - aviso de **información insuficiente** antes de analizar, con enlace para completarla.
- **Informe:**
  - síntesis ejecutiva;
  - **justificación** de cada puntuación;
  - etiqueta **IA** o **Reglas** en cada agente;
  - comparación ponderada;
  - aviso cuando los agentes **discrepan** fuertemente sobre una alternativa.
- Diseño responsive en español.

## Requisitos

- Node.js compatible con Angular 21.
- npm.
- Backend Polymind ejecutándose en `http://127.0.0.1:8000`.

## Instalación

```bash
npm install
npm start
```

Abre `http://localhost:4200`.

## Pruebas

```bash
npm test          # Vitest: servicios, guard, formulario y detalle de la decisión
```

Las pruebas cubren:
- la renovación automática del token;
- el guard de rutas;
- la validación y la edición de decisiones;
- la interpretación del análisis (fuente IA o reglas, desacuerdos e información faltante).


## Configuración del backend

La URL local se define en `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000',
};
```

Para otro entorno, cambia `apiUrl` por la URL pública de FastAPI. El backend debe permitir el origen del frontend en su configuración CORS.

## Endpoints consumidos

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /stats/`
- `GET /decisions/`
- `POST /decisions/`
- `GET /decisions/{id}`
- `POST /decisions/{id}/analyze`
- `GET /decisions/{id}/analyses`
- `GET /decisions/{id}/analyses/{analysis_id}/complete`

El frontend presenta las salidas del backend. El análisis multiagente y las puntuaciones se calculan en los servicios del backend, no en el navegador.

## Construcción

```bash
npm run build
```
