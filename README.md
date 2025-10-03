# Zitadel OAuth Frontend

This project is a **React + Vite frontend** that integrates with **ZITADEL** for user authentication using **OpenID Connect (OIDC)**.
It handles user login, logout, token management, and interaction with a protected backend API.

---

## Overview

The app authenticates users through **ZITADEL**, retrieves **access** and **refresh tokens**, and provides a simple interface to:

* Log in using ZITADEL’s hosted login page.
* Display access and refresh tokens.
* Refresh tokens silently without user interaction.
* Test authenticated calls to a protected backend endpoint.
* Log out and clear session data.

---

## Architecture Flow

The system involves three components:

1. **User (Browser)**
2. **ZITADEL Authorization Server** (`https://auth.sabanus.site`)
3. **Secure Backend API** (`https://secure-api.sabanus.site`)

### Step-by-step Flow (for diagramming in eraser.io)

1. **User → Frontend**

   * User clicks **“Login with ZITADEL”**.
   * The frontend calls `zitadel.authorize()`, which redirects the user to ZITADEL’s hosted login page.

2. **Frontend → ZITADEL (OIDC Authorization Code Flow)**

   * ZITADEL authenticates the user and redirects them back to the frontend’s callback route (`/callback`)
     with an authorization code.

3. **Frontend (Callback page)**

   * The frontend’s `Callback` component handles the redirect and calls `signinRedirectCallback()`
     from the ZITADEL SDK to exchange the authorization code for **tokens** (access, refresh, ID).

4. **Frontend → Secure Backend API**

   * The frontend can now include the `access_token` in the header of requests to the backend:

     ```
     Authorization: Bearer <access_token>
     ```
   * The backend introspects the token with ZITADEL to verify its validity and roles.

5. **Backend → ZITADEL (Introspection)**

   * The backend confirms that the token is active, belongs to the correct audience,
     and has the required scopes (e.g., `user.read`, `service.read`).

6. **ZITADEL → Backend → Frontend**

   * If valid, the backend returns protected data to the frontend.
   * If invalid, it responds with `401 Unauthorized` or `403 Forbidden`.

7. **Frontend (Silent Refresh)**

   * When tokens expire, the frontend uses `signinSilent()` to refresh them automatically
     without requiring another login.

---

## Key Components

### 1. ZITADEL Config (`config`)

```ts
const config: ZitadelConfig = {
  authority: 'https://auth.sabanus.site',
  client_id: '340451216704208899',
  redirect_uri: 'https://frontend-auth.sabanus.site/callback',
  post_logout_redirect_uri: 'https://frontend-auth.sabanus.site',
  response_type: 'code',
  scope: 'openid profile email offline_access',
};
```

* `authority` — your ZITADEL instance.
* `client_id` — the application ID configured in ZITADEL.
* `redirect_uri` — must match what’s configured in ZITADEL for your app.
* `scope` — determines which permissions and user data are granted.

---

### 2. Login Flow

```ts
function login() {
  zitadel.authorize(); // Redirects to Zitadel login page
}
```

This triggers ZITADEL’s OAuth 2.0 Authorization Code Flow.
Once the user logs in, ZITADEL redirects back to `/callback`.

---

### 3. Callback Handling

```ts
userManager.signinRedirectCallback().then((user) => {
  if (user) {
    setAuth(true);
    window.location.href = '/';
  }
});
```

This function:

* Finalizes the login process.
* Stores the access and refresh tokens.
* Marks the session as authenticated.

---

### 4. Testing a Secure API Call

```ts
const response = await fetch('https://secure-api.sabanus.site/user-protected', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});
```

If the token is valid and has the correct scope (`user.read`),
the backend returns a protected JSON payload.

---

### 5. Token Refresh

```ts
const refreshedUser = await zitadel.userManager.signinSilent();
```

This silently renews tokens before they expire using the refresh token.
No user interaction is required.

---

### 6. Logout

```ts
zitadel.signout();
```

Logs the user out from both the frontend and ZITADEL,
then redirects to the configured `post_logout_redirect_uri`.

---

## Example API Interaction

After successful login:

**Frontend request:**

```http
GET /user-protected
Host: secure-api.sabanus.site
Authorization: Bearer eyJhbGciOiJSUzI1...
```

**Backend response (if valid):**

```json
{
  "message": "User-protected data accessed successfully",
  "actor": "human-user",
  "scopes": ["openid", "user.read"],
  "userId": "1234567890"
}
```

---

## Diagram Description (for eraser.io)

You can visualize the flow with **four vertical swimlanes**:

* **User / Browser**
* **Frontend (React App)**
* **Zitadel (Auth Server)**
* **Secure Backend API**

And the arrows:

1. **User → Frontend** → Clicks “Login with Zitadel”
2. **Frontend → Zitadel** → Redirect (OIDC login)
3. **Zitadel → Frontend** → Redirect with authorization code
4. **Frontend → Zitadel** → Exchange code for tokens
5. **Frontend → Backend API** → Call `/user-protected` with `Bearer access_token`
6. **Backend → Zitadel** → Introspect token
7. **Zitadel → Backend** → Token valid response
8. **Backend → Frontend** → Protected data JSON

Add a side note for:

* “Silent Refresh Flow” between Frontend and Zitadel (background token renewal).

---

## Local Development

### Requirements

* Node.js (or Bun)
* ZITADEL instance configured with:

  * Redirect URI: `http://localhost:5173/callback`
  * Post logout URI: `http://localhost:5173`
  * Scopes: `openid profile email offline_access`

### Run locally

```bash
npm install
npm run dev
```

Then visit:
[http://localhost:5173](http://localhost:5173)

---

## Deployment

For production:

* Use HTTPS (required by OIDC).
* Update `redirect_uri` and `post_logout_redirect_uri` to match your deployed domain.
* Ensure the backend API uses a valid TLS certificate and CORS allows your frontend origin.

---

## Summary

This frontend serves as the **ZITADEL authentication gateway** for your system:

* Handles **user login/logout**.
* Manages **access and refresh tokens**.
* Sends **authenticated API calls** to the secure backend.
* Works seamlessly with **Zitadel’s OIDC standard flow**.
