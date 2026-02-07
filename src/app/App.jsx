import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { CartProvider } from '../contexts/CartContext'
import { WishlistProvider } from '../contexts/WishlistContext'
import { UserProvider } from '../contexts/UserContext'
import AppRouter from './router'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <CartProvider>
            <WishlistProvider>
              <AppRouter />
            </WishlistProvider>
          </CartProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App