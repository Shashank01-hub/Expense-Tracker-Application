# Project01 - Full Stack Finance Dashboard

This project is now a proper frontend + backend application:

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Auth: JWT-based registration/login
- Authorization: role-based access (admin-only actions)

## Features

- Register a new account
- Login for existing users
- Secure session with JWT
- User-only transaction create/delete
- Admin panel for user management and activity monitoring
- Dark mode and dashboard insights/charts

## Project Structure

- `frontend/`: React + Vite app
- `backend/`: Express API and MongoDB models

## Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string

## Setup

1. Install frontend dependencies:

```bash
npm --prefix frontend install
```

2. Install backend dependencies:

```bash
npm --prefix backend install
```

3. Configure backend environment:

- Copy `backend/.env.example` to `backend/.env`
- Update values:
	- `MONGODB_URI`
	- `JWT_SECRET`
	- `ADMIN_INVITE_CODE`
	- `FRONTEND_ORIGIN`

4. Configure frontend environment:

- Copy `frontend/.env.example` to `frontend/.env`
- For production, set:
	- `VITE_API_BASE_URL=https://your-backend-domain`

## Production Environment Files

- Backend production template: `backend/.env.production.example`
- Frontend production template: `frontend/.env.production.example`
- Create real files from these templates before deployment.

## Run in Development

Start backend:

```bash
npm run dev:backend
```

Start frontend (new terminal):

```bash
npm run dev
```

Frontend runs on Vite (`http://localhost:5173`) and proxies `/api` to backend (`http://localhost:5000`).

You can also run frontend directly from its folder:

```bash
npm --prefix frontend run dev
```

## Admin Access Rules

- Registration creates `user` role by default
- Registration gets `admin` role only when valid `adminInviteCode` is submitted
- Registration now sends a one-time email verification code before login is allowed
- Backend enforces user role for:
	- `POST /api/transactions`
	- `DELETE /api/transactions/:id`
- Backend enforces admin role for:
	- `/api/admin/*`

## Email Verification Setup

To send verification OTP emails, configure SMTP values in `backend/.env`:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

If SMTP values are missing in development, the backend logs the code to the console so you can still test the flow locally.

## Production Checklist

- Set `NODE_ENV=production` in backend
- Use strong values for `JWT_SECRET` and `ADMIN_INVITE_CODE`
- Set `SEED_ON_START=false` in production
- Set `ALLOW_DB_FALLBACK=false` in production
- Set strict `FRONTEND_ORIGIN` to deployed frontend domain(s)
- Set `VITE_API_BASE_URL` to deployed backend URL
- Rotate any previously exposed credentials before deployment
- Ensure `.env` files are not committed to git

## Build For Deployment

Build frontend assets:

```bash
npm run build
```

Start backend in production mode:

```bash
npm run start:backend
```

## Docker (Containerized Run)

This repo now includes Docker setup for both services:

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `frontend/nginx.conf` (serves frontend and proxies `/api` to backend)
- `docker-compose.yml`

Build and run both containers:

```bash
docker compose up --build
```

Run in detached mode:

```bash
docker compose up --build -d
```

Stop containers:

```bash
docker compose down
```

After startup:

- Frontend: `http://localhost:5173`
- Backend API (direct): `http://localhost:5001`

Note: `docker-compose.yml` uses `backend/.env` for backend environment variables.

## GitHub Actions CI/CD

This repository includes a ready workflow at `.github/workflows/ci-cd.yml`.

Pipeline behavior:

- On every push and pull request:
	- Builds backend Docker image
	- Builds frontend Docker image
- On push to `main`:
	- Pushes backend image to GHCR
	- Pushes frontend image to GHCR

Published image names:

- `ghcr.io/<github-username>/project01-backend:latest`
- `ghcr.io/<github-username>/project01-backend:<commit-sha>`
- `ghcr.io/<github-username>/project01-frontend:latest`
- `ghcr.io/<github-username>/project01-frontend:<commit-sha>`

How to use:

1. Push this repository to GitHub.
2. Ensure default branch is `main` (or update workflow condition if using another branch).
3. In GitHub repository settings:
	 - Actions permissions should allow read/write for packages.
4. Push code or open a pull request to trigger CI.
5. Merge to `main` to trigger image publish (CD).

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/transactions`
- `POST /api/transactions` (admin)
- `DELETE /api/transactions/:id` (admin)
