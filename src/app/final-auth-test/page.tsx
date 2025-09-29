'use client'

import { useState } from 'react'

export default function FinalAuthTest() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testAuthAPI = async () => {
    setLoading(true)
    setResult('Testing Supabase Auth API directly...\n\n')

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

      setResult(prev => prev + `Using URL: ${supabaseUrl}\n`)
      setResult(prev => prev + `Using Key: ${anonKey.substring(0, 20)}...\n\n`)

      // Test direct API call to Supabase Auth
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({
          email: 'kfreshsupermarket@gmail.com',
          password: 'Kfresh@2025'
        })
      })

      setResult(prev => prev + `Response Status: ${response.status}\n`)
      setResult(prev => prev + `Response Status Text: ${response.statusText}\n\n`)

      const responseText = await response.text()

      if (response.ok) {
        setResult(prev => prev + '✅ SUCCESS: Direct API call worked!\n')
        setResult(prev => prev + `Response: ${responseText}\n`)

        try {
          const data = JSON.parse(responseText)
          if (data.access_token) {
            setResult(prev => prev + '\n✅ Access token received - authentication is working!')
          }
        } catch (e) {
          setResult(prev => prev + '\n⚠️ Could not parse response as JSON')
        }
      } else {
        setResult(prev => prev + '❌ FAILED: Direct API call failed\n')
        setResult(prev => prev + `Error Response: ${responseText}\n`)

        try {
          const errorData = JSON.parse(responseText)
          setResult(prev => prev + `\nError Details: ${JSON.stringify(errorData, null, 2)}\n`)
        } catch (e) {
          setResult(prev => prev + '\n⚠️ Could not parse error response as JSON')
        }
      }

    } catch (error) {
      setResult(prev => prev + `❌ Network Error: ${error}\n`)
    }

    setLoading(false)
  }

  const testSupabaseSDK = async () => {
    setLoading(true)
    setResult('Testing with Supabase SDK...\n\n')

    try {
      // Dynamic import to avoid SSR issues
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      setResult(prev => prev + 'Supabase client created\n')

      // Test basic connection first
      const { data: testData, error: testError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)

      if (testError) {
        setResult(prev => prev + `❌ Basic connection test failed: ${testError.message}\n`)
        return
      }

      setResult(prev => prev + '✅ Basic connection test passed\n')

      // Now test authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'kfreshsupermarket@gmail.com',
        password: 'Kfresh@2025'
      })

      if (error) {
        setResult(prev => prev + `❌ SDK Authentication failed: ${error.message}\n`)
        setResult(prev => prev + `Error Code: ${error.name}\n`)
        setResult(prev => prev + `Error Details: ${JSON.stringify(error, null, 2)}\n`)
      } else {
        setResult(prev => prev + '✅ SDK Authentication successful!\n')
        setResult(prev => prev + `User: ${data.user?.email}\n`)
        setResult(prev => prev + `User ID: ${data.user?.id}\n`)
      }

    } catch (error) {
      setResult(prev => prev + `❌ SDK Error: ${error}\n`)
    }

    setLoading(false)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Final Authentication Test</h1>

      <div className="space-y-4 mb-6">
        <button
          onClick={testAuthAPI}
          disabled={loading}
          className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 disabled:opacity-50 mr-4"
        >
          {loading ? 'Testing...' : 'Test Direct API Call'}
        </button>

        <button
          onClick={testSupabaseSDK}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Supabase SDK'}
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Test Results:</h2>
        <pre className="whitespace-pre-wrap text-sm font-mono max-h-96 overflow-y-auto">
          {result || 'Click a button to run tests...'}
        </pre>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800">What This Tests:</h3>
        <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
          <li><strong>Direct API Call</strong>: Tests if Supabase Auth API responds correctly</li>
          <li><strong>Supabase SDK</strong>: Tests if the SDK can authenticate properly</li>
          <li>Both tests use the exact same credentials that are failing in your login form</li>
          <li>This will help us determine if it's an API issue or SDK configuration issue</li>
        </ul>
      </div>
    </div>
  )
}