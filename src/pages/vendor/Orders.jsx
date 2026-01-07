import React, { useState, useEffect } from 'react'
import orderService from '../../services/order.service'

const VendorOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  })

  useEffect(() => {
    fetchOrders()
  }, [filters])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.search) params.search = filters.search
      
      const response = await orderService.getMyOrders(params)
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, { status: newStatus })
      fetchOrders()
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'SHIPPED': return 'bg-blue-100 text-blue-800'
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800'
      case 'PENDING': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="flex-1 px-4 py-2 border rounded"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border rounded"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading orders...</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold">{order.orderId}</p>
                    <p className="text-sm text-gray-500">
                      Customer: {order.buyer?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.deliveryAddress?.phone} • {order.deliveryAddress?.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">KES {order.totalAmount}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Items:</h4>
                  <div className="space-y-2">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center text-sm">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-10 h-10 object-cover rounded mr-3"
                          />
                        )}
                        <div className="flex-1">
                          <p>{item.title}</p>
                          <p className="text-gray-500">
                            KES {item.price} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">KES {item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded text-sm ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`px-3 py-1 rounded text-sm ${
                      order.paymentStatus === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Payment: {order.paymentStatus}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="px-3 py-1 text-sm border rounded"
                      >
                        <option value="PENDING">Mark as Pending</option>
                        <option value="PROCESSING">Mark as Processing</option>
                        <option value="SHIPPED">Mark as Shipped</option>
                        <option value="DELIVERED">Mark as Delivered</option>
                      </select>
                    )}
                    <button className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorOrders