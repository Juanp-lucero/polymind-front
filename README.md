# Polymind IA · Frontend

Aplicación web de Polymind IA construida con Angular 21 y TypeScript. Consume la API FastAPI del repositorio `Juanp-lucero/polymind-back`.

## Funcionalidades

- Registro e inicio de sesión con JWT.
- Sesión de usuario y protección de rutas.
- Dashboard con estadísticas y decisiones recientes.
- Creación y consulta de decisiones con múltiples alternativas.
- Ejecución de análisis multiagente a través del backend.
- Historial, informe ejecutivo, recomendaciones, evaluaciones individuales y comparación ponderada.
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
