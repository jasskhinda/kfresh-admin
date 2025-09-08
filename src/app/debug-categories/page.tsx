'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TestResult {
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  duration?: number
  data?: any
}

export default function CategoryDebugPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [running, setRunning] = useState(false)

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result])
  }

  const runTests = async () => {
    setRunning(true)
    setResults([])
    
    const supabase = createClient()
    
    // Test 1: Basic Connection
    try {
      addResult({ test: 'Starting tests...', status: 'warning', message: 'Initializing category debugging' })
      
      const start = Date.now()
      const { data: healthCheck, error: healthError } = await supabase
        .from('categories')
        .select('count')
        .limit(1)
      
      const duration = Date.now() - start
      
      if (healthError) {
        addResult({ 
          test: 'Database Connection', 
          status: 'error', 
          message: `Failed: ${healthError.message}`,
          duration 
        })
      } else {
        addResult({ 
          test: 'Database Connection', 
          status: 'success', 
          message: 'Connection successful',
          duration 
        })
      }
    } catch (error) {
      addResult({ 
        test: 'Database Connection', 
        status: 'error', 
        message: `Exception: ${(error as Error).message}` 
      })
    }

    // Test 2: Category Fetch
    try {
      const start = Date.now()
      const { data: categories, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
      
      const duration = Date.now() - start
      
      if (categoryError) {
        addResult({ 
          test: 'Category Fetch', 
          status: 'error', 
          message: `Failed: ${categoryError.message}`,
          duration 
        })
      } else {
        addResult({ 
          test: 'Category Fetch', 
          status: 'success', 
          message: `Fetched ${categories.length} categories`,
          duration,
          data: categories
        })
        
        // Test each image URL
        const imageResults = await Promise.all(
          categories.map(async (cat) => {
            if (!cat.image_url) return { name: cat.name, status: 'no-image' }
            
            try {
              const response = await fetch(cat.image_url, { method: 'HEAD' })
              return { 
                name: cat.name, 
                status: response.ok ? 'success' : 'error',
                httpStatus: response.status
              }
            } catch {
              return { name: cat.name, status: 'error', httpStatus: 'network-error' }
            }
          })
        )
        
        const successfulImages = imageResults.filter(r => r.status === 'success').length
        const totalImages = imageResults.filter(r => r.status !== 'no-image').length
        
        addResult({
          test: 'Image URL Validation',
          status: successfulImages === totalImages ? 'success' : 'warning',
          message: `${successfulImages}/${totalImages} images accessible`,
          data: imageResults
        })
      }
    } catch (error) {
      addResult({ 
        test: 'Category Fetch', 
        status: 'error', 
        message: `Exception: ${(error as Error).message}` 
      })
    }

    // Test 3: Timeout Simulation
    try {
      addResult({ 
        test: 'Timeout Test', 
        status: 'warning', 
        message: 'Testing with 3-second timeout...' 
      })
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('3-second timeout reached')), 3000)
      )
      
      const queryPromise = supabase
        .from('categories')
        .select('*')
        .order('sort_order')
      
      await Promise.race([queryPromise, timeoutPromise])
      
      addResult({ 
        test: 'Timeout Test', 
        status: 'success', 
        message: 'Query completed within 3 seconds' 
      })
    } catch (error) {
      addResult({ 
        test: 'Timeout Test', 
        status: 'warning', 
        message: `Query took longer than 3 seconds: ${(error as Error).message}` 
      })
    }

    setRunning(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Category Debug Tool</h1>
              <p className="text-gray-600">Test database connectivity and category images</p>
            </div>
            <button
              onClick={runTests}
              disabled={running}
              className={`px-4 py-2 rounded-lg text-white font-medium ${
                running 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {running ? 'Running Tests...' : 'Run Debug Tests'}
            </button>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  result.status === 'success' 
                    ? 'bg-green-50 border-green-400' 
                    : result.status === 'error'
                    ? 'bg-red-50 border-red-400'
                    : 'bg-yellow-50 border-yellow-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{result.test}</h3>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    {result.duration && (
                      <p className="text-xs text-gray-500 mt-1">Duration: {result.duration}ms</p>
                    )}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    result.status === 'success' 
                      ? 'bg-green-400' 
                      : result.status === 'error'
                      ? 'bg-red-400'
                      : 'bg-yellow-400'
                  }`} />
                </div>

                {result.data && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700">
                      View Details
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>

          {results.length === 0 && !running && (
            <div className="text-center py-12">
              <p className="text-gray-500">Click "Run Debug Tests" to start testing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
