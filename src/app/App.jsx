import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../contexts/AuthContext'
import { CartProvider } from '../contexts/CartContext'
import { WishlistProvider } from '../contexts/WishlistContext'
import { UserProvider } from '../contexts/UserContext'
import { NotificationProvider } from '../contexts/NotificationContext'
import AppRouter from './router'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AuthProvider>
        <UserProvider>
          <NotificationProvider>
            <CartProvider>
              <WishlistProvider>
                <AppRouter />
              </WishlistProvider>
            </CartProvider>
          </NotificationProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App