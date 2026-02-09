import React, { useState, useEffect } from 'react'
import orderService from '../../services/order.service'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    fetchOrders()
  }, [filters])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate

      const response = await orderService.getAllOrders(params)
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

  const handleViewOrder = async (orderId) => {
    try {
      const response = await orderService.getOrderById(orderId)
      setSelectedOrder(response.data.order)
      setShowModal(true)
    } catch (error) {
      console.error('Failed to fetch order details:', error)
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
      <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Payment Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-3 py-2 border rounded"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-3 py-2 border rounded"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Order ID</th>
                  <th className="text-left py-3">Customer</th>
                  <th className="text-left py-3">Vendor</th>
                  <th className="text-left py-3">Amount</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Payment</th>
                  <th className="text-left py-3">Date</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="py-4">{order.orderId}</td>
                    <td className="py-4">
                      <p className="font-medium">{order.buyer?.name}</p>
                      <p className="text-sm text-gray-500">{order.deliveryAddress?.phone}</p>
                    </td>
                    <td className="py-4">{order.vendor?.storeName}</td>
                    <td className="py-4">KES {order.totalAmount}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs ${order.paymentStatus === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : order.paymentStatus === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className="px-2 py-1 text-sm border rounded"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleViewOrder(order._id)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{selectedOrder.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <span className={`px-2 py-1 rounded text-xs ${selectedOrder.paymentStatus === 'COMPLETED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Customer Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p><span className="font-medium">Name:</span> {selectedOrder.buyer?.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedOrder.buyer?.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedOrder.deliveryAddress?.phone}</p>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Delivery Address</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p>{selectedOrder.deliveryAddress?.fullName}</p>
                  <p>{selectedOrder.deliveryAddress?.street}</p>
                  <p>{selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.postalCode}</p>
                  <p>{selectedOrder.deliveryAddress?.country}</p>
                </div>
              </div>

              {/* Products */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Products</h3>
                <div className="border rounded">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border-b last:border-b-0">
                      {item.product?.images?.[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.title || 'Product'}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × KES {item.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">KES {item.quantity * item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>KES {selectedOrder.subtotal || selectedOrder.totalAmount}</span>
                </div>
                {selectedOrder.shippingCost > 0 && (
                  <div className="flex justify-between mb-2">
                    <span>Shipping:</span>
                    <span>KES {selectedOrder.shippingCost}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>KES {selectedOrder.totalAmount}</span>
                </div>
              </div>

              {/* Payment Details */}
              {selectedOrder.paymentDetails && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Payment Details</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <p><span className="font-medium">Method:</span> {selectedOrder.paymentMethod}</p>
                    {selectedOrder.paymentDetails.transactionId && (
                      <p><span className="font-medium">Transaction ID:</span> {selectedOrder.paymentDetails.transactionId}</p>
                    )}
                    {selectedOrder.paymentDetails.phoneNumber && (
                      <p><span className="font-medium">Phone:</span> {selectedOrder.paymentDetails.phoneNumber}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders