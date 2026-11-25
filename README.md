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

## Cómo probarlo

1. Entra a https://polymind-front.vercel.app e inicia sesión con la cuenta de prueba (o crea una cuenta en **Crear cuenta**).
2. **Decisiones → Nueva decisión**. Datos de ejemplo:
   - **Título de la decisión:** `Elegir plataforma para el sistema de inventario`
   - **Descripción del reto:** `La empresa necesita reemplazar su hoja de cálculo de inventario. Hay 15 usuarios, presupuesto anual de 20 millones de pesos y el equipo de TI tiene 2 personas con experiencia en Python.`
   - **Contexto adicional:** `El sistema debe estar en producción en 4 meses y conectarse con la facturación electrónica.`
   - **Alternativas a evaluar** (una por casilla; usa **＋ Añadir alternativa** para la tercera): `Desarrollo propio con Django`, `SaaS de inventario (Odoo)`, `Mejorar la hoja de cálculo actual`

   Pulsa **Guardar decisión**.
3. En el detalle, pulsa **Ejecutar análisis**. Se ven los pasos del análisis mientras los agentes trabajan.
4. Revisa el resultado:
   - la puntuación ponderada de cada alternativa y la recomendada;
   - la evaluación de cada agente con su justificación y la etiqueta **IA** o **Reglas**;
   - los **desacuerdos** entre agentes;
   - el aviso de **información insuficiente** cuando la descripción es muy corta;
   - el **informe ejecutivo**.
5. Usa **Editar** para cambiar la decisión y vuelve a analizarla. **Eliminar** pide confirmación.
6. En **Resumen** está el total de decisiones y el estado del sistema (API y IA).

## Cómo funciona

```
Angular (Vercel) ──REST + JWT──▶ FastAPI (Vercel) ──gRPC──▶ Orquestador
                                      │                     ├─ Agente financiero   (30 %)
                                      ▼                     ├─ Agente tecnológico  (30 %)
                               PostgreSQL (Neon)            ├─ Agente de impacto humano (20 %)
                                                            └─ Agente de riesgos   (20 %)
                                                                       │
                                                                       ▼
                                                             Agente analista ──▶ informe
```

1. **Agentes especialistas:** los cuatro evalúan todas las alternativas en paralelo, cada uno desde su perspectiva. Cada uno pide a Groq (`openai/gpt-oss-120b`) un JSON con puntuación de 1 a 10 y justificación por alternativa. Antes de usarlo, el backend comprueba que:
   - estén todas las alternativas;
   - las puntuaciones estén entre 1 y 10;
   - no haya justificaciones vacías ni alternativas inventadas.
   Si algo falla, ese agente usa sus reglas heurísticas.
2. **Agente analista:** pondera las puntuaciones, ordena las alternativas, detecta desacuerdos (4 puntos o más de diferencia) y vacíos de información. Groq redacta el informe ejecutivo; sin IA se genera un informe local.
3. **Sesión:** el access token se renueva solo con el refresh token cuando vence.
4. **Sin IA no se rompe nada:** cada paso tiene respaldo por reglas. Si el modelo configurado deja de existir, el backend prueba otro automáticamente.

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
