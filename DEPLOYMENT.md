# Bookmate Free Deployment Guide

This setup keeps one codebase for local development and production. The app changes behavior only through environment variables.

## Recommended Free Stack

- Frontend: Vercel Hobby plan
- Backend: Render free web service
- Database: SQLite locally; Render Postgres or another hosted Postgres URL in production

You can also deploy the frontend to Netlify or GitHub Pages with the config files already included.

Note: free hosting tiers are good for student demos and portfolio projects, but they have limits. Render's own docs say free instances are for testing, hobby projects, and previews, not serious production traffic.

## Project Paths

```text
src/Bookmate.UI   React + Vite frontend
src/Bookmate.API  FastAPI backend
```

## Local Development

### Backend

```bash
cd src/Bookmate.API
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend docs:

```text
http://127.0.0.1:8000/docs
```

### Frontend

```bash
cd src/Bookmate.UI
npm ci
cp .env.example .env
npm run dev
```

Frontend app:

```text
http://localhost:5173
```

Local frontend config:

```env
VITE_API_URL=http://localhost:8000
```

No code changes are needed when you move to production. Change only `VITE_API_URL`.

## Backend Deployment: Render

Render can read the root `render.yaml`, or you can create the service manually.

### Manual Render Setup

1. Push this repo to GitHub.
2. In Render, create a new Web Service from the repo.
3. Set Root Directory:

```text
src/Bookmate.API
```

4. Set Build Command:

```bash
pip install -r requirements.txt
```

5. Set Start Command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

6. Add environment variables:

```env
APP_NAME=Bookmate
DEBUG=false
DATABASE_URL=<your-render-postgres-connection-string>
JWT_SECRET_KEY=<generate-a-long-random-secret>
ENABLE_SAMPLE_DATA=false
FRONTEND_URL=https://your-frontend-domain.vercel.app
BACKEND_CORS_ORIGINS=https://your-frontend-domain.vercel.app
OPENAI_API_KEY=<optional>
```

7. After deploy, verify:

```text
https://your-render-service.onrender.com/health
```

For a hosted Postgres database, set `DATABASE_URL` to the provider URL. The backend accepts common `postgres://` and `postgresql://` URLs and converts them for async SQLAlchemy automatically.

Do not rely on SQLite for hosted persistence on Render free web services. Free web services can restart and do not include persistent disks.

## Frontend Deployment: Vercel

1. Import the GitHub repo in Vercel.
2. Set Framework Preset to Vite.
3. Set Root Directory:

```text
src/Bookmate.UI
```

4. Vercel will use `vercel.json`.
5. Add environment variable:

```env
VITE_API_URL=https://your-render-service.onrender.com
```

6. Deploy. Every push or PR merge to `main` redeploys automatically through Vercel's GitHub integration.

The `vercel.json` rewrite sends all frontend routes to `index.html`, so refreshing `/library`, `/login`, etc. works.

## Frontend Fallback: Netlify

1. Import the GitHub repo in Netlify.
2. Set Base directory:

```text
src/Bookmate.UI
```

3. Build command:

```bash
npm run build
```

4. Publish directory:

```text
dist
```

5. Add:

```env
VITE_API_URL=https://your-render-service.onrender.com
```

The included `netlify.toml` and `public/_redirects` handle SPA routing.

## Frontend Fallback: GitHub Pages

The workflow at `.github/workflows/deploy.yml` builds and deploys `src/Bookmate.UI/dist`.

Before using it:

1. In GitHub, open Settings -> Pages.
2. Set Source to GitHub Actions.
3. Add repository secret:

```text
VITE_API_URL=https://your-render-service.onrender.com
```

The workflow also copies `index.html` to `404.html`, which fixes refreshes on React routes for GitHub Pages.

## CI/CD

Two workflows are included:

- `.github/workflows/ci.yml`: runs on pull requests to `main` and pushes to `main`; builds frontend and runs backend tests.
- `.github/workflows/deploy.yml`: deploys the frontend to GitHub Pages on pushes to `main`; use this if you choose GitHub Pages instead of Vercel/Netlify.

Backend redeploys automatically on Render when the connected GitHub branch changes.

## Environment Variable Summary

### Frontend

```env
VITE_API_URL=http://localhost:8000
```

Production:

```env
VITE_API_URL=https://your-render-service.onrender.com
```

### Backend

```env
APP_NAME=Bookmate
DEBUG=false
DATABASE_URL=<your-hosted-postgres-url>
JWT_SECRET_KEY=<long-random-secret>
ENABLE_SAMPLE_DATA=false
FRONTEND_URL=https://your-frontend-domain.vercel.app
BACKEND_CORS_ORIGINS=https://your-frontend-domain.vercel.app
OPENAI_API_KEY=<optional>
```

For multiple frontend origins, separate them with commas:

```env
BACKEND_CORS_ORIGINS=http://localhost:5173,https://your-frontend-domain.vercel.app
```

## What Changes Between Local And Production

Only environment variables change:

- Local UI calls `http://localhost:8000`
- Production UI calls your hosted backend URL
- Local backend reads `src/Bookmate.API/.env`
- Production backend reads platform environment variables
- CORS allows local frontend locally and production frontend in production
