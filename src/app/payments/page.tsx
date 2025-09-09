'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  Eye,
  AlertCircle
} from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface Order {
  id: string
  order_number: string
  total: number
  payment_method: string | null
  payment_status: string
  email: string | null
  created_at: string
}

interface PaymentStats {
  totalRevenue: number
  todaySales: number
  pendingPayments: number
  totalTransactions: number
}

export default function PaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    todaySales: 0,
    pendingPayments: 0,
    totalTransactions: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentData()
  }, [])

  const fetchPaymentData = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      // Fetch recent orders with payment information
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, total, payment_method, payment_status, email, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      if (ordersError) {
        console.error('Error fetching orders:', ordersError)
        setError('Failed to load payment data')
        return
      }

      setOrders(ordersData || [])

      // Calculate stats from orders data
      if (ordersData && ordersData.length > 0) {
        const totalRevenue = ordersData
          .filter(order => order.payment_status === 'paid')
          .reduce((sum, order) => sum + order.total, 0)

        const today = new Date().toISOString().split('T')[0]
        const todaySales = ordersData
          .filter(order => 
            order.created_at.startsWith(today) && 
            order.payment_status === 'paid'
          )
          .reduce((sum, order) => sum + order.total, 0)

        const pendingPayments = ordersData
          .filter(order => order.payment_status === 'pending')
          .reduce((sum, order) => sum + order.total, 0)

        setStats({
          totalRevenue,
          todaySales,
          pendingPayments,
          totalTransactions: ordersData.length
        })
      }

    } catch (error) {
      console.error('Error fetching payment data:', error)
      setError('Failed to load payment data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">{error}</p>
            <button 
              onClick={fetchPaymentData}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const paymentStats = [
    {
      name: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Today\'s Sales',
      value: formatPrice(stats.todaySales),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Pending Payments',
      value: formatPrice(stats.pendingPayments),
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      name: 'Total Transactions',
      value: stats.totalTransactions.toString(),
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600">Track revenue, transactions, and payment status</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchPaymentData}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Payment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paymentStats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
              <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                View All
              </button>
            </div>
          </div>
          
          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">Transactions will appear here once orders are placed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900">Order Number</th>
                    <th className="text-left p-4 font-medium text-gray-900">Customer</th>
                    <th className="text-left p-4 font-medium text-gray-900">Amount</th>
                    <th className="text-left p-4 font-medium text-gray-900">Method</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-left p-4 font-medium text-gray-900">Date</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                          {order.order_number}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-900">{order.email || 'Guest Customer'}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center space-x-1">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{order.payment_method || 'Not specified'}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                      </td>
                      <td className="p-4">
                        <button className="p-1 text-gray-600 hover:text-blue-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Payment Methods Distribution */}
      {orders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(() => {
              const methodCounts = orders.reduce((acc, order) => {
                const method = order.payment_method || 'Not specified'
                acc[method] = (acc[method] || 0) + 1
                return acc
              }, {} as Record<string, number>)

              const total = orders.length
              const methods = Object.entries(methodCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)

              const getMethodIcon = (method: string) => {
                if (method.toLowerCase().includes('credit')) return CreditCard
                if (method.toLowerCase().includes('debit')) return CreditCard
                if (method.toLowerCase().includes('cash')) return DollarSign
                return CreditCard
              }

              const getMethodColor = (index: number) => {
                const colors = [
                  { text: 'text-blue-600', bg: 'bg-blue-50' },
                  { text: 'text-green-600', bg: 'bg-green-50' },
                  { text: 'text-purple-600', bg: 'bg-purple-50' }
                ]
                return colors[index] || colors[0]
              }

              return methods.map(([method, count], index) => {
                const percentage = Math.round((count / total) * 100)
                const colors = getMethodColor(index)
                const Icon = getMethodIcon(method)

                return (
                  <div key={method} className={`text-center p-4 ${colors.bg} rounded-lg`}>
                    <Icon className={`h-8 w-8 ${colors.text} mx-auto mb-2`} />
                    <p className="font-medium text-gray-900">{method}</p>
                    <p className={`text-2xl font-bold ${colors.text}`}>{percentage}%</p>
                    <p className="text-sm text-gray-600">{count} orders</p>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  )
}