import React, { createContext, useState, useEffect } from 'react'

export const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist')
        if (savedWishlist) {
            try {
                setWishlist(JSON.parse(savedWishlist))
            } catch (err) {
                console.error('Failed to load wishlist from localStorage:', err)
            }
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist))
    }, [wishlist])

    const addToWishlist = (product) => {
        setWishlist(prevItems => {
            const exists = prevItems.some(item => item._id === product._id)
            if (exists) {
                return prevItems
            }
            return [...prevItems, product]
        })
    }

    const removeFromWishlist = (productId) => {
        setWishlist(prevItems => prevItems.filter(item => item._id !== productId))
    }

    const toggleWishlist = (product) => {
        const exists = wishlist.some(item => item._id === product._id)
        if (exists) {
            removeFromWishlist(product._id)
        } else {
            addToWishlist(product)
        }
    }

    const clearWishlist = () => {
        setWishlist([])
        localStorage.removeItem('wishlist')
    }

    const getWishlistCount = () => {
        return wishlist.length
    }

    const isInWishlist = (productId) => {
        return wishlist.some(item => item._id === productId)
    }

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                loading,
                addToWishlist,
                removeFromWishlist,
                toggleWishlist,
                clearWishlist,
                getWishlistCount,
                isInWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    )
}
