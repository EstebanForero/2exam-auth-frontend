import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { createZitadelAuth, type ZitadelConfig } from '@zitadel/react';

function Callback({ authenticated, setAuth, handleLogout, userManager }: {
  authenticated: boolean | null;
  setAuth: (auth: boolean) => void;
  handleLogout: () => void;
  userManager: any;
}) {
  const location = useLocation();

  useEffect(() => {
    if (location.search) {
      userManager.signinRedirectCallback().then((user: any) => {
        if (user) {
          setAuth(true);
          window.location.href = '/';
        }
      }).catch((err: any) => {
        console.error('Callback error:', err);
      });
    }
  }, [userManager, setAuth, location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Logging you in...</h1>
        <p>Handling callback from Zitadel.</p>
      </div>
    </div>
  );
}

function Login({ authenticated, handleLogin }: {
  authenticated: boolean | null;
  handleLogin: () => void;
}) {
  if (authenticated === true) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">Zitadel OAuth Frontend</h1>
        <button
          onClick={handleLogin}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Login with Zitadel
        </button>
      </div>
    </div>
  );
}

function TokenDisplay({ user, handleRefresh, testApi, handleLogout }: {
  user: any;
  handleRefresh: () => void;
  testApi: () => void;
  handleLogout: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);

  const accessToken = user?.access_token || '';
  const refreshTokenValue = user?.refresh_token || '';

  const handleTestApi = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const response = await fetch('http://secure-api.sabanus.site/user-protected', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setApiResponse(data);
      console.log('API response:', data);
    } catch (err) {
      console.error('API test error:', err);
      setApiResponse({ error: 'API call failed (check secure API running?)' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-900">Zitadel OAuth Frontend</h1>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Authenticated! Tokens Loaded</h2>
          <div className="mt-4 space-x-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh Token'}
            </button>
            <button
              onClick={handleTestApi}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              Test Secure API (/user-protected)
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {accessToken && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Tokens (Copy for Postman)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
                <textarea
                  value={accessToken}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-md resize-none font-mono text-xs"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Token</label>
                <textarea
                  value={refreshTokenValue}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-md resize-none font-mono text-xs"
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}

        {apiResponse && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Secure API Response</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm font-mono">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  // const config: ZitadelConfig = {
  //   authority: 'https://auth.sabanus.site',
  //   client_id: '34045167040889',  // From your OIDC app
  //   redirect_uri: 'http://localhost:5173/callback',
  //   post_logout_redirect_uri: 'http://localhost:5173',
  //   response_type: 'code',
  //   scope: 'openid urn:zitadel:iam:org:project:id:340437961126445059:aud user.read user.write',
  // };

  const config: ZitadelConfig = {
    authority: 'https://auth.sabanus.site',
    client_id: '340451216704208899',
    redirect_uri: 'https://frontend-auth.sabanus.site/callback',
    post_logout_redirect_uri: 'https://frontend-auth.sabanus.site',
    // redirect_uri: 'http://localhost:5173/callback',
    // post_logout_redirect_uri: 'http://localhost:5173',
    response_type: 'code',
    scope: 'openid profile email offline_access',
  };


  const zitadel = createZitadelAuth(config);

  function login() {
    zitadel.authorize();
  }

  function signout() {
    zitadel.signout();
  }

  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    zitadel.userManager.getUser().then((userData: any) => {
      if (userData) {
        setAuthenticated(true);
        setUser(userData);
      } else {
        setAuthenticated(false);
      }
    });
  }, [zitadel]);

  const handleRefresh = async () => {
    try {
      const refreshedUser = await zitadel.userManager.signinSilent();
      setUser(refreshedUser);
      console.log('Refreshed tokens:', refreshedUser);
    } catch (err) {
      console.error('Refresh error:', err);
    }
  };

  const handleTestApi = async () => {
    if (!user?.access_token) return;
    try {
      const response = await fetch('http://secure-api.sabanus.site/user-protected', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
        },
      });
      const data = await response.json();
      console.log('API response:', data);
    } catch (err) {
      console.error('API test error:', err);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          element={
            authenticated ? (
              <TokenDisplay
                user={user}
                handleRefresh={handleRefresh}
                testApi={handleTestApi}
                handleLogout={signout}
              />
            ) : (
              <Login authenticated={authenticated} handleLogin={login} />
            )
          }
        />
        <Route
          path='/callback'
          element={
            <Callback
              authenticated={authenticated}
              setAuth={setAuthenticated}
              handleLogout={signout}
              userManager={zitadel.userManager}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
