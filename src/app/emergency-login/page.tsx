'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, AlertTriangle } from 'lucide-react'

export default function EmergencyLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleEmergencyLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Emergency bypass password - change this to something secure
    const emergencyPassword = 'KfreshEmergency2025!'

    if (password === emergencyPassword) {
      // Set emergency session in localStorage
      localStorage.setItem('emergency_admin_session', JSON.stringify({
        email: 'kfreshsupermarket@gmail.com',
        role: 'super_admin',
        emergency: true,
        timestamp: Date.now()
      }))

      // Redirect to admin panel
      router.push('/')
    } else {
      setError('Invalid emergency password')
    }
  }

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Emergency Admin Access</h1>
          <p className="text-gray-600 mt-2">
            Supabase authentication is currently experiencing issues. Use emergency access to continue working.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleEmergencyLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter emergency password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <Shield className="inline-block w-4 h-4 mr-2" />
            Emergency Access
          </button>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Instructions:</h3>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Emergency password: <code>KfreshEmergency2025!</code></li>
            <li>• This bypasses Supabase authentication temporarily</li>
            <li>• Once logged in, you can manage users and continue working</li>
            <li>• Run the emergency diagnosis SQL to identify the root cause</li>
          </ul>
        </div>
      </div>
    </div>
  )
}