'use client'

import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  Eye
} from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function PaymentsPage() {
  const paymentStats = [
    {
      name: 'Total Revenue',
      value: '$12,543.75',
      change: '+15.3%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Today\'s Sales',
      value: '$892.50',
      change: '+8.7%',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Pending Payments',
      value: '$234.25',
      change: '-2.1%',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      name: 'Total Transactions',
      value: '487',
      change: '+12.4%',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  const recentTransactions = [
    {
      id: 'TXN-001',
      orderId: 'KF20250107001',
      amount: 45.99,
      method: 'Credit Card',
      status: 'completed',
      customer: 'john.doe@example.com',
      date: '2025-01-07T10:30:00Z'
    },
    {
      id: 'TXN-002', 
      orderId: 'KF20250107002',
      amount: 32.50,
      method: 'Debit Card',
      status: 'completed',
      customer: 'jane.smith@example.com',
      date: '2025-01-07T09:15:00Z'
    },
    {
      id: 'TXN-003',
      orderId: 'KF20250107003', 
      amount: 78.25,
      method: 'Cash',
      status: 'pending',
      customer: 'mike.johnson@example.com',
      date: '2025-01-07T08:45:00Z'
    },
    {
      id: 'TXN-004',
      orderId: 'KF20250107004',
      amount: 23.99,
      method: 'Credit Card',
      status: 'completed',
      customer: 'sarah.wilson@example.com', 
      date: '2025-01-07T07:20:00Z'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600">Track revenue, transactions, and payment status</p>
          </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
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
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
              <span className="text-sm text-gray-500 ml-2">from last month</span>
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
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Transaction ID</th>
                <th className="text-left p-4 font-medium text-gray-900">Order</th>
                <th className="text-left p-4 font-medium text-gray-900">Customer</th>
                <th className="text-left p-4 font-medium text-gray-900">Amount</th>
                <th className="text-left p-4 font-medium text-gray-900">Method</th>
                <th className="text-left p-4 font-medium text-gray-900">Status</th>
                <th className="text-left p-4 font-medium text-gray-900">Date</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{transaction.id}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-blue-600 hover:text-blue-800 cursor-pointer">
                      {transaction.orderId}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-900">{transaction.customer}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{formatPrice(transaction.amount)}</p>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center space-x-1">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{transaction.method}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
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
      </div>

      {/* Payment Methods Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Credit Cards</p>
            <p className="text-2xl font-bold text-blue-600">68%</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Cash</p>
            <p className="text-2xl font-bold text-green-600">22%</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <CreditCard className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Debit Cards</p>
            <p className="text-2xl font-bold text-purple-600">10%</p>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}