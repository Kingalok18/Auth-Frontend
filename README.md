# Auth-Frontend — Technical README

## Summary
This repository contains an authentication-focused frontend built with modern React + TypeScript and designed to integrate with a Spring Boot backend (Spring Security + OAuth2). The README documents architecture, repository layout, end-to-end authentication lifecycle, backend API contract, and security recommendations to help frontend and backend teams align.

## Scope
- Frontend: React + TypeScript app that: handles OAuth2 flows, normal username/password flows, callback handling, token management, protected API access, and logout.
- Backend (recommended): Spring Boot + Spring Security as OAuth2 Authorization/Resource server and/or as an OAuth2 client to external providers (Google, GitHub, etc.).

## Goals
- Provide a clear repo structure and component responsibilities for scalability.
- Define the expected backend contract (endpoints, cookies, tokens).
- Document full E2E auth lifecycle and security defaults.

---

## Repository Layout (recommended)

Top-level structure (important folders shown):

- `src/`
  - `api/` — HTTP client wrappers and typed API functions (e.g., `authClient.ts`, `userClient.ts`).
  - `auth/` — auth store, providers, hooks and utilities (`store.ts`, `useAuth.ts`).
  - `components/` — reusable UI components and small presentational pieces.
  - `pages/` — route-level components (Login, Signup, OAuthSuccess, OAuthFailure, UserHome).
  - `config/` — API client configuration, environment mappings.
  - `lib/` — small utilities used across the app.
  - `models/` — TypeScript types/interfaces for request/response payloads.
  - `services/` — business-facing services (AuthService with high-level flows).
  - `public/` — static assets and redirect HTML if needed for some OAuth flows.

Keep `api/` functions small and typed; centralize error handling and token injection here.

---

## High-level Architecture & Interaction

1. User clicks provider (e.g., Google) on the frontend.
2. Frontend opens backend OAuth2 authorization entry (e.g., `GET /oauth2/authorize/google`) or redirects directly to the provider depending on auth architecture.
3. Provider authenticates the user and redirects back to backend callback (e.g., `/oauth2/callback`) which finalizes the flow and issues tokens.
4. Backend sets a secure, HttpOnly refresh cookie and (optionally) returns a short-lived access token in JSON or as another cookie.
5. Frontend receives success callback (or token payload) and initializes an in-memory session for the access token. Protected API requests include the access token in `Authorization: Bearer <token>`.
6. When access token expires, frontend calls `POST /api/auth/refresh` (the refresh cookie is sent automatically) to obtain a new access token.
7. Logout triggers `POST /api/auth/logout` which clears cookies and invalidates server-side session/refresh tokens.

Diagram (text):

Frontend <-> Backend <-> OAuth Provider
  - user -> backend -> provider
  - provider -> backend callback -> backend issues tokens -> frontend

---

## Suggested Backend Model (Spring stack)

- Use **Spring Boot** with **Spring Security**.
- Configure Spring Security to act as:
  - OAuth2 Client for social logins (Google, GitHub) OR
  - Authorization Server / Resource Server depending on your deployment.
- Key Spring modules: `spring-boot-starter-security`, `spring-security-oauth2-client`, `spring-security-oauth2-resource-server`, and optionally `spring-boot-starter-oauth2-authorization-server` when self-hosting auth.

Backend responsibilities:
- Manage OAuth2 client registrations.
- Handle provider callbacks, mapping provider user info to local user records.
- Issue JWT access tokens (short-lived) and maintain refresh tokens server-side (or issue HttpOnly refresh cookies).
- Protect resource endpoints (`/api/**`) with access token checking.

---

## End-to-End Auth Lifecycle (detailed)

1. Initiation
   - Frontend: user clicks provider button.
   - Frontend opens backend endpoint `GET /oauth2/authorize/{provider}` OR redirects to provider if you use pure client-side authorization.

2. Provider Auth
   - Provider authenticates user and redirects to backend callback.

3. Backend Callback
   - Backend exchanges authorization code for provider tokens, fetches user info, creates/updates local user, and issues application tokens.
   - Backend sets a **Secure, HttpOnly** cookie for refresh token and returns a short-lived access token in the response body (or as a cookie depending on preference).

4. Frontend Session Init
   - Frontend reads response from callback endpoint and stores the access token in memory (e.g., React state/context). Do NOT persist access tokens to localStorage.

5. Access Protected APIs
   - Frontend attaches `Authorization: Bearer <access_token>` header to protected API requests.

6. Token Refresh
   - When the access token is near expiry or receives 401, frontend calls `POST /api/auth/refresh`.
   - Server reads the refresh cookie, validates, and issues a new access token (and optionally rotates the refresh token cookie).

7. Logout
   - Frontend calls `POST /api/auth/logout`.
   - Backend clears refresh cookie, invalidates server-side refresh token/session, and returns a 200.

---

## Security Defaults & Recommendations

- Cookies
  - Refresh token cookie: `HttpOnly`, `Secure`, `SameSite=Strict` (or `Lax` if cross-site redirects required), path scoped to your API root.
  - If you place any token in cookie accessible to JS (not recommended), encrypt and minimize lifetime.

- Access Token Handling
  - Keep access tokens in memory (React context) only. Avoid localStorage/sessionStorage to reduce XSS risk.
  - Access tokens: short lifetime (5–15 minutes) — use refresh flow for seamless UX.

- Refresh Token Handling
  - Store refresh token server-side and/or set as HttpOnly cookie. Consider refresh token rotation and one-time-use refresh tokens.

- CORS and CSRF
  - If using cookies for auth (refresh tokens), protect state-changing endpoints with CSRF tokens.
  - For APIs using `Authorization` header-based Bearer tokens, CSRF risk is lower; nevertheless, enable strict CORS rules and validate origins.

- TLS
  - Enforce HTTPS (terminate TLS at load balancer or web server). Do not send sensitive cookies without `Secure`.

- Token Signing & Validation
  - Sign JWT access tokens with a strong asymmetric key pair (RS256) if tokens are validated by multiple services.
  - Validate scopes and claims on the resource server.

---

## Suggested Backend Endpoint Contract (frontend-aligned)

- OAuth2 Authorization Entry
  - `GET /oauth2/authorize/{provider}`
    - Redirects user to the provider's authorization page (or returns a URL).

- OAuth2 Callback
  - `GET /oauth2/callback?code=...&state=...`
    - Backend processes provider code, issues tokens, sets refresh cookie, and redirects to frontend success route with optional short-lived token payload.

- Refresh
  - `POST /api/auth/refresh`
    - Request: cookie with refresh token.
    - Response: `{ accessToken: string, expiresIn: number }` or `204` with new cookie.

- Get Current User
  - `GET /api/user/me`
    - Headers: `Authorization: Bearer <accessToken>`
    - Response: current user profile.

- Logout
  - `POST /api/auth/logout`
    - Request: cookie or Authorization header.
    - Response: clears cookie and returns success.

- Optional: Username/Password login (if offered)
  - `POST /api/auth/login` { username, password }
    - Response: issues access token in body and sets refresh cookie.

---

## Frontend Implementation Notes

- `AuthService` responsibilities:
  - Kick off provider auth, handle callback processing, store access token in context, call refresh endpoint, handle logout and error flows.
- `useAuth()` hook:
  - Provides `user`, `isAuthenticated`, `login`, `logout`, `getAccessToken()` and handles background token refresh.
- API client (`api/authClient.ts`):
  - Automatically injects `Authorization` header when `getAccessToken()` provides a token.
  - On 401, attempt `refresh()` then retry the request once.

---

## Local Development & Testing

- Redirect URIs: For OAuth providers, use a tunneling tool (e.g., `ngrok`) if the backend is local and provider requires a public redirect URL.
- Env variables:
  - `VITE_API_BASE_URL` — frontend uses this for API calls.
  - `VITE_OAUTH_REDIRECT_URL` — where providers send users back (backend callback URL is recommended).

Dev commands (example):

```bash
# from repo root
cd auth-frontend
npm install
npm run dev
```

---

## Deployment Notes

- Frontend can be hosted on CDN or static host (Netlify, Vercel, S3+CloudFront). Backend must be reachable at the configured `VITE_API_BASE_URL`.
- Set cookie domain carefully when frontend and backend are on different subdomains.

---

## Quick Alignment Checklist (frontend ↔ backend)

- Agree on which side initiates OAuth (frontend direct -> provider vs backend-initiated redirect).
- Decide where to store refresh tokens (server-side store + HttpOnly cookie vs long-lived cookie).
- Standardize endpoint contract: callback route, refresh, logout, `GET /api/user/me`.
- Confirm CORS and SameSite cookie behavior across dev and production domains.

---

If you want, I can:
- Update the `src/` scaffolding to match the suggested layout.
- Add example `AuthService` and `useAuth` hook implementations.
- Commit this README and provide `git` commands to push to your GitHub repo.

