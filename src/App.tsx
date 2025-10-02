// src/App.tsx (updated with OAuth flow + token display)
import { useState } from 'react'
import { useAuth } from '@zitadel/react'

function App() {
  const { isAuthenticated, login, logout, getToken, refreshToken } = useAuth()
  const [accessToken, setAccessToken] = useState<string>('')
  const [refreshToken, setRefreshToken] = useState<string>('')
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    login({
      // Scope with project audience + user scopes (from your setup)
      scope: 'openid urn:zitadel:iam:org:project:id:340437961126445059:aud user.read user.write',
    })
  }

  const fetchToken = async () => {
    if (isAuthenticated) {
      setLoading(true)
      try {
        const token = await getToken()
        setAccessToken(token.access_token || '')
        setRefreshToken(token.refresh_token || '')  // If available
        console.log('Tokens fetched:', { accessToken: token.access_token, refreshToken: token.refresh_token })
      } catch (err) {
        console.error('Token fetch error:', err)
      }
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const newToken = await refreshToken()
      setAccessToken(newToken.access_token || '')
      setRefreshToken(newToken.refresh_token || '')
      console.log('Refreshed tokens:', newToken)
      // Test old token would fail now (invalidated)
    } catch (err) {
      console.error('Refresh error:', err)
    }
    setLoading(false)
  }

  const testApi = async () => {
    if (!accessToken) return
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/user-protected', {  // Your secure API
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      const data = await response.json()
      setApiResponse(data)
      console.log('API response:', data)
    } catch (err) {
      console.error('API test error:', err)
      setApiResponse({ error: 'API call failed' })
    }
    setLoading(false)
  }

  if (!isAuthenticated) {
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
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-900">Zitadel OAuth Frontend</h1>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Authenticated! Fetch Tokens</h2>
          <button
            onClick={fetchToken}
            disabled={loading}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Access Token'}
          </button>
        </div>

        {accessToken && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Tokens (Copy for Postman)</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Access Token</label>
              <textarea
                value={accessToken}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                rows={3}
              />
              <label className="block text-sm font-medium text-gray-700">Refresh Token</label>
              <textarea
                value={refreshToken}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                rows={2}
              />
            </div>
            <div className="mt-4 space-x-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh Token'}
              </button>
              <button
                onClick={testApi}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                Test Secure API (/user-protected)
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {apiResponse && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Secure API Response</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
