'use client'

import { useState, useEffect } from 'react'
import { 
  Download, 
  FileText, 
  BarChart3, 
  Package, 
  ShoppingCart,
  Users,
  Calendar,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { downloadCSV, formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface QuickReportData {
  todaySales: number
  lowStockCount: number
  pendingOrdersCount: number
  weekRevenue: number
}

export default function DownloadsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quickData, setQuickData] = useState<QuickReportData>({
    todaySales: 0,
    lowStockCount: 0,
    pendingOrdersCount: 0,
    weekRevenue: 0
  })
  const reportTypes = [
    {
      name: 'Sales Report',
      description: 'Daily, weekly, and monthly sales data',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      formats: ['CSV', 'PDF']
    },
    {
      name: 'Products Report',
      description: 'Complete product catalog with pricing and inventory',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      formats: ['CSV', 'Excel']
    },
    {
      name: 'Orders Report',
      description: 'Order history, status, and fulfillment details',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      formats: ['CSV', 'PDF']
    },
    {
      name: 'Customer Report',
      description: 'Customer information and purchase history',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      formats: ['CSV']
    },
    {
      name: 'Inventory Report',
      description: 'Stock levels, low stock alerts, and inventory movements',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      formats: ['CSV', 'Excel']
    },
    {
      name: 'Financial Summary',
      description: 'Revenue, expenses, and profit analysis',
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      formats: ['PDF', 'CSV']
    }
  ]

  useEffect(() => {
    fetchQuickReportData()
  }, [])

  const fetchQuickReportData = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()
      
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      // Get today's sales
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total, payment_status')
        .gte('created_at', today)
        .eq('payment_status', 'paid')

      const todaySales = todayOrders?.reduce((sum, order) => sum + order.total, 0) || 0

      // Get low stock items
      const { data: lowStockProducts } = await supabase
        .from('products')
        .select('id, stock_quantity, low_stock_threshold')
        .or('stock_quantity.lte.low_stock_threshold,stock_quantity.lte.5')

      // Get pending orders
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_status', 'pending')

      // Get week's revenue
      const { data: weekOrders } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', weekAgo.toISOString())
        .eq('payment_status', 'paid')

      const weekRevenue = weekOrders?.reduce((sum, order) => sum + order.total, 0) || 0

      setQuickData({
        todaySales,
        lowStockCount: lowStockProducts?.length || 0,
        pendingOrdersCount: pendingOrders?.length || 0,
        weekRevenue
      })

    } catch (error) {
      console.error('Error fetching quick report data:', error)
      setError('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const quickReports = [
    {
      name: 'Today\'s Sales',
      description: 'All sales from today',
      value: formatPrice(quickData.todaySales),
      action: 'Download'
    },
    {
      name: 'Low Stock Items',
      description: 'Products with low stock',
      value: `${quickData.lowStockCount} items`,
      action: 'Download'
    },
    {
      name: 'Pending Orders',
      description: 'Orders awaiting processing',
      value: `${quickData.pendingOrdersCount} orders`,
      action: 'Download'
    },
    {
      name: 'This Week\'s Revenue',
      description: 'Weekly revenue summary',
      value: formatPrice(quickData.weekRevenue),
      action: 'Download'
    }
  ]

  const handleDownloadReport = async (reportName: string, format: string) => {
    try {
      const supabase = createClient()
      let data: any[] = []
      
      switch (reportName) {
        case 'Products Report':
          const { data: products } = await supabase
            .from('products')
            .select('name, sku, price, stock_quantity, categories(name)')
          
          data = products?.map((p: any) => ({
            Name: p.name,
            SKU: p.sku,
            Price: p.price,
            Stock: p.stock_quantity,
            Category: p.categories?.name || 'Uncategorized'
          })) || []
          break
          
        case 'Orders Report':
          const { data: orders } = await supabase
            .from('orders')
            .select('order_number, email, total, payment_status, created_at')
            .order('created_at', { ascending: false })
          
          data = orders?.map((o: any) => ({
            OrderNumber: o.order_number,
            Customer: o.email || 'Guest',
            Total: o.total,
            Status: o.payment_status,
            Date: new Date(o.created_at).toLocaleDateString()
          })) || []
          break
          
        case 'Sales Report':
          const { data: salesOrders } = await supabase
            .from('orders')
            .select('total, created_at, payment_status')
            .eq('payment_status', 'paid')
            .order('created_at', { ascending: false })
          
          const salesByDate: { [key: string]: { revenue: number, orders: number } } = {}
          salesOrders?.forEach(order => {
            const date = order.created_at.split('T')[0]
            if (!salesByDate[date]) {
              salesByDate[date] = { revenue: 0, orders: 0 }
            }
            salesByDate[date].revenue += order.total
            salesByDate[date].orders += 1
          })
          
          data = Object.entries(salesByDate).map(([date, stats]) => ({
            Date: date,
            Revenue: stats.revenue,
            Orders: stats.orders,
            AvgOrderValue: stats.orders > 0 ? (stats.revenue / stats.orders).toFixed(2) : 0
          }))
          break
          
        case 'Customer Report':
          const { data: customerOrders } = await supabase
            .from('orders')
            .select('email, total, created_at')
            .not('email', 'is', null)
            .order('created_at', { ascending: false })
          
          const customerStats: { [email: string]: { orders: number, totalSpent: number, lastOrder: string } } = {}
          customerOrders?.forEach(order => {
            if (!customerStats[order.email]) {
              customerStats[order.email] = { orders: 0, totalSpent: 0, lastOrder: '' }
            }
            customerStats[order.email].orders += 1
            customerStats[order.email].totalSpent += order.total
            if (!customerStats[order.email].lastOrder || order.created_at > customerStats[order.email].lastOrder) {
              customerStats[order.email].lastOrder = order.created_at
            }
          })
          
          data = Object.entries(customerStats).map(([email, stats]) => ({
            Email: email,
            TotalOrders: stats.orders,
            TotalSpent: stats.totalSpent,
            AvgOrderValue: (stats.totalSpent / stats.orders).toFixed(2),
            LastOrder: new Date(stats.lastOrder).toLocaleDateString()
          }))
          break
          
        case 'Inventory Report':
          const { data: inventory } = await supabase
            .from('products')
            .select('name, sku, stock_quantity, low_stock_threshold, price, categories(name)')
          
          data = inventory?.map((p: any) => ({
            Product: p.name,
            SKU: p.sku,
            CurrentStock: p.stock_quantity,
            LowStockThreshold: p.low_stock_threshold || 5,
            StockValue: (p.stock_quantity * p.price).toFixed(2),
            Status: p.stock_quantity <= (p.low_stock_threshold || 5) ? 'Low Stock' : 'Good Stock',
            Category: p.categories?.name || 'Uncategorized'
          })) || []
          break
          
        case 'Financial Summary':
          const { data: financialOrders } = await supabase
            .from('orders')
            .select('total, created_at, payment_status')
            .order('created_at', { ascending: false })
          
          const paidOrders = financialOrders?.filter(o => o.payment_status === 'paid') || []
          const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0)
          const totalOrders = paidOrders.length
          
          data = [
            {
              Metric: 'Total Revenue',
              Value: totalRevenue.toFixed(2),
              Period: 'All Time'
            },
            {
              Metric: 'Total Orders',
              Value: totalOrders,
              Period: 'All Time'
            },
            {
              Metric: 'Average Order Value',
              Value: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00',
              Period: 'All Time'
            }
          ]
          break
          
        default:
          data = [{ Message: 'Report data for ' + reportName, GeneratedAt: new Date().toISOString() }]
      }

      const filename = `${reportName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(data, filename)
      
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    }
  }

  const handleQuickDownload = async (reportName: string) => {
    try {
      const supabase = createClient()
      let data: any[] = []
      
      switch (reportName) {
        case 'Today\'s Sales':
          const today = new Date().toISOString().split('T')[0]
          const { data: todayOrders } = await supabase
            .from('orders')
            .select('order_number, total, created_at, email')
            .gte('created_at', today)
            .eq('payment_status', 'paid')
            .order('created_at', { ascending: false })
          
          data = todayOrders?.map((order: any) => ({
            Time: new Date(order.created_at).toLocaleTimeString(),
            Amount: order.total,
            OrderId: order.order_number,
            Customer: order.email || 'Guest'
          })) || []
          break
          
        case 'Low Stock Items':
          const { data: lowStockProducts } = await supabase
            .from('products')
            .select('name, stock_quantity, low_stock_threshold, categories(name)')
            .or('stock_quantity.lte.low_stock_threshold,stock_quantity.lte.5')
          
          data = lowStockProducts?.map((product: any) => ({
            Product: product.name,
            CurrentStock: product.stock_quantity,
            MinStock: product.low_stock_threshold || 5,
            Category: product.categories?.name || 'Uncategorized'
          })) || []
          break
          
        case 'Pending Orders':
          const { data: pendingOrders } = await supabase
            .from('orders')
            .select('order_number, total, created_at, email, payment_status')
            .eq('payment_status', 'pending')
            .order('created_at', { ascending: false })
          
          data = pendingOrders?.map((order: any) => ({
            OrderNumber: order.order_number,
            Amount: order.total,
            Customer: order.email || 'Guest',
            OrderDate: new Date(order.created_at).toLocaleDateString(),
            Status: order.payment_status
          })) || []
          break
          
        case 'This Week\'s Revenue':
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          
          const { data: weekOrders } = await supabase
            .from('orders')
            .select('total, created_at, payment_status')
            .gte('created_at', weekAgo.toISOString())
            .eq('payment_status', 'paid')
            .order('created_at', { ascending: false })
          
          const dailyRevenue: { [date: string]: number } = {}
          weekOrders?.forEach(order => {
            const date = order.created_at.split('T')[0]
            dailyRevenue[date] = (dailyRevenue[date] || 0) + order.total
          })
          
          data = Object.entries(dailyRevenue).map(([date, revenue]) => ({
            Date: date,
            Revenue: revenue,
            FormattedRevenue: formatPrice(revenue)
          }))
          break
          
        default:
          data = [{ Report: reportName, GeneratedAt: new Date().toISOString() }]
      }

      const filename = `${reportName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(data, filename)
      
    } catch (error) {
      console.error('Error generating quick report:', error)
      alert('Failed to generate report. Please try again.')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reports...</p>
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
              onClick={fetchQuickReportData}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Downloads & Reports</h1>
            <p className="text-gray-600">Export data and generate business reports</p>
          </div>
          <button
            onClick={fetchQuickReportData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </button>
        </div>

      {/* Quick Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Downloads</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickReports.map((report) => (
            <div key={report.name} className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{report.name}</h3>
                <span className="text-lg font-bold text-green-600">{report.value}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{report.description}</p>
              <button
                onClick={() => handleQuickDownload(report.name)}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                <span>{report.action}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Detailed Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <div key={report.name} className="border border-gray-200 rounded-lg p-6 hover:border-green-300 transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${report.bgColor}`}>
                  <report.icon className={`h-6 w-6 ${report.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {report.formats.map((format) => (
                  <button
                    key={format}
                    onClick={() => handleDownloadReport(report.name, format)}
                    className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download {format}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Report Generator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Custom Report Generator</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option>Sales Report</option>
              <option>Inventory Report</option>
              <option>Customer Report</option>
              <option>Financial Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last 12 months</option>
              <option>Custom range</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option>CSV</option>
              <option>Excel</option>
              <option>PDF</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={() => handleDownloadReport('Custom Report', 'CSV')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}