'use client'

import { useState, useRef } from 'react'
import { Upload, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CSVImportProps {
  onImportComplete: () => void
  onClose: () => void
}

interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

export default function CSVImport({ onImportComplete, onClose }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const downloadTemplate = () => {
    const csvContent = `sku,name,price,stock_quantity,is_available
SAMPLE-001,Sample Product 1,19.99,100,true
SAMPLE-002,Sample Product 2,29.99,50,true
SAMPLE-003,Sample Product 3,9.99,0,false`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product_import_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim())
      const row: any = { _lineNumber: index + 2 }
      
      headers.forEach((header, i) => {
        let value = values[i] || ''
        
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1)
        }
        
        // Convert specific fields
        if (header === 'price' || header === 'compare_price') {
          row[header] = value ? parseFloat(value) : null
        } else if (header === 'stock_quantity') {
          row[header] = value ? parseInt(value) : 0
        } else if (header === 'is_available' || header === 'is_featured') {
          row[header] = value.toLowerCase() === 'true'
        } else {
          row[header] = value
        }
      })
      
      return row
    })
  }

  const validateRow = (row: any): string[] => {
    const errors: string[] = []
    
    if (!row.name || row.name.trim() === '') {
      errors.push('Name is required')
    }
    
    if (!row.price || isNaN(row.price) || row.price <= 0) {
      errors.push('Valid price is required')
    }
    
    if (row.stock_quantity < 0) {
      errors.push('Stock quantity cannot be negative')
    }
    
    return errors
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setResult(null)

    try {
      const text = await file.text()
      const rows = parseCSV(text)
      
      let successCount = 0
      let failedCount = 0
      const allErrors: string[] = []

      for (const row of rows) {
        try {
          const errors = validateRow(row)
          
          if (errors.length > 0) {
            failedCount++
            allErrors.push(`Line ${row._lineNumber}: ${errors.join(', ')}`)
            continue
          }

          // Check if product exists by SKU
          let productData: any = {
            name: row.name,
            price: row.price,
            stock_quantity: row.stock_quantity,
            is_available: row.is_available !== undefined ? row.is_available : true,
            updated_at: new Date().toISOString()
          }

          // Add optional fields if present
          if (row.compare_price) productData.compare_price = row.compare_price
          if (row.is_featured !== undefined) productData.is_featured = row.is_featured

          if (row.sku) {
            // Try to update existing product by SKU
            const { data: existingProduct } = await supabase
              .from('products')
              .select('id')
              .eq('sku', row.sku)
              .single()

            if (existingProduct) {
              // Update existing product
              const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', existingProduct.id)

              if (error) {
                failedCount++
                allErrors.push(`Line ${row._lineNumber}: ${error.message}`)
              } else {
                successCount++
              }
            } else {
              // Create new product with SKU
              productData.sku = row.sku
              const { error } = await supabase
                .from('products')
                .insert(productData)

              if (error) {
                failedCount++
                allErrors.push(`Line ${row._lineNumber}: ${error.message}`)
              } else {
                successCount++
              }
            }
          } else {
            // Create new product without SKU
            const { error } = await supabase
              .from('products')
              .insert(productData)

            if (error) {
              failedCount++
              allErrors.push(`Line ${row._lineNumber}: ${error.message}`)
            } else {
              successCount++
            }
          }
        } catch (error) {
          failedCount++
          allErrors.push(`Line ${row._lineNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      setResult({
        success: successCount,
        failed: failedCount,
        errors: allErrors
      })

      if (successCount > 0) {
        onImportComplete()
      }
    } catch (error) {
      console.error('Import error:', error)
      setResult({
        success: 0,
        failed: 1,
        errors: ['Failed to parse CSV file. Please check the format.']
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
          <Upload className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Import Products from CSV
          </h2>
        </div>

        {!result && (
          <>
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Upload a CSV file with product data</li>
                <li>• Required columns: name, price, stock_quantity</li>
                <li>• Optional columns: sku, compare_price, is_available, is_featured</li>
                <li>• Products with existing SKUs will be updated</li>
                <li>• Products without SKUs will be created as new</li>
              </ul>
            </div>

            <div className="mb-4">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                Download CSV Template
              </button>
            </div>

            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 transition-colors"
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {file ? file.name : 'Click to select CSV file or drag and drop'}
                </p>
              </div>
            </div>
          </>
        )}

        {result && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">{result.success} successful</span>
              </div>
              {result.failed > 0 && (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">{result.failed} failed</span>
                </div>
              )}
            </div>

            {result.errors.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Errors:</h4>
                <div className="max-h-40 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-800">{error}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          {!result && (
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {importing ? 'Importing...' : 'Import Products'}
            </button>
          )}
          <button
            onClick={onClose}
            disabled={importing}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors"
          >
            {result ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}