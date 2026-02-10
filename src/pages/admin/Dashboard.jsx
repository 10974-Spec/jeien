import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import {
  TrendingUp, ShoppingBag, Users, Package,
  DollarSign, Clock, Star, Eye,
  BarChart3, PlusCircle, FileText, Settings,
  CheckCircle, AlertCircle, XCircle, Truck,
  MoreVertical, ArrowUpRight, ArrowDownRight,
  Menu, ChevronRight
} from 'lucide-react'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    revenueGrowth: 12.5,
    orderGrowth: 8.3,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // In real implementation, create a dedicated dashboard service
      const [ordersRes, productsRes, vendorsRes, usersRes] = await Promise.all([
        api.get('/orders/admin/all?limit=5'),
        api.get('/products?limit=5&sortBy=stats.sales'),
        api.get('/vendors/all?limit=5'),
        api.get('/users?limit=5'),
      ])

      const orders = ordersRes.data.orders || []
      const products = productsRes.data.products || []
      const vendors = vendorsRes.data.vendors || []
      const users = usersRes.data.users || []

      setStats({
        totalOrders: ordersRes.data.analytics?.totalOrders || 0,
        totalRevenue: ordersRes.data.analytics?.totalRevenue || 0,
        totalVendors: vendors.length,
        totalProducts: products.length,
        totalUsers: users.length,
        pendingOrders: orders.filter(o => o.status === 'PENDING').length,
        revenueGrowth: 12.5,
        orderGrowth: 8.3,
      })

      setRecentOrders(orders)
      setTopProducts(products)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'PROCESSING':
        return <Truck className="h-4 w-4 text-blue-500" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] md:h-96">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600 text-sm md:text-base">Loading dashboard data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 px-3 sm:px-4 md:px-6">
      {/* Header - Mobile & Desktop */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center justify-between md:justify-start gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-0.5 md:mt-1">
              Welcome back! Here's what's happening today.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-sm">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="truncate">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Revenue Card */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl shadow-lg">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-blue-100">Total Revenue</h3>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2">
                KES {stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs sm:text-sm">
            <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-300" />
            <span className="text-green-300 font-medium">+{stats.revenueGrowth}%</span>
            <span className="text-blue-200 ml-1 sm:ml-2 truncate">from last month</span>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</h3>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {stats.totalOrders}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs sm:text-sm">
            <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            <span className="text-green-600 font-medium">+{stats.orderGrowth}%</span>
            <span className="text-gray-500 ml-1 sm:ml-2 truncate">from last month</span>
          </div>
        </div>

        {/* Vendors Card */}
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total Vendors</h3>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {stats.totalVendors}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            <span className="text-gray-900 font-medium">{stats.pendingOrders}</span> pending
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total Products</h3>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {stats.totalProducts}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            <span className="text-gray-900 font-medium">{stats.pendingOrders}</span> pending
          </div>
        </div>
      </div>

      {/* Charts and Tables Section - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Recent Orders
            </h3>
            <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3 md:space-y-4">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 sm:p-4 rounded-lg md:rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className={`p-1.5 sm:p-2 rounded-md md:rounded-lg ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{order.orderId}</h4>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {order.buyer?.name || 'Unknown Customer'}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-2 sm:ml-4 min-w-[80px] sm:min-w-[100px]">
                  <p className="font-bold text-gray-900 text-sm sm:text-base">
                    KES {order.totalAmount?.toLocaleString()}
                  </p>
                  <div className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full inline-block ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Top Products
            </h3>
            <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3 md:space-y-4">
            {topProducts.map((product, index) => (
              <div key={product._id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg md:rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
                <div className="relative flex-shrink-0">
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/60'}
                    alt={product.title}
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-cover rounded-lg"
                  />
                  <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-blue-600 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-1 md:line-clamp-2">
                    {product.title}
                  </h4>
                  <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
                    <div className="flex items-center">
                      <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-gray-600 ml-0.5 sm:ml-1">
                        {product.averageRating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                    <span className="text-xs text-gray-600">{product.stats?.sales || 0} sold</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-bold text-blue-700 text-sm sm:text-base">
                    KES {product.price?.toLocaleString()}
                  </p>
                  <button className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-0.5 sm:gap-1 mt-0.5">
                    <Eye className="h-3 w-3" />
                    <span className="hidden sm:inline">View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions - Responsive Grid */}
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            Quick Actions
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Common admin tasks</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="group flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center mb-2 sm:mb-3 transition-colors">
              <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <span className="font-medium text-gray-900 text-xs sm:text-sm md:text-base">Add Product</span>
            <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">New listing</span>
          </button>

          <button
            onClick={() => navigate('/admin/reports')}
            className="group flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center mb-2 sm:mb-3 transition-colors">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <span className="font-medium text-gray-900 text-xs sm:text-sm md:text-base">Reports</span>
            <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">Analytics</span>
          </button>

          <button
            onClick={() => navigate('/admin/users')}
            className="group flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center mb-2 sm:mb-3 transition-colors">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <span className="font-medium text-gray-900 text-xs sm:text-sm md:text-base">Users</span>
            <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">Manage</span>
          </button>

          <button
            onClick={() => navigate('/admin/logs')}
            className="group flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center mb-2 sm:mb-3 transition-colors">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <span className="font-medium text-gray-900 text-xs sm:text-sm md:text-base">Logs</span>
            <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">Activity</span>
          </button>
        </div>
      </div>

      {/* Additional Stats - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </div>
            <div>
              <h3 className="font-medium text-sm sm:text-base">Active Users</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
          <p className="text-blue-100 text-xs sm:text-sm">+23 new users this week</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </div>
            <div>
              <h3 className="font-medium text-sm sm:text-base">Success Rate</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">94.7%</p>
            </div>
          </div>
          <p className="text-green-100 text-xs sm:text-sm">+2.3% from last month</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center">
              <Clock className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </div>
            <div>
              <h3 className="font-medium text-sm sm:text-base">Response Time</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">2.4h</p>
            </div>
          </div>
          <p className="text-purple-100 text-xs sm:text-sm">Faster than average</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard