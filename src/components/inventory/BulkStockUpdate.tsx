'use client'

import { useState } from 'react'
import { Package, Upload, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface BulkStockUpdateProps {
  selectedProducts: string[]
  onUpdate: () => void
  onClose: () => void
}

export default function BulkStockUpdate({ 
  selectedProducts, 
  onUpdate, 
  onClose 
}: BulkStockUpdateProps) {
  const [updateType, setUpdateType] = useState<'set' | 'add' | 'subtract'>('set')
  const [stockValue, setStockValue] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleBulkUpdate = async () => {
    if (!stockValue || selectedProducts.length === 0) return

    setLoading(true)
    try {
      const value = parseInt(stockValue)
      if (isNaN(value)) {
        alert('Please enter a valid number')
        return
      }

      // Get current stock quantities for add/subtract operations
      let updates: { id: string; stock_quantity: number }[] = []

      if (updateType === 'set') {
        updates = selectedProducts.map(id => ({
          id,
          stock_quantity: value
        }))
      } else {
        // Fetch current stock quantities
        const { data: currentProducts, error: fetchError } = await supabase
          .from('products')
          .select('id, stock_quantity')
          .in('id', selectedProducts)

        if (fetchError) {
          console.error('Error fetching current stock:', fetchError)
          alert('Failed to fetch current stock quantities')
          return
        }

        updates = currentProducts.map(product => {
          let newStock = product.stock_quantity
          if (updateType === 'add') {
            newStock += value
          } else if (updateType === 'subtract') {
            newStock = Math.max(0, newStock - value) // Don't allow negative stock
          }
          return {
            id: product.id,
            stock_quantity: newStock
          }
        })
      }

      // Perform bulk update
      const updatePromises = updates.map(update =>
        supabase
          .from('products')
          .update({ stock_quantity: update.stock_quantity })
          .eq('id', update.id)
      )

      const results = await Promise.all(updatePromises)
      const errors = results.filter(result => result.error)

      if (errors.length > 0) {
        console.error('Some updates failed:', errors)
        alert(`${errors.length} updates failed. Please try again.`)
      } else {
        alert(`Successfully updated stock for ${selectedProducts.length} products`)
        onUpdate()
        onClose()
      }
    } catch (error) {
      console.error('Error updating stock:', error)
      alert('Failed to update stock quantities')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <Package className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Bulk Stock Update
          </h2>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Updating stock for {selectedProducts.length} selected product{selectedProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Type
            </label>
            <select
              value={updateType}
              onChange={(e) => setUpdateType(e.target.value as 'set' | 'add' | 'subtract')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="set">Set stock to specific value</option>
              <option value="add">Add to current stock</option>
              <option value="subtract">Subtract from current stock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {updateType === 'set' ? 'New Stock Quantity' : 
               updateType === 'add' ? 'Quantity to Add' : 'Quantity to Subtract'}
            </label>
            <input
              type="number"
              min="0"
              value={stockValue}
              onChange={(e) => setStockValue(e.target.value)}
              placeholder="Enter quantity"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {updateType === 'subtract' && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                Stock quantities will not go below 0. Products with insufficient stock will be set to 0.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleBulkUpdate}
            disabled={loading || !stockValue}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Updating...' : 'Update Stock'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}