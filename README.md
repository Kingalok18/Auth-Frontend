# Auth-Frontend

Frontend application for authentication flows integrated with a Spring Boot backend.

## Project Structure

> Current repository is minimal. Use this as the target structure as the app grows.

```text
Auth-Frontend/
├── public/                     # Static assets
├── src/
│   ├── api/                    # API clients (auth, user, token refresh)
│   ├── components/             # Reusable UI components
│   ├── pages/                  # Route/page-level components
│   ├── hooks/                  # Custom hooks (auth/session logic)
│   ├── context/                # Global state (AuthContext, AppContext)
│   ├── utils/                  # Utility helpers
│   ├── styles/                 # Global and shared styles
│   ├── constants/              # App constants (routes, endpoints)
│   ├── App.*                   # Main app entry component
│   └── main.* / index.*        # App bootstrap
├── .env*                       # Environment variables
├── package.json                # Dependencies and scripts
└── README.md                   # Project documentation
```

## Backend Integration (Spring Boot)

This frontend is intended to work with a backend built using:

- **Spring Boot**
- **Spring Security**
- **OAuth2** (Google/GitHub/other providers)
- **Cookies + JWT tokens**

### Typical Auth Flow

1. User opens frontend login page.
2. Frontend redirects user to backend OAuth2 authorization endpoint.
3. Backend handles OAuth2 login via Spring Security.
4. On successful login, backend:
   - creates/accesses user session,
   - issues access token (and optional refresh token),
   - sets secure HttpOnly cookies when cookie-based auth is used.
5. Frontend calls protected APIs with:
   - cookie-based session automatically, or
   - `Authorization: Bearer <token>` when token-based flow is used.
6. On token expiry, frontend triggers refresh flow (refresh endpoint/cookie).
7. Logout clears backend session/cookies/tokens.

## Security Notes

- Prefer **HttpOnly + Secure + SameSite** cookies for sensitive tokens.
- Enable **CORS** correctly for frontend origin.
- Use **CSRF protection** when using cookie/session-based authentication.
- Keep access tokens short-lived; rotate/refresh safely.
- Store secrets and OAuth client credentials only on backend.

## High-Level Architecture

```text
[Browser / Frontend]
        |
        | HTTPS (API calls, auth redirects)
        v
[Spring Boot Backend]
   |  Spring Security filters
   |  OAuth2 login success handler
   |  Token service (JWT)
   |  Session/Cookie handling
        |
        v
[OAuth2 Provider] (Google/GitHub/etc.)
```

## Suggested Backend Endpoints

- `GET /oauth2/authorization/{provider}` - Start OAuth2 login
- `GET /login/oauth2/code/{provider}` - OAuth2 callback
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and clear cookie/session
- `GET /api/user/me` - Get authenticated user profile
