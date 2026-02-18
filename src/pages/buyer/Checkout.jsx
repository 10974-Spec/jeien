import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import orderService from '../../services/order.service'
import paymentService from '../../services/payment.service'
import userService from '../../services/user.service'
import toast from 'react-hot-toast'
import { formatPhoneNumber } from '../../utils/phone.utils'

const Checkout = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { cartItems, getCartTotal, clearCart } = useCart()

  const [loading, setLoading] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('MPESA')
  const [orderData, setOrderData] = useState({
    deliveryAddress: {
      fullName: '',
      phone: '',
      email: '',
      country: 'Kenya',
      city: '',
      street: '',
      postalCode: '',
    },
    customerNotes: '',
  })
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [pollingInterval, setPollingInterval] = useState(null)
  const [order, setOrder] = useState(null)
  const [isTestMode, setIsTestMode] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }

    if (cartItems.length === 0) {
      navigate('/cart')
      return
    }

    fetchAddresses()
    initializeOrderData()
    checkTestMode()

    // Add scroll event listener
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll)

    // Cleanup polling and scroll listener on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isAuthenticated, cartItems.length, navigate])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const checkTestMode = async () => {
    try {
      const response = await paymentService.getPaymentMethods()
      if (response.data.testMode) {
        setIsTestMode(true)
        console.log('Payment system is in TEST MODE')
      }
    } catch (error) {
      console.log('Could not determine payment mode, assuming test mode')
      setIsTestMode(true)
    }
  }

  const fetchAddresses = async () => {
    try {
      const response = await userService.getUserProfile()
      const userData = response.data.user
      if (userData.addresses) {
        setAddresses(userData.addresses)
        const defaultAddress = userData.addresses.find(addr => addr.isDefault) || userData.addresses[0]
        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id)
          setOrderData(prev => ({
            ...prev,
            deliveryAddress: {
              fullName: defaultAddress.fullName,
              phone: defaultAddress.phone,
              email: user.email || '',
              country: defaultAddress.country || 'Kenya',
              city: defaultAddress.city,
              street: defaultAddress.street,
              postalCode: defaultAddress.postalCode || '',
            }
          }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
      toast.error('Failed to load addresses')
    }
  }

  const initializeOrderData = () => {
    if (user) {
      setOrderData(prev => ({
        ...prev,
        deliveryAddress: {
          ...prev.deliveryAddress,
          fullName: user.name,
          email: user.email,
          phone: user.phone || '',
        }
      }))
      setMpesaPhone(user.phone || '')
    }
  }

  const handleAddressChange = (addressId) => {
    setSelectedAddress(addressId)
    const address = addresses.find(addr => addr._id === addressId)
    if (address) {
      setOrderData(prev => ({
        ...prev,
        deliveryAddress: {
          fullName: address.fullName,
          phone: address.phone,
          email: user.email || '',
          country: address.country || 'Kenya',
          city: address.city,
          street: address.street,
          postalCode: address.postalCode || '',
        }
      }))
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('deliveryAddress.')) {
      const field = name.split('.')[1]
      setOrderData(prev => ({
        ...prev,
        deliveryAddress: {
          ...prev.deliveryAddress,
          [field]: field === 'phone' ? formatPhoneNumber(value) : value
        }
      }))
    } else {
      setOrderData(prev => ({ ...prev, [name]: value }))
    }
  }

  const validateForm = () => {
    const { fullName, phone, country, city, street } = orderData.deliveryAddress

    if (!fullName || !phone || !country || !city || !street) {
      toast.error('Please fill in all required address fields')
      return false
    }

    if (paymentMethod === 'MPESA' && !mpesaPhone) {
      toast.error('Please enter your M-Pesa phone number')
      return false
    }

    if (paymentMethod === 'MPESA' && mpesaPhone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid phone number (10 digits minimum)')
      return false
    }

    return true
  }

  const createOrder = async () => {
    try {
      // Prepare order items exactly as the backend expects
      const items = cartItems.map(item => {
        let price = parseFloat(item.price);

        // If price seems too high (like 20000 instead of 200), divide by 100
        if (price > 10000) {
          console.log('Adjusting price from', price, 'to', price / 100);
          price = price / 100;
        }

        return {
          productId: item._id,
          title: item.title,
          price: price.toFixed(2),
          quantity: item.quantity,
          attributes: item.attributes || [],
          vendorId: item.vendorId || item.vendor?._id,
          image: item.images?.[0] || ''
        }
      })

      // Calculate amounts with ZERO TAX
      const subtotal = parseFloat(getCartTotal().toFixed(2))
      const tax = 0 // ZERO TAX - NO TAX FOR BUYERS
      const shipping = 0 // FREE SHIPPING
      const total = parseFloat((subtotal + shipping).toFixed(2)) // NO TAX ADDED

      console.log('Calculated amounts (ZERO TAX & FREE SHIPPING):', {
        subtotal,
        tax,
        shipping,
        total,
        calculation: `subtotal(${subtotal}) + tax(${tax}) + shipping(${shipping}) = total(${total})`,
        cartItemsDebug: cartItems.map(item => ({
          title: item.title,
          originalPrice: item.price,
          parsedPrice: parseFloat(item.price),
          quantity: item.quantity,
          itemTotal: parseFloat(item.price) * item.quantity
        }))
      })

      // Get unique vendor IDs
      const vendorIds = [...new Set(cartItems
        .map(item => item.vendorId || item.vendor?._id)
        .filter(id => id))]

      const orderPayload = {
        items,
        deliveryAddress: {
          ...orderData.deliveryAddress,
          phone: orderData.deliveryAddress.phone.replace(/\D/g, '')
        },
        paymentMethod,
        customerNotes: orderData.customerNotes,
        shippingMethod: 'Standard',
        vendorIds,
        applyFreeShipping: true // Request free shipping
      }

      console.log('Creating order with payload:', orderPayload)

      const response = await orderService.createOrder(orderPayload)
      const order = response.data.order

      console.log('Order created successfully:', order)

      setOrderId(order._id)
      setOrder(order)
      return order
    } catch (error) {
      console.error('Failed to create order:', error)
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create order'
      toast.error(errorMessage)

      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors)
      }

      throw error
    }
  }

  const initiatePayment = async (order) => {
    try {
      const amount = parseFloat(order.totalAmount)

      console.log('Initiating payment for order:', {
        orderId: order._id,
        orderAmount: amount,
        paymentMethod,
        isTestMode,
        taxApplied: false, // NO TAX
        taxAmount: 0 // ZERO TAX
      })

      // Format phone number for M-Pesa
      let formattedPhone = mpesaPhone.replace(/\D/g, '')

      // Ensure it starts with 254 if it's a local number
      if (formattedPhone.startsWith('0')) {
        formattedPhone = `254${formattedPhone.substring(1)}`
      } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
        formattedPhone = `254${formattedPhone}`
      }
      // If it already starts with 254, leave it as is.


      console.log('Formatted phone number:', formattedPhone)

      const paymentData = {
        orderId: order._id,
        phone: formattedPhone,
        amount: Math.round(amount)
      }

      console.log('Final payment data being sent:', paymentData)

      let response
      switch (paymentMethod) {
        case 'MPESA':
          // If in test mode, use test payment endpoint
          if (isTestMode) {
            console.log('Using test payment endpoint')
            response = await paymentService.testMpesaPayment(paymentData)
          } else {
            response = await paymentService.initiateMpesaPayment(paymentData)
          }
          break
        case 'PAYPAL':
          response = await paymentService.processPayPalPayment(paymentData)
          break
        case 'CARD':
          response = await paymentService.processCardPayment(paymentData)
          break
        default:
          throw new Error('Unsupported payment method')
      }

      console.log('Payment response:', response.data)
      return response.data

    } catch (error) {
      console.error('Payment error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      })

      throw new Error(error.response?.data?.message || error.message || 'Payment failed')
    }
  }

  const processMpesaPayment = async (order) => {
    try {
      setProcessingPayment(true)

      const result = await initiatePayment(order)

      if (result.success) {
        if (isTestMode) {
          toast.success('Test payment initiated! Simulating M-Pesa payment...')
          // For test mode, start polling immediately
          startPolling(order._id, result.checkoutRequestId || result.transactionId)
        } else {
          toast.success('M-Pesa payment initiated! Please check your phone for the STK Push prompt.')
          startPolling(order._id, result.checkoutRequestId || result.transactionId)
        }
      } else {
        toast.error(result.message || 'Failed to initiate payment')
        setProcessingPayment(false)
      }
    } catch (error) {
      console.error('M-Pesa payment error:', error)
      toast.error(error.message || 'Payment failed')
      setProcessingPayment(false)
    }
  }

  const startPolling = (orderId, transactionId) => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
    }

    let attempts = 0
    const maxAttempts = isTestMode ? 2 : 60 // 60 attempts = 10 minutes in production

    const interval = setInterval(async () => {
      attempts++
      console.log(`Polling payment status attempt ${attempts}/${maxAttempts}`)

      try {
        const statusResponse = await paymentService.getPaymentStatus(orderId)
        console.log('Payment status response:', statusResponse.data)

        if (statusResponse.data.paymentStatus === 'COMPLETED') {
          clearInterval(interval)
          setPollingInterval(null)
          setProcessingPayment(false)

          const orderIdDisplay = statusResponse.data.orderId || orderId
          toast.success(`Payment completed successfully! Order ${orderIdDisplay} is being processed.`, {
            duration: 5000
          })

          clearCart()
          navigate('/orders')
        } else if (statusResponse.data.paymentStatus === 'FAILED') {
          clearInterval(interval)
          setPollingInterval(null)
          setProcessingPayment(false)
          toast.error('Payment failed. Please try again.')
        } else if (statusResponse.data.paymentStatus === 'PROCESSING') {
          // If in test mode and we've polled enough, manually complete
          if (isTestMode && attempts >= maxAttempts) {
            console.log('Test mode: Manually completing payment...')

            try {
              // Try to manually complete the test payment
              const completeResponse = await paymentService.testMpesaPayment({
                orderId: orderId,
                phone: mpesaPhone,
                amount: Math.round(order?.totalAmount || 0)
              })

              if (completeResponse.data.success) {
                clearInterval(interval)
                setPollingInterval(null)
                setProcessingPayment(false)
                toast.success('Test payment completed! Redirecting to your orders...', {
                  duration: 4000
                })
                clearCart()
                navigate('/orders')
              }
            } catch (error) {
              console.error('Error completing test payment:', error)
            }
          }

          console.log('Payment still processing...')
        } else if (attempts >= maxAttempts) {
          // Final check before giving up
          console.log('Max attempts reached, doing final status check...')

          try {
            const finalCheck = await paymentService.getPaymentStatus(orderId)

            if (finalCheck.data.paymentStatus === 'COMPLETED') {
              clearInterval(interval)
              setPollingInterval(null)
              setProcessingPayment(false)

              toast.success('Payment completed! Redirecting to your orders...', {
                duration: 5000
              })
              clearCart()
              navigate('/orders')
              return
            }
          } catch (error) {
            console.error('Final status check error:', error)
          }

          clearInterval(interval)
          setPollingInterval(null)
          setProcessingPayment(false)


          if (isTestMode) {
            toast.error('Test payment timed out. You can try manually checking status.', {
              duration: 6000
            })
          } else {
            // In production/local without callback, we need to let them know
            toast.error(
              'Payment confirmation not received yet. If you have paid, please click "Check Payment Status" below.',
              { duration: 8000 }
            )
          }

          // specific flag to show manual check button
          setProcessingPayment(true) // Keep it true so we can show the button
        }
      } catch (error) {
        console.error('Payment status check error:', error)

        if (attempts >= maxAttempts) {
          clearInterval(interval)
          setPollingInterval(null)
          setProcessingPayment(false)

          toast.info(
            'Unable to confirm payment status. Please check "My Orders" page. If you completed the M-Pesa payment, your order will appear there.',
            {
              duration: 8000,
              action: {
                label: 'View Orders',
                onClick: () => navigate('/orders')
              }
            }
          )
        }
      }
    }, isTestMode ? 2000 : 10000) // Check every 2 seconds in test mode, 10 in production

    setPollingInterval(interval)
  }

  const handleManualCheck = async () => {
    if (!orderId) return

    try {
      setLoading(true)
      // Check status
      const statusResponse = await paymentService.getPaymentStatus(orderId)

      if (statusResponse.data.paymentStatus === 'COMPLETED') {
        toast.success('Payment confirmed! Processing your order...')
        clearCart()
        setProcessingPayment(false)
        navigate('/orders')
      } else {
        toast.error(`Payment status: ${statusResponse.data.paymentStatus}. If you have paid, please wait a moment and try again.`)

        // In dev mode/test mode, we offer a way to force success since callback setup is hard locally
        if ((isTestMode || window.location.hostname === 'localhost')) {
          // We use a confirm dialog as a simple UI for this dev-only feature
          if (window.confirm("Development/Test Mode: Payment callback likely failed to reach localhost. \n\nClick OK to simulate a successful callback from the backend.")) {
            try {
              toast.loading("Simulating callback...");
              await paymentService.testMpesaPayment({
                orderId: orderId,
                phone: mpesaPhone,
                amount: Math.round(order?.totalAmount || 0),
                forceSuccess: true
              });
              toast.dismiss();
              toast.success("Payment simulated successfully!");
              clearCart();
              setProcessingPayment(false);
              navigate('/orders');
            } catch (e) {
              console.error(e);
              toast.error("Failed to simulate payment.");
            }
          }
        }
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to check status')
    } finally {
      setLoading(false)
    }
  }

  const handleOtherPayment = async (order) => {
    try {
      const result = await initiatePayment(order)

      if (result.success) {
        if (paymentMethod === 'PAYPAL') {
          if (result.redirectUrl) {
            window.location.href = result.redirectUrl
          } else {
            toast.success(`PayPal payment completed! Order ${order.orderId} is being processed.`, {
              duration: 5000
            })
            clearCart()
            navigate('/orders')
          }
        } else if (paymentMethod === 'CARD') {
          toast.success(`Card payment completed! Order ${order.orderId} is being processed.`, {
            duration: 5000
          })
          clearCart()
          navigate('/orders')
        }
      } else {
        toast.error(result.message || 'Payment failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.message || 'Payment failed')
    }
  }

  const handlePlaceOrder = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      const newOrder = await createOrder()
      console.log('Order created successfully:', newOrder)

      if (paymentMethod === 'MPESA') {
        await processMpesaPayment(newOrder)
      } else if (paymentMethod === 'CASH_ON_DELIVERY') {
        clearCart()
        toast.success(`Order ${newOrder.orderId} placed successfully! Please have cash ready for delivery.`, {
          duration: 5000
        })
        navigate('/orders')
      } else if (paymentMethod === 'PAYPAL' || paymentMethod === 'CARD') {
        await handleOtherPayment(newOrder)
      }

    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error.message || 'Failed to place order')
    } finally {
      if (paymentMethod !== 'MPESA') {
        setLoading(false)
      }
    }
  }

  const cancelPayment = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
    setProcessingPayment(false)
    toast.info('Payment process cancelled')
  }

  if (!isAuthenticated || cartItems.length === 0) {
    return null
  }

  // Calculate totals with ZERO TAX
  const subtotal = parseFloat(getCartTotal().toFixed(2))
  const tax = 0 // ZERO TAX - NO TAX FOR BUYERS
  const shipping = 0 // FREE SHIPPING
  const total = parseFloat((subtotal + shipping).toFixed(2)) // NO TAX ADDED

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>

      {/* Test Mode Banner */}
      {isTestMode && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="h-6 w-6 text-yellow-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Test Mode Active</p>
              <p className="text-sm">Payments are simulated. No real money will be deducted.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Checkout Form */}
        <div className="lg:w-2/3 space-y-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Delivery Address</h2>

            {addresses.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-3">Select Address</h3>
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedAddress === address._id
                        ? 'border-blue-500 bg-blue-50 transform scale-[1.02]'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => handleAddressChange(address._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{address.fullName}</p>
                          <p className="text-gray-600 mt-1">{address.phone}</p>
                          <p className="text-gray-600 text-sm mt-1">
                            {address.street}, {address.city}, {address.country}
                          </p>
                          {address.postalCode && (
                            <p className="text-gray-500 text-sm mt-1">Postal Code: {address.postalCode}</p>
                          )}
                        </div>
                        {address.isDefault && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowNewAddress(true)}
                  className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Address
                </button>
              </div>
            )}

            {/* New Address Form */}
            {(showNewAddress || addresses.length === 0) && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.fullName"
                      value={orderData.deliveryAddress.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.phone"
                      value={orderData.deliveryAddress.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                      placeholder="0712 345 678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                    <input
                      type="email"
                      name="deliveryAddress.email"
                      value={orderData.deliveryAddress.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Country *
                    </label>
                    <select
                      name="deliveryAddress.country"
                      value={orderData.deliveryAddress.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                      required
                    >
                      <option value="Kenya">Kenya</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      City/Town *
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.city"
                      value={orderData.deliveryAddress.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                      placeholder="Nairobi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.postalCode"
                      value={orderData.deliveryAddress.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="00100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Street Address *
                  </label>
                  <textarea
                    name="deliveryAddress.street"
                    value={orderData.deliveryAddress.street}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    rows="3"
                    required
                    placeholder="Building name, street, apartment number"
                  />
                </div>

                {addresses.length > 0 && (
                  <button
                    onClick={() => setShowNewAddress(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to saved addresses
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Payment Method</h2>

            {isTestMode && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <span className="font-medium">Note:</span> Using test payment mode. No real money will be charged.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'MPESA' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setPaymentMethod('MPESA')}>
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border ${paymentMethod === 'MPESA' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  }`}>
                  {paymentMethod === 'MPESA' && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-800">M-Pesa</span>
                      <p className="text-sm text-gray-600">
                        Pay with mobile money
                      </p>
                    </div>
                    {paymentMethod === 'MPESA' && (
                      <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Recommended
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {paymentMethod === 'MPESA' && (
                <div className="ml-8 p-4 bg-green-50 rounded-lg border border-green-100 animate-slideDown">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    M-Pesa Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="0712345678"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      required
                    />
                    <button
                      onClick={() => setMpesaPhone(user?.phone || '')}
                      className="px-3 py-2 text-sm text-green-600 hover:text-green-800 font-medium whitespace-nowrap"
                    >
                      Use my number
                    </button>
                  </div>
                  {isTestMode ? (
                    <p className="text-sm text-green-600 mt-2">
                      In test mode, payment will be simulated automatically.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">
                      You will receive an M-Pesa STK Push prompt to complete payment. Ensure your phone is nearby.
                    </p>
                  )}
                </div>
              )}

              <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'PAYPAL' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setPaymentMethod('PAYPAL')}>
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border ${paymentMethod === 'PAYPAL' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                  {paymentMethod === 'PAYPAL' && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-800">PayPal</span>
                  <p className="text-sm text-gray-600">
                    Pay with PayPal account or card
                  </p>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setPaymentMethod('CARD')}>
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border ${paymentMethod === 'CARD' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                  }`}>
                  {paymentMethod === 'CARD' && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-800">Credit/Debit Card</span>
                  <p className="text-sm text-gray-600">
                    Visa, Mastercard, American Express
                  </p>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'CASH_ON_DELIVERY' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}>
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border ${paymentMethod === 'CASH_ON_DELIVERY' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                  }`}>
                  {paymentMethod === 'CASH_ON_DELIVERY' && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-800">Cash on Delivery</span>
                  <p className="text-sm text-gray-600">
                    Pay when you receive your order
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Additional Information</h2>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Order Notes (Optional)
              </label>
              <textarea
                name="customerNotes"
                value={orderData.customerNotes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                rows="4"
                placeholder="Special instructions for delivery, access codes, gift messages, etc."
              />
              <p className="text-sm text-gray-500 mt-2">
                These notes will be shared with the delivery agent.
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                <span className="font-medium">KES {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">FREE</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium text-green-600">NONE</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">KES {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="text-sm text-green-600 mt-1">
                  ✓ Free shipping applied
                </div>
                <div className="text-sm text-green-600 mt-1">
                  ✓ No tax charged
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-3 text-gray-700">Order Items</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                    {item.images?.[0] && (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded mr-3"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                      {item.vendor?.businessName && (
                        <p className="text-xs text-gray-500">by {item.vendor.businessName}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {item.quantity} × KES {parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium text-gray-800 whitespace-nowrap">
                      KES {(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg mb-6 border border-green-100">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Free Shipping Applied
              </h4>
              <p className="text-sm text-green-700">
                Enjoy free shipping on all orders!
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg mb-6 border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Delivery Estimate
              </h4>
              <p className="text-sm text-blue-700">
                Orders are typically delivered within 15-45 days
              </p>
              <p className="text-xs text-blue-600 mt-1">
                You'll receive tracking information once your order ships.
              </p>
            </div>

            {/* No Tax Notice */}
            <div className="p-4 bg-blue-50 rounded-lg mb-6 border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                No Tax Charged
              </h4>
              <p className="text-sm text-blue-700">
                You are not charged any tax on your purchases.
              </p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || processingPayment}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${processingPayment
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : loading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
                }`}
            >
              {processingPayment ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {isTestMode ? 'Processing Test Payment...' : 'Waiting for M-Pesa Payment...'}
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Processing Your Order...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Place Order - KES {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              )}
            </button>

            {processingPayment && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg animate-pulse">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-ping"></div>
                  <p className="font-medium text-yellow-800">
                    {isTestMode ? 'Processing Test Payment...' : 'Waiting for M-Pesa Payment'}
                  </p>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  {isTestMode ? (
                    'Simulating payment processing. This will complete automatically...'
                  ) : (
                    '⏳ Please check your phone for the STK Push prompt and enter your M-Pesa PIN to complete payment.'
                  )}
                </p>
                <button
                  onClick={cancelPayment}
                  className="text-sm text-yellow-700 hover:text-yellow-900 font-medium"
                >
                  Cancel Payment
                </button>
                <div className="mt-2 pt-2 border-t border-yellow-200">
                  <button
                    onClick={handleManualCheck}
                    className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 font-medium w-full"
                  >
                    Check Payment Status
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-4 text-center">
              By placing your order, you agree to our
              <a href="/terms" className="text-blue-600 hover:text-blue-800 mx-1">Terms of Service</a>
              and
              <a href="/privacy" className="text-blue-600 hover:text-blue-800 mx-1">Privacy Policy</a>
            </p>

            {/* Security Badge */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-3 text-gray-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Secure & Encrypted Payment</span>
              </div>
            </div>
          </div>
        </div>
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

export default Checkout