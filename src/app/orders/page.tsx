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
  MapPin,
  X,
  Phone,
  Mail,
  User,
  Package,
  CreditCard,
  Calendar
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, downloadCSV } from '@/lib/utils'
import DatabaseDebug from '@/components/debug/DatabaseDebug'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface Order {
  id: string
  order_number: string
  customer_email: string | null
  customer_phone: string | null
  customer_name: string | null
  user_id: string | null
  status: string
  fulfillment_status: string
  payment_status: string
  payment_intent_id: string | null
  payment_method: string | null
  subtotal_cents: number
  tax_cents: number
  shipping_cents: number
  discount_cents: number
  total_cents: number
  fulfillment_method: string
  delivery_method: string | null
  delivery_address: any
  items: any
  notes: string | null
  special_instructions: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

// Order Details Modal Component
function OrderDetailsModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const formatCentsToPrice = (cents: number): string => {
    return formatPrice(cents / 100)
  }

  // Parse items - they could be stored as JSON string or already an array
  const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Order #{order.order_number}</h2>
              <p className="text-green-100 mt-1">
                {new Date(order.created_at).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Order Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                order.status === 'ready' ? 'bg-orange-100 text-orange-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Payment Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
                order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                order.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.payment_status}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Fulfillment</p>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                {order.fulfillment_method}
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-green-600" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.customer_name && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{order.customer_name}</span>
                </div>
              )}
              {order.customer_email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{order.customer_email}</span>
                </div>
              )}
              {order.customer_phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{order.customer_phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-green-600" />
              Order Items ({orderItems.length} items)
            </h3>
            <div className="space-y-3">
              {orderItems.length > 0 ? (
                orderItems.map((item: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name || item.product_name || 'Unknown Item'}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                        {/* Show customizations if any */}
                        {item.selectedExtras && item.selectedExtras.length > 0 && (
                          <p className="text-sm text-gray-500 mt-1">
                            Extras: {item.selectedExtras.map((e: any) => e.name || e).join(', ')}
                          </p>
                        )}
                        {item.selectedSwallow && (
                          <p className="text-sm text-gray-500">Swallow: {item.selectedSwallow.name || item.selectedSwallow}</p>
                        )}
                        {item.selectedProtein && (
                          <p className="text-sm text-gray-500">Protein: {item.selectedProtein.name || item.selectedProtein}</p>
                        )}
                        {item.special_instructions && (
                          <p className="text-sm text-orange-600 mt-1">Note: {item.special_instructions}</p>
                        )}
                      </div>
                      <p className="font-medium text-gray-900">
                        {item.price ? formatPrice(item.price * (item.quantity || 1)) :
                         item.total_cents ? formatCentsToPrice(item.total_cents) :
                         item.unit_price_cents ? formatCentsToPrice(item.unit_price_cents * (item.quantity || 1)) : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No item details available</p>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gray-50 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-green-600" />
              Payment Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCentsToPrice(order.subtotal_cents)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatCentsToPrice(order.tax_cents)}</span>
              </div>
              {order.shipping_cents > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatCentsToPrice(order.shipping_cents)}</span>
                </div>
              )}
              {order.discount_cents > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCentsToPrice(order.discount_cents)}</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between font-bold text-gray-900 text-lg">
                  <span>Total</span>
                  <span>{formatCentsToPrice(order.total_cents)}</span>
                </div>
              </div>
              {order.payment_method && (
                <p className="text-sm text-gray-500 mt-2">
                  Payment Method: {order.payment_method}
                </p>
              )}
              {order.payment_intent_id && (
                <p className="text-xs text-gray-400 mt-1 break-all">
                  Payment ID: {order.payment_intent_id}
                </p>
              )}
            </div>
          </div>

          {/* Delivery Address (if delivery) */}
          {order.fulfillment_method === 'delivery' && order.delivery_address && (
            <div className="bg-gray-50 rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Delivery Address
              </h3>
              <div className="text-gray-700">
                {typeof order.delivery_address === 'string' ? (
                  <p>{order.delivery_address}</p>
                ) : (
                  <>
                    {order.delivery_address.street && <p>{order.delivery_address.street}</p>}
                    {order.delivery_address.city && (
                      <p>
                        {order.delivery_address.city}
                        {order.delivery_address.state && `, ${order.delivery_address.state}`}
                        {order.delivery_address.postal_code && ` ${order.delivery_address.postal_code}`}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Notes & Special Instructions */}
          {(order.notes || order.special_instructions) && (
            <div className="bg-orange-50 rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                Notes & Instructions
              </h3>
              {order.notes && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Order Notes:</p>
                  <p className="text-gray-600">{order.notes}</p>
                </div>
              )}
              {order.special_instructions && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Special Instructions:</p>
                  <p className="text-gray-600">{order.special_instructions}</p>
                </div>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Timeline
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Created</span>
                <span className="text-gray-700">{new Date(order.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-700">{new Date(order.updated_at).toLocaleString()}</span>
              </div>
              {order.completed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Completed</span>
                  <span className="text-gray-700">{new Date(order.completed_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    console.log('🔄 Starting fetchOrders...')
    try {
      const supabase = createClient()
      console.log('📡 Making Supabase orders query with new structure...')
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          customer_email,
          customer_phone,
          customer_name,
          user_id,
          status,
          fulfillment_status,
          payment_status,
          payment_intent_id,
          payment_method,
          subtotal_cents,
          tax_cents,
          shipping_cents,
          discount_cents,
          total_cents,
          fulfillment_method,
          delivery_method,
          delivery_address,
          items,
          notes,
          special_instructions,
          created_at,
          updated_at,
          completed_at
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('❌ Orders Supabase error:', error)
        console.log('Database table might not exist yet. Please run the create-orders-table.sql script.')
        setOrders([]) // Show empty state instead of mock data
      } else {
        console.log(`✅ Successfully loaded ${data?.length || 0} real orders from database`)
        setOrders(data || [])
      }
    } catch (error) {
      console.error('❌ Orders fetch error:', error)
      setOrders([]) // Show empty state instead of mock data
    } finally {
      console.log('✅ Setting orders loading to false')
      setLoading(false)
    }
  }

  // Helper function to convert cents to dollars for display
  const formatCentsToPrice = (cents: number): string => {
    return formatPrice(cents / 100)
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
      'Customer Name': order.customer_name || '',
      'Email': order.customer_email || '',
      'Phone': order.customer_phone || '',
      'Status': order.status,
      'Payment Status': order.payment_status,
      'Payment Method': order.payment_method || '',
      'Fulfillment': order.fulfillment_method,
      'Delivery Method': order.delivery_method || '',
      'Subtotal': formatCentsToPrice(order.subtotal_cents),
      'Tax': formatCentsToPrice(order.tax_cents),
      'Total': formatCentsToPrice(order.total_cents),
      'Created Date': new Date(order.created_at).toLocaleDateString(),
      'Payment Intent': order.payment_intent_id || '',
    }))

    downloadCSV(exportData, `kfresh-orders-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_phone?.includes(searchTerm)
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
                        {order.customer_name && <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>}
                        {order.customer_email && <p className="text-sm text-gray-700">{order.customer_email}</p>}
                        {order.customer_phone && <p className="text-xs text-gray-500">{order.customer_phone}</p>}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {formatCentsToPrice(order.total_cents)}
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
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-2 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors flex items-center gap-1"
                          title="View Order Details"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="text-xs font-medium">View</span>
                        </button>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              updateOrderStatus(order.id, e.target.value)
                              e.target.value = "" // Reset select after update
                            }
                          }}
                          defaultValue=""
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
            {orders.length === 0 ? (
              <div>
                <p className="text-gray-500 mb-2">No orders in the system yet</p>
                <p className="text-sm text-gray-400">Orders will appear here once customers make purchases</p>
                <p className="text-xs text-gray-400 mt-2">Make sure to run create-orders-table.sql if you see database errors</p>
              </div>
            ) : (
              <p className="text-gray-500">No orders match your search criteria</p>
            )}
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
    </DashboardLayout>
  )
}

