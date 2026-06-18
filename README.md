# Peer Code Review - Baatcheet Backend

This repository contains the backend for a real-time chat application. It provides user authentication, one-to-one chats, group chats, message APIs, and Socket.io events for live message delivery.

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- Socket.io
- JWT authentication with HTTP-only cookies

## Project Structure

```text
backend/
  server.js
  src/
    app.js
    config/database.js
    controllers/
    middlewares/
    models/
    routes/
```

## Setup

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Create an environment file:

```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string and JWT secret.

4. Start the development server:

```bash
npm run dev
```

The API runs on `http://localhost:3000` by default.

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Chats

- `POST /api/chat`
- `GET /api/chat`
- `POST /api/chat/group`
- `PUT /api/chat/rename`
- `PUT /api/chat/groupadd`
- `PUT /api/chat/groupremove`

### Messages

- `POST /api/message`
- `GET /api/message/:chatId`

## Review Notes

The peer review report is available in [CODE_REVIEW.md](CODE_REVIEW.md).
