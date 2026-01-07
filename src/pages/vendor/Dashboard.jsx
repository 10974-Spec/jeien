import React, { useState, useEffect } from 'react'
import vendorService from '../../services/vendor.service'
import orderService from '../../services/order.service'
import productService from '../../services/product.service'

const VendorDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
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

      setStats({
        totalProducts: vendorStats.totalProducts || 0,
        totalOrders: vendorStats.totalOrders || 0,
        totalRevenue: vendorStats.totalRevenue || 0,
        pendingOrders: orders.filter(o => o.status === 'PENDING').length,
        lowStockProducts: products.filter(p => p.stock <= 10).length,
      })

      setRecentOrders(orders)
      setTopProducts(products)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Vendor Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-2xl font-bold">KES {stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Products</h3>
          <p className="text-2xl font-bold">{stats.totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pending Orders</h3>
          <p className="text-2xl font-bold">{stats.pendingOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent orders</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{order.orderId}</p>
                      <p className="text-sm text-gray-500">
                        {order.buyer?.name} • KES {order.totalAmount}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
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

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Top Products</h3>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No products yet</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product._id} className="flex items-center border-b pb-4 last:border-0">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded mr-3"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{product.title}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>KES {product.price}</span>
                      <span>Stock: {product.stock}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border rounded hover:bg-gray-50 text-center">
            Add New Product
          </button>
          <button className="p-4 border rounded hover:bg-gray-50 text-center">
            View All Orders
          </button>
          <button className="p-4 border rounded hover:bg-gray-50 text-center">
            Update Store Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default VendorDashboard