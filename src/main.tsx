import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { createZitadelAuth, ZitadelAuthProvider } from '@zitadel/react'

const zitadelConfig = createZitadelAuth({
  authority: 'https://auth.sabanus.site',  // Your issuer
  client_id: '34045167040889',  // From your OIDC app (snake_case)
  redirect_uri: 'http://localhost:5173/callback',  // Callback route
  post_logout_redirect_uri: 'http://localhost:5173',
  response_type: 'code',  // Authorization Code + PKCE
  scope: 'openid profile email urn:zitadel:iam:org:project:id:340437961126445059:aud user.read user.write',  // Project audience + user scopes
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ZitadelAuthProvider config={zitadelConfig}>
        <App />
      </ZitadelAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
