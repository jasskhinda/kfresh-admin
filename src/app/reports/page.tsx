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
  RefreshCw,
  AlertCircle 
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
  const [error, setError] = useState<string | null>(null)
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
    outOfStockItems: 0,
    wellStockedItems: 0
  })

  useEffect(() => {
    fetchReportsData()
  }, [dateRange])

  const fetchReportsData = async () => {
    try {
      setLoading(true)
      setError(null)
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
        .select('id, order_number, total, payment_method, payment_status, email, created_at, order_items(quantity, unit_price, products(name, category_id, categories(name)))')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })

      // Fetch products data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, low_stock_threshold, category_id, categories(name)')

      // Fetch categories data
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, is_active')
        .eq('is_active', true)

      if (ordersError || productsError || categoriesError) {
        console.error('Database errors:', { ordersError, productsError, categoriesError })
        setError('Failed to load reports data')
        return
      }

      processReportsData(orders || [], products || [], categories || [])

    } catch (error) {
      console.error('Reports fetch error:', error)
      setError('Failed to load reports data')
    } finally {
      setLoading(false)
    }
  }


  const processReportsData = (orders: any[], products: any[], categories: any[]) => {
    // Calculate basic metrics
    const totalRevenue = orders
      .filter(order => order.payment_status === 'paid')
      .reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    
    // Calculate stock metrics
    const lowStockItems = products.filter(p => 
      p.stock_quantity <= (p.low_stock_threshold || 5)
    ).length
    const outOfStockItems = products.filter(p => p.stock_quantity === 0).length
    const wellStockedItems = products.length - lowStockItems - outOfStockItems

    setMetrics({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalProducts: products.length,
      lowStockItems,
      activeCategories: categories.length,
      outOfStockItems,
      wellStockedItems
    })

    // Process sales data by date
    const salesByDate: { [key: string]: { total: number, orders: number } } = {}
    orders.forEach(order => {
      const date = order.created_at.split('T')[0]
      if (!salesByDate[date]) {
        salesByDate[date] = { total: 0, orders: 0 }
      }
      if (order.payment_status === 'paid') {
        salesByDate[date].total += order.total
      }
      salesByDate[date].orders += 1
    })

    const salesDataArray = Object.entries(salesByDate)
      .map(([date, data]) => ({
        date,
        total: data.total,
        orders: data.orders
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setSalesData(salesDataArray)
    
    // Process category performance data
    const categoryStats: { [key: string]: { sales: number, orders: Set<string> } } = {}
    
    orders.forEach(order => {
      if (order.order_items && order.payment_status === 'paid') {
        order.order_items.forEach((item: any) => {
          if (item.products?.categories?.name) {
            const categoryName = item.products.categories.name
            if (!categoryStats[categoryName]) {
              categoryStats[categoryName] = { sales: 0, orders: new Set() }
            }
            categoryStats[categoryName].sales += item.quantity * item.unit_price
            categoryStats[categoryName].orders.add(order.id)
          }
        })
      }
    })

    const categoryDataArray = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        sales: stats.sales,
        orders: stats.orders.size
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)

    setCategoryData(categoryDataArray)

    // Process top products data
    const productStats: { [key: string]: { sales: number, quantity: number } } = {}
    
    orders.forEach(order => {
      if (order.order_items && order.payment_status === 'paid') {
        order.order_items.forEach((item: any) => {
          if (item.products?.name) {
            const productName = item.products.name
            if (!productStats[productName]) {
              productStats[productName] = { sales: 0, quantity: 0 }
            }
            productStats[productName].sales += item.quantity * item.unit_price
            productStats[productName].quantity += item.quantity
          }
        })
      }
    })

    const topProductsArray = Object.entries(productStats)
      .map(([name, stats]) => ({
        name,
        sales: stats.sales,
        quantity: stats.quantity
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)

    setTopProducts(topProductsArray)
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
                <span className="text-xs text-green-600 font-medium">Revenue</span>
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
                <span className="text-xs text-blue-600 font-medium">Total orders</span>
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
                        {product.quantity} sold
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
              <span className="font-medium text-red-600">{metrics.outOfStockItems}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Well Stocked</span>
              <span className="font-medium text-green-600">{metrics.wellStockedItems}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Paid Orders</span>
              <span className="font-medium text-green-600">
                {metrics.totalOrders > 0 ? 
                  Math.round((salesData.reduce((sum, day) => sum + day.orders, 0) / metrics.totalOrders) * 100) : 0
                }%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Orders</span>
              <span className="font-medium text-orange-600">
                {metrics.totalOrders > 0 ? 
                  100 - Math.round((salesData.reduce((sum, day) => sum + day.orders, 0) / metrics.totalOrders) * 100) : 0
                }%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Daily Average</span>
              <span className="font-medium">
                {salesData.length > 0 ? 
                  Math.round(salesData.reduce((sum, day) => sum + day.orders, 0) / salesData.length) : 0
                } orders
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Peak Day Revenue</span>
              <span className="font-medium text-green-600">
                {salesData.length > 0 ? 
                  formatPrice(Math.max(...salesData.map(day => day.total))) : 
                  formatPrice(0)
                }
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Categories Active</span>
              <span className="font-medium">{metrics.activeCategories}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Best Category</span>
              <span className="font-medium text-green-600">
                {categoryData.length > 0 ? categoryData[0].category : 'No data'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Top Product Sales</span>
              <span className="font-medium">
                {topProducts.length > 0 ? formatPrice(topProducts[0].sales) : formatPrice(0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stock Health</span>
              <span className="font-medium text-green-600">
                {metrics.totalProducts > 0 ? 
                  Math.round((metrics.wellStockedItems / metrics.totalProducts) * 100) : 0
                }% Good
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}