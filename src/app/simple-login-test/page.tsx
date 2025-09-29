'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SimpleLoginTest() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult('Testing login...')

    const supabase = createClient()

    try {
      // First, sign out to ensure clean state
      await supabase.auth.signOut()
      console.log('Signed out successfully')

      // Test basic connection
      console.log('Testing basic Supabase connection...')
      const { data: connectionTest, error: connectionError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)

      if (connectionError) {
        setResult(`❌ Connection test failed: ${connectionError.message}`)
        return
      }

      console.log('Connection test passed')

      // Now try to sign in
      console.log('Attempting sign in...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'kfreshsupermarket@gmail.com',
        password: 'Kfresh@2025'
      })

      console.log('Sign in response:', { data, error })

      if (error) {
        setResult(`❌ Sign in failed: ${error.message}`)
        console.error('Full error object:', error)
      } else if (data.user && data.session) {
        setResult(`✅ Sign in successful! User: ${data.user.email}, ID: ${data.user.id}`)
        console.log('Success! User:', data.user)
        console.log('Session:', data.session)

        // Test profile fetch
        try {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profileError) {
            setResult(prev => prev + `\n⚠️ Profile fetch failed: ${profileError.message}`)
          } else {
            setResult(prev => prev + `\n✅ Profile fetched: ${JSON.stringify(profile, null, 2)}`)
          }
        } catch (profileErr) {
          setResult(prev => prev + `\n❌ Profile error: ${profileErr}`)
        }
      } else {
        setResult('❌ Sign in returned no user or session')
      }

    } catch (err) {
      setResult(`❌ Unexpected error: ${err}`)
      console.error('Unexpected error:', err)
    }

    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Simple Login Test</h1>

      <button
        onClick={testLogin}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50 mb-6"
      >
        {loading ? 'Testing...' : 'Test Login with kfreshsupermarket@gmail.com'}
      </button>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Test Result:</h2>
        <pre className="whitespace-pre-wrap text-sm">{result || 'Click the button to test login'}</pre>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800">Environment Info:</h3>
        <div className="text-sm text-blue-700 mt-2">
          <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
          <p>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'}</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800">Instructions:</h3>
        <p className="text-sm text-yellow-700 mt-2">
          This test bypasses all the complex authentication context and tries direct login.
          Check both the result here and your browser console for detailed error information.
        </p>
      </div>
    </div>
  )
}