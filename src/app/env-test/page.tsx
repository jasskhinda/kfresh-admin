// Environment Variables Test for Production
// This page helps verify that Supabase connection works in production

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function EnvTestPage() {
  const [status, setStatus] = useState<{
    supabaseUrl: boolean
    supabaseKey: boolean
    connection: boolean
    error?: string
  }>({
    supabaseUrl: false,
    supabaseKey: false,
    connection: false
  })

  useEffect(() => {
    const testEnvironment = async () => {
      // Check if environment variables exist
      const supabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      setStatus(prev => ({ ...prev, supabaseUrl, supabaseKey }))

      // Test Supabase connection
      try {
        const supabase = createClient()
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus(prev => ({ 
            ...prev, 
            connection: false, 
            error: error.message 
          }))
        } else {
          setStatus(prev => ({ 
            ...prev, 
            connection: true 
          }))
        }
      } catch (error: any) {
        setStatus(prev => ({ 
          ...prev, 
          connection: false, 
          error: error.message 
        }))
      }
    }

    testEnvironment()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">
          Environment Test
        </h1>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Supabase URL:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              status.supabaseUrl ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {status.supabaseUrl ? '✅ Set' : '❌ Missing'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Supabase Key:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              status.supabaseKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {status.supabaseKey ? '✅ Set' : '❌ Missing'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Connection:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              status.connection ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {status.connection ? '✅ Working' : '❌ Failed'}
            </span>
          </div>
        </div>

        {status.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 text-sm">Error: {status.error}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <a 
            href="/login" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Go to Login Page
          </a>
        </div>
      </div>
    </div>
  )
}
