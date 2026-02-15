import React, { useState, useEffect } from 'react'
import orderService from '../../services/order.service'
import invoiceService from '../../services/invoice.service'
import toast from 'react-hot-toast'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ show: false, order: null })
  const [downloadingInvoice, setDownloadingInvoice] = useState(null)
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
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdating(orderId)
      await orderService.updateOrderStatus(orderId, { status: newStatus })
      toast.success(`Order status updated to ${newStatus}`)
      fetchOrders()
    } catch (error) {
      console.error('Failed to update order status:', error)
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const handleViewOrder = async (orderId) => {
    try {
      const response = await orderService.getOrderById(orderId)
      setSelectedOrder(response.data.order)
      setShowModal(true)
    } catch (error) {
      console.error('Failed to fetch order details:', error)
      toast.error('Failed to fetch order details')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'SHIPPED': return 'bg-blue-100 text-blue-800'
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-indigo-100 text-indigo-800'
      case 'PENDING': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'REFUNDED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDeleteClick = (order) => {
    setDeleteModal({ show: true, order })
  }

  const handleDeleteConfirm = async () => {
    try {
      await orderService.deleteOrder(deleteModal.order._id)
      setDeleteModal({ show: false, order: null })
      fetchOrders()
      toast.success('Order deleted successfully')
    } catch (error) {
      console.error('Failed to delete order:', error)
      toast.error('Failed to delete order: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDownloadInvoice = async (orderId) => {
    try {
      setDownloadingInvoice(orderId)
      const blob = await invoiceService.downloadInvoice(orderId)
      const order = orders.find(o => o._id === orderId)
      const filename = `invoice-${order?.orderId || orderId}.pdf`
      invoiceService.triggerDownload(blob, filename)
      toast.success('Invoice downloaded successfully')
    } catch (error) {
      console.error('Failed to download invoice:', error)
      toast.error('Failed to download invoice')
    } finally {
      setDownloadingInvoice(null)
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
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
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
            <option value="REFUNDED">Refunded</option>
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
                    <td className="py-4 font-medium">{order.orderId}</td>
                    <td className="py-4">
                      <p className="font-medium">{order.buyer?.name}</p>
                      <p className="text-sm text-gray-500">{order.deliveryAddress?.phone}</p>
                    </td>
                    <td className="py-4">
                      {order.items?.map(item => item.vendorName || item.vendorId?.storeName).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'N/A'}
                    </td>
                    <td className="py-4 font-medium">KES {order.totalAmount.toLocaleString()}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${order.paymentStatus === 'COMPLETED'
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
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={updating === order._id}
                          className={`px-2 py-1 text-sm border rounded cursor-pointer ${updating === order._id ? 'opacity-50 cursor-wait' : 'hover:border-blue-500'}`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="REFUNDED">Refunded</option>
                        </select>
                        <button
                          onClick={() => handleViewOrder(order._id)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(order._id)}
                          disabled={downloadingInvoice === order._id}
                          className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          title="Download Invoice PDF"
                        >
                          {downloadingInvoice === order._id ? (
                            <>
                              <span className="animate-spin h-3 w-3 border-b-2 border-green-800 rounded-full"></span>
                              Wait
                            </>
                          ) : 'Invoice'}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(order)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          Delete
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
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${selectedOrder.paymentStatus === 'COMPLETED'
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
                <div className="bg-gray-50 p-4 rounded border">
                  <p><span className="font-medium">Name:</span> {selectedOrder.buyer?.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedOrder.buyer?.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedOrder.deliveryAddress?.phone}</p>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Delivery Address</h3>
                <div className="bg-gray-50 p-4 rounded border">
                  <p className="font-medium">{selectedOrder.deliveryAddress?.fullName}</p>
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
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.title || item.product.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                          Maybe IMG
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.title || item.product?.title || 'Product'}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × KES {item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">KES {(item.quantity * item.price).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>KES {(selectedOrder.subtotal || selectedOrder.totalAmount).toLocaleString()}</span>
                </div>
                {selectedOrder.shippingCost > 0 && (
                  <div className="flex justify-between mb-2">
                    <span>Shipping:</span>
                    <span>KES {selectedOrder.shippingCost.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>KES {selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Details */}
              {selectedOrder.paymentDetails && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Payment Details</h3>
                  <div className="bg-gray-50 p-4 rounded border">
                    <p><span className="font-medium">Method:</span> {selectedOrder.paymentMethod}</p>
                    {selectedOrder.paymentDetails.transactionId && (
                      <p><span className="font-medium">Transaction ID:</span> {selectedOrder.paymentDetails.transactionId}</p>
                    )}
                    {selectedOrder.paymentDetails.phoneNumber && (
                      <p><span className="font-medium">Phone:</span> {selectedOrder.paymentDetails.phoneNumber}</p>
                    )}
                    {selectedOrder.paymentDetails.mpesaReceiptNumber && (
                      <p><span className="font-medium">M-Pesa Receipt:</span> {selectedOrder.paymentDetails.mpesaReceiptNumber}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Commission Breakdown */}
              {selectedOrder.commissionDetails && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Commission Breakdown</h3>
                  <div className="bg-blue-50 p-4 rounded border border-blue-100 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Order Total:</span>
                      <span className="font-semibold">KES {selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Commission Rate:</span>
                      <span>{selectedOrder.commissionDetails.rate}%</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-blue-200 pt-2">
                      <span>Admin Commission:</span>
                      <span className="text-red-600 font-medium">KES {selectedOrder.commissionDetails.adminAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Vendor Payout:</span>
                      <span className="text-green-600 font-medium">KES {selectedOrder.commissionDetails.vendorAmount.toLocaleString()}</span>
                    </div>
                    {selectedOrder.commissionDetails.processed && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-green-600 font-medium">
                          ✓ Commission processed on {new Date(selectedOrder.commissionDetails.processedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete order <strong>#{deleteModal.order?.orderNumber || deleteModal.order?._id?.slice(-6)}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, order: null })}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders