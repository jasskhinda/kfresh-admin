'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function AuthTestPage() {
  const [directSupabaseTest, setDirectSupabaseTest] = useState('Testing...')
  const authContext = useAuth()
  
  useEffect(() => {
    // Test Supabase directly without auth context
    const testSupabase = async () => {
      try {
        console.log('Direct Supabase test - Creating client...')
        const supabase = createClient()
        console.log('Direct Supabase test - Client created')
        
        const { data, error } = await supabase.auth.getSession()
        console.log('Direct Supabase test - Session result:', { data: !!data, error })
        
        setDirectSupabaseTest(error ? `Error: ${error.message}` : 'Success - No error')
      } catch (error) {
        console.error('Direct Supabase test error:', error)
        setDirectSupabaseTest(`Exception: ${error}`)
      }
    }
    
    testSupabase()
  }, [])
  
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Authentication Debug Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Auth Context State</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authContext, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Direct Supabase Test</h2>
          <p className="text-gray-700">{directSupabaseTest}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          <div className="space-y-2 text-sm">
            <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}</p>
            <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
