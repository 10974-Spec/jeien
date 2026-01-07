import { useContext } from 'react'
import { UserContext } from '../contexts/UserContext'

export const useRole = () => {
  const context = useContext(UserContext)
  
  if (!context) {
    throw new Error('useRole must be used within an UserProvider')
  }
  
  return context
}