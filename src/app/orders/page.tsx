'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Clock, 
  Check, 
  AlertCircle, 
  Truck,
  MapPin
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, downloadCSV } from '@/lib/utils'
import DatabaseDebug from '@/components/debug/DatabaseDebug'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface Order {
  id: string
  order_number: string
  customer_id: string | null
  email: string | null
  phone: string | null
  status: string
  fulfillment_status: string
  payment_status: string
  total: number
  fulfillment_method: string
  delivery_method: string | null
  created_at: string
  updated_at: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const supabase = createClient()
      
      // First, let's try to get orders with the expected structure
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          created_at,
          updated_at,
          notes,
          user_id,
          fulfillment_method,
          delivery_method,
          payment_status
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching orders:', error)
        console.log('Falling back to mock data. Check your orders table structure.')
        setOrders(getMockOrders())
      } else if (data && data.length > 0) {
        // Transform the data to match the expected interface
        const transformedOrders = data.map(order => ({
          id: order.id,
          order_number: order.order_number || `KF${order.id.slice(0, 8)}`,
          customer_id: order.user_id || null,
          email: extractEmailFromNotes(order.notes),
          phone: extractPhoneFromNotes(order.notes),
          status: order.status || 'pending',
          fulfillment_status: 'unfulfilled', // Default value
          payment_status: order.payment_status || 'pending',
          total: order.total_amount || 0,
          fulfillment_method: order.fulfillment_method || 'pickup',
          delivery_method: order.delivery_method || null,
          created_at: order.created_at,
          updated_at: order.updated_at || order.created_at
        }))
        
        console.log('Successfully loaded orders:', transformedOrders.length)
        setOrders(transformedOrders)
      } else {
        console.log('No orders found in database')
        setOrders([])
      }
    } catch (error) {
      console.error('Error:', error)
      setOrders(getMockOrders())
    } finally {
      setLoading(false)
    }
  }

  // Helper function to extract email from notes
  const extractEmailFromNotes = (notes: string | null): string | null => {
    if (!notes) return null
    const emailMatch = notes.match(/Customer: ([^,]+)/)
    return emailMatch ? emailMatch[1] : null
  }

  // Helper function to extract phone from notes
  const extractPhoneFromNotes = (notes: string | null): string | null => {
    if (!notes) return null
    const phoneMatch = notes.match(/Phone: ([^,]+)/)
    return phoneMatch ? phoneMatch[1] : null
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) {
        console.error('Error updating order:', error)
        alert('Error updating order status')
      } else {
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, status, updated_at: new Date().toISOString() }
            : order
        ))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error updating order status')
    }
  }

  const handleExportOrders = () => {
    const exportData = orders.map(order => ({
      'Order Number': order.order_number,
      'Email': order.email || '',
      'Phone': order.phone || '',
      'Status': order.status,
      'Fulfillment': order.fulfillment_method,
      'Delivery Method': order.delivery_method || '',
      'Total': order.total,
      'Payment Status': order.payment_status,
      'Created Date': new Date(order.created_at).toLocaleDateString(),
    }))

    downloadCSV(exportData, `kfresh-orders-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.phone?.includes(searchTerm)
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          color: 'bg-yellow-100 text-yellow-800', 
          icon: Clock, 
          iconColor: 'text-yellow-600' 
        }
      case 'confirmed':
        return { 
          color: 'bg-blue-100 text-blue-800', 
          icon: Check, 
          iconColor: 'text-blue-600' 
        }
      case 'processing':
        return { 
          color: 'bg-purple-100 text-purple-800', 
          icon: AlertCircle, 
          iconColor: 'text-purple-600' 
        }
      case 'ready':
        return { 
          color: 'bg-orange-100 text-orange-800', 
          icon: Check, 
          iconColor: 'text-orange-600' 
        }
      case 'completed':
        return { 
          color: 'bg-green-100 text-green-800', 
          icon: Check, 
          iconColor: 'text-green-600' 
        }
      case 'cancelled':
        return { 
          color: 'bg-red-100 text-red-800', 
          icon: AlertCircle, 
          iconColor: 'text-red-600' 
        }
      default:
        return { 
          color: 'bg-gray-100 text-gray-800', 
          icon: Clock, 
          iconColor: 'text-gray-600' 
        }
    }
  }

  const getDeliveryMethodLabel = (method: string | null) => {
    switch (method) {
      case 'uber_eats': return 'Uber Eats'
      case 'doordash': return 'DoorDash'
      default: return 'N/A'
    }
  }

  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600">Manage and track customer orders ({orders.length} total)</p>
          </div>
        <div className="flex gap-2">
          <button
            onClick={fetchOrders}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>Refresh Orders</span>
          </button>
          <button
            onClick={handleExportOrders}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Orders</span>
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-purple-600">{statusCounts.processing}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ready</p>
              <p className="text-2xl font-bold text-orange-600">{statusCounts.ready}</p>
            </div>
            <Check className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
            </div>
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Order</th>
                <th className="text-left p-4 font-medium text-gray-900">Customer</th>
                <th className="text-left p-4 font-medium text-gray-900">Total</th>
                <th className="text-left p-4 font-medium text-gray-900">Status</th>
                <th className="text-left p-4 font-medium text-gray-900">Fulfillment</th>
                <th className="text-left p-4 font-medium text-gray-900">Date</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status)
                const StatusIcon = statusConfig.icon
                
                return (
                  <tr key={order.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.order_number}</p>
                        <div className="flex items-center mt-1">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            order.payment_status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.payment_status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        {order.email && <p className="text-sm text-gray-900">{order.email}</p>}
                        {order.phone && <p className="text-xs text-gray-500">{order.phone}</p>}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="flex items-center space-x-1">
                          {order.fulfillment_method === 'delivery' ? (
                            <Truck className="h-4 w-4 text-blue-600" />
                          ) : (
                            <MapPin className="h-4 w-4 text-green-600" />
                          )}
                          <span className="text-sm font-medium capitalize">
                            {order.fulfillment_method}
                          </span>
                        </div>
                        {order.delivery_method && (
                          <p className="text-xs text-gray-500 mt-1">
                            via {getDeliveryMethodLabel(order.delivery_method)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-600 hover:text-blue-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <select
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          value=""
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="" disabled>Update Status</option>
                          <option value="confirmed">Confirm</option>
                          <option value="processing">Start Processing</option>
                          <option value="ready">Mark Ready</option>
                          <option value="completed">Complete</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="h-12 w-12 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredOrders.length} orders
            </p>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50">
                Previous
              </button>
              <span className="px-3 py-1 bg-green-600 text-white rounded">1</span>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Component - Remove this in production */}
      <DatabaseDebug />
    </div>
    </DashboardLayout>
  )
}

// Mock data for development
function getMockOrders(): Order[] {
  return [
    {
      id: '1',
      order_number: 'KF20250107001',
      customer_id: null,
      email: 'john.doe@example.com',
      phone: '+1-416-555-0123',
      status: 'processing',
      fulfillment_status: 'unfulfilled',
      payment_status: 'paid',
      total: 45.99,
      fulfillment_method: 'pickup',
      delivery_method: null,
      created_at: '2025-01-07T10:30:00Z',
      updated_at: '2025-01-07T11:15:00Z'
    },
    {
      id: '2',
      order_number: 'KF20250107002',
      customer_id: null,
      email: 'jane.smith@example.com',
      phone: '+1-416-555-0124',
      status: 'completed',
      fulfillment_status: 'fulfilled',
      payment_status: 'paid',
      total: 32.50,
      fulfillment_method: 'delivery',
      delivery_method: 'uber_eats',
      created_at: '2025-01-07T09:15:00Z',
      updated_at: '2025-01-07T10:45:00Z'
    },
    {
      id: '3',
      order_number: 'KF20250107003',
      customer_id: null,
      email: 'mike.johnson@example.com',
      phone: '+1-416-555-0125',
      status: 'pending',
      fulfillment_status: 'unfulfilled',
      payment_status: 'pending',
      total: 78.25,
      fulfillment_method: 'delivery',
      delivery_method: 'doordash',
      created_at: '2025-01-07T08:45:00Z',
      updated_at: '2025-01-07T08:45:00Z'
    },
    {
      id: '4',
      order_number: 'KF20250107004',
      customer_id: null,
      email: 'sarah.wilson@example.com',
      phone: '+1-416-555-0126',
      status: 'ready',
      fulfillment_status: 'partial',
      payment_status: 'paid',
      total: 23.99,
      fulfillment_method: 'pickup',
      delivery_method: null,
      created_at: '2025-01-07T07:20:00Z',
      updated_at: '2025-01-07T12:30:00Z'
    }
  ]
}