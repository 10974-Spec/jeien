import React, { createContext, useState, useContext, useEffect } from 'react'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (err) {
        console.error('Failed to load cart from localStorage:', err)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item._id === product._id)

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += quantity
        return updatedItems
      } else {
        return [...prevItems, { ...product, quantity }]
      }
    })
  }

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId)
      return
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Check if user manually selected a pricing type
      if (item.selectedPricingType === 'wholesale' && item.allowWholesale && item.wholesalePrice) {
        // User chose wholesale pricing
        return total + (item.wholesalePrice * item.quantity)
      } else if (item.selectedPricingType === 'retail') {
        // User chose retail pricing
        return total + (item.price * item.quantity)
      }

      // Fallback to automatic calculation (for items added without selection)
      const quantity = item.quantity
      const hasWholesale = item.allowWholesale && item.wholesalePrice && item.minWholesaleQuantity

      if (hasWholesale && quantity >= item.minWholesaleQuantity) {
        // Use wholesale price
        return total + (item.wholesalePrice * quantity)
      } else {
        // Use retail price
        return total + (item.price * quantity)
      }
    }, 0)
  }

  const getTotalItems = () => {
    return cartItems.length
  }

  const getItemPrice = (item) => {
    // Return the applicable price for an item based on selected type or quantity
    if (item.selectedPricingType === 'wholesale' && item.allowWholesale && item.wholesalePrice) {
      return item.wholesalePrice
    } else if (item.selectedPricingType === 'retail') {
      return item.price
    }

    // Fallback to automatic calculation
    const hasWholesale = item.allowWholesale && item.wholesalePrice && item.minWholesaleQuantity
    if (hasWholesale && item.quantity >= item.minWholesaleQuantity) {
      return item.wholesalePrice
    }
    return item.price
  }

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const getItemCount = (productId) => {
    const item = cartItems.find(item => item._id === productId)
    return item ? item.quantity : 0
  }

  const isInCart = (productId) => {
    return cartItems.some(item => item._id === productId)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        getTotalItems,
        getItemCount,
        getItemPrice,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}