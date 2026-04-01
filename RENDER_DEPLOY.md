# CURABOT Render Deployment

This repo is prepared for a Render monorepo deploy:

- `curabot-backend` as a `Web Service`
- `curabot-frontend` as a `Static Site`

The repo now includes:

- a root `package.json` so Render can run from the repo root if needed
- a pinned Node version in `.node-version`
- a `render.yaml` blueprint for both services
- frontend build-time env validation so broken API URLs fail early

## 1. Recommended: Deploy with Blueprint

1. Push this repo to GitHub.
2. In Render, choose `New +` -> `Blueprint`.
3. Select this repository.
4. Render will read [`render.yaml`](./render.yaml) and create both services.

## 2. Manual Render Settings

### Backend

- Service type: `Web Service`
- Runtime: `Node`
- Root Directory: `Backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/healthz`

### Frontend

- Service type: `Static Site`
- Root Directory: `Frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `build`

Render rewrite rule for React Router:

- Source: `/*`
- Destination: `/index.html`
- Action: `Rewrite`

## 3. Required Environment Variables

### Backend

- `NODE_ENV=production`
- `MONGODB_URI=your-mongodb-atlas-connection-string`
- `JWT_SECRET=your-long-random-secret`
- `GEMINI_API_KEY=your-gemini-api-key`

Recommended:

- `CLIENT_URL=https://your-frontend.onrender.com`
- `ALLOWED_ORIGINS=https://your-frontend.onrender.com`
- `GEMINI_MAX_OUTPUT_TOKENS=1400`
- `GEMINI_REQUEST_TIMEOUT_MS=45000`

Optional legacy integration:

- `ML_API_URL=https://your-ml-service.onrender.com`

### Frontend

- `REACT_APP_API_URL=https://your-backend-service.onrender.com/api`

Optional:

- `REACT_APP_SOCKET_URL=https://your-backend-service.onrender.com`

If `REACT_APP_SOCKET_URL` is omitted, the app derives it from `REACT_APP_API_URL`.

## 4. Deployment Order

1. Deploy the backend first.
2. Copy the backend Render URL.
3. Set frontend `REACT_APP_API_URL` to `https://your-backend-url.onrender.com/api`.
4. Deploy the frontend.
5. Copy the frontend Render URL.
6. Set backend `CLIENT_URL` and `ALLOWED_ORIGINS` to the frontend URL.
7. Redeploy the backend.

## 5. Important Notes

- Do not set `PORT` on Render. Render injects it automatically.
- The backend now fails fast in production if `MONGODB_URI`, `JWT_SECRET`, or `GEMINI_API_KEY` are missing.
- The frontend build now fails fast if `REACT_APP_API_URL` is missing.
- Do not use `localhost` in Render environment variables.
- Node is pinned with [`.node-version`](./.node-version) to keep deploys stable.

## 6. Root-Level Fallback Commands

If you accidentally point Render at the repo root instead of a subdirectory:

- Backend build command: `npm install`
- Backend start command: `npm start`
- Frontend build command: `npm install && npm run build`
- Frontend publish directory: `Frontend/build`

Using `Backend` and `Frontend` as the service root directories is still the cleaner setup.
