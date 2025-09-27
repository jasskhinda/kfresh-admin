# KFresh Admin Panel

Professional e-commerce management dashboard for KFresh Supermarket. Simple, clean, and powerful admin interface for managing products, orders, payments, and reports.

## ✨ Features

### 📊 Dashboard Overview
- **Revenue Analytics** - Real-time sales and revenue tracking
- **Order Management** - View recent orders and status updates
- **Low Stock Alerts** - Monitor inventory levels
- **Quick Actions** - Fast access to common tasks

### 📦 Product Management
- **CRUD Operations** - Add, edit, delete, and view products
- **Bulk Actions** - Select multiple products for batch operations
- **Inventory Tracking** - Stock levels and low stock alerts
- **Category Management** - Organize products by categories
- **Price Management** - Regular and compare pricing
- **Export Data** - Download product catalogs as CSV

### 🛍️ Order Tracking
- **Order Status Management** - Update order statuses in real-time
- **Fulfillment Options** - Track pickup vs delivery orders
- **Delivery Integration** - Support for Uber Eats, DoorDash, Skip, Instacart
- **Customer Information** - View customer details and contact info
- **Order History** - Complete order timeline and updates

### 💳 Payment Tracking
- **Revenue Dashboard** - Daily, weekly, monthly revenue tracking
- **Transaction History** - Complete payment transaction logs
- **Payment Methods** - Credit cards, cash, debit card tracking
- **Payment Status** - Pending, completed, failed payment monitoring

### 📈 Reports & Downloads
- **Sales Reports** - Revenue analysis and trends
- **Inventory Reports** - Stock levels and movement
- **Customer Reports** - Customer data and purchase history
- **Quick Downloads** - Instant access to daily summaries
- **Custom Reports** - Generate reports by date range and type
- **Multiple Formats** - Export as CSV, Excel, or PDF

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy the `.env.local` file and add your Supabase keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tmufbgaxhtqgkvcngyxg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_CLIENT_URL=https://your-client-app.vercel.app
```

### 3. Run Development Server
```bash
npm run dev
```

The admin panel will be available at `http://localhost:3001`

### 4. Build for Production
```bash
npm run build
npm start
```

## 📋 Database Connection

This admin app shares the **same Supabase database** as the client app. Both applications connect to:
- **Project ID**: `tmufbgaxhtqgkvcngyxg`
- **Database**: All product, order, and customer data is synchronized
- **Real-time Updates**: Changes in admin immediately reflect on the client store

## 🎯 Core Admin Features

### Product Management
- ✅ **Add Products** - Create new products with all details
- ✅ **Edit Products** - Update pricing, inventory, descriptions
- ✅ **Delete Products** - Remove products individually or in bulk
- ✅ **Stock Control** - Monitor and update inventory levels
- ✅ **Price Updates** - Regular price and sale price management

### Order Processing
- ✅ **Order List** - View all orders with filtering
- ✅ **Status Updates** - Change order status (pending → processing → ready → completed)
- ✅ **Customer Info** - View customer contact details
- ✅ **Fulfillment Tracking** - Track pickup and delivery orders
- ✅ **Payment Status** - Monitor payment completion

### Business Intelligence
- ✅ **Revenue Tracking** - Daily, weekly, monthly sales
- ✅ **Inventory Alerts** - Low stock notifications
- ✅ **Export Reports** - Download business data
- ✅ **Payment Analytics** - Transaction and payment method analysis

## 🔄 Deployment

### Deploy to Vercel (Recommended)
1. Push code to your GitHub repository: `https://github.com/jasskhinda/kfreshadmin`
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🎉 Ready for Business

This admin panel provides everything needed to manage a professional e-commerce operation:

- **Product Catalog Management** - Complete CRUD operations
- **Order Processing** - From order to fulfillment
- **Inventory Control** - Stock monitoring and alerts
- **Financial Tracking** - Revenue and payment monitoring
- **Business Reports** - Data export and analysis
- **Professional Interface** - Clean, fast, reliable

Perfect for managing KFresh Supermarket's operations with the same database as the customer-facing store!

---

**Built with ❤️ for KFresh Supermarket Management**

## Latest Updates - September 27, 2025

- ✅ Fixed user deletion functionality with cascade deletion
- ✅ Implemented self-deletion prevention for admin safety
- ✅ Added visual lock indicator for own account
- ✅ Fixed user creation with proper profile management
- ✅ Enhanced review system with dynamic ratings
- ✅ Improved authentication flow and session handling
