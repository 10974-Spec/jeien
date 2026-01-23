import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import orderService from '../../services/order.service'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    fetchOrders()

    // Add scroll event listener
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll)

    // Cleanup scroll listener on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [statusFilter])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter) params.status = statusFilter
      
      const response = await orderService.getMyOrders(params)
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded ${!statusFilter ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              All Orders
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-4 py-2 rounded ${statusFilter === 'PENDING' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('DELIVERED')}
              className={`px-4 py-2 rounded ${statusFilter === 'DELIVERED' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              Delivered
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {orders.length} orders found
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Link
              to="/"
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{order.orderId}</h3>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Order Items</h4>
                    <div className="space-y-4">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center border-b pb-4 last:border-0 last:pb-0">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded mr-4"
                            />
                          )}
                          <div className="flex-1">
                            <h5 className="font-medium">{item.title}</h5>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">KES {item.price * item.quantity}</p>
                            <p className="text-sm text-gray-500">KES {item.price} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-medium mb-2">Delivery Address</h4>
                      <p className="text-gray-700">
                        {order.deliveryAddress?.fullName}<br />
                        {order.deliveryAddress?.phone}<br />
                        {order.deliveryAddress?.street}<br />
                        {order.deliveryAddress?.city}, {order.deliveryAddress?.country}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Payment Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span>KES {order.subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping:</span>
                          <span>KES {order.shippingCost}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax:</span>
                          <span>KES {order.taxAmount}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between font-bold">
                            <span>Total:</span>
                            <span>KES {order.totalAmount}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Paid via {order.paymentMethod}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <button className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
                        Track Order
                      </button>
                    </div>
                    <div className="space-x-3">
                      {order.status === 'DELIVERED' && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                          Leave Review
                        </button>
                      )}
                      {order.status === 'PENDING' && (
                        <button className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200">
                          Cancel Order
                        </button>
                      )}
                      <Link
                        to={`/orders/${order._id}`}
                        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default Orders