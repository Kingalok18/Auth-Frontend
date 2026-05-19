# Auth-Frontend

Authentication-first web application architecture using:

- **Frontend:** React + shadcn/ui
- **Backend:** Spring Boot + Spring Security + OAuth2
- **Auth transport:** cookies, session, and token-based patterns

---

## High-Level Architecture

```text
┌───────────────────────────────────────────────────────────────────────┐
│                          Client (Browser)                             │
│                  React + shadcn/ui components                         │
└───────────────────────────────┬───────────────────────────────────────┘
                                │ HTTPS
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    Spring Boot API Gateway/App                        │
│             Spring Security Filter Chain + OAuth2 Login               │
└───────────────┬──────────────────────────────┬────────────────────────┘
                │                              │
                ▼                              ▼
     Session/Cookie Store               Token Services (JWT/Opaque)
      (HttpOnly/Secure cookie)        (issue, validate, refresh, revoke)
                │                              │
                └───────────────┬──────────────┘
                                ▼
                       Business Services + DB
```

---

## Backend Architecture (Spring + Spring Security + OAuth2)

### Core Layers

1. **Controller Layer**
   - Exposes auth endpoints (`/login`, `/logout`, `/me`, `/refresh`).
   - Exposes protected business APIs.

2. **Security Layer**
   - Spring Security filter chain for request authentication/authorization.
   - OAuth2 client/resource server integration.
   - Role/authority mapping.

3. **Token & Session Layer**
   - Access token validation.
   - Refresh token rotation/revocation.
   - Session creation and invalidation.

4. **Service & Persistence Layer**
   - User profile and domain logic.
   - User/session/token metadata persistence.

### Auth Modes Supported

- **Session + Cookie**
  - After login, backend creates session.
  - Session ID is stored in `HttpOnly`, `Secure`, `SameSite` cookie.
  - Spring Security uses session context for subsequent requests.

- **OAuth2 + Token**
  - OAuth2 login/authorization flow issues tokens.
  - Access token used for API authorization.
  - Refresh token used to renew access token.

- **Hybrid**
  - Session for browser UX + token endpoints for API/mobile integrations.

### Recommended Security Controls

- Enforce HTTPS only.
- Use `HttpOnly` + `Secure` + strict `SameSite` for auth cookies.
- Enable CSRF protection for cookie/session-based flows.
- Set short-lived access tokens and rotating refresh tokens.
- Centralize logout to clear session + revoke refresh tokens.

---

## Frontend Architecture (React + shadcn/ui)

### UI Layer

- React app with route-level auth guards.
- shadcn/ui for accessible, reusable auth UI:
  - login form
  - signup form
  - OTP/verification dialogs
  - account/session settings

### State & Auth Flow

1. User submits credentials in React form.
2. Frontend sends request to Spring auth endpoint.
3. Backend returns:
   - secure session cookie (cookie/session flow), or
   - access/refresh token response (token flow), or both.
4. Frontend:
   - reads profile via `/me`,
   - stores minimal client auth state (user, roles, auth status),
   - refreshes token/session when needed.
5. Protected routes render only when user is authenticated.

### Frontend Security Practices

- Do not store sensitive tokens in localStorage when cookie flow is available.
- Prefer server-managed `HttpOnly` auth cookies for browser sessions.
- Use centralized API client interceptors for refresh/retry logic.
- Handle unauthorized responses by redirecting to login and clearing local state.

---

## End-to-End Login Sequence

```text
React Login Page -> Spring Security Auth Endpoint -> OAuth2 Provider (optional)
       <- session cookie / token response <-
React /me fetch -> authorized backend request -> user data returned
```
