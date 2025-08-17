'use client'

import { useState } from 'react'
import { Database, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DatabaseDebug() {
  const [showDebug, setShowDebug] = useState(false)
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkDatabase = async () => {
    setLoading(true)
    const supabase = createClient()
    
    try {
      // Check orders table structure
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .limit(3)

      // Check products table
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity')
        .limit(3)

      setDebugData({
        orders: {
          data: orders,
          error: ordersError,
          count: orders?.length || 0
        },
        products: {
          data: products,
          error: productsError,
          count: products?.length || 0
        }
      })
    } catch (error) {
      setDebugData({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (!showDebug) {
    return (
      <button
        onClick={() => {
          setShowDebug(true)
          checkDatabase()
        }}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Debug Database"
      >
        <Database className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Database className="h-4 w-4" />
          Database Debug
        </h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <EyeOff className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Checking database...</p>
        </div>
      ) : debugData ? (
        <div className="space-y-4 text-xs">
          <div>
            <h4 className="font-medium text-gray-900">Orders Table:</h4>
            <p className="text-gray-600">Count: {debugData.orders?.count || 0}</p>
            {debugData.orders?.error && (
              <p className="text-red-600">Error: {debugData.orders.error.message}</p>
            )}
            {debugData.orders?.data && debugData.orders.data.length > 0 && (
              <div className="bg-gray-50 p-2 rounded mt-1">
                <p className="font-medium">Sample order structure:</p>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(debugData.orders.data[0], null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Products Table:</h4>
            <p className="text-gray-600">Count: {debugData.products?.count || 0}</p>
            {debugData.products?.error && (
              <p className="text-red-600">Error: {debugData.products.error.message}</p>
            )}
          </div>

          <button
            onClick={checkDatabase}
            className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Refresh Debug Info
          </button>
        </div>
      ) : (
        <p className="text-gray-600 text-sm">Click refresh to check database</p>
      )}
    </div>
  )
}