import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Package, MapPin, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react'
import orderService from '../../services/order.service'
import invoiceService from '../../services/invoice.service'
import toast from 'react-hot-toast'

const OrderDetails = () => {
    const { id } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [downloadingInvoice, setDownloadingInvoice] = useState(false)

    useEffect(() => {
        fetchOrderDetails()
    }, [id])

    const fetchOrderDetails = async () => {
        try {
            setLoading(true)
            const response = await orderService.getOrderById(id)
            setOrder(response.data.order)
        } catch (error) {
            console.error('Failed to fetch order details:', error)
            toast.error('Failed to load order details')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadInvoice = async () => {
        try {
            setDownloadingInvoice(true)
            const blob = await invoiceService.downloadInvoice(id)
            const filename = `invoice-${order.orderId}.pdf`
            invoiceService.triggerDownload(blob, filename)
            toast.success('Invoice downloaded successfully')
        } catch (error) {
            console.error('Failed to download invoice:', error)
            toast.error('Failed to download invoice')
        } finally {
            setDownloadingInvoice(false)
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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
                <p className="text-gray-600 mb-6">The order you are looking for does not exist.</p>
                <Link to="/orders" className="text-blue-600 hover:underline">
                    &larr; Back to Orders
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/orders" className="text-gray-500 hover:text-gray-700">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderId}</h1>
                        <p className="text-sm text-gray-500">
                            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleDownloadInvoice}
                    disabled={downloadingInvoice}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {downloadingInvoice ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    )}
                    Download Invoice
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Order Status */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-600" />
                            Order Status
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                            {order.trackingNumber && (
                                <span className="text-sm text-gray-600">
                                    Tracking: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{order.trackingNumber}</span>
                                </span>
                            )}
                        </div>
                        {/* Simple progress steps could go here if needed */}
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4">Items</h2>
                        <div className="divide-y">
                            {order.items?.map((item, index) => (
                                <div key={index} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                        <img
                                            src={item.image || item.product?.images?.[0] || 'https://via.placeholder.com/80'}
                                            alt={item.title}
                                            className="h-full w-full object-cover object-center"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col">
                                        <div>
                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                <h3>
                                                    <Link to={`/product/${item.product?._id}`} className="hover:text-blue-600">
                                                        {item.title}
                                                    </Link>
                                                </h3>
                                                <p className="ml-4">KES {(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">{item.vendorName || 'Vendor'}</p>
                                        </div>
                                        <div className="flex flex-1 items-end justify-between text-sm">
                                            <p className="text-gray-500">Qty {item.quantity}</p>
                                            <div className="flex">
                                                <Link to={`/product/${item.product?._id}`} className="font-medium text-blue-600 hover:text-blue-500">
                                                    Buy Again
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">KES {order.subtotal?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium">KES {order.shippingCost?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax</span>
                                <span className="font-medium">KES {order.taxAmount?.toLocaleString()}</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between text-base font-bold">
                                <span>Total</span>
                                <span>KES {order.totalAmount?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Details */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-gray-500" />
                            Delivery Details
                        </h2>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p className="font-medium text-gray-900">{order.deliveryAddress?.fullName}</p>
                            <p>{order.deliveryAddress?.street}</p>
                            <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.postalCode}</p>
                            <p>{order.deliveryAddress?.country}</p>
                            <p className="mt-2 text-gray-500">Phone: {order.deliveryAddress?.phone}</p>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-gray-500" />
                            Payment Info
                        </h2>
                        <div className="text-sm space-y-2">
                            <p className="flex justify-between">
                                <span className="text-gray-600">Method:</span>
                                <span className="font-medium">{order.paymentMethod}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                        order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {order.paymentStatus}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetails
