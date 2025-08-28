'use client'

import { 
  Download, 
  FileText, 
  BarChart3, 
  Package, 
  ShoppingCart,
  Users,
  Calendar
} from 'lucide-react'
import { downloadCSV } from '@/lib/utils'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function DownloadsPage() {
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

  const quickReports = [
    {
      name: 'Today\'s Sales',
      description: 'All sales from today',
      value: '$892.50',
      action: 'Download'
    },
    {
      name: 'Low Stock Items',
      description: 'Products with stock ≤ 10',
      value: '12 items',
      action: 'Download'
    },
    {
      name: 'Pending Orders',
      description: 'Orders awaiting processing',
      value: '8 orders',
      action: 'Download'
    },
    {
      name: 'This Week\'s Revenue',
      description: 'Weekly revenue summary',
      value: '$5,243.75',
      action: 'Download'
    }
  ]

  const handleDownloadReport = (reportName: string, format: string) => {
    // Mock data generation based on report type
    let data: any[] = []
    
    switch (reportName) {
      case 'Products Report':
        data = [
          { Name: 'Ghana Yam', SKU: 'KF-GY-001', Price: 5.99, Stock: 3, Category: 'Fresh Produce' },
          { Name: 'Jollof Rice', SKU: 'KF-JR-001', Price: 12.99, Stock: 20, Category: 'Cooked Meals' },
          { Name: 'Fresh Ginger', SKU: 'KF-GR-001', Price: 3.49, Stock: 8, Category: 'Fresh Produce' }
        ]
        break
      case 'Orders Report':
        data = [
          { OrderNumber: 'KF20250107001', Customer: 'john.doe@example.com', Total: 45.99, Status: 'processing' },
          { OrderNumber: 'KF20250107002', Customer: 'jane.smith@example.com', Total: 32.50, Status: 'completed' }
        ]
        break
      case 'Sales Report':
        data = [
          { Date: '2025-01-07', Revenue: 892.50, Orders: 23, AvgOrderValue: 38.80 },
          { Date: '2025-01-06', Revenue: 1243.75, Orders: 31, AvgOrderValue: 40.12 }
        ]
        break
      default:
        data = [{ Message: 'Sample data for ' + reportName }]
    }

    const filename = `${reportName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(data, filename)
  }

  const handleQuickDownload = (reportName: string) => {
    let data: any[] = []
    
    switch (reportName) {
      case 'Today\'s Sales':
        data = [
          { Time: '09:00', Amount: 45.99, OrderId: 'KF20250107001' },
          { Time: '10:30', Amount: 32.50, OrderId: 'KF20250107002' },
          { Time: '11:45', Amount: 78.25, OrderId: 'KF20250107003' }
        ]
        break
      case 'Low Stock Items':
        data = [
          { Product: 'Ghana Yam', CurrentStock: 3, MinStock: 10 },
          { Product: 'Palm Oil', CurrentStock: 5, MinStock: 15 },
          { Product: 'Fresh Ginger', CurrentStock: 8, MinStock: 20 }
        ]
        break
      default:
        data = [{ Report: reportName, GeneratedAt: new Date().toISOString() }]
    }

    const filename = `${reportName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(data, filename)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Downloads & Reports</h1>
          <p className="text-gray-600">Export data and generate business reports</p>
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