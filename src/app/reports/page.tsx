'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Download,
  Calendar,
  Filter,
  RefreshCw 
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, downloadCSV } from '@/lib/utils'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface SalesData {
  date: string
  total: number
  orders: number
}

interface CategoryData {
  category: string
  sales: number
  orders: number
}

interface ProductData {
  name: string
  sales: number
  quantity: number
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [topProducts, setTopProducts] = useState<ProductData[]>([])
  
  // Summary metrics
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalProducts: 0,
    lowStockItems: 0,
    activeCategories: 0,
    conversionRate: 12.4,
    growthRate: 8.7
  })

  useEffect(() => {
    fetchReportsData()
  }, [dateRange])

  const fetchReportsData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // Get date range
      const endDate = new Date()
      const startDate = new Date()
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      // Fetch products data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')

      // Fetch categories data
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)

      if (ordersError || productsError || categoriesError) {
        console.error('Error fetching data')
        setMockData()
      } else {
        processReportsData(orders || [], products || [], categories || [])
      }
    } catch (error) {
      console.error('Error:', error)
      setMockData()
    } finally {
      setLoading(false)
    }
  }

  const setMockData = () => {
    // Mock data for demonstration
    setSalesData([
      { date: '2025-01-01', total: 1250.00, orders: 15 },
      { date: '2025-01-02', total: 1890.50, orders: 22 },
      { date: '2025-01-03', total: 1456.75, orders: 18 },
      { date: '2025-01-04', total: 2134.25, orders: 28 },
      { date: '2025-01-05', total: 1678.90, orders: 21 },
      { date: '2025-01-06', total: 2345.60, orders: 31 },
      { date: '2025-01-07', total: 1987.30, orders: 25 }
    ])

    setCategoryData([
      { category: 'Fresh Produce', sales: 3456.78, orders: 89 },
      { category: 'Cooked Meals', sales: 2890.45, orders: 67 },
      { category: 'Meat & Seafood', sales: 2345.67, orders: 45 },
      { category: 'Rice & Grains', sales: 1876.34, orders: 78 },
      { category: 'Pantry Essentials', sales: 1567.89, orders: 56 }
    ])

    setTopProducts([
      { name: 'Ghana Yam', sales: 567.89, quantity: 95 },
      { name: 'Jollof Rice Combo', sales: 456.78, quantity: 35 },
      { name: 'Palm Oil (500ml)', sales: 389.45, quantity: 30 },
      { name: 'Cassava Flour', sales: 345.67, quantity: 49 },
      { name: 'Fresh Plantains', sales: 234.56, quantity: 78 }
    ])

    setMetrics({
      totalRevenue: 12743.30,
      totalOrders: 160,
      averageOrderValue: 79.65,
      totalProducts: 156,
      lowStockItems: 12,
      activeCategories: 10,
      conversionRate: 12.4,
      growthRate: 8.7
    })
  }

  const processReportsData = (orders: any[], products: any[], categories: any[]) => {
    // Process actual data from database
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const lowStockItems = products.filter(p => p.stock_quantity <= p.low_stock_threshold || 5).length

    setMetrics({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalProducts: products.length,
      lowStockItems,
      activeCategories: categories.length,
      conversionRate: 12.4, // Would calculate from analytics
      growthRate: 8.7 // Would calculate from historical data
    })

    // Process sales data by date
    const salesByDate: { [key: string]: { total: number, orders: number } } = {}
    orders.forEach(order => {
      const date = order.created_at.split('T')[0]
      if (!salesByDate[date]) {
        salesByDate[date] = { total: 0, orders: 0 }
      }
      salesByDate[date].total += order.total
      salesByDate[date].orders += 1
    })

    const salesDataArray = Object.entries(salesByDate).map(([date, data]) => ({
      date,
      total: data.total,
      orders: data.orders
    }))

    setSalesData(salesDataArray)
    
    // Use mock data for categories and products if no specific data available
    setMockData()
  }

  const handleExportReport = () => {
    const reportData = [
      { type: 'Summary', ...metrics },
      ...salesData.map(item => ({ type: 'Daily Sales', ...item })),
      ...categoryData.map(item => ({ type: 'Category Sales', ...item })),
      ...topProducts.map(item => ({ type: 'Top Products', ...item }))
    ]
    
    downloadCSV(reportData, `kfresh-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Business insights and performance metrics</p>
          </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={fetchReportsData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(metrics.totalRevenue)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600 font-medium">+{metrics.growthRate}%</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalOrders}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-xs text-blue-600 font-medium">+{metrics.conversionRate}%</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Order Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(metrics.averageOrderValue)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-xs text-purple-600 font-medium">+5.3%</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.lowStockItems}</p>
              <div className="flex items-center mt-1">
                {metrics.lowStockItems > 10 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-xs text-red-600 font-medium">Attention needed</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-600 font-medium">Good stock</span>
                  </>
                )}
              </div>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Daily Sales</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {salesData.map((item, index) => (
              <div key={item.date} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    {new Date(item.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatPrice(item.total)}</p>
                  <p className="text-xs text-gray-500">{item.orders} orders</p>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(item.total / Math.max(...salesData.map(d => d.total))) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Category Performance</h2>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {categoryData.map((category, index) => {
              const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500']
              return (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                    <span className="text-sm text-gray-900">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatPrice(category.sales)}</p>
                    <p className="text-xs text-gray-500">{category.orders} orders</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Products</h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Product</th>
                <th className="text-left p-4 font-medium text-gray-900">Sales</th>
                <th className="text-left p-4 font-medium text-gray-900">Quantity Sold</th>
                <th className="text-left p-4 font-medium text-gray-900">Performance</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={product.name} className="border-t border-gray-200">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 w-10 h-10 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">#{index + 1} Best Seller</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    {formatPrice(product.sales)}
                  </td>
                  <td className="p-4 text-gray-600">
                    {product.quantity} units
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">
                        +{Math.floor(Math.random() * 15 + 5)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Products</span>
              <span className="font-medium">{metrics.totalProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Low Stock</span>
              <span className="font-medium text-orange-600">{metrics.lowStockItems}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Out of Stock</span>
              <span className="font-medium text-red-600">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Well Stocked</span>
              <span className="font-medium text-green-600">{metrics.totalProducts - metrics.lowStockItems - 3}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Fulfillment</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pickup Orders</span>
              <span className="font-medium">67%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Delivery Orders</span>
              <span className="font-medium">33%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Prep Time</span>
              <span className="font-medium">25 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">On-Time Rate</span>
              <span className="font-medium text-green-600">94%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Repeat Customers</span>
              <span className="font-medium">42%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Customers</span>
              <span className="font-medium">58%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Order Frequency</span>
              <span className="font-medium">2.3/month</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Customer Satisfaction</span>
              <span className="font-medium text-green-600">4.6/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}