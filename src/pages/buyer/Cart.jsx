import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'

const Cart = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart()
  
  const [loading, setLoading] = useState(false)

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    
    if (cartItems.length === 0) {
      alert('Your cart is empty!')
      return
    }
    
    navigate('/checkout')
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some products to get started!</p>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{cartItems.length} Items in Cart</h2>
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item._id} className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/4">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-48 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-2xl">📷</span>
                        </div>
                      )}
                    </div>

                    <div className="md:w-3/4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-800 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-1">
                            Vendor: {item.vendor?.storeName || 'Unknown'}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Category: {item.category?.name || 'Uncategorized'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold mb-2">KES {item.price}</p>
                          {item.comparePrice && (
                            <p className="text-sm text-gray-500 line-through">
                              KES {item.comparePrice}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center border rounded">
                            <button
                              onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                              className="px-3 py-1 hover:bg-gray-100"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item._id, Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-12 text-center py-1 border-x"
                              min="1"
                              max={item.stock}
                            />
                            <button
                              onClick={() => updateQuantity(item._id, Math.min(item.stock, item.quantity + 1))}
                              className="px-3 py-1 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            KES {item.price * item.quantity}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} × KES {item.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>KES {getCartTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="text-green-600">NONE</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">KES {getCartTotal()}</span>
                </div>
                <div className="text-sm text-green-600 mt-2">
                  ✓ No tax charged on your purchase
                </div>
                <div className="text-sm text-green-600">
                  ✓ Free shipping on all orders
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Proceed to Checkout'}
            </button>

            {/* Free Shipping Notice */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Free Shipping
              </h4>
              <p className="text-sm text-green-700">
                Enjoy free shipping on all orders! No minimum purchase required.
              </p>
            </div>

            {/* No Tax Notice */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                No Tax Charged
              </h4>
              <p className="text-sm text-blue-700">
                You are not charged any tax on your purchases. All prices shown are final.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-gray-700">We Accept</h4>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">M-Pesa</div>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">PayPal</div>
                <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium">Visa</div>
                <div className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">Mastercard</div>
                <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm font-medium">Cash on Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart