import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import orderService from '../../services/order.service'
import userService from '../../services/user.service'

const Checkout = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { cartItems, getCartTotal, clearCart } = useCart()
  
  const [loading, setLoading] = useState(false)
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
  }, [isAuthenticated, cartItems.length, navigate])

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
          [field]: value
        }
      }))
    } else {
      setOrderData(prev => ({ ...prev, [name]: value }))
    }
  }

  const validateForm = () => {
    const { fullName, phone, country, city, street } = orderData.deliveryAddress
    
    if (!fullName || !phone || !country || !city || !street) {
      alert('Please fill in all required address fields')
      return false
    }

    if (paymentMethod === 'MPESA' && !mpesaPhone) {
      alert('Please enter your M-Pesa phone number')
      return false
    }

    return true
  }

  const handlePlaceOrder = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      // Prepare order items
      const items = cartItems.map(item => ({
        productId: item._id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        attributes: item.attributes || [],
      }))

      const orderPayload = {
        items,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod,
        customerNotes: orderData.customerNotes,
      }

      if (paymentMethod === 'MPESA') {
        orderPayload.phone = mpesaPhone
      }

      const response = await orderService.createOrder(orderPayload)
      const order = response.data.order

      // Clear cart on success
      clearCart()

      // Redirect based on payment method
      if (paymentMethod === 'MPESA') {
        // Show M-Pesa payment instructions
        alert('Order placed successfully! Please check your phone for M-Pesa prompt.')
        navigate(`/orders`)
      } else {
        // Redirect to payment gateway or order confirmation
        navigate(`/orders`)
      }
    } catch (error) {
      console.error('Failed to place order:', error)
      alert(error.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || cartItems.length === 0) {
    return null
  }

  const subtotal = getCartTotal()
  const tax = subtotal * 0.16
  const shipping = 500 // Fixed shipping for now
  const total = subtotal + tax + shipping

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>

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
                      className={`p-4 border rounded-lg cursor-pointer ${
                        selectedAddress === address._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => handleAddressChange(address._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{address.fullName}</p>
                          <p className="text-gray-600">{address.phone}</p>
                          <p className="text-gray-600">
                            {address.street}, {address.city}, {address.country}
                          </p>
                          {address.postalCode && (
                            <p className="text-gray-600">Postal Code: {address.postalCode}</p>
                          )}
                        </div>
                        {address.isDefault && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowNewAddress(true)}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  + Add New Address
                </button>
              </div>
            )}

            {/* New Address Form */}
            {(showNewAddress || addresses.length === 0) && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.fullName"
                      value={orderData.deliveryAddress.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.phone"
                      value={orderData.deliveryAddress.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      name="deliveryAddress.email"
                      value={orderData.deliveryAddress.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Country *
                    </label>
                    <select
                      name="deliveryAddress.country"
                      value={orderData.deliveryAddress.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    >
                      <option value="Kenya">Kenya</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      City/Town *
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.city"
                      value={orderData.deliveryAddress.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.postalCode"
                      value={orderData.deliveryAddress.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Street Address *
                  </label>
                  <textarea
                    name="deliveryAddress.street"
                    value={orderData.deliveryAddress.street}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                    rows="3"
                    required
                  />
                </div>

                {addresses.length > 0 && (
                  <button
                    onClick={() => setShowNewAddress(false)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    ← Back to saved addresses
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="mpesa"
                  name="paymentMethod"
                  value="MPESA"
                  checked={paymentMethod === 'MPESA'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-5 w-5"
                />
                <label htmlFor="mpesa" className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">M-Pesa</span>
                      <p className="text-sm text-gray-600">
                        Pay with mobile money
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                      Recommended
                    </div>
                  </div>
                </label>
              </div>

              {paymentMethod === 'MPESA' && (
                <div className="ml-8 p-4 bg-gray-50 rounded">
                  <label className="block text-sm font-medium mb-2">
                    M-Pesa Phone Number
                  </label>
                  <input
                    type="text"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    placeholder="e.g., 0712345678"
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    You will receive an M-Pesa prompt to complete payment
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="paypal"
                  name="paymentMethod"
                  value="PAYPAL"
                  checked={paymentMethod === 'PAYPAL'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-5 w-5"
                />
                <label htmlFor="paypal" className="flex-1">
                  <div>
                    <span className="font-medium">PayPal</span>
                    <p className="text-sm text-gray-600">
                      Pay with PayPal account or card
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="card"
                  name="paymentMethod"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-5 w-5"
                />
                <label htmlFor="card" className="flex-1">
                  <div>
                    <span className="font-medium">Credit/Debit Card</span>
                    <p className="text-sm text-gray-600">
                      Visa, Mastercard, American Express
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  value="CASH_ON_DELIVERY"
                  checked={paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-5 w-5"
                />
                <label htmlFor="cod" className="flex-1">
                  <div>
                    <span className="font-medium">Cash on Delivery</span>
                    <p className="text-sm text-gray-600">
                      Pay when you receive your order
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Additional Information</h2>
            <div>
              <label className="block text-sm font-medium mb-2">
                Order Notes (Optional)
              </label>
              <textarea
                name="customerNotes"
                value={orderData.customerNotes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
                rows="4"
                placeholder="Special instructions for delivery, gift messages, etc."
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>KES {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>KES {shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (16%)</span>
                <span>KES {tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>KES {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-3">Order Items</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center">
                    {item.images?.[0] && (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded mr-3"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} × KES {item.price}
                      </p>
                    </div>
                    <p className="font-medium">
                      KES {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg mb-6">
              <h4 className="font-medium text-blue-800 mb-2">Delivery Estimate</h4>
              <p className="text-sm text-blue-700">
                Orders are typically delivered within 3-7 business days
              </p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Place Order - KES ${total.toFixed(2)}`}
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              By placing your order, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout