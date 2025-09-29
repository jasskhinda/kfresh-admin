'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugAuthPage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  const testDirectAuth = async () => {
    setResults([])
    setLoading(true)
    addResult('Starting authentication test...')

    try {
      // Test 1: Check Supabase connection
      addResult('Testing Supabase connection...')
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      addResult(`Current session: ${currentSession ? 'EXISTS' : 'NONE'}`)

      // Test 2: Sign out first to ensure clean state
      addResult('Signing out any existing session...')
      await supabase.auth.signOut()
      addResult('Signed out successfully')

      // Test 3: Test direct authentication
      addResult('Attempting direct authentication...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'kfreshsupermarket@gmail.com',
        password: 'Kfresh@2025'
      })

      if (error) {
        addResult(`❌ Authentication failed: ${error.message}`)
        addResult(`Error code: ${error.name}`)
        addResult(`Error details: ${JSON.stringify(error, null, 2)}`)
      } else {
        addResult('✅ Authentication successful!')
        addResult(`User ID: ${data.user?.id}`)
        addResult(`Email: ${data.user?.email}`)
        addResult(`Session: ${data.session ? 'EXISTS' : 'MISSING'}`)

        // Test 4: Try to fetch user profile
        if (data.user) {
          addResult('Fetching user profile...')
          try {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()

            if (profileError) {
              addResult(`❌ Profile fetch failed: ${profileError.message}`)
              addResult(`Profile error details: ${JSON.stringify(profileError, null, 2)}`)
            } else {
              addResult('✅ Profile fetched successfully!')
              addResult(`Profile: ${JSON.stringify(profile, null, 2)}`)
            }
          } catch (profileErr) {
            addResult(`❌ Profile fetch error: ${profileErr}`)
          }
        }
      }

    } catch (err) {
      addResult(`❌ Unexpected error: ${err}`)
    }

    setLoading(false)
  }

  const testUserProfiles = async () => {
    setResults([])
    setLoading(true)
    addResult('Testing user_profiles table access...')

    try {
      // Test direct table access
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', 'kfreshsupermarket@gmail.com')

      if (error) {
        addResult(`❌ Table access failed: ${error.message}`)
        addResult(`Error details: ${JSON.stringify(error, null, 2)}`)
      } else {
        addResult('✅ Table access successful!')
        addResult(`Found ${data?.length || 0} profiles`)
        if (data && data.length > 0) {
          addResult(`Profile data: ${JSON.stringify(data[0], null, 2)}`)
        }
      }

      // Test general table access
      addResult('Testing general table access...')
      const { data: allProfiles, error: allError } = await supabase
        .from('user_profiles')
        .select('email, role, created_at')
        .limit(5)

      if (allError) {
        addResult(`❌ General table access failed: ${allError.message}`)
      } else {
        addResult(`✅ General table access successful! Found ${allProfiles?.length || 0} total profiles`)
        if (allProfiles) {
          allProfiles.forEach((profile, index) => {
            addResult(`Profile ${index + 1}: ${profile.email} (${profile.role})`)
          })
        }
      }

    } catch (err) {
      addResult(`❌ Unexpected error: ${err}`)
    }

    setLoading(false)
  }

  const testSupabaseEnvironment = async () => {
    setResults([])
    setLoading(true)
    addResult('Testing Supabase environment...')

    try {
      addResult(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
      addResult(`Anon Key exists: ${!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`)
      addResult(`Anon Key prefix: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10)}...`)

      // Test basic connection
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1)

      if (error) {
        addResult(`❌ Basic connection failed: ${error.message}`)
      } else {
        addResult('✅ Basic Supabase connection working')
      }

    } catch (err) {
      addResult(`❌ Environment test error: ${err}`)
    }

    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Console</h1>

      <div className="space-y-4 mb-6">
        <button
          onClick={testSupabaseEnvironment}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mr-4"
        >
          Test Environment
        </button>

        <button
          onClick={testUserProfiles}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 mr-4"
        >
          Test User Profiles Table
        </button>

        <button
          onClick={testDirectAuth}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          Test Direct Authentication
        </button>
      </div>

      {loading && (
        <div className="mb-4 text-blue-600">
          Running test... Please wait.
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Results:</h2>
        <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className={`${
                result.includes('❌')
                  ? 'text-red-600'
                  : result.includes('✅')
                  ? 'text-green-600'
                  : 'text-gray-700'
              }`}
            >
              {result}
            </div>
          ))}
          {results.length === 0 && (
            <div className="text-gray-500">Click a button to run tests...</div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800">Instructions:</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 mt-2 space-y-1">
          <li>First run "Test Environment" to verify Supabase connection</li>
          <li>Then run "Test User Profiles Table" to check database access</li>
          <li>Finally run "Test Direct Authentication" to debug the login issue</li>
          <li>Check the browser console for additional debug information</li>
        </ol>
      </div>
    </div>
  )
}