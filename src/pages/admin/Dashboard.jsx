import React, { useState, useEffect } from 'react'
import api from '../../services/api'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
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
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
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
          <h3 className="text-gray-500 text-sm">Total Vendors</h3>
          <p className="text-2xl font-bold">{stats.totalVendors}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pending Orders</h3>
          <p className="text-2xl font-bold">{stats.pendingOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Order ID</th>
                  <th className="text-left py-2">Customer</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{order.orderId}</td>
                    <td className="py-2">{order.buyer?.name}</td>
                    <td className="py-2">KES {order.totalAmount}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Top Products</h3>
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div key={product._id} className="flex items-center border-b pb-4">
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="ml-4 flex-1">
                  <h4 className="font-medium">{product.title}</h4>
                  <p className="text-gray-500 text-sm">KES {product.price}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{product.stats?.sales || 0} sold</p>
                  <p className="text-gray-500 text-sm">
                    Rating: {product.averageRating || 0}/5
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border rounded hover:bg-gray-50 text-center">
            Add New Product
          </button>
          <button className="p-4 border rounded hover:bg-gray-50 text-center">
            Create Category
          </button>
          <button className="p-4 border rounded hover:bg-gray-50 text-center">
            View Reports
          </button>
          <button className="p-4 border rounded hover:bg-gray-50 text-center">
            Manage Users
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard