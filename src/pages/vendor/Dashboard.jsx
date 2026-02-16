import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import vendorService from '../../services/vendor.service'
import orderService from '../../services/order.service'
import productService from '../../services/product.service'

const VendorDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCommission: 0,
    netEarnings: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [vendorRes, ordersRes, productsRes] = await Promise.all([
        vendorService.getVendorStats(),
        orderService.getMyOrders({ limit: 5 }),
        productService.getVendorProducts({ limit: 5, sortBy: 'stats.sales' }),
      ])

      const vendorStats = vendorRes.data.overview || {}
      const orders = ordersRes.data.orders || []
      const products = productsRes.data.products || []

      // Calculate commission (10% of revenue)
      const totalRevenue = vendorStats.totalRevenue || 0
      const commissionRate = 10
      const totalCommission = parseFloat((totalRevenue * (commissionRate / 100)).toFixed(2))
      const netEarnings = parseFloat((totalRevenue - totalCommission).toFixed(2))

      setStats({
        totalProducts: vendorStats.totalProducts || 0,
        totalOrders: vendorStats.totalOrders || 0,
        totalRevenue,
        totalCommission,
        netEarnings,
        pendingOrders: orders.filter(o => o.status === 'PENDING').length,
        lowStockProducts: products.filter(p => p.stock <= 10).length,
      })

      setRecentOrders(orders)
      setTopProducts(products)
    } catch (error) {
      // Error handled silently, could add user-facing error message here
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Revenue Stats with Commission Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold">KES {stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs mt-2 opacity-75">100% of sales</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Admin Commission</h3>
            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-3xl font-bold">KES {stats.totalCommission.toLocaleString()}</p>
          <p className="text-xs mt-2 opacity-75">10% platform fee</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Your Net Earnings</h3>
            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold">KES {stats.netEarnings.toLocaleString()}</p>
          <p className="text-xs mt-2 opacity-75">90% after commission</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Orders</h3>
            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
          <p className="text-xs mt-2 opacity-75">{stats.pendingOrders} pending</p>
        </div>
      </div>

      {/* Info Banner about Commission */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Commission Structure</h4>
            <p className="text-sm text-blue-800">
              For every sale, 10% goes to platform fees and 90% is paid directly to your M-Pesa account.
              Payouts are processed automatically within 24-48 hours after order delivery.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent orders</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{order.orderId}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.buyer?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className="text-gray-700 font-medium">KES {order.totalAmount}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-green-600 font-medium">
                          You earn: KES {(order.totalAmount * 0.9).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Top Products</h3>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products yet</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product._id} className="flex items-center border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-lg mr-4 border border-gray-200"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{product.title}</p>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>KES {product.price}</span>
                      <span className={product.stock <= 10 ? 'text-red-600 font-medium' : ''}>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/vendor/products')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
          >
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-medium text-gray-700 group-hover:text-blue-700">Add New Product</span>
          </button>
          <button
            onClick={() => navigate('/vendor/orders')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
          >
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-medium text-gray-700 group-hover:text-blue-700">View All Orders</span>
          </button>
          <button
            onClick={() => navigate('/vendor/settings')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
          >
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium text-gray-700 group-hover:text-blue-700">Store Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default VendorDashboard