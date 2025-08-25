'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SupabaseTest() {
  const [status, setStatus] = useState('Testing...')
  
  useEffect(() => {
    const test = async () => {
      try {
        console.log('Creating Supabase client...')
        const supabase = createClient()
        console.log('Client created:', !!supabase)
        
        console.log('Calling getSession...')
        const { data, error } = await supabase.auth.getSession()
        console.log('Session result:', { data: !!data, error })
        
        setStatus(`Success: ${error ? 'Error - ' + error.message : 'No error'}`)
      } catch (error) {
        console.error('Test error:', error)
        setStatus(`Error: ${error}`)
      }
    }
    
    test()
  }, [])
  
  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      <h3 className="font-bold">Supabase Test</h3>
      <p>{status}</p>
    </div>
  )
}
