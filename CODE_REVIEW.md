# Repository Review Report

## Repository

- Project: Baatcheet / Peer Code Review
- Reviewed fork: `rohitpokhariya10/Peer-Code-Review`
- Original repository: `Abdul-Ayub-Ali/BAATCHEET`
- Review type: Backend code review

## Summary

The backend has a clear MVC-style structure with separate folders for routes, controllers, models, middleware, and database configuration. The main features are user authentication, one-to-one chats, group chats, message storage, and real-time delivery through Socket.io.

Overall, the project direction is good, but a few issues were important for correctness, security, and maintainability.

## What Works Well

- Routes, controllers, models, and middleware are separated cleanly.
- Passwords are hashed before saving users.
- JWT authentication middleware protects chat and message routes.
- Mongoose schemas use timestamps, which helps with chat ordering and debugging.
- Message creation updates `latestMessage`, which is useful for chat list UI.

## High Priority Findings

### 1. Socket.io server was not actually listening

`server.js` created an HTTP server and attached Socket.io to it, but the app was started with `app.listen(...)`. That means Express routes could run, but Socket.io would not be served from the created HTTP server.

Status: Fixed by changing startup to `server.listen(...)`.

### 2. Message APIs allowed access by chat ID only

The message endpoints accepted a `chatId`, but did not verify that the logged-in user was part of that chat. A user who guessed or obtained another chat ID could fetch or send messages in that chat.

Status: Fixed by checking chat membership before sending or fetching messages.

### 3. Secrets should not be committed

The repository contains a `.env` file. Environment files can include MongoDB URLs, JWT secrets, and other private values. These should stay local and should not be pushed to GitHub.

Status: Added `.gitignore` and `.env.example`.

Recommended next step: remove the tracked `.env` file from Git history or rotate any exposed credentials if this was already pushed.

## Medium Priority Findings

### 4. Cookie options were too loose

Auth cookies were set without `httpOnly`, `sameSite`, or `secure` options. That increases risk in browser-based authentication.

Status: Improved by adding shared cookie options.

### 5. CORS origin was hard-coded

The backend allowed only `http://localhost:5173`. This works locally but becomes painful when deployed.

Status: Improved by using `FRONTEND_URL` from environment variables.

### 6. Group admin authorization needed more protection

Group rename, add-user, and remove-user endpoints should verify that the requester is allowed to perform that action. Currently the routes are authenticated, but authorization rules should be stricter for group management.

Status: Improved by requiring the group admin for rename/add/remove-other-user actions. A user can still remove themselves from a group.

## Low Priority Suggestions

- Add request validation for email format, password length, and MongoDB ObjectId values.
- Add a central error-handling middleware to reduce repeated `try/catch` response code.
- Replace mixed Hindi/English implementation comments with consistent professional comments before submission.
- Add tests for auth, chat access, message sending, and unauthorized message access.
- Add API documentation with sample request/response bodies.

## Changes Made In This Review

- Fixed Socket.io startup by using `server.listen`.
- Made CORS configurable with `FRONTEND_URL`.
- Added secure HTTP-only cookie options.
- Removed debug logging from login.
- Added membership checks for message send/fetch endpoints.
- Added group admin checks for group management endpoints.
- Added README documentation.
- Added `.env.example`.
- Added `.gitignore` for local secrets and dependencies.

## Final Recommendation

The repository is a good backend foundation for a real-time chat app. Before final submission or deployment, the biggest remaining improvements are removing committed secrets from Git history, adding request validation, and adding tests for protected chat/message behavior.
