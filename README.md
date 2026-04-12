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
- Backend enforces user role for:
	- `POST /api/transactions`
	- `DELETE /api/transactions/:id`
- Backend enforces admin role for:
	- `/api/admin/*`

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

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/transactions`
- `POST /api/transactions` (admin)
- `DELETE /api/transactions/:id` (admin)
